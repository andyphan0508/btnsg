// Chạy Worker cục bộ (wrangler dev, R2 giả lập) + Supabase giả để kiểm tra auth, soft limit, kiểu file.
import { spawn } from 'node:child_process';
import http from 'node:http';
import assert from 'node:assert';
import { fileURLToPath } from 'node:url';

const workerDir = fileURLToPath(new URL('.', import.meta.url)); // chạy: node workers/images/test.mjs
const alerts = [];
const auth = http
  .createServer(async (req, res) => {
    if (req.url === '/alert') {
      let body = '';
      for await (const chunk of req) body += chunk;
      alerts.push(JSON.parse(body));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end('{"ok":true}');
    }
    const ok = req.headers.authorization === 'Bearer good';
    res.writeHead(ok ? 200 : 401, { 'Content-Type': 'application/json' });
    res.end(ok ? 'true' : '{"message":"invalid"}');
  })
  .listen(8799);

const vars = ['SUPABASE_URL:http://127.0.0.1:8799', 'SUPABASE_ANON_KEY:x', 'LIMIT_BYTES:3000000', 'ALLOWED_ORIGINS:http://localhost:5174', 'ALERT_WEBHOOK_URL:http://127.0.0.1:8799/alert', 'ALERT_EMAIL:test@example.com', 'RECOUNT_PAGE_SIZE:2', 'RECOUNT_PAGES_PER_RUN:3'];
const dev = spawn('npx', ['wrangler@4', 'dev', '--test-scheduled', '--port', '8788', '--ip', '127.0.0.1', ...vars.flatMap((v) => ['--var', v])], {
  cwd: workerDir,
  env: { ...process.env, CI: '1', WRANGLER_SEND_METRICS: 'false' },
});
let log = '';
dev.stdout.on('data', (d) => (log += d));
dev.stderr.on('data', (d) => (log += d));

const base = 'http://127.0.0.1:8788';
for (let i = 0; i < 60; i++) {
  try { await fetch(`${base}/_usage`); break; } catch { await new Promise((r) => setTimeout(r, 1000)); }
}

const uuid = () => crypto.randomUUID();
const put = (key, size, { token = 'good', type = 'image/webp' } = {}) =>
  fetch(`${base}/${key}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}`, 'Content-Type': type }, body: new Uint8Array(size) });

try {
  const k1 = `2026-11-23/${uuid()}.webp`;
  assert.equal((await put(k1, 1000, { token: 'bad' })).status, 401, 'sai token phải 401');
  assert.equal((await put(`_usage.json`, 10)).status, 404, 'không được ghi đè _usage.json');
  assert.equal((await put(`2026-11-23/abc.webp`, 10)).status, 404, 'tên file lạ phải bị chặn');
  assert.equal((await put(k1, 1000, { type: 'image/png' })).status, 415, 'png phải bị chặn');
  assert.equal((await put(k1, 2.1 * 1024 * 1024)).status, 413, '>2MB phải bị chặn');
  assert.equal((await put(k1, 1_000_000)).status, 201, 'upload hợp lệ');
  assert.equal((await put(k1, 1_000_000)).status, 200, 'upload lại cùng file → bỏ qua');
  const get = await fetch(`${base}/${k1}`);
  assert.equal(get.status, 200);
  assert.equal(get.headers.get('content-type'), 'image/webp');
  assert.match(get.headers.get('cache-control'), /immutable/);

  const k2 = `posts/${uuid()}/${uuid()}.jpg`;
  assert.equal((await put(k2, 1_500_000, { type: 'image/jpeg' })).status, 201);
  let usage = await (await fetch(`${base}/_usage`)).json();
  assert.equal(usage.bytes, 2_500_000);
  assert.equal(usage.alerted, 80, 'vượt 80% của 3MB → mức cảnh báo 80');

  const blocked = await put(`khac/${uuid()}-thumb.webp`, 500_000);
  assert.equal(blocked.status, 507, 'vượt 95% → chặn mềm');

  assert.equal((await fetch(`${base}/${k2}`, { method: 'DELETE', headers: { Authorization: 'Bearer bad' } })).status, 401);
  assert.equal((await fetch(`${base}/${k2}`, { method: 'DELETE', headers: { Authorization: 'Bearer good' } })).status, 200);
  usage = await (await fetch(`${base}/_usage`)).json();
  assert.equal(usage.bytes, 1_000_000);
  assert.equal(usage.alerted, 0, 'xoá bớt → hạ mức, lần vượt sau lại báo');
  assert.equal((await put(`khac/${uuid()}-thumb.webp`, 500_000)).status, 201, 'xoá xong lại upload được');

  const pre = await fetch(`${base}/${k1}`, { method: 'OPTIONS', headers: { Origin: 'http://localhost:5174' } });
  assert.equal(pre.headers.get('access-control-allow-origin'), 'http://localhost:5174');
  const evil = await fetch(`${base}/${k1}`, { method: 'OPTIONS', headers: { Origin: 'https://evil.example' } });
  assert.equal(evil.headers.get('access-control-allow-origin'), null);

  // Dashboard upload song song (3 ảnh × 2 cỡ) — bộ đếm không được mất lượt cộng nào.
  const before = (await (await fetch(`${base}/_usage`)).json()).bytes;
  const parallel = await Promise.all(Array.from({ length: 12 }, () => put(`khac/${uuid()}.webp`, 100_000)));
  assert.ok(parallel.every((r) => r.status === 201), `upload song song: ${parallel.map((r) => r.status)}`);
  usage = await (await fetch(`${base}/_usage`)).json();
  assert.equal(usage.bytes, before + 1_200_000, 'đếm đủ 12 upload song song');

  // 15 file, trang 2 file, mỗi lần cron 3 trang → phải đếm nối tiếp qua 3 lần cron.
  let cron;
  let runs = 0;
  for (let run = 0; run < 6; run++) {
    runs += 1;
    cron = await fetch(`${base}/__scheduled?cron=0+*/6+*+*+*`);
    usage = await (await fetch(`${base}/_usage`)).json();
    if (!usage.scan) break;
  }
  assert.equal(runs, 3, `đếm nối tiếp qua 3 lần cron (thực tế ${runs})`);
  assert.equal(usage.bytes, 2_700_000, 'cron đếm lại đúng dung lượng thật');
  assert.ok(usage.measuredAt, `cron phải ghi measuredAt (status ${cron.status})`);
  await new Promise((r) => setTimeout(r, 500));
  assert.equal(alerts.length, 2, `mỗi lần lên mức 80% chỉ 1 email (nhận ${alerts.length})`);
  assert.match(alerts[0].subject, /80%/);
  assert.equal(alerts[0].recipients[0].email, 'test@example.com');
  console.log('ALL WORKER TESTS PASSED', JSON.stringify(usage));
} catch (error) {
  console.log('FAILED:', error.message);
  console.log(log.slice(-2000));
  process.exitCode = 1;
} finally {
  dev.kill();
  auth.close();
}

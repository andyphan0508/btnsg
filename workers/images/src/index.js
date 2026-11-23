/**
 * BTNSG Images — Cloudflare Worker đứng trước bucket R2, là CỬA DUY NHẤT vào kho ảnh.
 *
 *   GET    /<key>    ảnh công khai (cache trình duyệt 1 năm — tên file không bao giờ trùng)
 *   PUT    /<key>    upload (chỉ thành viên đã duyệt trên Supabase), có soft limit
 *   DELETE /<key>    xoá ảnh (chỉ thành viên đã duyệt)
 *   GET    /_usage   dung lượng / lượt ghi đã dùng để dashboard hiện cảnh báo
 *   cron (6 giờ/lần) đếm lại dung lượng thật, gửi email khi vượt 80% / 95%
 *
 * Vì sao không thể phát sinh phí (miễn là bucket KHÔNG bật r2.dev / custom domain public
 * và không tạo S3 API token):
 *   - Dung lượng: từ chối upload khi chạm 95% của 10GB miễn phí.
 *   - Lượt ghi (Class A, free 1 triệu/tháng): từ chối upload khi chạm 90%.
 *   - Lượt đọc (Class B, free 10 triệu/tháng): Workers Free tối đa 100.000 request/ngày
 *     ≈ 3 triệu/tháng — không thể chạm 10 triệu.
 */

const USAGE_KEY = '_usage.json';
const GB = 1024 ** 3;
const FREE_WRITES_PER_MONTH = 1_000_000;
const WARN_RATIO = 0.8;
const BLOCK_RATIO = 0.95;
const WRITE_BLOCK_RATIO = 0.9;
const MAX_OBJECT_BYTES = 2 * 1024 * 1024;
const IMAGE_TYPES = new Set(['image/webp', 'image/jpeg']);
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
/** Chỉ đúng 2 kiểu tên file dashboard tạo ra — không ai ghi đè được _usage.json hay file lạ. */
const KEY_PATTERN = new RegExp(
  `^(posts/${UUID}/${UUID}|(\\d{4}-\\d{2}-\\d{2}|khac)/${UUID}(-thumb)?)\\.(webp|jpg)$`,
);

const currentMonth = () => new Date().toISOString().slice(0, 7);

const limitBytes = (env) => Number(env.LIMIT_BYTES) || 10 * GB;

const freshUsage = () => ({ bytes: 0, objects: 0, writes: 0, alerted: 0 });

const withMonth = (usage) => {
  if (usage.month !== currentMonth()) {
    usage.month = currentMonth();
    usage.writes = 0;
  }
  return usage;
};

async function readUsage(env) {
  const object = await env.BUCKET.get(USAGE_KEY);
  return withMonth(object ? await object.json() : freshUsage());
}

/**
 * Sửa bộ đếm an toàn khi nhiều upload chạy song song: ghi có điều kiện theo etag vừa đọc;
 * có ai ghi chen vào trước thì đọc lại và thử lại. Mỗi lần thử tính 1 lượt ghi Class A.
 * Trả về usage đã lưu, kèm cờ alert nếu vừa lên mức cảnh báo mới.
 */
async function updateUsage(env, mutate) {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const object = await env.BUCKET.get(USAGE_KEY);
    if (!object) {
      // Lần đầu tiên: tạo file đếm rỗng rồi vòng lại để cập nhật có điều kiện.
      await env.BUCKET.put(USAGE_KEY, JSON.stringify(withMonth(freshUsage())));
      continue;
    }
    const usage = withMonth(await object.json());
    mutate(usage);
    usage.writes += attempt + 1;
    const alert = nextAlert(usage, env);
    const saved = await env.BUCKET.put(USAGE_KEY, JSON.stringify(usage), {
      onlyIf: { etagMatches: object.etag },
      httpMetadata: { contentType: 'application/json' },
    });
    if (saved) return { usage, alert };
  }
  throw new Error('Bộ đếm dung lượng đang bận — thử lại sau.');
}

const summarize = (usage, env) => {
  const limit = limitBytes(env);
  return {
    ...usage,
    limitBytes: limit,
    warnBytes: Math.floor(limit * WARN_RATIO),
    blockBytes: Math.floor(limit * BLOCK_RATIO),
    writeLimit: FREE_WRITES_PER_MONTH,
    writeBlock: Math.floor(FREE_WRITES_PER_MONTH * WRITE_BLOCK_RATIO),
  };
};

/** Mức cảnh báo hiện tại: 0, 80 hoặc 95 (%). */
const alertLevel = (usage, env) => {
  const ratio = Math.max(usage.bytes / limitBytes(env), usage.writes / FREE_WRITES_PER_MONTH);
  if (ratio >= BLOCK_RATIO) return 95;
  if (ratio >= WARN_RATIO) return 80;
  return 0;
};

const formatGB = (bytes) => `${(bytes / GB).toFixed(2)} GB`;

/** Cập nhật mức đã báo; trả về true nếu vừa lên mức mới (cần gửi email). */
function nextAlert(usage, env) {
  const level = alertLevel(usage, env);
  const rising = level > (usage.alerted || 0);
  usage.alerted = level; // tụt mức (đã xoá bớt ảnh) → lần vượt sau lại báo
  return rising;
}

/** Gửi email qua Apps Script (tools/apps-script/Code.gs). */
async function sendAlert(env, usage) {
  const level = usage.alerted;
  if (!env.ALERT_WEBHOOK_URL || !env.ALERT_EMAIL) return;
  const limit = limitBytes(env);
  const body = [
    level >= 95
      ? 'Kho ảnh R2 đã chạm 95% hạn mức miễn phí — dashboard ĐÃ NGỪNG nhận ảnh mới để không phát sinh phí.'
      : 'Kho ảnh R2 đã dùng hơn 80% hạn mức miễn phí.',
    '',
    `Dung lượng: ${formatGB(usage.bytes)} / ${formatGB(limit)} (${Math.round((usage.bytes / limit) * 100)}%)`,
    `Lượt ghi tháng ${usage.month}: ${usage.writes.toLocaleString('vi-VN')} / ${FREE_WRITES_PER_MONTH.toLocaleString('vi-VN')}`,
    '',
    'Cách xử lý: xoá bớt ảnh cũ trong dashboard (Khoảnh khắc / Tin tức), hoặc giảm mức nén ảnh.',
  ].join('\n');
  await fetch(env.ALERT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      subject: `[BTNSG] Kho ảnh R2 đã dùng ${level}% hạn mức miễn phí`,
      body,
      recipients: [{ email: env.ALERT_EMAIL, name: 'Quản trị' }],
    }),
  }).catch(() => {});
}

/** Thành viên đã đăng nhập dashboard và được duyệt (hàm is_approved trên Supabase). */
async function isApproved(request, env) {
  const auth = request.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return false;
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/is_approved`, {
    method: 'POST',
    headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: auth, 'Content-Type': 'application/json' },
    body: '{}',
  });
  return response.ok && (await response.json()) === true;
}

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGINS || '').split(',').map((o) => o.trim());
  if (!allowed.includes(origin)) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

const json = (data, status, headers) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } });

async function handlePut(request, env, ctx, key, cors) {
  const type = (request.headers.get('Content-Type') || '').split(';')[0];
  if (!IMAGE_TYPES.has(type)) return json({ error: 'Chỉ nhận ảnh WebP hoặc JPEG.' }, 415, cors);
  if (Number(request.headers.get('Content-Length')) > MAX_OBJECT_BYTES) {
    return json({ error: 'Ảnh quá 2MB.' }, 413, cors);
  }

  // Chép lại ảnh cũ (chạy nhiều lần) → file đã có thì bỏ qua, không tốn lượt ghi.
  if (await env.BUCKET.head(key)) return json({ ok: true, exists: true }, 200, cors);

  const body = await request.arrayBuffer();
  if (body.byteLength > MAX_OBJECT_BYTES) return json({ error: 'Ảnh quá 2MB.' }, 413, cors);

  const usage = await readUsage(env);
  const limits = summarize(usage, env);
  if (usage.bytes + body.byteLength > limits.blockBytes) {
    return json(
      { error: `Kho ảnh đã dùng ${formatGB(usage.bytes)} / ${formatGB(limits.limitBytes)} — tạm ngừng nhận ảnh để không phát sinh phí. Hãy xoá bớt ảnh cũ.` },
      507,
      cors,
    );
  }
  if (usage.writes + 2 > limits.writeBlock) {
    return json({ error: 'Đã hết lượt ghi miễn phí của tháng này — thử lại vào tháng sau.' }, 429, cors);
  }

  await env.BUCKET.put(key, body, {
    httpMetadata: { contentType: type, cacheControl: 'public, max-age=31536000, immutable' },
  });
  const result = await updateUsage(env, (u) => {
    u.bytes += body.byteLength;
    u.objects += 1;
    u.writes += 1; // chính file ảnh
  });
  if (result.alert) ctx.waitUntil(sendAlert(env, result.usage));
  return json({ ok: true }, 201, cors);
}

async function handleDelete(env, key, cors) {
  const head = await env.BUCKET.head(key);
  if (!head) return json({ ok: true }, 200, cors);
  await env.BUCKET.delete(key); // xoá không tính lượt ghi
  await updateUsage(env, (u) => {
    u.bytes = Math.max(0, u.bytes - head.size);
    u.objects = Math.max(0, u.objects - 1);
  });
  return json({ ok: true }, 200, cors);
}

// Workers Free: tối đa 50 subrequest (mỗi lệnh R2 tính 1) mỗi lần chạy → mỗi lần cron chỉ đọc
// tối đa 40 trang × 1.000 file, lưu vị trí dở dang vào bộ đếm và lần cron sau đọc tiếp.
const RECOUNT_PAGES_PER_RUN = 40;

/** Đếm lại dung lượng thật của bucket (nối tiếp qua nhiều lần cron nếu bucket lớn). */
async function recount(env) {
  const pageSize = Number(env.RECOUNT_PAGE_SIZE) || 1000;
  const scan = (await readUsage(env)).scan || { bytes: 0, objects: 0 };
  let cursor = scan.cursor;
  let pages = 0;
  do {
    const page = await env.BUCKET.list({ cursor, limit: pageSize });
    for (const object of page.objects) {
      if (object.key === USAGE_KEY) continue;
      scan.bytes += object.size;
      scan.objects += 1;
    }
    pages += 1;
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor && pages < (Number(env.RECOUNT_PAGES_PER_RUN) || RECOUNT_PAGES_PER_RUN));

  const result = await updateUsage(env, (u) => {
    u.writes += pages; // list tính là lượt Class A
    if (cursor) {
      u.scan = { cursor, bytes: scan.bytes, objects: scan.objects };
      return;
    }
    delete u.scan;
    u.bytes = scan.bytes;
    u.objects = scan.objects;
    u.measuredAt = new Date().toISOString();
  });
  if (result.alert) await sendAlert(env, result.usage);
  return result.usage;
}

export default {
  async fetch(request, env, ctx) {
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    const key = decodeURIComponent(new URL(request.url).pathname.slice(1));

    if (key === '_usage') {
      return json(summarize(await readUsage(env), env), 200, { ...cors, 'Cache-Control': 'no-store' });
    }
    if (!KEY_PATTERN.test(key)) return json({ error: 'Không tìm thấy' }, 404, cors);

    if (request.method === 'GET' || request.method === 'HEAD') {
      const object = await env.BUCKET.get(key);
      if (!object) return new Response('Không tìm thấy ảnh', { status: 404 });
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('ETag', object.httpEtag);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('Access-Control-Allow-Origin', '*');
      return new Response(request.method === 'HEAD' ? null : object.body, { headers });
    }

    if (request.method !== 'PUT' && request.method !== 'DELETE') {
      return json({ error: 'Phương thức không hỗ trợ' }, 405, cors);
    }
    if (!(await isApproved(request, env))) {
      return json({ error: 'Cần đăng nhập dashboard bằng tài khoản đã được duyệt.' }, 401, cors);
    }
    return request.method === 'PUT' ? handlePut(request, env, ctx, key, cors) : handleDelete(env, key, cors);
  },

  async scheduled(_event, env, ctx) {
    ctx.waitUntil(recount(env));
  },
};

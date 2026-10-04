/**
 * Vercel Cron (khai báo trong vercel.json → "crons") — chạy mỗi ngày một lần để project Supabase
 * gói Free không bị tạm dừng (Supabase pause project sau 7 ngày không có hoạt động).
 * Mỗi lần chạy = 1 truy vấn đọc nhỏ (bảng programs, anon được đọc bản đã công bố) — không ghi gì.
 *
 * Bảo vệ: đặt biến CRON_SECRET trên Vercel → Vercel tự gửi "Authorization: Bearer <CRON_SECRET>",
 * người ngoài gọi thẳng sẽ nhận 401. Không đặt thì endpoint vẫn chạy (chỉ là một lệnh đọc vô hại).
 */

export default async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    return res.status(401).json({ error: 'Không có quyền' });
  }

  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'Máy chủ chưa cấu hình Supabase' });

  res.setHeader('Cache-Control', 'no-store');
  const startedAt = Date.now();
  try {
    const response = await fetch(`${url}/rest/v1/programs?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    const ok = response.ok;
    // Lỗi sẽ hiện trong Vercel → Logs; Supabase vẫn ghi nhận đây là một lần hoạt động.
    if (!ok) console.error('[keep-alive] Supabase trả về', response.status, await response.text());
    return res.status(ok ? 200 : 502).json({ ok, status: response.status, ms: Date.now() - startedAt });
  } catch (error) {
    console.error('[keep-alive]', error);
    return res.status(502).json({ ok: false, error: String(error?.message || error) });
  }
}

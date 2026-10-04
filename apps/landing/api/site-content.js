/**
 * Vercel Serverless Function — nội dung landing chỉnh từ dashboard (bảng site_content).
 *
 * GET → 200 { content: { [key]: value } } · 405 / 502 / 503 { error }
 *
 * Đọc bằng anon key (RLS chỉ cho phép đọc bảng này) và để CDN của Vercel giữ bản sao:
 * mọi lượt xem dùng chung một bản, Supabase chỉ bị gọi khoảng 1 lần/phút dù đông người.
 * Sửa trong dashboard → landing hiện bản mới sau tối đa ~1 phút.
 *
 * Biến môi trường (đã có sẵn cho push-send): SUPABASE_URL, SUPABASE_ANON_KEY
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Chỉ hỗ trợ GET' });

  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'Máy chủ chưa cấu hình Supabase' });

  try {
    const response = await fetch(`${url}/rest/v1/site_content?select=key,value`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    // Chưa chạy migration 0007 (chưa có bảng) = chưa lưu gì → trả rỗng, landing dùng mặc định.
    // Trả 200 để CDN cache được (Vercel không cache 5xx → mỗi lượt xem lại chờ Supabase).
    const rows = response.status === 404 ? [] : await response.json();
    if (!response.ok && response.status !== 404) throw new Error(`Supabase lỗi ${response.status}`);
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');
    return res.status(200).json({ content: Object.fromEntries(rows.map((row) => [row.key, row.value])) });
  } catch (error) {
    // Lỗi cũng cache ngắn để một sự cố Supabase không biến mỗi lượt xem thành một lần gọi.
    res.setHeader('Cache-Control', 'public, s-maxage=30');
    return res.status(502).json({ error: String(error?.message || error) });
  }
}

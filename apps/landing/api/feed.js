/**
 * Vercel Serverless Function — proxy có cache CDN cho Google Apps Script (thư viện ảnh, tin tức).
 *
 * GET /api/feed?src=gallery            → JSON của VITE_GALLERY_SCRIPT_URL
 * GET /api/feed?src=news               → danh sách bài (VITE_NEWS_SCRIPT_URL)
 * GET /api/feed?src=news&post=<id>     → một bài viết
 *
 * Apps Script mất 1,3–2,6 giây mỗi lần gọi (đo 2026-10-04); qua đây CDN của Vercel trả bản đã lưu
 * gần như tức thì, Apps Script chỉ bị gọi lại ngầm khi bản lưu cũ (stale-while-revalidate).
 * Đăng bài / thêm ảnh mới hiện ra sau tối đa 1 phút (tin tức) / 5 phút (ảnh).
 */

const SOURCES = {
  gallery: { env: 'VITE_GALLERY_SCRIPT_URL', maxAge: 300 },
  news: { env: 'VITE_NEWS_SCRIPT_URL', maxAge: 60 },
};

/** ID bài viết = ID folder Google Drive. */
const POST_ID = /^[\w-]{10,100}$/;

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Chỉ hỗ trợ GET' });

  const source = SOURCES[req.query.src];
  const scriptUrl = source && (process.env[source.env] || '').trim();
  if (!scriptUrl) return res.status(404).json({ error: 'Nguồn dữ liệu chưa được cấu hình' });

  const post = req.query.post;
  if (post !== undefined && (req.query.src !== 'news' || !POST_ID.test(post))) {
    return res.status(400).json({ error: 'Mã bài viết không hợp lệ' });
  }
  const url = post ? `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}post=${encodeURIComponent(post)}` : scriptUrl;

  try {
    const response = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
    const data = JSON.parse(await response.text());
    if (!response.ok || data?.error) throw new Error(data?.error || `Apps Script lỗi ${response.status}`);

    res.setHeader('Cache-Control', `public, s-maxage=${source.maxAge}, stale-while-revalidate=86400`);
    return res.status(200).json(data);
  } catch (error) {
    // Lỗi cache ngắn: Apps Script trục trặc thì không biến mỗi lượt xem thành một lần gọi.
    res.setHeader('Cache-Control', 'public, s-maxage=15');
    return res.status(502).json({ error: String(error?.message || error) });
  }
}

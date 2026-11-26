/**
 * Vercel Serverless Function — dữ liệu công khai lưu trên Supabase (đăng từ dashboard).
 *
 * GET /api/library?t=moments          → { images: [{ id, name, album, date, src, thumb, w, h, tags }] }
 * GET /api/library?t=sermons          → { sermons: [{ id, title, date, speaker, scripture, tags, excerpt }] }
 * GET /api/library?t=sermons&id=<id>  → { sermon: { id, title, date, speaker, scripture, tags, content } }
 * GET /api/library?t=posts            → { posts: [{ id, title, date, description, cover }] }
 * GET /api/library?t=posts&id=<id>    → { post: { id, title, date, description, cover, content, images: [] } }
 *
 * Đọc bằng anon key (RLS chỉ lộ ảnh + bài giảng đã công khai). CDN của Vercel giữ bản sao
 * nên Supabase chỉ bị gọi khoảng 1 lần/phút dù đông người; ảnh mới hiện ra sau tối đa ~1 phút.
 *
 * Biến môi trường (đã có sẵn cho push-send): SUPABASE_URL, SUPABASE_ANON_KEY
 * Tuỳ chọn: IMAGES_BASE_URL = URL Worker R2 (workers/images) — có thì ảnh Khoảnh khắc lấy từ R2.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SERMON_FIELDS = 'id,title,date,speaker,scripture,tags,content,audio_url';
const SERMON_FILTER = 'published=is.true&category=eq.bai_giang';
const POST_LIST_FIELDS = 'id,title,date,description,cover';
const POST_ORDER = 'order=date.desc.nullslast,created_at.desc';

/** Đoạn mở đầu dạng chữ thường (bỏ thẻ HTML và ký hiệu Markdown) cho thẻ trong danh sách. */
const excerpt = (content) =>
  (content || '')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Chỉ hỗ trợ GET' });

  const { t, id } = req.query;
  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Chưa cấu hình DB trên Cloudflare/Vercel → trả danh sách rỗng (200) để giao diện hiển thị trạng thái trống mượt mà.
    res.setHeader('Cache-Control', 'public, s-maxage=30');
    if (t === 'moments') return res.status(200).json({ images: [] });
    if (t === 'posts' && id === undefined) return res.status(200).json({ posts: [] });
    if (t === 'sermons' && id === undefined) return res.status(200).json({ sermons: [] });
    if (t === 'posts') return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
    if (t === 'sermons') return res.status(404).json({ error: 'Không tìm thấy bài giảng.' });
    return res.status(400).json({ error: 'Tham số không hợp lệ.' });
  }
  let query;
  if (t === 'moments') {
    // Dùng select('*') để tương thích ngược dù đã chạy migration 0011 (program_id, program_title) hay chưa.
    query = 'moments?select=*&order=taken_on.desc.nullslast,created_at.desc';
  } else if (t === 'posts' && id === undefined) {
    query = `posts?select=${POST_LIST_FIELDS}&published=is.true&${POST_ORDER}`;
  } else if (t === 'posts' && UUID.test(id)) {
    query = `posts?select=${POST_LIST_FIELDS},content&published=is.true&id=eq.${id}`;
  } else if (t === 'sermons' && id === undefined) {
    query = `notes?select=${SERMON_FIELDS}&${SERMON_FILTER}&order=date.desc.nullslast,created_at.desc`;
  } else if (t === 'sermons' && UUID.test(id)) {
    query = `notes?select=${SERMON_FIELDS}&${SERMON_FILTER}&id=eq.${id}`;
  } else {
    return res.status(400).json({ error: 'Tham số không hợp lệ' });
  }

  try {
    const response = await fetch(`${url}/rest/v1/${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    // Chưa chạy migration 0008/0009 (chưa có bảng) = chưa có ảnh → trả rỗng, landing dùng nguồn cũ.
    if (!response.ok && response.status !== 404) throw new Error(`Supabase lỗi ${response.status}`);
    const rows = response.ok ? await response.json() : [];

    let body;
    if (t === 'moments') {
      // Có IMAGES_BASE_URL (Worker R2) thì ảnh lấy từ R2 — cùng path với Supabase, không cần đổi dữ liệu.
      const imagesBase = (process.env.IMAGES_BASE_URL || '').trim().replace(/\/$/, '');
      const storage = imagesBase ? `${imagesBase}/` : `${url}/storage/v1/object/public/moments/`;
      body = {
        images: rows.map((row) => ({
          id: row.id,
          name: row.caption || row.program_title || row.album || 'Khoảnh khắc buổi nhóm',
          caption: row.caption || '',
          album: row.album || '',
          programId: row.program_id || null,
          program: row.program_title || row.album || '',
          date: row.taken_on,
          src: storage + row.path,
          thumb: storage + row.thumb_path,
          w: row.width,
          h: row.height,
          tags: row.tags || [],
        })),
      };
    } else if (t === 'posts') {
      if (id === undefined) body = { posts: rows };
      else if (rows.length > 0) body = { post: { ...rows[0], images: [] } };
      else {
        res.setHeader('Cache-Control', 'public, s-maxage=30');
        return res.status(404).json({ error: 'Không tìm thấy bài viết' });
      }
    } else if (id === undefined) {
      body = { sermons: rows.map(({ content, ...sermon }) => ({ ...sermon, excerpt: excerpt(content) })) };
    } else {
      if (rows.length === 0) {
        res.setHeader('Cache-Control', 'public, s-maxage=30');
        return res.status(404).json({ error: 'Không tìm thấy bài giảng' });
      }
      body = { sermon: rows[0] };
    }

    // stale-while-revalidate ngắn: web ít lượt xem thì bản lưu hay quá hạn, SWR dài khiến mỗi
    // lượt xem nhận bản của lượt trước (ảnh/bài vừa đăng không hiện). Supabase vẫn chỉ ≤ 1 lần/phút.
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=60');
    return res.status(200).json(body);
  } catch (error) {
    // Lỗi cũng cache ngắn để một sự cố Supabase không biến mỗi lượt xem thành một lần gọi.
    res.setHeader('Cache-Control', 'public, s-maxage=30');
    return res.status(502).json({ error: String(error?.message || error) });
  }
}

/**
 * Vercel Serverless Function — dữ liệu công khai lưu trên Supabase (đăng từ dashboard).
 *
 * GET /api/library?t=moments          → { images: [{ id, name, album, date, src, thumb, w, h }] }
 * GET /api/library?t=sermons          → { sermons: [{ id, title, date, speaker, scripture, tags, excerpt }] }
 * GET /api/library?t=sermons&id=<id>  → { sermon: { id, title, date, speaker, scripture, tags, content } }
 *
 * Đọc bằng anon key (RLS chỉ lộ ảnh + bài giảng đã công khai). CDN của Vercel giữ bản sao
 * nên Supabase chỉ bị gọi khoảng 1 lần/phút dù đông người; ảnh mới hiện ra sau tối đa ~1 phút.
 *
 * Biến môi trường (đã có sẵn cho push-send): SUPABASE_URL, SUPABASE_ANON_KEY
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SERMON_FIELDS = 'id,title,date,speaker,scripture,tags,content';
const SERMON_FILTER = 'published=is.true&category=eq.bai_giang';

/** Đoạn mở đầu dạng chữ thường (bỏ ký hiệu Markdown) cho thẻ trong danh sách. */
const excerpt = (markdown) =>
  markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Chỉ hỗ trợ GET' });

  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'Máy chủ chưa cấu hình Supabase' });

  const { t, id } = req.query;
  let query;
  if (t === 'moments') {
    // ponytail: PostgREST trả tối đa 1000 dòng (max-rows) — quá số đó thì phân trang theo album.
    query = 'moments?select=id,album,caption,taken_on,path,thumb_path,width,height&order=taken_on.desc.nullslast,created_at.desc';
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
    // Chưa chạy migration 0008 (chưa có bảng moments) = chưa có ảnh → trả rỗng, landing dùng nguồn cũ.
    if (!response.ok && response.status !== 404) throw new Error(`Supabase lỗi ${response.status}`);
    const rows = response.ok ? await response.json() : [];

    let body;
    if (t === 'moments') {
      const storage = `${url}/storage/v1/object/public/moments/`;
      body = {
        images: rows.map((row) => ({
          id: row.id,
          name: row.caption || row.album,
          album: row.album,
          date: row.taken_on,
          src: storage + row.path,
          thumb: storage + row.thumb_path,
          w: row.width,
          h: row.height,
        })),
      };
    } else if (id === undefined) {
      body = { sermons: rows.map(({ content, ...sermon }) => ({ ...sermon, excerpt: excerpt(content) })) };
    } else {
      if (rows.length === 0) {
        res.setHeader('Cache-Control', 'public, s-maxage=30');
        return res.status(404).json({ error: 'Không tìm thấy bài giảng' });
      }
      body = { sermon: rows[0] };
    }

    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=86400');
    return res.status(200).json(body);
  } catch (error) {
    // Lỗi cũng cache ngắn để một sự cố Supabase không biến mỗi lượt xem thành một lần gọi.
    res.setHeader('Cache-Control', 'public, s-maxage=30');
    return res.status(502).json({ error: String(error?.message || error) });
  }
}

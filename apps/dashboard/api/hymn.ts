// GET /api/hymn?number=29 — tên bài Thánh Ca theo số, đọc trực tiếp từ thanhca.httlvn.org (trang chính thức HTTLVN).
// 200 { number, title } · 400 / 404 / 502 { error }. Chỉ lấy tên bài; lời bài hát do OpenPresenter tự tải.
// Bản demo/local của cùng hợp đồng: apps/api/src/routes/program.ts.

type Req = { query: Record<string, string | string[] | undefined> };
type Res = { setHeader: (name: string, value: string) => void; status: (code: number) => Res; json: (body: unknown) => void };

const decode = (s: string) =>
  s
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');

export default async function handler(req: Req, res: Res) {
  const raw = typeof req.query.number === 'string' ? req.query.number.trim() : '';
  if (!/^\d{1,4}$/.test(raw)) return res.status(400).json({ error: 'number phải là số bài' });
  const number = Number(raw);

  const response = await fetch(`https://thanhca.httlvn.org/thanh-ca-${number}`);
  if (response.status === 404 || response.status === 500) return res.status(404).json({ error: `Không có Thánh Ca ${number}` });
  if (!response.ok) return res.status(502).json({ error: `thanhca.httlvn.org lỗi ${response.status}` });

  const h1 = (await response.text()).match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  if (!h1) return res.status(502).json({ error: 'Không đọc được trang Thánh Ca' });
  const title = decode(h1.replace(/<small[\s\S]*?<\/small>/i, '').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).json({ number, title });
}

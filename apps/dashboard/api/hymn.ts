// GET /api/hymn?number=29 — bài Thánh Ca theo số, đọc trực tiếp từ thanhca.httlvn.org (trang chính thức HTTLVN).
// 200 { number, title, sections: [{ label, text }], order: string[] } · 400 / 404 / 502 { error }
// Lời chỉ để người soạn chương trình chọn đoạn / thứ tự hát; không lưu lại. OpenPresenter tự tải lời riêng.
// API demo (apps/api) dùng chung bộ đọc _hymn.ts.
import { parseHymnPage } from './_hymn';

type Req = { query: Record<string, string | string[] | undefined> };
type Res = { setHeader: (name: string, value: string) => void; status: (code: number) => Res; json: (body: unknown) => void };

export default async function handler(req: Req, res: Res) {
  const raw = typeof req.query.number === 'string' ? req.query.number.trim() : '';
  if (!/^\d{1,4}$/.test(raw)) return res.status(400).json({ error: 'number phải là số bài' });
  const number = Number(raw);

  const response = await fetch(`https://thanhca.httlvn.org/thanh-ca-${number}`);
  if (response.status === 404 || response.status === 500) return res.status(404).json({ error: `Không có Thánh Ca ${number}` });
  if (!response.ok) return res.status(502).json({ error: `thanhca.httlvn.org lỗi ${response.status}` });

  const hymn = parseHymnPage(await response.text());
  if (!hymn) return res.status(502).json({ error: 'Không đọc được trang Thánh Ca' });

  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
  return res.status(200).json({ number, ...hymn });
}

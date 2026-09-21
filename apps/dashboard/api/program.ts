// GET /api/program[?date=YYYY-MM-DD] — chương trình thờ phượng đã công bố, cho OpenPresenter đồng bộ.
//   có date    → chương trình đúng ngày đó
//   không date → chương trình gần nhất từ hôm nay (giờ VN) trở đi
// 200 { version: 1, program: { id, date, title, startTime?, updatedAt, items } } · 400/404/405/502/503 { error }
// Bản demo/local của cùng hợp đồng: apps/api/src/routes/program.ts.

type Req = { method?: string; query: Record<string, string | string[] | undefined> };
type Res = {
  setHeader: (name: string, value: string) => void;
  status: (code: number) => Res;
  json: (body: unknown) => void;
  end: () => void;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const todayInVietnam = () => new Date(Date.now() + 7 * 3600e3).toISOString().slice(0, 10);

export default async function handler(req: Req, res: Res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Chỉ hỗ trợ GET' });

  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(503).json({ error: 'Máy chủ chưa cấu hình Supabase' });

  const date = typeof req.query.date === 'string' ? req.query.date : '';
  if (date && !DATE.test(date)) return res.status(400).json({ error: 'date phải có dạng YYYY-MM-DD' });

  // RLS chỉ cho anon đọc bản đã công bố; lọc thêm ở đây cho rõ ràng.
  const filter = date ? `date=eq.${date}` : `date=gte.${todayInVietnam()}&order=date.asc&limit=1`;
  const response = await fetch(`${url}/rest/v1/programs?select=*&published=is.true&${filter}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!response.ok) return res.status(502).json({ error: `Supabase lỗi ${response.status}` });

  const [row] = (await response.json()) as { id: string; date: string; title: string; start_time?: string | null; items: unknown[]; updated_at: string }[];
  if (!row) return res.status(404).json({ error: date ? `Chưa có chương trình đã công bố ngày ${date}` : 'Chưa có chương trình sắp tới' });

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=300');
  return res.status(200).json({
    version: 1,
    program: {
      id: row.id, date: row.date, title: row.title, startTime: row.start_time ?? undefined,
      updatedAt: row.updated_at, items: row.items ?? [],
    },
  });
}

// Đọc trang Thánh Ca HTTLVN (https://thanhca.httlvn.org/thanh-ca-{n}) → tên bài + các đoạn lời.
// Tên đoạn PHẢI giống OpenPresenter (src/renderer/src/helpers/thanhca.ts): tiêu đề "Câu 1"/"Điệp khúc",
// đoạn trùng nội dung gộp làm một, trùng tên khác nội dung thành "Tên (2)". Thứ tự hát chọn ở dashboard
// dùng đúng các tên này. (File bắt đầu bằng "_" nên Vercel không coi là một API.)

export type HymnSection = { label: string; text: string };
export type HymnPage = { title: string; sections: HymnSection[]; order: string[] };

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ensp: ' ', emsp: ' ' };
const decode = (s: string) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(+d))
    .replace(/&([a-z]+);/gi, (m, name: string) => ENTITIES[name.toLowerCase()] ?? m);

const HEADER = /^(câu(\s*\d+)?|điệp\s*khúc(\s*\d+)?|kết|coda)\s*:?$/i;

export function parseHymnPage(html: string): HymnPage | undefined {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1];
  const start = html.indexOf('<div id="lyric-content">');
  if (!h1) return undefined;
  const title = decode(h1.replace(/<small[\s\S]*?<\/small>/i, '').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
  if (start < 0) return { title, sections: [], order: [] };

  const lines = decode(
    html
      .slice(start, html.indexOf('</div>', start))
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, ''),
  )
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim());

  const raw: { label: string; lines: string[] }[] = [];
  for (const line of lines) {
    if (HEADER.test(line)) raw.push({ label: line.replace(/:$/, ''), lines: [] });
    else {
      if (!raw.length) raw.push({ label: 'Câu 1', lines: [] });
      raw[raw.length - 1].lines.push(line);
    }
  }

  const sections: HymnSection[] = [];
  const order: string[] = [];
  for (const s of raw) {
    const text = s.lines.join('\n').replace(/\n{2,}/g, '\n\n').trim();
    if (!text) continue;
    let hit = sections.find((u) => u.text === text);
    if (!hit) {
      let label = s.label;
      for (let i = 2; sections.some((u) => u.label === label); i++) label = `${s.label} (${i})`;
      hit = { label, text };
      sections.push(hit);
    }
    order.push(hit.label);
  }
  return { title, sections, order };
}

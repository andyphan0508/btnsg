import type { ProgramItem } from '@btnsg/shared';
import { formatDate } from '../../../utils/format';

type ProgramPrintSheetProps = {
  date: string;
  title: string;
  startTime?: string;
  items: ProgramItem[];
  starts: (string | null)[];
  end: string | null;
  totalMinutes: number;
};

const shortSection = (label: string) => label.replace(/^Điệp khúc/i, 'ĐK');

const detailOf = (item: ProgramItem): string => {
  if (item.kind === 'song' && item.song) {
    const ref = item.song.book && item.song.number ? `${item.song.book} ${item.song.number} · ` : '';
    const order = item.song.arrangement?.length ? ` (${item.song.arrangement.map(shortSection).join(' → ')})` : '';
    return `${ref}${item.song.title}${order}`;
  }
  if (item.kind === 'sermon') return [item.text, item.speaker && `Diễn giả: ${item.speaker}`, item.ref].filter(Boolean).join(' · ');
  if (item.kind === 'bible') return item.ref ?? '';
  return item.text ?? '';
};

/** Bản in cho ban phục vụ (chỉ hiện khi in — xem @media print trong dashboard.css). */
const ProgramPrintSheet = ({ date, title, startTime, items, starts, end, totalMinutes }: ProgramPrintSheetProps) => (
  <section className="program-print" aria-hidden="true">
    <h1>{title || 'Chương trình thờ phượng'}</h1>
    <p className="program-print-sub">
      {formatDate(date)}
      {startTime && ` · ${startTime}${end ? ` – ${end}` : ''}`}
      {totalMinutes > 0 && ` · ${totalMinutes} phút`}
    </p>
    <table>
      <thead>
        <tr>
          <th>#</th>
          {startTime && <th>Giờ</th>}
          <th>Mục</th>
          <th>Nội dung</th>
          <th>Phụ trách</th>
          <th>Phút</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id}>
            <td>{index + 1}</td>
            {startTime && <td>{starts[index]}</td>}
            <td><b>{item.label}</b></td>
            <td>
              {detailOf(item)}
              {item.note && <div className="program-print-note">{item.note}</div>}
            </td>
            <td>{item.leader}</td>
            <td>{item.minutes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

export default ProgramPrintSheet;

import { NOTE_CATEGORY_LABELS, type Note } from '@btnsg/shared';
import EmptyState from '../../../ui/EmptyState';
import { formatDate } from '../../../utils/format';
import { FiBookOpen, FiChevronRight } from 'react-icons/fi';

type NoteListProps = {
  notes: Note[];
  totalCount: number;
  deletingNoteId: string | null;
  onOpen: (note: Note) => void;
  onDelete: (note: Note) => void;
};

/** Rút gọn nội dung Markdown thành đoạn xem trước dạng chữ thường. */
const previewText = (markdown: string, maxLen = 160): string => {
  const plain = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*`_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > maxLen ? `${plain.slice(0, maxLen)}…` : plain;
};

const NoteList = ({ notes, totalCount, deletingNoteId, onOpen, onDelete }: NoteListProps) => {
  const styles = createStyles();

  if (totalCount === 0) {
    return (
      <div className="card">
        <EmptyState icon={<FiBookOpen />} title="Chưa có ghi chép nào" hint="Bấm “+ Ghi chép mới” để soạn ghi chú hoặc lưu bài giảng đầu tiên." />
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={<FiBookOpen />} title="Không tìm thấy kết quả phù hợp" hint="Thử đổi từ khoá hoặc bỏ bớt bộ lọc." />
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {notes.map((note) => (
        <div
          className="card card-hover"
          key={note.id}
          style={styles.clickableCard}
          role="button"
          tabIndex={0}
          onClick={() => onOpen(note)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onOpen(note);
          }}
        >
          <div style={styles.head}>
            <div style={styles.titleWrap}>
              <span className={`badge ${note.category === 'bai_giang' ? 'badge-navy' : 'badge-grey'}`}>
                {NOTE_CATEGORY_LABELS[note.category]}
              </span>
              <span className="cell-strong" style={styles.title}>{note.title}</span>
            </div>
            <div style={styles.actions}>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                disabled={deletingNoteId === note.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(note);
                }}
              >
                {deletingNoteId === note.id ? 'Đang xoá…' : 'Xoá'}
              </button>
              <FiChevronRight style={styles.chevron} />
            </div>
          </div>

          <div className="cell-muted" style={styles.meta}>
            {note.date ? formatDate(note.date) : ''}
            {note.speaker ? ` · ${note.speaker}` : ''}
            {note.scripture ? ` · ${note.scripture}` : ''}
          </div>

          {note.content.trim() && <p style={styles.content}>{previewText(note.content)}</p>}

          {note.tags.length > 0 && (
            <div style={styles.tagRow}>
              {note.tags.map((tag) => (
                <span key={tag} className="badge badge-grey">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NoteList;

const createStyles = () => {
  return {
    list: { display: 'flex', flexDirection: 'column' as const, gap: 14 },
    clickableCard: { cursor: 'pointer' },
    head: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10,
      flexWrap: 'wrap' as const,
    },
    titleWrap: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const },
    title: { fontSize: '1.02rem' },
    actions: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
    chevron: { color: 'var(--ink-3, #98897b)', flexShrink: 0 },
    meta: { marginTop: 8 },
    content: { marginTop: 10, color: 'var(--ink-2)' },
    tagRow: { display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 10 },
  };
};

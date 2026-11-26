import { useState } from 'react';
import { NOTE_CATEGORY_LABELS, stripHtmlToText, type Note } from '@btnsg/shared';
import FacebookShareModal, { PUBLIC_LANDING_URL } from '../../../ui/FacebookShareModal';
import MarkdownView from '../../../ui/MarkdownView';
import { formatDate } from '../../../utils/format';
import { FiBookOpen, FiCalendar, FiEdit3, FiShare2, FiUser } from 'react-icons/fi';

type NotePreviewProps = {
  note: Note;
  onEdit: () => void;
};

/** Bố cục trang xem 1 ghi chép: tựa đề, câu gốc, diễn giả, thời gian, chia sẻ Facebook (nếu là bài giảng công khai) và nội dung. */
const NotePreview = ({ note, onEdit }: NotePreviewProps) => {
  const styles = createStyles();
  const [isShareOpen, setIsShareOpen] = useState(false);

  const metaItems = [
    note.scripture && { icon: <FiBookOpen />, text: note.scripture },
    note.speaker && { icon: <FiUser />, text: note.speaker },
    note.date && { icon: <FiCalendar />, text: formatDate(note.date) },
  ].filter((item): item is { icon: JSX.Element; text: string } => Boolean(item));

  return (
    <div className="card" style={styles.page}>
      <div style={styles.editRow}>
        {note.category === 'bai_giang' && note.published && (
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setIsShareOpen(true)}>
            <FiShare2 /> Chia sẻ Facebook
          </button>
        )}
        <button type="button" className="btn btn-primary btn-sm" onClick={onEdit}>
          <FiEdit3 /> Chỉnh sửa
        </button>
      </div>

      <span className={`badge ${note.category === 'bai_giang' ? 'badge-navy' : 'badge-grey'}`}>
        {NOTE_CATEGORY_LABELS[note.category]}
      </span>
      <h1 style={styles.title}>{note.title}</h1>

      {metaItems.length > 0 && (
        <div style={styles.metaRow}>
          {metaItems.map((item, i) => (
            <span key={i} style={styles.metaItem}>
              {item.icon} {item.text}
            </span>
          ))}
        </div>
      )}

      {note.tags.length > 0 && (
        <div style={styles.tagRow}>
          {note.tags.map((tag) => (
            <span key={tag} className="badge badge-grey">#{tag}</span>
          ))}
        </div>
      )}

      <hr style={styles.divider} />

      <MarkdownView markdown={note.content} />

      <FacebookShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        url={`${PUBLIC_LANDING_URL}/bai-giang/${note.id}`}
        title={note.title}
        description={stripHtmlToText(note.content).slice(0, 180)}
        isDraft={!note.published}
      />
    </div>
  );
};

export default NotePreview;

const createStyles = () => {
  return {
    page: { maxWidth: 760, margin: '0 auto' },
    editRow: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 10 },
    title: { fontSize: '1.6rem', lineHeight: 1.3, margin: '10px 0 12px' },
    metaRow: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px 18px', marginBottom: 12 },
    metaItem: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      color: 'var(--ink-2)',
      fontSize: '0.88rem',
    },
    tagRow: { display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginBottom: 12 },
    divider: { border: 'none', borderTop: '1px solid var(--line, #e5decf)', margin: '0 0 18px' },
  };
};

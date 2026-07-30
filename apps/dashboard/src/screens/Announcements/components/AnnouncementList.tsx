import type { Announcement } from '@btnsg/shared';
import EmptyState from '../../../ui/EmptyState';
import { formatDate } from '../../../utils/format';
import { FiBell, FiBookmark } from 'react-icons/fi';

type AnnouncementListProps = {
  announcements: Announcement[];
  onEdit: (item: Announcement) => void;
  onDelete: (item: Announcement) => void;
  onTogglePin: (item: Announcement) => void;
};

const AnnouncementList = ({ announcements, onEdit, onDelete, onTogglePin }: AnnouncementListProps) => {
  const styles = createStyles();

  if (announcements.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={<FiBell />} title="Chưa có thông báo" hint="Tạo thông báo để nhắc lịch nhóm, sự kiện…" />
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {announcements.map((item) => (
        <div className="card card-hover" key={item.id} style={item.pinned ? styles.pinnedCard : undefined}>
          <div style={styles.head}>
            <div style={styles.titleWrap}>
              {item.pinned && <span className="badge badge-amber"><FiBookmark /> Đã ghim</span>}
              <span className="cell-strong" style={styles.title}>{item.title}</span>
            </div>
            <div style={styles.actions}>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => onTogglePin(item)}>
                {item.pinned ? 'Bỏ ghim' : 'Ghim'}
              </button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => onEdit(item)}>Sửa</button>
              <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(item)}>Xoá</button>
            </div>
          </div>
          <p style={styles.content}>{item.content}</p>
          <div className="cell-muted" style={styles.meta}>
            {item.author ? `${item.author} · ` : ''}{formatDate(item.createdAt)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementList;

const createStyles = () => {
  return {
    list: { display: 'flex', flexDirection: 'column' as const, gap: 14 },
    pinnedCard: {
      borderColor: 'rgba(240, 193, 75, 0.6)',
      boxShadow: '0 0 0 3px rgba(240, 193, 75, 0.12), var(--shadow-sm)',
    },
    head: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 10,
      flexWrap: 'wrap' as const,
    },
    titleWrap: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const },
    title: { fontSize: '1.02rem' },
    actions: { display: 'flex', gap: 6 },
    content: { marginTop: 10, color: 'var(--ink-2)', whiteSpace: 'pre-wrap' as const },
    meta: { marginTop: 10 },
  };
};

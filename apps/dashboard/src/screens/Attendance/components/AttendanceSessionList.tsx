import type { AttendanceSession } from '@btnsg/shared';
import EmptyState from '../../../ui/EmptyState';
import { formatDate } from '../../../utils/format';

type AttendanceSessionListProps = {
  sessions: AttendanceSession[];
  selectedSessionId: string | null;
  onSelect: (session: AttendanceSession) => void;
  onDelete: (session: AttendanceSession) => void;
};

const AttendanceSessionList = ({ sessions, selectedSessionId, onSelect, onDelete }: AttendanceSessionListProps) => {
  const styles = createStyles();

  if (sessions.length === 0) {
    return (
      <div className="card">
        <EmptyState icon="🗓️" title="Chưa có buổi điểm danh" hint="Tạo buổi mới để bắt đầu điểm danh." />
      </div>
    );
  }

  return (
    <div style={styles.list}>
      {sessions.map((session) => {
        const presentCount = session.records.filter((r) => r.status === 'present').length;
        const isSelected = session.id === selectedSessionId;
        return (
          <div
            key={session.id}
            className="card card-hover"
            style={isSelected ? { ...styles.item, ...styles.itemActive } : styles.item}
            onClick={() => onSelect(session)}
          >
            <div style={styles.itemHead}>
              <span className="cell-strong">{session.title}</span>
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(session);
                }}
              >
                Xoá
              </button>
            </div>
            <div style={styles.itemMeta}>
              <span className="cell-muted">{formatDate(session.date)}</span>
              <span className="badge badge-brand">
                {presentCount}/{session.records.length} có mặt
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AttendanceSessionList;

const createStyles = () => {
  return {
    list: { display: 'flex', flexDirection: 'column' as const, gap: 12 },
    item: { cursor: 'pointer', padding: 16 },
    itemActive: {
      borderColor: 'var(--brand)',
      boxShadow: '0 0 0 3px var(--brand-soft), var(--shadow-md)',
    },
    itemHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    itemMeta: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  };
};

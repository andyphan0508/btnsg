import type { OverviewStats } from '@btnsg/shared';
import EmptyState from '../../../ui/EmptyState';
import { formatDate } from '../../../utils/format';

type OverviewRecentSessionsProps = {
  sessions: OverviewStats['recentSessions'];
};

const OverviewRecentSessions = ({ sessions }: OverviewRecentSessionsProps) => {
  const styles = createStyles();

  if (sessions.length === 0) {
    return (
      <div className="card">
        <div className="card-title">Điểm danh gần đây</div>
        <EmptyState icon="✅" title="Chưa có buổi điểm danh nào" hint="Tạo buổi điểm danh đầu tiên ở mục Điểm danh." />
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-title">Điểm danh gần đây</div>
      <div style={styles.list}>
        {sessions.map((session) => {
          const rate = session.totalCount > 0 ? Math.round((session.presentCount / session.totalCount) * 100) : 0;
          return (
            <div key={session.id} style={styles.row}>
              <div style={styles.rowInfo}>
                <span className="cell-strong">{session.title}</span>
                <span className="cell-muted">{formatDate(session.date)}</span>
              </div>
              <div style={styles.rowRight}>
                <div className="progress-track" style={styles.progress}>
                  <div className="progress-fill" style={{ width: `${rate}%` }} />
                </div>
                <span className="badge badge-brand">
                  {session.presentCount}/{session.totalCount}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OverviewRecentSessions;

const createStyles = () => {
  return {
    list: { display: 'flex', flexDirection: 'column' as const, gap: 12 },
    row: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      flexWrap: 'wrap' as const,
    },
    rowInfo: { display: 'flex', flexDirection: 'column' as const },
    rowRight: { display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 180px', justifyContent: 'flex-end' },
    progress: { width: 120 },
  };
};

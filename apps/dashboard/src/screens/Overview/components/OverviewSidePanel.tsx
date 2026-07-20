import type { OverviewStats } from '@btnsg/shared';
import { DAY_OF_WEEK_LABELS } from '@btnsg/shared';
import EmptyState from '../../../ui/EmptyState';

type OverviewSidePanelProps = {
  events: OverviewStats['upcomingEvents'];
  announcements: OverviewStats['pinnedAnnouncements'];
};

const OverviewSidePanel = ({ events, announcements }: OverviewSidePanelProps) => {
  const styles = createStyles();

  return (
    <div style={styles.column}>
      <div className="card">
        <div className="card-title">Lịch trong tuần</div>
        {events.length === 0 && <EmptyState icon="📅" title="Chưa có lịch sinh hoạt" />}
        <div style={styles.list}>
          {events.map((event) => (
            <div key={event.id} style={styles.eventRow}>
              <span className={`badge ${event.isMain ? 'badge-brand' : 'badge-grey'}`}>
                {event.recurrence === 'weekly' && event.dayOfWeek !== undefined
                  ? DAY_OF_WEEK_LABELS[event.dayOfWeek]
                  : event.date ?? 'Một lần'}
              </span>
              <div style={styles.eventInfo}>
                <span className="cell-strong">{event.title}</span>
                <span className="cell-muted">{event.time}{event.location ? ` · ${event.location}` : ''}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">Thông báo ghim</div>
        {announcements.length === 0 && <EmptyState icon="📌" title="Chưa có thông báo ghim" />}
        <div style={styles.list}>
          {announcements.map((item) => (
            <div key={item.id} style={styles.announcement}>
              <span className="cell-strong">📌 {item.title}</span>
              <p className="cell-muted" style={styles.announcementBody}>{item.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewSidePanel;

const createStyles = () => {
  return {
    column: { display: 'flex', flexDirection: 'column' as const, gap: 18 },
    list: { display: 'flex', flexDirection: 'column' as const, gap: 12 },
    eventRow: { display: 'flex', alignItems: 'flex-start', gap: 10 },
    eventInfo: { display: 'flex', flexDirection: 'column' as const },
    announcement: { display: 'flex', flexDirection: 'column' as const, gap: 4 },
    announcementBody: {
      display: '-webkit-box',
      WebkitLineClamp: 3,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    },
  };
};

import type { AttendanceSession, AttendanceStatus, Member } from '@btnsg/shared';
import { ATTENDANCE_STATUS_LABELS } from '@btnsg/shared';
import EmptyState from '../../../ui/EmptyState';
import { formatDate } from '../../../utils/format';

type AttendanceSheetProps = {
  session: AttendanceSession | null;
  members: Member[];
  isSaving: boolean;
  onSetStatus: (memberId: string, status: AttendanceStatus) => void;
  onMarkAll: (status: AttendanceStatus) => void;
  onSave: () => void;
};

const STATUS_OPTIONS: AttendanceStatus[] = ['present', 'absent', 'excused'];

const STATUS_BADGE_CLASS: Record<AttendanceStatus, string> = {
  present: 'badge-green',
  absent: 'badge-red',
  excused: 'badge-amber',
};

const AttendanceSheet = ({ session, members, isSaving, onSetStatus, onMarkAll, onSave }: AttendanceSheetProps) => {
  const styles = createStyles();

  if (!session) {
    return (
      <div className="card">
        <EmptyState icon="👈" title="Chọn một buổi điểm danh" hint="Hoặc tạo buổi mới để bắt đầu." />
      </div>
    );
  }

  const statusByMemberId = new Map(session.records.map((record) => [record.memberId, record.status]));
  const presentCount = session.records.filter((r) => r.status === 'present').length;

  return (
    <div className="card" style={styles.sheet}>
      <div style={styles.head}>
        <div>
          <div className="card-title" style={styles.title}>{session.title}</div>
          <span className="cell-muted">{formatDate(session.date)} · {presentCount}/{members.length} có mặt</span>
        </div>
        <div style={styles.headActions}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => onMarkAll('present')}>
            Tất cả có mặt
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => onMarkAll('absent')}>
            Tất cả vắng
          </button>
        </div>
      </div>

      <div style={styles.rows}>
        {members.map((member) => {
          const currentStatus = statusByMemberId.get(member.id) ?? 'absent';
          return (
            <div className="att-row" key={member.id}>
              <div style={styles.memberInfo}>
                <span className="cell-strong">{member.name}</span>
                {member.role === 'leader' && <span className="badge badge-brand">{member.boardRole ?? 'BĐH'}</span>}
              </div>
              <div className="segmented">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={currentStatus === status ? 'active' : ''}
                    onClick={() => onSetStatus(member.id, status)}
                  >
                    {ATTENDANCE_STATUS_LABELS[status]}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.foot}>
        <span className="badge badge-grey">
          Tỷ lệ: {members.length > 0 ? Math.round((presentCount / members.length) * 100) : 0}%
        </span>
        <span className={`badge ${STATUS_BADGE_CLASS.present}`}>{presentCount} {ATTENDANCE_STATUS_LABELS.present}</span>
        <div className="toolbar-spacer" />
        <button type="button" className="btn btn-primary" disabled={isSaving} onClick={onSave}>
          {isSaving ? 'Đang lưu…' : 'Lưu điểm danh'}
        </button>
      </div>
    </div>
  );
};

export default AttendanceSheet;

const createStyles = () => {
  return {
    sheet: { padding: 0, overflow: 'hidden' },
    head: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      flexWrap: 'wrap' as const,
      padding: '20px 20px 14px',
      borderBottom: '1px solid var(--line)',
    },
    title: { marginBottom: 2 },
    headActions: { display: 'flex', gap: 8 },
    rows: { maxHeight: 460, overflowY: 'auto' as const },
    memberInfo: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const },
    foot: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      padding: '14px 20px',
      borderTop: '1px solid var(--line)',
      background: 'var(--surface-2)',
    },
  };
};

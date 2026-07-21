import type { MemberChange, MemberChangeAction } from '@btnsg/shared';

type MemberHistoryPanelProps = {
  changes: MemberChange[];
  isLoading: boolean;
};

const ACTION_META: Record<MemberChangeAction, { label: string; badge: string }> = {
  create: { label: 'Thêm mới', badge: 'badge-green' },
  update: { label: 'Cập nhật', badge: 'badge-blue' },
  delete: { label: 'Xoá', badge: 'badge-red' },
};

const FIELD_LABELS: Record<string, string> = {
  name: 'Họ tên',
  gender: 'Giới tính',
  birthday: 'Ngày sinh',
  phone: 'SĐT',
  email: 'Email',
  role: 'Vai trò',
  boardRole: 'Chức vụ',
  duties: 'Nhiệm vụ',
  group: 'Nhóm nhỏ',
  joinedAt: 'Ngày tham gia',
  status: 'Trạng thái',
  stage: 'Giai đoạn',
  notes: 'Ghi chú',
};

const VALUE_LABELS: Record<string, string> = {
  member: 'Ban viên',
  leader: 'Ban Điều Hành',
  active: 'Đang sinh hoạt',
  inactive: 'Tạm vắng',
  nam: 'Nam',
  nu: 'Nữ',
  thieu_nien: 'Thiếu niên',
  thanh_nien: 'Thanh niên',
  thanh_trang: 'Thanh tráng',
};

const displayValue = (value?: string): string => {
  if (value === undefined || value === '') return '(trống)';
  return VALUE_LABELS[value] ?? value;
};

const formatTime = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/** Hiển thị trực quan các thay đổi gần đây của danh sách thành viên. */
const MemberHistoryPanel = ({ changes, isLoading }: MemberHistoryPanelProps) => {
  return (
    <div className="card" style={styles.card}>
      <div className="card-title">Lịch sử thay đổi danh sách</div>
      {isLoading && <div style={styles.muted}>Đang tải lịch sử…</div>}
      {!isLoading && changes.length === 0 && (
        <div style={styles.muted}>Chưa có thay đổi nào được ghi nhận.</div>
      )}
      <div style={styles.list}>
        {changes.map((change) => {
          const meta = ACTION_META[change.action];
          return (
            <div key={change.id} style={styles.item}>
              <div style={styles.itemHead}>
                <span className={`badge ${meta.badge}`}>{meta.label}</span>
                <span className="cell-strong">{change.memberName}</span>
                {change.actorName && <span className="cell-muted">bởi {change.actorName}</span>}
                <span style={styles.time}>{formatTime(change.createdAt)}</span>
              </div>
              {change.action === 'update' && change.changes.length > 0 && (
                <ul style={styles.changeList}>
                  {change.changes.map((fieldChange, index) => (
                    <li key={`${change.id}-${index}`} style={styles.changeLine}>
                      <strong>{FIELD_LABELS[fieldChange.field] ?? fieldChange.field}:</strong>{' '}
                      <span style={styles.from}>{displayValue(fieldChange.from)}</span>
                      {' → '}
                      <span style={styles.to}>{displayValue(fieldChange.to)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MemberHistoryPanel;

const styles = {
  card: { marginBottom: 18 },
  muted: { fontSize: '0.84rem', color: 'var(--ink-3)', padding: '6px 0' },
  list: { display: 'flex', flexDirection: 'column' as const, gap: 10, maxHeight: 360, overflowY: 'auto' as const },
  item: {
    padding: '10px 12px',
    background: 'var(--surface-2)',
    borderRadius: 10,
  },
  itemHead: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const },
  time: { marginLeft: 'auto', fontSize: '0.76rem', color: 'var(--ink-3)' },
  changeList: { margin: '8px 0 0', paddingLeft: 18, display: 'flex', flexDirection: 'column' as const, gap: 3 },
  changeLine: { fontSize: '0.82rem', color: 'var(--ink-2)' },
  from: { color: 'var(--red)', textDecoration: 'line-through' },
  to: { color: 'var(--green)', fontWeight: 600 },
};

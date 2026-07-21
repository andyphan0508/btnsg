import { useMemo } from 'react';
import { computeAge, computeTransitionAlerts, type Member, type TransitionAlert } from '@btnsg/shared';

type TransitionAlertsPanelProps = {
  members: Member[];
};

const AlertList = ({
  title,
  hint,
  alerts,
  emptyText,
  accentBadge,
}: {
  title: string;
  hint: string;
  alerts: TransitionAlert[];
  emptyText: string;
  accentBadge: string;
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="card">
      <div className="card-title">{title}</div>
      <div style={styles.hint}>{hint}</div>
      {alerts.length === 0 ? (
        <div style={styles.empty}>{emptyText}</div>
      ) : (
        <div style={styles.list}>
          {alerts.map(({ member, year, milestoneAge }) => (
            <div key={member.id} style={styles.item}>
              <div>
                <div className="cell-strong">{member.name}</div>
                <div className="cell-muted">
                  {member.group ? `Nhóm ${member.group} · ` : ''}
                  {computeAge(member.birthday) !== null ? `${computeAge(member.birthday)} tuổi` : 'Chưa rõ tuổi'}
                </div>
              </div>
              <span className={`badge ${year === currentYear ? accentBadge : 'badge-grey'}`}>
                Đủ {milestoneAge} tuổi {year === currentYear ? 'năm nay' : `năm ${year}`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/** Cảnh báo cho BĐH: ai sắp lên thanh tráng, thiếu niên nào sắp lên thanh niên. */
const TransitionAlertsPanel = ({ members }: TransitionAlertsPanelProps) => {
  const alerts = useMemo(() => computeTransitionAlerts(members), [members]);

  if (alerts.toThanhTrang.length === 0 && alerts.toThanhNien.length === 0) return null;

  return (
    <div className="grid-2" style={styles.grid}>
      <AlertList
        title="⬆️ Chuẩn bị lên Thanh tráng"
        hint="Thanh niên đủ 30 tuổi trong năm nay hoặc năm sau."
        alerts={alerts.toThanhTrang}
        emptyText="Chưa có thành viên nào sắp qua 30 tuổi."
        accentBadge="badge-amber"
      />
      <AlertList
        title="🌱 Thiếu niên chuẩn bị lên Thanh niên"
        hint="Thiếu niên đủ 18 tuổi trong năm nay hoặc năm sau."
        alerts={alerts.toThanhNien}
        emptyText="Chưa có thiếu niên nào sắp đủ 18 tuổi."
        accentBadge="badge-green"
      />
    </div>
  );
};

export default TransitionAlertsPanel;

const styles = {
  grid: { marginBottom: 18 },
  hint: { fontSize: '0.78rem', color: 'var(--ink-3)', marginBottom: 10 },
  empty: { fontSize: '0.84rem', color: 'var(--ink-3)', padding: '8px 0' },
  list: { display: 'flex', flexDirection: 'column' as const, gap: 8 },
  item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    padding: '8px 10px',
    background: 'var(--surface-2)',
    borderRadius: 10,
  },
};

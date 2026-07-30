import type { Plan } from '@btnsg/shared';
import { PLAN_STATUS_LABELS } from '@btnsg/shared';
import EmptyState from '../../../ui/EmptyState';
import { formatDate } from '../../../utils/format';
import { FiCalendar, FiCheck, FiTarget } from 'react-icons/fi';

type PlanListProps = {
  plans: Plan[];
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onToggleItem: (plan: Plan, itemId: string) => void;
};

const STATUS_BADGE: Record<Plan['status'], string> = {
  draft: 'badge-grey',
  active: 'badge-brand',
  done: 'badge-green',
};

const PlanList = ({ plans, onEdit, onDelete, onToggleItem }: PlanListProps) => {
  const styles = createStyles();

  if (plans.length === 0) {
    return (
      <div className="card">
        <EmptyState icon={<FiTarget />} title="Chưa có kế hoạch" hint="Lên kế hoạch cho các chương trình của Ban." />
      </div>
    );
  }

  return (
    <div className="grid-2">
      {plans.map((plan) => {
        const doneCount = plan.items.filter((item) => item.done).length;
        const progress = plan.items.length > 0 ? Math.round((doneCount / plan.items.length) * 100) : 0;
        return (
          <div className="card card-hover" key={plan.id}>
            <div style={styles.head}>
              <span className={`badge ${STATUS_BADGE[plan.status]}`}>{PLAN_STATUS_LABELS[plan.status]}</span>
              <div style={styles.actions}>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => onEdit(plan)}>Sửa</button>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(plan)}>Xoá</button>
              </div>
            </div>
            <div className="cell-strong" style={styles.title}>{plan.title}</div>
            {plan.goal && <p className="cell-muted" style={styles.goal}>{plan.goal}</p>}
            {(plan.startDate || plan.endDate) && (
              <div className="cell-muted" style={styles.dates}>
                <FiCalendar /> {formatDate(plan.startDate)} – {formatDate(plan.endDate)}
              </div>
            )}

            <div style={styles.progressRow}>
              <div className="progress-track" style={styles.progressTrack}>
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <span className="badge badge-grey">{doneCount}/{plan.items.length}</span>
            </div>

            <div style={styles.checklist}>
              {plan.items.map((item) => (
                <div
                  key={item.id}
                  className={`check-item${item.done ? ' done' : ''}`}
                  onClick={() => onToggleItem(plan, item.id)}
                >
                  <span className="check-box">{item.done ? <FiCheck /> : null}</span>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlanList;

const createStyles = () => {
  return {
    head: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
    actions: { display: 'flex', gap: 6 },
    title: { fontSize: '1.05rem', marginTop: 10 },
    goal: { marginTop: 4 },
    dates: { marginTop: 8, fontSize: '0.8rem' },
    progressRow: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 },
    progressTrack: { flex: 1 },
    checklist: { marginTop: 10, display: 'flex', flexDirection: 'column' as const, gap: 2 },
  };
};

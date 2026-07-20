import type { Member, TaskItem, TaskStatus } from '@btnsg/shared';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@btnsg/shared';
import { formatDate } from '../../../utils/format';

type TaskBoardProps = {
  tasks: TaskItem[];
  members: Member[];
  onEdit: (task: TaskItem) => void;
  onDelete: (task: TaskItem) => void;
  onMove: (task: TaskItem, status: TaskStatus) => void;
};

const COLUMNS: TaskStatus[] = ['todo', 'doing', 'done'];

const PRIORITY_BADGE: Record<TaskItem['priority'], string> = {
  low: 'badge-grey',
  medium: 'badge-blue',
  high: 'badge-red',
};

const TaskBoard = ({ tasks, members, onEdit, onDelete, onMove }: TaskBoardProps) => {
  const styles = createStyles();
  const memberNameById = new Map(members.map((m) => [m.id, m.name]));

  const renderMoveButtons = (task: TaskItem) => {
    const currentIndex = COLUMNS.indexOf(task.status);
    return (
      <div style={styles.moveButtons}>
        {currentIndex > 0 && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onMove(task, COLUMNS[currentIndex - 1])}
          >
            ← {TASK_STATUS_LABELS[COLUMNS[currentIndex - 1]]}
          </button>
        )}
        {currentIndex < COLUMNS.length - 1 && (
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onMove(task, COLUMNS[currentIndex + 1])}
          >
            {TASK_STATUS_LABELS[COLUMNS[currentIndex + 1]]} →
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="kanban">
      {COLUMNS.map((status) => {
        const columnTasks = tasks.filter((task) => task.status === status);
        return (
          <div className="kanban-col" key={status}>
            <div className="kanban-col-head">
              <span>{TASK_STATUS_LABELS[status]}</span>
              <span className="badge badge-grey">{columnTasks.length}</span>
            </div>
            {columnTasks.length === 0 && <span className="cell-muted" style={styles.emptyCol}>Trống</span>}
            {columnTasks.map((task) => (
              <div className="kanban-card" key={task.id}>
                <div style={styles.cardHead}>
                  <span className={`badge ${PRIORITY_BADGE[task.priority]}`}>
                    {TASK_PRIORITY_LABELS[task.priority]}
                  </span>
                  {task.dueDate && <span className="cell-muted">⏰ {formatDate(task.dueDate)}</span>}
                </div>
                <div className="cell-strong" style={styles.cardTitle}>{task.title}</div>
                {task.description && <p className="cell-muted" style={styles.cardDesc}>{task.description}</p>}
                {task.assigneeIds.length > 0 && (
                  <div style={styles.assignees}>
                    {task.assigneeIds.map((id) => (
                      <span className="badge badge-brand" key={id}>{memberNameById.get(id) ?? 'Không rõ'}</span>
                    ))}
                  </div>
                )}
                {renderMoveButtons(task)}
                <div style={styles.cardFoot}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(task)}>Sửa</button>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => onDelete(task)}>Xoá</button>
                </div>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoard;

const createStyles = () => {
  return {
    emptyCol: { textAlign: 'center' as const, padding: '14px 0' },
    cardHead: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 },
    cardTitle: { fontSize: '0.95rem' },
    cardDesc: { marginTop: 4, fontSize: '0.82rem' },
    assignees: { display: 'flex', flexWrap: 'wrap' as const, gap: 4, marginTop: 8 },
    moveButtons: { display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' as const },
    cardFoot: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 4,
      marginTop: 10,
      borderTop: '1px solid var(--line)',
      paddingTop: 8,
    },
  };
};

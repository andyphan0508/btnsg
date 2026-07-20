import { useEffect, useState } from 'react';
import type { Member, TaskItem, TaskPriority, TaskStatus } from '@btnsg/shared';
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from '@btnsg/shared';
import Modal from '../../../ui/Modal';

export type TaskFormValues = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assigneeIds: string[];
};

const EMPTY_FORM: TaskFormValues = {
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: '',
  assigneeIds: [],
};

type TaskFormModalProps = {
  isOpen: boolean;
  editingTask: TaskItem | null;
  members: Member[];
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSubmit: (values: TaskFormValues) => void;
};

const TaskFormModal = ({ isOpen, editingTask, members, isSaving, saveError, onClose, onSubmit }: TaskFormModalProps) => {
  const [formValues, setFormValues] = useState<TaskFormValues>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    if (!editingTask) {
      setFormValues(EMPTY_FORM);
      return;
    }
    setFormValues({
      title: editingTask.title,
      description: editingTask.description ?? '',
      status: editingTask.status,
      priority: editingTask.priority,
      dueDate: editingTask.dueDate ?? '',
      assigneeIds: editingTask.assigneeIds,
    });
  }, [isOpen, editingTask]);

  const setField = <K extends keyof TaskFormValues>(field: K, value: TaskFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAssignee = (memberId: string) => {
    setFormValues((prev) => ({
      ...prev,
      assigneeIds: prev.assigneeIds.includes(memberId)
        ? prev.assigneeIds.filter((id) => id !== memberId)
        : [...prev.assigneeIds, memberId],
    }));
  };

  const styles = createStyles();

  return (
    <Modal
      title={editingTask ? 'Cập nhật công việc' : 'Thêm công việc'}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          <button type="button" className="btn btn-primary" disabled={isSaving} onClick={() => onSubmit(formValues)}>
            {isSaving ? 'Đang lưu…' : 'Lưu công việc'}
          </button>
        </>
      }
    >
      {saveError && <div className="form-error">{saveError}</div>}
      <div className="form-grid">
        <div className="field span-2">
          <label className="field-label">Tên công việc *</label>
          <input className="input" value={formValues.title} onChange={(e) => setField('title', e.target.value)} />
        </div>
        <div className="field span-2">
          <label className="field-label">Mô tả</label>
          <textarea className="textarea" value={formValues.description} onChange={(e) => setField('description', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Trạng thái</label>
          <select className="select" value={formValues.status} onChange={(e) => setField('status', e.target.value as TaskStatus)}>
            {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Ưu tiên</label>
          <select className="select" value={formValues.priority} onChange={(e) => setField('priority', e.target.value as TaskPriority)}>
            {Object.entries(TASK_PRIORITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Hạn hoàn thành</label>
          <input type="date" className="input" value={formValues.dueDate} onChange={(e) => setField('dueDate', e.target.value)} />
        </div>
        <div className="field span-2">
          <label className="field-label">Phân công cho</label>
          <div style={styles.assigneeGrid}>
            {members.map((member) => {
              const isChecked = formValues.assigneeIds.includes(member.id);
              return (
                <label
                  key={member.id}
                  className={`check-item${isChecked ? ' done' : ''}`}
                  style={isChecked ? { ...styles.assignee, textDecoration: 'none', color: 'var(--brand-deep)' } : styles.assignee}
                >
                  <span className="check-box">{isChecked ? '✓' : ''}</span>
                  <input type="checkbox" checked={isChecked} onChange={() => toggleAssignee(member.id)} style={styles.hiddenInput} />
                  {member.name}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TaskFormModal;

const createStyles = () => {
  return {
    assigneeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: 4,
      maxHeight: 180,
      overflowY: 'auto' as const,
      border: '1px solid var(--line)',
      borderRadius: 10,
      padding: 8,
    },
    assignee: { fontSize: '0.84rem' },
    hiddenInput: { display: 'none' },
  };
};

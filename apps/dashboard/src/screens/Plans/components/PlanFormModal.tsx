import { useEffect, useState } from 'react';
import type { Plan, PlanStatus } from '@btnsg/shared';
import { PLAN_STATUS_LABELS } from '@btnsg/shared';
import Modal from '../../../ui/Modal';

export type PlanFormValues = {
  title: string;
  goal: string;
  startDate: string;
  endDate: string;
  status: PlanStatus;
  itemsText: string;
};

const EMPTY_FORM: PlanFormValues = {
  title: '',
  goal: '',
  startDate: '',
  endDate: '',
  status: 'draft',
  itemsText: '',
};

type PlanFormModalProps = {
  isOpen: boolean;
  editingPlan: Plan | null;
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSubmit: (values: PlanFormValues) => void;
};

const PlanFormModal = ({ isOpen, editingPlan, isSaving, saveError, onClose, onSubmit }: PlanFormModalProps) => {
  const [formValues, setFormValues] = useState<PlanFormValues>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    if (!editingPlan) {
      setFormValues(EMPTY_FORM);
      return;
    }
    setFormValues({
      title: editingPlan.title,
      goal: editingPlan.goal ?? '',
      startDate: editingPlan.startDate ?? '',
      endDate: editingPlan.endDate ?? '',
      status: editingPlan.status,
      itemsText: editingPlan.items.map((item) => item.text).join('\n'),
    });
  }, [isOpen, editingPlan]);

  const setField = <K extends keyof PlanFormValues>(field: K, value: PlanFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      title={editingPlan ? 'Cập nhật kế hoạch' : 'Lên kế hoạch mới'}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          <button type="button" className="btn btn-primary" disabled={isSaving} onClick={() => onSubmit(formValues)}>
            {isSaving ? 'Đang lưu…' : 'Lưu kế hoạch'}
          </button>
        </>
      }
    >
      {saveError && <div className="form-error">{saveError}</div>}
      <div className="field">
        <label className="field-label">Tên kế hoạch *</label>
        <input
          className="input"
          placeholder="VD: Kỳ trại hè 2026"
          value={formValues.title}
          onChange={(e) => setField('title', e.target.value)}
        />
      </div>
      <div className="field">
        <label className="field-label">Mục tiêu</label>
        <textarea className="textarea" value={formValues.goal} onChange={(e) => setField('goal', e.target.value)} />
      </div>
      <div className="form-grid">
        <div className="field">
          <label className="field-label">Bắt đầu</label>
          <input type="date" className="input" value={formValues.startDate} onChange={(e) => setField('startDate', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Kết thúc</label>
          <input type="date" className="input" value={formValues.endDate} onChange={(e) => setField('endDate', e.target.value)} />
        </div>
        <div className="field span-2">
          <label className="field-label">Trạng thái</label>
          <select className="select" value={formValues.status} onChange={(e) => setField('status', e.target.value as PlanStatus)}>
            {Object.entries(PLAN_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label className="field-label">Các hạng mục (mỗi dòng một việc)</label>
        <textarea
          className="textarea"
          rows={5}
          placeholder={'VD:\nĐặt địa điểm\nLên chương trình\nPhân công hậu cần'}
          value={formValues.itemsText}
          onChange={(e) => setField('itemsText', e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default PlanFormModal;

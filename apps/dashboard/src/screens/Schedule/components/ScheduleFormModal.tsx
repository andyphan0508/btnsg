import { useEffect, useState } from 'react';
import type { ScheduleEvent, ScheduleRecurrence } from '@btnsg/shared';
import { DAY_OF_WEEK_LABELS } from '@btnsg/shared';
import Modal from '../../../ui/Modal';
import { todayIsoDate } from '../../../utils/format';

export type ScheduleFormValues = {
  title: string;
  recurrence: ScheduleRecurrence;
  dayOfWeek: number;
  date: string;
  time: string;
  location: string;
  description: string;
  isMain: boolean;
};

const EMPTY_FORM: ScheduleFormValues = {
  title: '',
  recurrence: 'weekly',
  dayOfWeek: 0,
  date: todayIsoDate(),
  time: '19:00',
  location: '',
  description: '',
  isMain: false,
};

type ScheduleFormModalProps = {
  isOpen: boolean;
  editingEvent: ScheduleEvent | null;
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSubmit: (values: ScheduleFormValues) => void;
};

const ScheduleFormModal = ({ isOpen, editingEvent, isSaving, saveError, onClose, onSubmit }: ScheduleFormModalProps) => {
  const [formValues, setFormValues] = useState<ScheduleFormValues>(EMPTY_FORM);

  useEffect(() => {
    if (!isOpen) return;
    if (!editingEvent) {
      setFormValues(EMPTY_FORM);
      return;
    }
    setFormValues({
      title: editingEvent.title,
      recurrence: editingEvent.recurrence,
      dayOfWeek: editingEvent.dayOfWeek ?? 0,
      date: editingEvent.date ?? todayIsoDate(),
      time: editingEvent.time,
      location: editingEvent.location ?? '',
      description: editingEvent.description ?? '',
      isMain: Boolean(editingEvent.isMain),
    });
  }, [isOpen, editingEvent]);

  const setField = <K extends keyof ScheduleFormValues>(field: K, value: ScheduleFormValues[K]) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal
      title={editingEvent ? 'Cập nhật lịch sinh hoạt' : 'Thêm lịch sinh hoạt'}
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          <button type="button" className="btn btn-primary" disabled={isSaving} onClick={() => onSubmit(formValues)}>
            {isSaving ? 'Đang lưu…' : 'Lưu lịch'}
          </button>
        </>
      }
    >
      {saveError && <div className="form-error">{saveError}</div>}
      <div className="form-grid">
        <div className="field span-2">
          <label className="field-label">Tên buổi sinh hoạt *</label>
          <input className="input" value={formValues.title} onChange={(e) => setField('title', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Loại lịch</label>
          <select
            className="select"
            value={formValues.recurrence}
            onChange={(e) => setField('recurrence', e.target.value as ScheduleRecurrence)}
          >
            <option value="weekly">Hằng tuần</option>
            <option value="once">Một lần (sự kiện)</option>
          </select>
        </div>
        {formValues.recurrence === 'weekly' ? (
          <div className="field">
            <label className="field-label">Thứ trong tuần</label>
            <select
              className="select"
              value={formValues.dayOfWeek}
              onChange={(e) => setField('dayOfWeek', Number(e.target.value))}
            >
              {DAY_OF_WEEK_LABELS.map((label, index) => (
                <option key={label} value={index}>{label}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="field">
            <label className="field-label">Ngày diễn ra</label>
            <input type="date" className="input" value={formValues.date} onChange={(e) => setField('date', e.target.value)} />
          </div>
        )}
        <div className="field">
          <label className="field-label">Giờ *</label>
          <input type="time" className="input" value={formValues.time} onChange={(e) => setField('time', e.target.value)} />
        </div>
        <div className="field">
          <label className="field-label">Địa điểm</label>
          <input className="input" value={formValues.location} onChange={(e) => setField('location', e.target.value)} />
        </div>
        <div className="field span-2">
          <label className="field-label">Mô tả</label>
          <textarea className="textarea" value={formValues.description} onChange={(e) => setField('description', e.target.value)} />
        </div>
        <div className="field span-2">
          <label className="check-item" style={{ padding: 0 }}>
            <input
              type="checkbox"
              checked={formValues.isMain}
              onChange={(e) => setField('isMain', e.target.checked)}
            />
            Đây là buổi nhóm chính trong tuần
          </label>
        </div>
      </div>
    </Modal>
  );
};

export default ScheduleFormModal;

import { useEffect, useState } from 'react';
import type { ScheduleEvent } from '@btnsg/shared';
import Modal from '../../../ui/Modal';
import { todayIsoDate } from '../../../utils/format';

export type AttendanceCreateValues = {
  date: string;
  title: string;
  scheduleEventId: string;
};

type AttendanceCreateModalProps = {
  isOpen: boolean;
  scheduleEvents: ScheduleEvent[];
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSubmit: (values: AttendanceCreateValues) => void;
};

const AttendanceCreateModal = ({
  isOpen,
  scheduleEvents,
  isSaving,
  saveError,
  onClose,
  onSubmit,
}: AttendanceCreateModalProps) => {
  const [sessionDate, setSessionDate] = useState<string>(todayIsoDate());
  const [sessionTitle, setSessionTitle] = useState<string>('Nhóm thờ phượng Chúa');
  const [linkedEventId, setLinkedEventId] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;
    setSessionDate(todayIsoDate());
    setSessionTitle(scheduleEvents.find((e) => e.isMain)?.title ?? 'Buổi sinh hoạt');
    setLinkedEventId(scheduleEvents.find((e) => e.isMain)?.id ?? '');
  }, [isOpen, scheduleEvents]);

  const handleEventSelect = (eventId: string) => {
    setLinkedEventId(eventId);
    const event = scheduleEvents.find((e) => e.id === eventId);
    if (event) setSessionTitle(event.title);
  };

  return (
    <Modal
      title="Tạo buổi điểm danh"
      isOpen={isOpen}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>Huỷ</button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={isSaving}
            onClick={() => onSubmit({ date: sessionDate, title: sessionTitle, scheduleEventId: linkedEventId })}
          >
            {isSaving ? 'Đang tạo…' : 'Tạo buổi điểm danh'}
          </button>
        </>
      }
    >
      {saveError && <div className="form-error">{saveError}</div>}
      <div className="field">
        <label className="field-label">Buổi sinh hoạt</label>
        <select className="select" value={linkedEventId} onChange={(e) => handleEventSelect(e.target.value)}>
          <option value="">— Buổi khác —</option>
          {scheduleEvents.map((event) => (
            <option key={event.id} value={event.id}>{event.title} ({event.time})</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label className="field-label">Tên buổi *</label>
        <input className="input" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} />
      </div>
      <div className="field">
        <label className="field-label">Ngày *</label>
        <input type="date" className="input" value={sessionDate} onChange={(e) => setSessionDate(e.target.value)} />
      </div>
    </Modal>
  );
};

export default AttendanceCreateModal;

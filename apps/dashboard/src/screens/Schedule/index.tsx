import { useEffect, useMemo, useState } from 'react';
import type { ScheduleEvent } from '@btnsg/shared';
import { scheduleApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import ScheduleFormModal, { type ScheduleFormValues } from './components/ScheduleFormModal';
import ScheduleTable from './components/ScheduleTable';

const buildSchedulePayload = (values: ScheduleFormValues): Partial<ScheduleEvent> => {
  return {
    title: values.title,
    recurrence: values.recurrence,
    dayOfWeek: values.recurrence === 'weekly' ? values.dayOfWeek : undefined,
    date: values.recurrence === 'once' ? values.date : undefined,
    time: values.time,
    location: values.location || undefined,
    description: values.description || undefined,
    isMain: values.isMain,
  };
};

const ScheduleScreen = () => {
  // 1. State declarations
  const [eventList, setEventList] = useState<ScheduleEvent[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState<boolean>(false);
  const [eventListError, setEventListError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [isSavingEvent, setIsSavingEvent] = useState<boolean>(false);
  const [saveEventError, setSaveEventError] = useState<string | null>(null);

  // 2. Logic functions
  const validateScheduleForm = (values: ScheduleFormValues): boolean => {
    if (!values.title.trim()) return false;
    if (!values.time) return false;
    return true;
  };

  const sortedEvents = useMemo(() => {
    return [...eventList].sort((a, b) => {
      if (a.recurrence !== b.recurrence) return a.recurrence === 'weekly' ? -1 : 1;
      return (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0) || a.time.localeCompare(b.time);
    });
  }, [eventList]);

  // 3. API call functions
  const fetchEventList = async (): Promise<boolean> => {
    try {
      setIsLoadingEvents(true);
      const data = await scheduleApi.getList();
      setEventList(data);
      return true;
    } catch (error) {
      setEventListError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const submitScheduleForm = async (values: ScheduleFormValues): Promise<boolean> => {
    if (!validateScheduleForm(values)) {
      setSaveEventError('Vui lòng nhập tên buổi và giờ sinh hoạt.');
      return false;
    }

    try {
      setIsSavingEvent(true);
      setSaveEventError(null);
      const payload = buildSchedulePayload(values);
      if (editingEvent) {
        await scheduleApi.update(editingEvent.id, payload);
      } else {
        await scheduleApi.create(payload);
      }
      setIsFormOpen(false);
      await fetchEventList();
      return true;
    } catch (error) {
      setSaveEventError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsSavingEvent(false);
    }
  };

  const deleteEvent = async (event: ScheduleEvent): Promise<boolean> => {
    const confirmed = window.confirm(`Xoá lịch "${event.title}"?`);
    if (!confirmed) return false;

    try {
      await scheduleApi.remove(event.id);
      await fetchEventList();
      return true;
    } catch (error) {
      setEventListError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  // 4. Effects
  useEffect(() => {
    fetchEventList();
  }, []);

  // 5. Handlers
  const handleOpenCreate = () => {
    setEditingEvent(null);
    setSaveEventError(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setSaveEventError(null);
    setIsFormOpen(true);
  };

  // 6. Render
  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Sinh hoạt</span>
          <h2>Lịch sinh hoạt &amp; lịch trình</h2>
          <p className="page-sub">Quản lý các buổi định kỳ hằng tuần và sự kiện đặc biệt.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={handleOpenCreate}>
          + Thêm lịch
        </button>
      </div>

      {eventListError && <div className="form-error" style={{ marginBottom: 14 }}>{eventListError}</div>}
      {isLoadingEvents && eventList.length === 0 ? (
        <LoadingState />
      ) : (
        <ScheduleTable events={sortedEvents} onEdit={handleOpenEdit} onDelete={deleteEvent} />
      )}

      <ScheduleFormModal
        isOpen={isFormOpen}
        editingEvent={editingEvent}
        isSaving={isSavingEvent}
        saveError={saveEventError}
        onClose={() => setIsFormOpen(false)}
        onSubmit={submitScheduleForm}
      />
    </div>
  );
};

export default ScheduleScreen;

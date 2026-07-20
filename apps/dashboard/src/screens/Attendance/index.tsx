import { useEffect, useState } from 'react';
import type { AttendanceSession, AttendanceStatus, Member, ScheduleEvent } from '@btnsg/shared';
import { attendanceApi, memberApi, scheduleApi } from '../../api/resourceApi';
import LoadingState from '../../ui/LoadingState';
import AttendanceCreateModal, { type AttendanceCreateValues } from './components/AttendanceCreateModal';
import AttendanceSessionList from './components/AttendanceSessionList';
import AttendanceSheet from './components/AttendanceSheet';

const AttendanceScreen = () => {
  // 1. State declarations
  const [sessionList, setSessionList] = useState<AttendanceSession[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState<boolean>(false);
  const [sessionListError, setSessionListError] = useState<string | null>(null);

  const [memberList, setMemberList] = useState<Member[]>([]);
  const [scheduleEvents, setScheduleEvents] = useState<ScheduleEvent[]>([]);

  const [selectedSession, setSelectedSession] = useState<AttendanceSession | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [isCreatingSession, setIsCreatingSession] = useState<boolean>(false);
  const [createSessionError, setCreateSessionError] = useState<string | null>(null);

  const [isSavingRecords, setIsSavingRecords] = useState<boolean>(false);

  // 2. Logic functions
  const validateSessionForm = (values: AttendanceCreateValues): boolean => {
    if (!values.title.trim()) return false;
    if (!values.date) return false;
    return true;
  };

  const applyStatusToSelected = (memberId: string, status: AttendanceStatus) => {
    if (!selectedSession) return;
    const otherRecords = selectedSession.records.filter((r) => r.memberId !== memberId);
    setSelectedSession({ ...selectedSession, records: [...otherRecords, { memberId, status }] });
  };

  const applyStatusToAll = (status: AttendanceStatus) => {
    if (!selectedSession) return;
    const activeMembers = memberList.filter((m) => m.status === 'active');
    setSelectedSession({
      ...selectedSession,
      records: activeMembers.map((m) => ({ memberId: m.id, status })),
    });
  };

  // 3. API call functions
  const fetchSessionList = async (): Promise<boolean> => {
    try {
      setIsLoadingSessions(true);
      const data = await attendanceApi.getList();
      const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
      setSessionList(sorted);
      return true;
    } catch (error) {
      setSessionListError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const fetchMemberList = async (): Promise<boolean> => {
    try {
      const data = await memberApi.getList();
      setMemberList(data);
      return true;
    } catch (error) {
      setSessionListError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  const fetchScheduleEvents = async (): Promise<boolean> => {
    try {
      const data = await scheduleApi.getList();
      setScheduleEvents(data);
      return true;
    } catch {
      return false;
    }
  };

  const submitCreateSession = async (values: AttendanceCreateValues): Promise<boolean> => {
    if (!validateSessionForm(values)) {
      setCreateSessionError('Vui lòng nhập tên buổi và ngày.');
      return false;
    }

    try {
      setIsCreatingSession(true);
      setCreateSessionError(null);
      const activeMembers = memberList.filter((m) => m.status === 'active');
      const created = await attendanceApi.create({
        date: values.date,
        title: values.title,
        scheduleEventId: values.scheduleEventId || undefined,
        records: activeMembers.map((m) => ({ memberId: m.id, status: 'absent' as const })),
      });
      setIsCreateOpen(false);
      await fetchSessionList();
      setSelectedSession(created);
      return true;
    } catch (error) {
      setCreateSessionError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsCreatingSession(false);
    }
  };

  const saveSelectedSessionRecords = async (): Promise<boolean> => {
    if (!selectedSession) return false;

    try {
      setIsSavingRecords(true);
      await attendanceApi.update(selectedSession.id, { records: selectedSession.records });
      await fetchSessionList();
      return true;
    } catch (error) {
      setSessionListError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsSavingRecords(false);
    }
  };

  const deleteSession = async (session: AttendanceSession): Promise<boolean> => {
    const confirmed = window.confirm(`Xoá buổi điểm danh "${session.title}" ngày ${session.date}?`);
    if (!confirmed) return false;

    try {
      await attendanceApi.remove(session.id);
      if (selectedSession?.id === session.id) setSelectedSession(null);
      await fetchSessionList();
      return true;
    } catch (error) {
      setSessionListError(error instanceof Error ? error.message : String(error));
      return false;
    }
  };

  // 4. Effects
  useEffect(() => {
    fetchSessionList();
    fetchMemberList();
    fetchScheduleEvents();
  }, []);

  // 5. Render
  const styles = createStyles();
  const activeMembers = memberList.filter((m) => m.status === 'active');

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Tham gia sinh hoạt</span>
          <h2>Điểm danh</h2>
          <p className="page-sub">Theo dõi sự hiện diện của {activeMembers.length} ban viên đang sinh hoạt.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setIsCreateOpen(true)}>
          + Tạo buổi điểm danh
        </button>
      </div>

      {sessionListError && <div className="form-error" style={{ marginBottom: 14 }}>{sessionListError}</div>}

      {isLoadingSessions && sessionList.length === 0 ? (
        <LoadingState />
      ) : (
        <div style={styles.grid}>
          <AttendanceSessionList
            sessions={sessionList}
            selectedSessionId={selectedSession?.id ?? null}
            onSelect={setSelectedSession}
            onDelete={deleteSession}
          />
          <AttendanceSheet
            session={selectedSession}
            members={activeMembers}
            isSaving={isSavingRecords}
            onSetStatus={applyStatusToSelected}
            onMarkAll={applyStatusToAll}
            onSave={saveSelectedSessionRecords}
          />
        </div>
      )}

      <AttendanceCreateModal
        isOpen={isCreateOpen}
        scheduleEvents={scheduleEvents}
        isSaving={isCreatingSession}
        saveError={createSessionError}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={submitCreateSession}
      />
    </div>
  );
};

export default AttendanceScreen;

const createStyles = () => {
  return {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'minmax(240px, 1fr) minmax(0, 2fr)',
      gap: 18,
      alignItems: 'start' as const,
    },
  };
};

import type {
  Announcement,
  AttendanceSession,
  EmailTemplate,
  Expense,
  Member,
  MemberChange,
  OverviewStats,
  Plan,
  Profile,
  RequestItem,
  ScheduleEvent,
  TaskItem,
} from '@btnsg/shared';
import { supabase } from '../lib/supabase';

/* ============================================================
   Mapper snake_case (Postgres) ↔ camelCase (types dùng chung)
   ============================================================ */

type Row = Record<string, unknown>;

/** Cột tương ứng cho từng field; field JSON giữ nguyên cấu trúc camelCase bên trong jsonb. */
type FieldSpec = {
  field: string;
  column: string;
  /** Giá trị mặc định khi cột null (vd: mảng rỗng cho jsonb). */
  fallback?: unknown;
};

const f = (field: string, column: string, fallback?: unknown): FieldSpec => ({ field, column, fallback });

const BASE_SPECS: FieldSpec[] = [f('id', 'id'), f('createdAt', 'created_at'), f('updatedAt', 'updated_at')];

const buildMapper = <T>(table: string, specs: FieldSpec[]) => {
  const allSpecs = [...BASE_SPECS, ...specs];

  const fromRow = (row: Row): T => {
    const entity: Row = {};
    for (const spec of allSpecs) {
      const value = row[spec.column];
      entity[spec.field] = value ?? spec.fallback ?? undefined;
    }
    return entity as T;
  };

  /**
   * Chỉ map những field có mặt trong payload; field có key nhưng giá trị
   * undefined được ghi thành null để xoá giá trị cũ (giống hành vi REST API).
   */
  const toRow = (payload: Partial<T>): Row => {
    const row: Row = {};
    const source = payload as Row;
    for (const spec of specs) {
      if (spec.field in source) row[spec.column] = source[spec.field] ?? null;
    }
    return row;
  };

  return { table, fromRow, toRow };
};

const memberMapper = buildMapper<Member>('members', [
  f('name', 'name'),
  f('gender', 'gender'),
  f('birthday', 'birthday'),
  f('phone', 'phone'),
  f('email', 'email'),
  f('role', 'role'),
  f('boardRole', 'board_role'),
  f('duties', 'duties', []),
  f('group', 'group_name'),
  f('joinedAt', 'joined_at'),
  f('status', 'status'),
  f('stage', 'stage'),
  f('notes', 'notes'),
]);

const attendanceMapper = buildMapper<AttendanceSession>('attendance_sessions', [
  f('date', 'date'),
  f('title', 'title'),
  f('scheduleEventId', 'schedule_event_id'),
  f('records', 'records', []),
]);

const scheduleMapper = buildMapper<ScheduleEvent>('schedule_events', [
  f('title', 'title'),
  f('recurrence', 'recurrence'),
  f('dayOfWeek', 'day_of_week'),
  f('date', 'date'),
  f('time', 'time'),
  f('location', 'location'),
  f('description', 'description'),
  f('isMain', 'is_main'),
]);

const announcementMapper = buildMapper<Announcement>('announcements', [
  f('title', 'title'),
  f('content', 'content'),
  f('pinned', 'pinned', false),
  f('author', 'author'),
]);

const taskMapper = buildMapper<TaskItem>('tasks', [
  f('title', 'title'),
  f('description', 'description'),
  f('assigneeIds', 'assignee_ids', []),
  f('dueDate', 'due_date'),
  f('status', 'status'),
  f('priority', 'priority'),
]);

const requestMapper = buildMapper<RequestItem>('requests', [
  f('title', 'title'),
  f('content', 'content'),
  f('requesterName', 'requester_name'),
  f('status', 'status'),
  f('response', 'response'),
]);

const expenseMapper = buildMapper<Expense>('expenses', [
  f('date', 'date'),
  f('type', 'type'),
  f('category', 'category'),
  f('amount', 'amount'),
  f('note', 'note'),
  f('subCategory', 'sub_category'),
  f('receiptNo', 'receipt_no'),
  f('paymentMethod', 'payment_method'),
  f('counterparty', 'counterparty'),
  f('handledBy', 'handled_by'),
  f('eventName', 'event_name'),
  f('attachmentUrl', 'attachment_url'),
]);

const planMapper = buildMapper<Plan>('plans', [
  f('title', 'title'),
  f('goal', 'goal'),
  f('startDate', 'start_date'),
  f('endDate', 'end_date'),
  f('status', 'status'),
  f('items', 'items', []),
]);

const emailTemplateMapper = buildMapper<EmailTemplate>('email_templates', [
  f('name', 'name'),
  f('subject', 'subject'),
  f('body', 'body'),
  f('description', 'description'),
]);

const memberChangeMapper = buildMapper<MemberChange>('member_changes', [
  f('memberId', 'member_id'),
  f('memberName', 'member_name'),
  f('action', 'action'),
  f('changes', 'changes', []),
  f('actorName', 'actor_name'),
]);

const profileMapper = buildMapper<Profile>('profiles', [
  f('email', 'email'),
  f('fullName', 'full_name'),
  f('role', 'role'),
  f('approved', 'approved', false),
]);

/* ============================================================
   Resource API chạy trên Supabase — cùng interface với REST
   ============================================================ */

const client = () => {
  if (!supabase) throw new Error('Supabase chưa được cấu hình');
  return supabase;
};

const fail = (message: string | undefined): never => {
  throw new Error(message || 'Lỗi truy vấn Supabase');
};

export const createSupabaseResourceApi = <T>(mapper: ReturnType<typeof buildMapper<T>>) => ({
  getList: async (): Promise<T[]> => {
    const { data, error } = await client().from(mapper.table).select('*').order('created_at', { ascending: true });
    if (error) fail(error.message);
    return (data ?? []).map(mapper.fromRow);
  },
  getById: async (id: string): Promise<T> => {
    const { data, error } = await client().from(mapper.table).select('*').eq('id', id).single();
    if (error) fail(error.message);
    return mapper.fromRow(data as Row);
  },
  create: async (body: Partial<T>): Promise<T> => {
    const { data, error } = await client().from(mapper.table).insert(mapper.toRow(body)).select('*').single();
    if (error) fail(error.message);
    return mapper.fromRow(data as Row);
  },
  update: async (id: string, body: Partial<T>): Promise<T> => {
    const { data, error } = await client().from(mapper.table).update(mapper.toRow(body)).eq('id', id).select('*').single();
    if (error) fail(error.message);
    return mapper.fromRow(data as Row);
  },
  remove: async (id: string): Promise<{ id: string }> => {
    const { error } = await client().from(mapper.table).delete().eq('id', id);
    if (error) fail(error.message);
    return { id };
  },
});

export const supabaseMemberApi = {
  ...createSupabaseResourceApi<Member>(memberMapper),
  bulkCreate: async (items: Partial<Member>[]): Promise<Member[]> => {
    const rows = items.map(memberMapper.toRow);
    const { data, error } = await client().from('members').insert(rows).select('*');
    if (error) fail(error.message);
    return (data ?? []).map(memberMapper.fromRow);
  },
};

export const supabaseAttendanceApi = createSupabaseResourceApi<AttendanceSession>(attendanceMapper);
export const supabaseScheduleApi = createSupabaseResourceApi<ScheduleEvent>(scheduleMapper);
export const supabaseAnnouncementApi = createSupabaseResourceApi<Announcement>(announcementMapper);
export const supabaseTaskApi = createSupabaseResourceApi<TaskItem>(taskMapper);
export const supabaseRequestApi = createSupabaseResourceApi<RequestItem>(requestMapper);
export const supabaseExpenseApi = createSupabaseResourceApi<Expense>(expenseMapper);
export const supabasePlanApi = createSupabaseResourceApi<Plan>(planMapper);
export const supabaseEmailTemplateApi = createSupabaseResourceApi<EmailTemplate>(emailTemplateMapper);

export const supabaseMemberChangeApi = {
  getList: async (): Promise<MemberChange[]> => {
    const { data, error } = await client()
      .from('member_changes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) fail(error.message);
    return (data ?? []).map(memberChangeMapper.fromRow);
  },
};

export const supabaseProfileApi = {
  getList: async (): Promise<Profile[]> => {
    const { data, error } = await client().from('profiles').select('*').order('created_at', { ascending: true });
    if (error) fail(error.message);
    return (data ?? []).map(profileMapper.fromRow);
  },
  update: async (id: string, body: Partial<Profile>): Promise<Profile> => {
    const { data, error } = await client().from('profiles').update(profileMapper.toRow(body)).eq('id', id).select('*').single();
    if (error) fail(error.message);
    return profileMapper.fromRow(data as Row);
  },
};

/* ---------- Thống kê tổng quan (tính phía client) ---------- */

const RECENT_SESSION_LIMIT = 8;

export const supabaseStatsApi = {
  getOverview: async (): Promise<OverviewStats> => {
    const [members, sessions, tasks, requests, expenses, schedule, announcements] = await Promise.all([
      supabaseMemberApi.getList(),
      supabaseAttendanceApi.getList(),
      supabaseTaskApi.getList(),
      supabaseRequestApi.getList(),
      supabaseExpenseApi.getList(),
      supabaseScheduleApi.getList(),
      supabaseAnnouncementApi.getList(),
    ]);

    const sortedSessions = [...sessions].sort((a, b) => b.date.localeCompare(a.date));
    const recentSessions = sortedSessions.slice(0, RECENT_SESSION_LIMIT).map((session) => ({
      id: session.id,
      date: session.date,
      title: session.title,
      presentCount: session.records.filter((r) => r.status === 'present').length,
      totalCount: session.records.length,
    }));

    const attendanceTotals = recentSessions.reduce(
      (acc, s) => ({ present: acc.present + s.presentCount, total: acc.total + s.totalCount }),
      { present: 0, total: 0 },
    );

    const totalIncome = expenses.filter((e) => e.type === 'income').reduce((sum, e) => sum + e.amount, 0);
    const totalExpense = expenses.filter((e) => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0);

    return {
      totalMembers: members.length,
      activeMembers: members.filter((m) => m.status === 'active').length,
      leaderCount: members.filter((m) => m.role === 'leader').length,
      attendanceRate:
        attendanceTotals.total > 0 ? Math.round((attendanceTotals.present / attendanceTotals.total) * 100) : 0,
      recentSessions,
      openTasks: tasks.filter((t) => t.status !== 'done').length,
      doneTasks: tasks.filter((t) => t.status === 'done').length,
      openRequests: requests.filter((r) => r.status === 'open' || r.status === 'in_review').length,
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      upcomingEvents: [...schedule].sort((a, b) => (a.dayOfWeek ?? 0) - (b.dayOfWeek ?? 0)),
      pinnedAnnouncements: announcements
        .filter((a) => a.pinned)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    };
  },
};

import type {
  Announcement,
  AttendanceRecord,
  AttendanceSession,
  Expense,
  Member,
  Plan,
  PlanChecklistItem,
  RequestItem,
  ScheduleEvent,
  TaskItem,
} from '@btnsg/shared';
import {
  announcementsCol,
  attendanceCol,
  expensesCol,
  membersCol,
  plansCol,
  requestsCol,
  scheduleCol,
  tasksCol,
} from '../store/collections.js';
import {
  createCrudRouter,
  oneOf,
  optionalNumber,
  optionalString,
  requireString,
  stringArray,
  ValidationError,
  type Sanitizer,
} from './crud.js';

/* ---------- Members ---------- */
const sanitizeMember: Sanitizer<Member> = (body, isPartial) => {
  const fields: Partial<Member> = {};
  if (!isPartial || body.name !== undefined) fields.name = requireString(body, 'name');
  if (!isPartial || body.role !== undefined) fields.role = oneOf(body, 'role', ['member', 'leader'] as const, 'member');
  if (!isPartial || body.status !== undefined) fields.status = oneOf(body, 'status', ['active', 'inactive'] as const, 'active');
  if (!isPartial || body.duties !== undefined) fields.duties = stringArray(body, 'duties');
  if (body.gender !== undefined) fields.gender = oneOf(body, 'gender', ['nam', 'nu'] as const, 'nam');
  fields.birthday = optionalString(body, 'birthday');
  fields.phone = optionalString(body, 'phone');
  fields.email = optionalString(body, 'email');
  fields.boardRole = optionalString(body, 'boardRole');
  fields.group = optionalString(body, 'group');
  fields.joinedAt = optionalString(body, 'joinedAt');
  fields.notes = optionalString(body, 'notes');
  return fields;
};

/* ---------- Attendance ---------- */
const sanitizeAttendanceRecords = (body: Record<string, unknown>): AttendanceRecord[] => {
  const value = body.records;
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new ValidationError('Trường "records" phải là mảng');

  return value.map((raw) => {
    const record = raw as Record<string, unknown>;
    if (typeof record.memberId !== 'string' || record.memberId === '') {
      throw new ValidationError('Mỗi bản ghi điểm danh cần "memberId"');
    }
    return {
      memberId: record.memberId,
      status: oneOf(record, 'status', ['present', 'absent', 'excused'] as const, 'absent'),
      note: optionalString(record, 'note'),
    };
  });
};

const sanitizeAttendance: Sanitizer<AttendanceSession> = (body, isPartial) => {
  const fields: Partial<AttendanceSession> = {};
  if (!isPartial || body.date !== undefined) fields.date = requireString(body, 'date');
  if (!isPartial || body.title !== undefined) fields.title = requireString(body, 'title');
  if (!isPartial || body.records !== undefined) fields.records = sanitizeAttendanceRecords(body);
  fields.scheduleEventId = optionalString(body, 'scheduleEventId');
  return fields;
};

/* ---------- Schedule ---------- */
const sanitizeSchedule: Sanitizer<ScheduleEvent> = (body, isPartial) => {
  const fields: Partial<ScheduleEvent> = {};
  if (!isPartial || body.title !== undefined) fields.title = requireString(body, 'title');
  if (!isPartial || body.time !== undefined) fields.time = requireString(body, 'time');
  if (!isPartial || body.recurrence !== undefined) {
    fields.recurrence = oneOf(body, 'recurrence', ['weekly', 'once'] as const, 'weekly');
  }
  const dayOfWeek = optionalNumber(body, 'dayOfWeek');
  if (dayOfWeek !== undefined) {
    if (dayOfWeek < 0 || dayOfWeek > 6) throw new ValidationError('"dayOfWeek" phải từ 0 đến 6');
    fields.dayOfWeek = dayOfWeek;
  }
  fields.date = optionalString(body, 'date');
  fields.location = optionalString(body, 'location');
  fields.description = optionalString(body, 'description');
  if (body.isMain !== undefined) fields.isMain = Boolean(body.isMain);
  return fields;
};

/* ---------- Announcements ---------- */
const sanitizeAnnouncement: Sanitizer<Announcement> = (body, isPartial) => {
  const fields: Partial<Announcement> = {};
  if (!isPartial || body.title !== undefined) fields.title = requireString(body, 'title');
  if (!isPartial || body.content !== undefined) fields.content = requireString(body, 'content');
  if (body.pinned !== undefined) fields.pinned = Boolean(body.pinned);
  else if (!isPartial) fields.pinned = false;
  fields.author = optionalString(body, 'author');
  return fields;
};

/* ---------- Tasks ---------- */
const sanitizeTask: Sanitizer<TaskItem> = (body, isPartial) => {
  const fields: Partial<TaskItem> = {};
  if (!isPartial || body.title !== undefined) fields.title = requireString(body, 'title');
  if (!isPartial || body.status !== undefined) fields.status = oneOf(body, 'status', ['todo', 'doing', 'done'] as const, 'todo');
  if (!isPartial || body.priority !== undefined) {
    fields.priority = oneOf(body, 'priority', ['low', 'medium', 'high'] as const, 'medium');
  }
  if (!isPartial || body.assigneeIds !== undefined) fields.assigneeIds = stringArray(body, 'assigneeIds');
  fields.description = optionalString(body, 'description');
  fields.dueDate = optionalString(body, 'dueDate');
  return fields;
};

/* ---------- Requests ---------- */
const sanitizeRequest: Sanitizer<RequestItem> = (body, isPartial) => {
  const fields: Partial<RequestItem> = {};
  if (!isPartial || body.title !== undefined) fields.title = requireString(body, 'title');
  if (!isPartial || body.content !== undefined) fields.content = requireString(body, 'content');
  if (!isPartial || body.requesterName !== undefined) fields.requesterName = requireString(body, 'requesterName');
  if (!isPartial || body.status !== undefined) {
    fields.status = oneOf(body, 'status', ['open', 'in_review', 'approved', 'rejected', 'done'] as const, 'open');
  }
  fields.response = optionalString(body, 'response');
  return fields;
};

/* ---------- Expenses ---------- */
const sanitizeExpense: Sanitizer<Expense> = (body, isPartial) => {
  const fields: Partial<Expense> = {};
  if (!isPartial || body.date !== undefined) fields.date = requireString(body, 'date');
  if (!isPartial || body.category !== undefined) fields.category = requireString(body, 'category');
  if (!isPartial || body.type !== undefined) fields.type = oneOf(body, 'type', ['income', 'expense'] as const, 'expense');
  if (!isPartial || body.amount !== undefined) {
    const amount = optionalNumber(body, 'amount');
    if (amount === undefined || amount <= 0) throw new ValidationError('"amount" phải là số dương');
    fields.amount = amount;
  }
  fields.note = optionalString(body, 'note');
  return fields;
};

/* ---------- Plans ---------- */
const sanitizePlanItems = (body: Record<string, unknown>): PlanChecklistItem[] => {
  const value = body.items;
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new ValidationError('Trường "items" phải là mảng');

  return value.map((raw) => {
    const item = raw as Record<string, unknown>;
    if (typeof item.text !== 'string' || item.text.trim() === '') {
      throw new ValidationError('Mỗi hạng mục kế hoạch cần "text"');
    }
    return {
      id: typeof item.id === 'string' && item.id !== '' ? item.id : crypto.randomUUID(),
      text: item.text.trim(),
      done: Boolean(item.done),
    };
  });
};

const sanitizePlan: Sanitizer<Plan> = (body, isPartial) => {
  const fields: Partial<Plan> = {};
  if (!isPartial || body.title !== undefined) fields.title = requireString(body, 'title');
  if (!isPartial || body.status !== undefined) fields.status = oneOf(body, 'status', ['draft', 'active', 'done'] as const, 'draft');
  if (!isPartial || body.items !== undefined) fields.items = sanitizePlanItems(body);
  fields.goal = optionalString(body, 'goal');
  fields.startDate = optionalString(body, 'startDate');
  fields.endDate = optionalString(body, 'endDate');
  return fields;
};

/* ---------- Routers ---------- */
export const membersRouter = createCrudRouter(membersCol, sanitizeMember);
export const attendanceRouter = createCrudRouter(attendanceCol, sanitizeAttendance);
export const scheduleRouter = createCrudRouter(scheduleCol, sanitizeSchedule);
export const announcementsRouter = createCrudRouter(announcementsCol, sanitizeAnnouncement);
export const tasksRouter = createCrudRouter(tasksCol, sanitizeTask);
export const requestsRouter = createCrudRouter(requestsCol, sanitizeRequest);
export const expensesRouter = createCrudRouter(expensesCol, sanitizeExpense);
export const plansRouter = createCrudRouter(plansCol, sanitizePlan);

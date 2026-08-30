import type {
  Announcement,
  AttendanceSession,
  EmailTemplate,
  Expense,
  Member,
  MemberChange,
  Note,
  Plan,
  RequestItem,
  ScheduleEvent,
  TaskItem,
} from '@btnsg/shared';
import { Collection } from './db.js';

export const membersCol = new Collection<Member>('members');
export const memberChangesCol = new Collection<MemberChange>('member_changes');
export const emailTemplatesCol = new Collection<EmailTemplate>('email_templates');
export const attendanceCol = new Collection<AttendanceSession>('attendance');
export const scheduleCol = new Collection<ScheduleEvent>('schedule');
export const announcementsCol = new Collection<Announcement>('announcements');
export const tasksCol = new Collection<TaskItem>('tasks');
export const requestsCol = new Collection<RequestItem>('requests');
export const expensesCol = new Collection<Expense>('expenses');
export const plansCol = new Collection<Plan>('plans');
export const notesCol = new Collection<Note>('notes');

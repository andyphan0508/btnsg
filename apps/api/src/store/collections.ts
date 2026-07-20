import type {
  Announcement,
  AttendanceSession,
  Expense,
  Member,
  Plan,
  RequestItem,
  ScheduleEvent,
  TaskItem,
} from '@btnsg/shared';
import { Collection } from './db.js';

export const membersCol = new Collection<Member>('members');
export const attendanceCol = new Collection<AttendanceSession>('attendance');
export const scheduleCol = new Collection<ScheduleEvent>('schedule');
export const announcementsCol = new Collection<Announcement>('announcements');
export const tasksCol = new Collection<TaskItem>('tasks');
export const requestsCol = new Collection<RequestItem>('requests');
export const expensesCol = new Collection<Expense>('expenses');
export const plansCol = new Collection<Plan>('plans');

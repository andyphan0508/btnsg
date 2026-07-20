import type {
  Announcement,
  AttendanceSession,
  Expense,
  Member,
  OverviewStats,
  Plan,
  RequestItem,
  ScheduleEvent,
  TaskItem,
} from '@btnsg/shared';
import { apiClient } from './client';

const createResourceApi = <T>(base: string) => ({
  getList: () => apiClient.get<T[]>(base),
  getById: (id: string) => apiClient.get<T>(`${base}/${id}`),
  create: (body: Partial<T>) => apiClient.post<T>(base, body),
  update: (id: string, body: Partial<T>) => apiClient.put<T>(`${base}/${id}`, body),
  remove: (id: string) => apiClient.delete<{ id: string }>(`${base}/${id}`),
});

export const memberApi = createResourceApi<Member>('/api/members');
export const attendanceApi = createResourceApi<AttendanceSession>('/api/attendance');
export const scheduleApi = createResourceApi<ScheduleEvent>('/api/schedule');
export const announcementApi = createResourceApi<Announcement>('/api/announcements');
export const taskApi = createResourceApi<TaskItem>('/api/tasks');
export const requestApi = createResourceApi<RequestItem>('/api/requests');
export const expenseApi = createResourceApi<Expense>('/api/expenses');
export const planApi = createResourceApi<Plan>('/api/plans');

export const statsApi = {
  getOverview: () => apiClient.get<OverviewStats>('/api/stats/overview'),
};

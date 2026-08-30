import type {
  Announcement,
  AttendanceSession,
  EmailTemplate,
  Expense,
  Member,
  MemberChange,
  Note,
  OverviewStats,
  Plan,
  Profile,
  RequestItem,
  ScheduleEvent,
  TaskItem,
} from '@btnsg/shared';
import { apiClient } from './client';
import { appsScriptUrl, isSupabaseConfigured } from '../lib/supabase';
import {
  supabaseAnnouncementApi,
  supabaseAttendanceApi,
  supabaseEmailTemplateApi,
  supabaseExpenseApi,
  supabaseMemberApi,
  supabaseMemberChangeApi,
  supabaseNoteApi,
  supabasePlanApi,
  supabaseProfileApi,
  supabaseRequestApi,
  supabaseScheduleApi,
  supabaseStatsApi,
  supabaseTaskApi,
} from './supabaseApi';

const createRestResourceApi = <T>(base: string) => ({
  getList: () => apiClient.get<T[]>(base),
  getById: (id: string) => apiClient.get<T>(`${base}/${id}`),
  create: (body: Partial<T>) => apiClient.post<T>(base, body),
  update: (id: string, body: Partial<T>) => apiClient.put<T>(`${base}/${id}`, body),
  remove: (id: string) => apiClient.delete<{ id: string }>(`${base}/${id}`),
});

const restMemberApi = {
  ...createRestResourceApi<Member>('/api/members'),
  bulkCreate: async (items: Partial<Member>[]): Promise<Member[]> => {
    const created: Member[] = [];
    for (const item of items) {
      created.push(await apiClient.post<Member>('/api/members', item));
    }
    return created;
  },
};

const restMemberChangeApi = {
  getList: () => apiClient.get<MemberChange[]>('/api/member-changes'),
};

/** Chế độ demo/local không có bảng tài khoản — trả về hồ sơ giả để màn hình Admin hiển thị. */
const restProfileApi = {
  getList: async (): Promise<Profile[]> => [
    {
      id: 'demo-admin',
      email: 'demo@btnsg.local',
      fullName: 'Quản trị (demo)',
      role: 'admin',
      approved: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
  update: async (): Promise<Profile> => {
    throw new Error('Quản lý tài khoản chỉ khả dụng khi chạy với Supabase.');
  },
};

export const memberApi = isSupabaseConfigured ? supabaseMemberApi : restMemberApi;
export const attendanceApi = isSupabaseConfigured
  ? supabaseAttendanceApi
  : createRestResourceApi<AttendanceSession>('/api/attendance');
export const scheduleApi = isSupabaseConfigured
  ? supabaseScheduleApi
  : createRestResourceApi<ScheduleEvent>('/api/schedule');
export const announcementApi = isSupabaseConfigured
  ? supabaseAnnouncementApi
  : createRestResourceApi<Announcement>('/api/announcements');
export const taskApi = isSupabaseConfigured ? supabaseTaskApi : createRestResourceApi<TaskItem>('/api/tasks');
export const requestApi = isSupabaseConfigured
  ? supabaseRequestApi
  : createRestResourceApi<RequestItem>('/api/requests');
export const expenseApi = isSupabaseConfigured ? supabaseExpenseApi : createRestResourceApi<Expense>('/api/expenses');
export const planApi = isSupabaseConfigured ? supabasePlanApi : createRestResourceApi<Plan>('/api/plans');
export const noteApi = isSupabaseConfigured ? supabaseNoteApi : createRestResourceApi<Note>('/api/notes');
export const emailTemplateApi = isSupabaseConfigured
  ? supabaseEmailTemplateApi
  : createRestResourceApi<EmailTemplate>('/api/email-templates');
export const memberChangeApi = isSupabaseConfigured ? supabaseMemberChangeApi : restMemberChangeApi;
export const profileApi = isSupabaseConfigured ? supabaseProfileApi : restProfileApi;

export const statsApi = isSupabaseConfigured
  ? supabaseStatsApi
  : { getOverview: () => apiClient.get<OverviewStats>('/api/stats/overview') };

/* ---------- Gửi email hàng loạt qua Google Apps Script ---------- */

export type BulkEmailPayload = {
  subject: string;
  body: string;
  recipients: { name: string; email: string }[];
};

export type BulkEmailResult = {
  ok: boolean;
  sent: number;
  demo?: boolean;
  error?: string;
};

export const emailApi = {
  isConfigured: () => appsScriptUrl !== '',
  sendBulk: async (payload: BulkEmailPayload): Promise<BulkEmailResult> => {
    if (!appsScriptUrl) {
      // Chế độ demo — không gửi thật.
      await new Promise((resolve) => setTimeout(resolve, 600));
      return { ok: true, sent: payload.recipients.length, demo: true };
    }

    // Content-Type text/plain để tránh CORS preflight (Apps Script không trả lời OPTIONS).
    const response = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });
    const result = (await response.json().catch(() => null)) as BulkEmailResult | null;
    if (!response.ok || !result || !result.ok) {
      throw new Error(result?.error || `Gửi email thất bại (HTTP ${response.status})`);
    }
    return result;
  },
};

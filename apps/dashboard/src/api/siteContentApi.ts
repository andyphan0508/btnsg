import { apiClient } from './client';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

/** Nội dung đã lưu: key mục → giá trị (chưa ghép mặc định — dùng mergeSiteContent khi hiển thị). */
export type SavedSiteContent = Record<string, unknown>;

const supabaseSiteContentApi = {
  getAll: async (): Promise<SavedSiteContent> => {
    if (!supabase) throw new Error('Supabase chưa được cấu hình');
    const { data, error } = await supabase.from('site_content').select('key, value');
    if (error) throw new Error(error.message);
    return Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  },
  /** Ghi đè các mục được truyền vào (mục khác giữ nguyên). */
  save: async (changes: SavedSiteContent, actorName: string): Promise<void> => {
    if (!supabase) throw new Error('Supabase chưa được cấu hình');
    const rows = Object.entries(changes).map(([key, value]) => ({ key, value, updated_by: actorName }));
    const { error } = await supabase.from('site_content').upsert(rows, { onConflict: 'key' });
    if (error) throw new Error(error.message);
  },
};

const restSiteContentApi = {
  getAll: () => apiClient.get<SavedSiteContent>('/api/site-content'),
  save: async (changes: SavedSiteContent): Promise<void> => {
    await apiClient.put<SavedSiteContent>('/api/site-content', changes);
  },
};

export const siteContentApi = isSupabaseConfigured ? supabaseSiteContentApi : restSiteContentApi;

/** Gốc site landing — khung xem trước mở trang này kèm ?preview=1. */
export const LANDING_URL = (
  (import.meta.env.VITE_LANDING_URL as string | undefined) ||
  (import.meta.env.VITE_PUSH_API_URL as string | undefined) ||
  'https://btnsg.vercel.app'
).replace(/\/$/, '');

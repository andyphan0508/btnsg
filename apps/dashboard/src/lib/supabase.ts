import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Có cấu hình Supabase → chạy chế độ production (Supabase Auth + Postgres).
 * Không có → chạy chế độ demo/local: dữ liệu qua Express API, đăng nhập bỏ qua.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

/** URL webhook Google Apps Script để gửi email hàng loạt cho BĐH. */
export const appsScriptUrl = (import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined) ?? '';

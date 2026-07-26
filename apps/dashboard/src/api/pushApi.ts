import { isSupabaseConfigured, supabase } from '../lib/supabase';

/**
 * Gọi Vercel Function của trang landing để đẩy thông báo.
 * VITE_PUSH_API_URL = "https://btnsg.vercel.app" (gốc site landing).
 */
const PUSH_API_BASE: string = (import.meta.env.VITE_PUSH_API_URL as string | undefined) ?? '';

export const isPushConfigured = Boolean(PUSH_API_BASE) && isSupabaseConfigured;

export type PushMessageInput = {
  title: string;
  body: string;
  url?: string;
};

export type PushSendResult = {
  sent: number;
  failed: number;
  total: number;
  removed?: number;
  note?: string;
};

export type PushMessageLog = {
  id: string;
  title: string;
  body: string;
  url: string | null;
  sentCount: number;
  failedCount: number;
  sentBy: string | null;
  createdAt: string;
};

/** Số thiết bị đang đăng ký nhận thông báo. */
export const countSubscribers = async (): Promise<number> => {
  if (!supabase) return 0;
  const { count, error } = await supabase
    .from('push_subscriptions')
    .select('id', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
};

/** Lịch sử các thông báo đã gửi (mới nhất trước). */
export const fetchPushLog = async (limit = 20): Promise<PushMessageLog[]> => {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('push_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    body: row.body,
    url: row.url,
    sentCount: row.sent_count ?? 0,
    failedCount: row.failed_count ?? 0,
    sentBy: row.sent_by,
    createdAt: row.created_at,
  }));
};

/** Đẩy thông báo tới mọi thiết bị đã đăng ký. */
export const sendPushMessage = async (message: PushMessageInput): Promise<PushSendResult> => {
  if (!PUSH_API_BASE) {
    throw new Error('Chưa cấu hình VITE_PUSH_API_URL (địa chỉ trang landing đã deploy).');
  }
  if (!supabase) {
    throw new Error('Cần đăng nhập bằng tài khoản Supabase để gửi thông báo.');
  }

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Phiên đăng nhập đã hết hạn — vui lòng đăng nhập lại.');

  const response = await fetch(`${PUSH_API_BASE.replace(/\/$/, '')}/api/push-send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(message),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || `Gửi thông báo thất bại (HTTP ${response.status}).`);
  }

  return {
    sent: payload.sent ?? 0,
    failed: payload.failed ?? 0,
    total: payload.total ?? payload.sent ?? 0,
    removed: payload.removed,
    note: payload.note,
  };
};

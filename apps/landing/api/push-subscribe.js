/**
 * Vercel Serverless Function — lưu / xoá đăng ký nhận thông báo của một thiết bị.
 *
 * POST   { subscription: { endpoint, keys: { p256dh, auth } }, userAgent }
 * DELETE { endpoint }
 *
 * Biến môi trường cần có (Vercel → project landing → Settings → Environment Variables):
 *   SUPABASE_URL              — URL project Supabase
 *   SUPABASE_SERVICE_ROLE_KEY — service role key (KHÔNG để lộ ra client)
 */

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
};

const send = (res, status, payload) => {
  Object.entries(jsonHeaders).forEach(([key, value]) => res.setHeader(key, value));
  res.status(status).json(payload);
};

/**
 * SUPABASE_URL phải là địa chỉ API của project — dạng https://<ref>.supabase.co,
 * KHÔNG phải link trang quản trị (https://supabase.com/dashboard/project/...).
 * Đặt sai thì mọi request sẽ nhận về HTML của trang web thay vì JSON.
 */
const checkSupabaseUrl = () => {
  const url = (process.env.SUPABASE_URL || '').trim();
  if (!url) return 'Thiếu biến SUPABASE_URL.';
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)\/?$/i.test(url)) {
    return `SUPABASE_URL không đúng định dạng: "${url}". Phải là https://<project-ref>.supabase.co (lấy ở Project Settings → Data API → Project URL), không phải link trang quản trị.`;
  }
  return null;
};

/** Gọi REST API của Supabase bằng service role (bỏ qua RLS). */
const supabaseFetch = (path, options = {}) => {
  const url = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

/** Diễn giải lỗi từ Supabase thành câu người dùng hiểu được. */
const explainSupabaseError = (status, text) => {
  if (text.trimStart().startsWith('<')) {
    return 'Supabase trả về trang HTML thay vì dữ liệu — gần như chắc chắn SUPABASE_URL bị sai (phải là https://<project-ref>.supabase.co).';
  }
  if (status === 401 || status === 403) {
    return 'Supabase từ chối truy cập — kiểm tra SUPABASE_SERVICE_ROLE_KEY (secret key).';
  }
  if (/relation .* does not exist|PGRST205/i.test(text)) {
    return 'Chưa có bảng push_subscriptions — hãy chạy supabase/migrations/0003_push_subscriptions.sql trong SQL Editor.';
  }
  if (/PGRST125|Invalid path specified/i.test(text)) {
    return 'Đường dẫn tới Supabase không hợp lệ — thường do SUPABASE_URL có dấu "/" thừa ở cuối. Hãy để đúng dạng https://<project-ref>.supabase.co rồi Redeploy.';
  }
  return `Không lưu được đăng ký: ${text.slice(0, 200)}`;
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    Object.entries(jsonHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(204).end();
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return send(res, 500, { error: 'Server chưa cấu hình SUPABASE_SERVICE_ROLE_KEY.' });
  }
  const urlError = checkSupabaseUrl();
  if (urlError) return send(res, 500, { error: urlError });

  // ?debug=1 — tự kiểm tra cấu hình mà không ghi gì vào CSDL.
  if (req.query?.debug === '1') {
    const probe = await supabaseFetch('push_subscriptions?select=endpoint&limit=1');
    const text = await probe.text();
    return send(res, 200, {
      supabaseUrlHopLe: true,
      ketNoiBang: probe.ok,
      chiTiet: probe.ok ? 'Bảng push_subscriptions đọc được.' : explainSupabaseError(probe.status, text),
    });
  }

  try {
    if (req.method === 'POST') {
      const { subscription, userAgent } = req.body ?? {};
      if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
        return send(res, 400, { error: 'Thiếu thông tin subscription.' });
      }

      // Cùng một thiết bị đăng ký lại thì cập nhật, không tạo bản ghi trùng.
      const response = await supabaseFetch('push_subscriptions?on_conflict=endpoint', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          user_agent: (userAgent || '').slice(0, 300),
        }),
      });

      if (!response.ok) {
        const detail = await response.text();
        return send(res, 502, { error: explainSupabaseError(response.status, detail) });
      }
      return send(res, 200, { ok: true });
    }

    if (req.method === 'DELETE') {
      const { endpoint } = req.body ?? {};
      if (!endpoint) return send(res, 400, { error: 'Thiếu endpoint.' });

      const del = await supabaseFetch(`push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, {
        method: 'DELETE',
      });
      if (!del.ok) {
        const detail = await del.text();
        return send(res, 502, { error: explainSupabaseError(del.status, detail) });
      }
      return send(res, 200, { ok: true });
    }

    return send(res, 405, { error: 'Method không được hỗ trợ.' });
  } catch (error) {
    return send(res, 500, { error: String(error?.message || error) });
  }
}

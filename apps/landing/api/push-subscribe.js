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

/** Gọi REST API của Supabase bằng service role (bỏ qua RLS). */
const supabaseFetch = (path, options = {}) => {
  const url = process.env.SUPABASE_URL;
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

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    Object.entries(jsonHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(204).end();
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return send(res, 500, { error: 'Server chưa cấu hình SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.' });
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
        return send(res, 502, { error: `Không lưu được đăng ký: ${detail.slice(0, 200)}` });
      }
      return send(res, 200, { ok: true });
    }

    if (req.method === 'DELETE') {
      const { endpoint } = req.body ?? {};
      if (!endpoint) return send(res, 400, { error: 'Thiếu endpoint.' });

      await supabaseFetch(`push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}`, {
        method: 'DELETE',
      });
      return send(res, 200, { ok: true });
    }

    return send(res, 405, { error: 'Method không được hỗ trợ.' });
  } catch (error) {
    return send(res, 500, { error: String(error?.message || error) });
  }
}

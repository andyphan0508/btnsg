/**
 * Vercel Serverless Function — đẩy thông báo tới MỌI thiết bị đã đăng ký.
 *
 * POST { title, body, url }
 * Header: Authorization: Bearer <access_token của phiên đăng nhập dashboard>
 *
 * Chỉ tài khoản Supabase đã được duyệt (Quản trị / BĐH) mới gửi được — token
 * được xác thực với Supabase, không dùng mật khẩu chung nhúng trong client.
 *
 * Biến môi trường cần có (Vercel → project landing):
 *   SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
 *   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT (mailto:...)
 */

import webpush from 'web-push';

/** Cho phép hàm chạy lâu hơn mặc định khi danh sách thiết bị lớn. */
export const config = { maxDuration: 60 };

/** Gửi mỗi lô này rồi mới sang lô kế — tránh mở hàng nghìn kết nối cùng lúc. */
const BATCH_SIZE = 100;

const jsonHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const send = (res, status, payload) => {
  Object.entries(jsonHeaders).forEach(([key, value]) => res.setHeader(key, value));
  res.status(status).json(payload);
};

/** SUPABASE_URL phải là https://<project-ref>.supabase.co, không phải link trang quản trị. */
const checkSupabaseUrl = () => {
  const url = (process.env.SUPABASE_URL || '').trim();
  if (!url) return 'Thiếu biến SUPABASE_URL.';
  if (!/^https:\/\/[a-z0-9-]+\.supabase\.(co|in)\/?$/i.test(url)) {
    return `SUPABASE_URL không đúng định dạng: "${url}". Phải là https://<project-ref>.supabase.co.`;
  }
  return null;
};

const supabaseFetch = (path, options = {}) => {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const base = (process.env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  return fetch(`${base}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

/** Xác thực token của người gửi và kiểm tra họ đã được duyệt. */
async function authorize(req) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) return { ok: false, status: 401, error: 'Thiếu token đăng nhập.' };

  const userRes = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: process.env.SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!userRes.ok) return { ok: false, status: 401, error: 'Phiên đăng nhập không hợp lệ.' };
  const user = await userRes.json();

  const profileRes = await supabaseFetch(
    `profiles?id=eq.${user.id}&select=full_name,role,approved`,
  );
  const [profile] = (await profileRes.json().catch(() => [])) || [];
  if (!profile?.approved) {
    return { ok: false, status: 403, error: 'Tài khoản chưa được duyệt để gửi thông báo.' };
  }

  return { ok: true, name: profile.full_name || user.email };
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    Object.entries(jsonHeaders).forEach(([key, value]) => res.setHeader(key, value));
    return res.status(204).end();
  }
  if (req.method !== 'POST') return send(res, 405, { error: 'Method không được hỗ trợ.' });

  const missing = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'VAPID_PUBLIC_KEY',
    'VAPID_PRIVATE_KEY',
  ].filter((key) => !process.env[key]);
  if (missing.length > 0) {
    return send(res, 500, { error: `Server thiếu biến môi trường: ${missing.join(', ')}` });
  }
  const urlError = checkSupabaseUrl();
  if (urlError) return send(res, 500, { error: urlError });

  try {
    const auth = await authorize(req);
    if (!auth.ok) return send(res, auth.status, { error: auth.error });

    const { title, body, url } = req.body ?? {};
    if (!title?.trim() || !body?.trim()) {
      return send(res, 400, { error: 'Cần có tiêu đề và nội dung thông báo.' });
    }

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:banthanhniensaigon@gmail.com',
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    );

    const subsRes = await supabaseFetch('push_subscriptions?select=endpoint,p256dh,auth');
    const subsText = await subsRes.text();
    if (!subsRes.ok) {
      if (/PGRST125|Invalid path specified/i.test(subsText)) {
        return send(res, 502, {
          error: 'Đường dẫn tới Supabase không hợp lệ — thường do SUPABASE_URL có dấu "/" thừa ở cuối.',
        });
      }
      if (/PGRST205|does not exist/i.test(subsText)) {
        return send(res, 502, {
          error: 'Chưa có bảng push_subscriptions — hãy chạy migration 0003 trong SQL Editor.',
        });
      }
      return send(res, 502, { error: `Không đọc được danh sách thiết bị: ${subsText.slice(0, 200)}` });
    }
    let subscriptions = [];
    try {
      subscriptions = JSON.parse(subsText) || [];
    } catch {
      return send(res, 502, { error: 'Supabase trả về dữ liệu không hợp lệ — kiểm tra SUPABASE_URL.' });
    }
    if (subscriptions.length === 0) {
      return send(res, 200, { ok: true, sent: 0, failed: 0, note: 'Chưa có thiết bị nào đăng ký.' });
    }

    const payload = JSON.stringify({
      title: title.trim(),
      body: body.trim(),
      url: url?.trim() || '/',
    });

    // Gửi theo lô: trong một lô thì song song (nhanh), giữa các lô thì tuần tự
    // để không mở quá nhiều kết nối cùng lúc khi danh sách thiết bị lớn.
    let sent = 0;
    let attempted = 0;
    const expired = [];

    for (let start = 0; start < subscriptions.length; start += BATCH_SIZE) {
      const batch = subscriptions.slice(start, start + BATCH_SIZE);
      const results = await Promise.allSettled(
        batch.map((row) =>
          webpush.sendNotification(
            { endpoint: row.endpoint, keys: { p256dh: row.p256dh, auth: row.auth } },
            payload,
          ),
        ),
      );

      results.forEach((result, index) => {
        attempted += 1;
        if (result.status === 'fulfilled') {
          sent += 1;
          return;
        }
        const status = result.reason?.statusCode;
        // 404/410 = người dùng đã gỡ đăng ký hoặc endpoint hết hạn → dọn khỏi CSDL.
        if (status === 404 || status === 410) expired.push(batch[index].endpoint);
      });
    }

    if (expired.length > 0) {
      const list = expired.map((endpoint) => `"${endpoint}"`).join(',');
      await supabaseFetch(`push_subscriptions?endpoint=in.(${encodeURIComponent(list)})`, {
        method: 'DELETE',
      }).catch(() => {});
    }

    // Ghi nhật ký để BĐH tra lại đã gửi gì, cho bao nhiêu thiết bị.
    await supabaseFetch('push_messages', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        title: title.trim(),
        body: body.trim(),
        url: url?.trim() || null,
        sent_count: sent,
        failed_count: attempted - sent,
        sent_by: auth.name,
      }),
    }).catch(() => {});

    return send(res, 200, {
      ok: true,
      sent,
      failed: attempted - sent,
      removed: expired.length,
      total: subscriptions.length,
    });
  } catch (error) {
    return send(res, 500, { error: String(error?.message || error) });
  }
}

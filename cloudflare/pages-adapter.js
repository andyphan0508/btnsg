/**
 * Chạy các API viết theo kiểu Vercel (`export default handler(req, res)` trong apps/<app>/api) trên
 * Cloudflare Pages Functions — một mã nguồn chạy được cả hai nơi trong lúc chuyển dần sang Cloudflare.
 *
 * - req: { method, url, query, headers (chữ thường), body (JSON đã parse / chuỗi) }
 * - res: setHeader / status / json / send / end — đúng phần các handler đang dùng.
 * - process.env lấy từ biến môi trường + secret của project Pages.
 * - GET có `Cache-Control: s-maxage=N` → lưu vào cache của Cloudflare N giây (thay CDN của Vercel),
 *   nên Supabase / Apps Script không bị gọi lại mỗi lượt xem.
 */

const parseBody = async (request) => {
  const text = await request.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export function pagesHandler(handler) {
  return async ({ request, env, waitUntil }) => {
    globalThis.process ??= { env: {} };
    globalThis.process.env ??= {};
    for (const [name, value] of Object.entries(env)) {
      if (typeof value === 'string') globalThis.process.env[name] = value;
    }

    const cacheable = request.method === 'GET';
    if (cacheable) {
      const hit = await caches.default.match(request);
      if (hit) return hit;
    }

    const url = new URL(request.url);
    const req = {
      method: request.method,
      url: url.pathname + url.search,
      query: Object.fromEntries(url.searchParams),
      headers: Object.fromEntries([...request.headers].map(([name, value]) => [name.toLowerCase(), value])),
      body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method) ? await parseBody(request) : undefined,
    };

    let status = 200;
    let payload = null;
    const headers = new Headers();
    const res = {
      setHeader(name, value) {
        headers.set(name, String(value));
        return res;
      },
      status(code) {
        status = code;
        return res;
      },
      json(data) {
        headers.set('Content-Type', 'application/json; charset=utf-8');
        payload = JSON.stringify(data);
        return res;
      },
      send(data) {
        payload = data;
        return res;
      },
      end(data) {
        if (data !== undefined) payload = data;
        return res;
      },
    };

    await handler(req, res);
    const body = status === 204 || status === 304 ? null : payload;

    const sMaxAge = /s-maxage=(\d+)/.exec(headers.get('Cache-Control') || '')?.[1];
    if (cacheable && sMaxAge && Number(sMaxAge) > 0) {
      const stored = new Response(body, { status, headers: new Headers(headers) });
      stored.headers.set('Cache-Control', `public, max-age=${sMaxAge}`);
      waitUntil(caches.default.put(request, stored));
    }
    return new Response(body, { status, headers });
  };
}

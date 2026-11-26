/**
 * Cloudflare Pages Function — tiêm thẻ Open Graph động (og:title, og:description, og:image)
 * khi bot Facebook / Zalo / Twitter truy cập trực tiếp đường dẫn /tin-tuc/<id>.
 * Người dùng thật được chuyển thẳng qua static SPA (context.next()) với độ trễ = 0.
 */

const CRAWLER_UA =
  /facebookexternalhit|Facebot|Zalo|Twitterbot|LinkedInBot|TelegramBot|Slackbot|Discordbot|WhatsApp/i;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const escapeAttr = (text = '') =>
  String(text).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const stripTags = (text = '') =>
  String(text)
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

export async function onRequest(context) {
  const { request, env, params, waitUntil } = context;
  const ua = request.headers.get('user-agent') || '';
  const postId = String(params?.postId || '');

  if (request.method !== 'GET' || !CRAWLER_UA.test(ua) || !UUID.test(postId)) {
    return context.next();
  }

  const supabaseUrl = (env.SUPABASE_URL || '').trim().replace(/\/$/, '');
  const supabaseKey = env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return context.next();
  }

  const cacheHit = await caches.default.match(request);
  if (cacheHit) return cacheHit;

  try {
    const apiRes = await fetch(
      `${supabaseUrl}/rest/v1/posts?select=title,description,cover,content&published=is.true&id=eq.${postId}`,
      { headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` } },
    );
    if (!apiRes.ok) return context.next();
    const rows = await apiRes.json();
    const post = Array.isArray(rows) ? rows[0] : null;
    if (!post) return context.next();

    const assetRes = await env.ASSETS.fetch(new URL('/index.html', request.url));
    if (!assetRes.ok) return context.next();

    const rawHtml = await assetRes.text();
    const title = escapeAttr(`${post.title} — Ban Thanh Niên HTTL Sài Gòn`);
    const desc = escapeAttr((post.description || stripTags(post.content)).slice(0, 200));
    const pageUrl = escapeAttr(request.url);
    const cover = post.cover && /^https?:\/\//i.test(post.cover) ? escapeAttr(post.cover) : '';

    let html = rawHtml
      .replace(/<title>[^<]*<\/title>/i, `<title>${title}</title>`)
      .replace(/(<meta\s+name="description"\s+content=")[^"]*/i, `$1${desc}`)
      .replace(/(<meta\s+property="og:title"\s+content=")[^"]*/i, `$1${title}`)
      .replace(/(<meta\s+property="og:description"\s+content=")[^"]*/i, `$1${desc}`)
      .replace(/(<meta\s+property="og:url"\s+content=")[^"]*/i, `$1${pageUrl}`)
      .replace(/(<meta\s+property="og:type"\s+content=")[^"]*/i, `$1article`);

    if (cover) {
      html = html.replace(/(<meta\s+property="og:image"\s+content=")[^"]*/i, `$1${cover}`);
    }

    const response = new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
    waitUntil(caches.default.put(request, response.clone()));
    return response;
  } catch {
    return context.next();
  }
}

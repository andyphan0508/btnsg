// Cloudflare Pages Function — dùng lại nguyên handler Vercel ở api/feed.js.
import handler from '../../api/feed.js';
import { pagesHandler } from '../../../../cloudflare/pages-adapter.js';

export const onRequest = pagesHandler(handler);

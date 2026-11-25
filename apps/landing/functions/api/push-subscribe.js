// Cloudflare Pages Function — dùng lại nguyên handler Vercel ở api/push-subscribe.js.
import handler from '../../api/push-subscribe.js';
import { pagesHandler } from '../../../../cloudflare/pages-adapter.js';

export const onRequest = pagesHandler(handler);

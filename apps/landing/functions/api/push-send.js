// Cloudflare Pages Function — dùng lại nguyên handler Vercel ở api/push-send.js.
import handler from '../../api/push-send.js';
import { pagesHandler } from '../../../../cloudflare/pages-adapter.js';

export const onRequest = pagesHandler(handler);

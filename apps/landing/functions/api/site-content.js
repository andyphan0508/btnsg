// Cloudflare Pages Function — dùng lại nguyên handler Vercel ở api/site-content.js.
import handler from '../../api/site-content.js';
import { pagesHandler } from '../../../../cloudflare/pages-adapter.js';

export const onRequest = pagesHandler(handler);

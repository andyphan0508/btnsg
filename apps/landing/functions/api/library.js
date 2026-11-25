// Cloudflare Pages Function — dùng lại nguyên handler Vercel ở api/library.js.
import handler from '../../api/library.js';
import { pagesHandler } from '../../../../cloudflare/pages-adapter.js';

export const onRequest = pagesHandler(handler);

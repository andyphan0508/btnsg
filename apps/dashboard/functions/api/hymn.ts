// Cloudflare Pages Function — dùng lại nguyên handler Vercel ở api/hymn.ts.
import handler from '../../api/hymn';
import { pagesHandler } from '../../../../cloudflare/pages-adapter.js';

export const onRequest = pagesHandler(handler);

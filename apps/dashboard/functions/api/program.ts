// Cloudflare Pages Function — dùng lại nguyên handler Vercel ở api/program.ts.
import handler from '../../api/program';
import { pagesHandler } from '../../../../cloudflare/pages-adapter.js';

export const onRequest = pagesHandler(handler);

import { Router } from 'express';
import type { Program, ProgramItem } from '@btnsg/shared';
import { cleanProgramItems, todayInVietnam } from '@btnsg/shared';
import { programsCol } from '../store/collections.js';
import { parseHymnPage } from '../../../dashboard/api/_hymn.js';
import { createCrudRouter, requireString, ValidationError, type Sanitizer } from './crud.js';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const KINDS = ['text', 'bible', 'song', 'sermon'];

const sanitizeProgram: Sanitizer<Program> = (body, isPartial) => {
  const fields: Partial<Program> = {};
  if (!isPartial || body.date !== undefined) {
    fields.date = requireString(body, 'date');
    if (!DATE.test(fields.date)) throw new ValidationError('date phải có dạng YYYY-MM-DD');
  }
  if (!isPartial || body.title !== undefined) fields.title = typeof body.title === 'string' ? body.title.trim() : '';
  if (!isPartial || body.items !== undefined) {
    const items = Array.isArray(body.items) ? (body.items as ProgramItem[]) : [];
    if (items.some((item) => !KINDS.includes(item?.kind))) throw new ValidationError('items có kind không hợp lệ');
    fields.items = cleanProgramItems(items.map((item) => ({ ...item, label: String(item.label ?? '') })));
  }
  if (!isPartial || body.published !== undefined) fields.published = body.published === true;
  if (!isPartial || body.startTime !== undefined) {
    const startTime = typeof body.startTime === 'string' ? body.startTime.trim() : '';
    fields.startTime = /^\d{1,2}:\d{2}$/.test(startTime) ? startTime : undefined;
  }
  return fields;
};

export const programsRouter = createCrudRouter(programsCol, sanitizeProgram);

/** Cùng hợp đồng với Vercel Function apps/dashboard/api/program.ts — để OpenPresenter thử với bản demo. */
export const publicProgramRouter = Router();
publicProgramRouter.get('/', (req, res) => {
  const date = typeof req.query.date === 'string' ? req.query.date : '';
  if (date && !DATE.test(date)) return res.status(400).json({ error: 'date phải có dạng YYYY-MM-DD' });
  const today = todayInVietnam();
  const program = programsCol
    .list()
    .filter((p) => p.published && (date ? p.date === date : p.date >= today))
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  if (!program) {
    return res.status(404).json({ error: date ? `Chưa có chương trình đã công bố ngày ${date}` : 'Chưa có chương trình sắp tới' });
  }
  const { id, title, startTime, items, updatedAt } = program;
  return res.json({ version: 1, program: { id, date: program.date, title, startTime, updatedAt, items } });
});

/** Cùng hợp đồng với Vercel Function apps/dashboard/api/hymn.ts (dùng chung bộ đọc _hymn.ts). */
export const hymnRouter = Router();
hymnRouter.get('/', async (req, res) => {
  const raw = typeof req.query.number === 'string' ? req.query.number.trim() : '';
  if (!/^\d{1,4}$/.test(raw)) return res.status(400).json({ error: 'number phải là số bài' });
  const number = Number(raw);
  const response = await fetch(`https://thanhca.httlvn.org/thanh-ca-${number}`);
  if (response.status === 404 || response.status === 500) return res.status(404).json({ error: `Không có Thánh Ca ${number}` });
  if (!response.ok) return res.status(502).json({ error: `thanhca.httlvn.org lỗi ${response.status}` });
  const hymn = parseHymnPage(await response.text());
  if (!hymn) return res.status(502).json({ error: 'Không đọc được trang Thánh Ca' });
  return res.json({ number, ...hymn });
});

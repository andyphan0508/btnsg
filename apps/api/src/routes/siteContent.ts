import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import { SITE_SECTIONS } from '@btnsg/shared';
import { DATA_DIR } from '../store/db.js';

/** Bản demo/local của bảng site_content: một object key → value trong data/site-content.json. */
const FILE = path.join(DATA_DIR, 'site-content.json');
const KEYS = new Set(SITE_SECTIONS.map((section) => section.key));

const load = (): Record<string, unknown> => {
  try {
    return existsSync(FILE) ? JSON.parse(readFileSync(FILE, 'utf-8')) : {};
  } catch {
    return {};
  }
};

export const siteContentRouter = Router();

siteContentRouter.get('/', (_req, res) => {
  res.json({ data: load() });
});

siteContentRouter.put('/', (req, res) => {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const next = { ...load(), ...Object.fromEntries(Object.entries(body).filter(([key]) => KEYS.has(key))) };
  writeFileSync(`${FILE}.tmp`, JSON.stringify(next, null, 2), 'utf-8');
  renameSync(`${FILE}.tmp`, FILE);
  res.json({ data: next });
});

import { Router } from 'express';
import type { BaseEntity, Collection } from '../store/db.js';

export class ValidationError extends Error {}

export type Sanitizer<T extends BaseEntity> = (
  body: Record<string, unknown>,
  isPartial: boolean,
) => Partial<Omit<T, keyof BaseEntity>>;

export type CrudHooks<T extends BaseEntity> = {
  afterCreate?: (item: T) => void;
  afterUpdate?: (before: T, after: T) => void;
  afterDelete?: (before: T) => void;
};

/**
 * Tạo router CRUD chuẩn cho một collection:
 * GET / — danh sách, GET /:id — chi tiết,
 * POST / — tạo, PUT /:id — cập nhật, DELETE /:id — xoá.
 */
export const createCrudRouter = <T extends BaseEntity>(
  collection: Collection<T>,
  sanitize: Sanitizer<T>,
  hooks?: CrudHooks<T>,
): Router => {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json({ data: collection.list() });
  });

  router.get('/:id', (req, res) => {
    const item = collection.get(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Không tìm thấy bản ghi' });
      return;
    }
    res.json({ data: item });
  });

  router.post('/', (req, res) => {
    const fields = sanitize(req.body ?? {}, false) as Omit<T, keyof BaseEntity>;
    const item = collection.insert(fields);
    hooks?.afterCreate?.(item);
    res.status(201).json({ data: item });
  });

  router.put('/:id', (req, res) => {
    const before = collection.get(req.params.id);
    const patch = sanitize(req.body ?? {}, true);
    const item = collection.update(req.params.id, patch);
    if (!item || !before) {
      res.status(404).json({ error: 'Không tìm thấy bản ghi' });
      return;
    }
    hooks?.afterUpdate?.(before, item);
    res.json({ data: item });
  });

  router.delete('/:id', (req, res) => {
    const before = collection.get(req.params.id);
    const removed = collection.remove(req.params.id);
    if (!removed || !before) {
      res.status(404).json({ error: 'Không tìm thấy bản ghi' });
      return;
    }
    hooks?.afterDelete?.(before);
    res.json({ data: { id: req.params.id } });
  });

  return router;
};

/* ---------- Helpers dùng chung cho sanitizer ---------- */

export const requireString = (body: Record<string, unknown>, field: string): string => {
  const value = body[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`Trường "${field}" là bắt buộc`);
  }
  return value.trim();
};

export const optionalString = (body: Record<string, unknown>, field: string): string | undefined => {
  const value = body[field];
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') throw new ValidationError(`Trường "${field}" phải là chuỗi`);
  return value.trim();
};

export const optionalNumber = (body: Record<string, unknown>, field: string): number | undefined => {
  const value = body[field];
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  if (Number.isNaN(num)) throw new ValidationError(`Trường "${field}" phải là số`);
  return num;
};

export const oneOf = <V extends string>(
  body: Record<string, unknown>,
  field: string,
  allowed: readonly V[],
  fallback?: V,
): V => {
  const value = body[field];
  if (value === undefined || value === null || value === '') {
    if (fallback !== undefined) return fallback;
    throw new ValidationError(`Trường "${field}" là bắt buộc`);
  }
  if (typeof value !== 'string' || !allowed.includes(value as V)) {
    throw new ValidationError(`Trường "${field}" không hợp lệ`);
  }
  return value as V;
};

export const stringArray = (body: Record<string, unknown>, field: string): string[] => {
  const value = body[field];
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value)) throw new ValidationError(`Trường "${field}" phải là mảng`);
  return value.filter((v): v is string => typeof v === 'string' && v.trim() !== '').map((v) => v.trim());
};

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DATA_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'data');

export type BaseEntity = {
  id: string;
  createdAt: string;
  updatedAt: string;
};

const ensureDataDir = (): void => {
  if (existsSync(DATA_DIR)) return;
  mkdirSync(DATA_DIR, { recursive: true });
};

/**
 * Kho lưu trữ JSON theo collection — mỗi collection một file data/<name>.json.
 * Ghi file kiểu atomic (ghi file tạm rồi rename) để tránh hỏng dữ liệu.
 */
export class Collection<T extends BaseEntity> {
  private items: T[];
  private readonly filePath: string;

  constructor(name: string) {
    ensureDataDir();
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this.items = this.load();
  }

  private load(): T[] {
    if (!existsSync(this.filePath)) return [];

    try {
      const raw = readFileSync(this.filePath, 'utf-8');
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persist(): void {
    const tmpPath = `${this.filePath}.tmp`;
    writeFileSync(tmpPath, JSON.stringify(this.items, null, 2), 'utf-8');
    renameSync(tmpPath, this.filePath);
  }

  count(): number {
    return this.items.length;
  }

  list(): T[] {
    return [...this.items];
  }

  get(id: string): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  insert(fields: Omit<T, keyof BaseEntity>): T {
    const now = new Date().toISOString();
    const item = {
      ...fields,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as T;
    this.items.push(item);
    this.persist();
    return item;
  }

  update(id: string, patch: Partial<Omit<T, keyof BaseEntity>>): T | undefined {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;

    const updated = {
      ...this.items[index],
      ...patch,
      id,
      createdAt: this.items[index].createdAt,
      updatedAt: new Date().toISOString(),
    } as T;
    this.items[index] = updated;
    this.persist();
    return updated;
  }

  remove(id: string): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;

    this.items.splice(index, 1);
    this.persist();
    return true;
  }

  seedIfEmpty(rows: Omit<T, keyof BaseEntity>[]): void {
    if (this.items.length > 0) return;
    rows.forEach((row) => this.insert(row));
  }
}

// Thư viện ảnh "Khoảnh khắc": file ảnh nằm trong kho ảnh (Cloudflare R2 qua Worker, hoặc Supabase
// Storage khi chưa cấu hình R2 — xem lib/images.ts), thông tin ảnh nằm ở bảng moments.
// Landing đọc qua /api/library?t=moments.

import { normalizeTag } from '@btnsg/shared';
import { supabase } from '../lib/supabase';
import { deleteImages, imageUrl, uploadImage } from '../lib/images';
import type { GalleryImage } from '../utils/imageCompress';

export type Moment = {
  id: string;
  album: string;
  caption: string;
  takenOn: string | null;
  path: string;
  thumbPath: string;
  thumbUrl: string;
  url: string;
  /** Dung lượng bản lớn + bản nhỏ; null với ảnh đăng trước migration 0009. */
  bytes: number | null;
  /** Tag để các thẻ / dải ảnh trên web lấy đúng ảnh (VD "Trại hè", "Truyền giảng"). */
  tags: string[];
  /** Liên kết chương trình buổi nhóm (tùy chọn — migration 0011). */
  programId: string | null;
  programTitle: string;
};

type MomentRow = {
  id: string;
  album: string;
  caption: string;
  taken_on: string | null;
  path: string;
  thumb_path: string;
  bytes?: number | null;
  tags?: string[] | null;
  program_id?: string | null;
  program_title?: string | null;
};

const client = () => {
  if (!supabase) throw new Error('Supabase chưa được cấu hình');
  return supabase;
};

const fromRow = (row: MomentRow): Moment => ({
  id: row.id,
  album: row.album,
  caption: row.caption,
  takenOn: row.taken_on,
  path: row.path,
  thumbPath: row.thumb_path,
  thumbUrl: imageUrl(row.thumb_path),
  url: imageUrl(row.path),
  bytes: row.bytes ?? null,
  tags: row.tags ?? [],
  programId: row.program_id ?? null,
  programTitle: row.program_title ?? '',
});

/** "Trại hè, truyền giảng ,, Trại Hè" → ["Trại hè", "truyền giảng"] (NFC, bỏ trùng không phân biệt hoa thường). */
export const parseTags = (text: string): string[] => {
  const seen = new Set<string>();
  return text
    .split(',')
    .map(normalizeTag)
    .filter((tag) => {
      const key = tag.toLocaleLowerCase('vi');
      if (!tag || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
};

const extensionOf = (blob: Blob) => (blob.type === 'image/webp' ? 'webp' : 'jpg');

export const momentsApi = {
  list: async (): Promise<Moment[]> => {
    const { data, error } = await client()
      .from('moments')
      .select('*') // '*' thay vì liệt kê cột: chạy được cả khi chưa có cột bytes (migration 0009)
      .order('taken_on', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as MomentRow[]).map(fromRow);
  },

  /** Upload 2 cỡ ảnh rồi ghi 1 dòng; ghi lỗi thì dọn file vừa upload để không mồ côi. */
  upload: async (
    image: GalleryImage,
    meta: { album: string; caption?: string; takenOn: string; tags: string[]; programId?: string | null; programTitle?: string },
  ): Promise<Moment> => {
    const base = `${meta.takenOn || 'khac'}/${crypto.randomUUID()}`;
    const path = `${base}.${extensionOf(image.full)}`;
    const thumbPath = `${base}-thumb.${extensionOf(image.thumb)}`;
    try {
      await Promise.all([uploadImage(path, image.full), uploadImage(thumbPath, image.thumb)]);
    } catch (uploadError) {
      await deleteImages([path, thumbPath]);
      throw uploadError;
    }

    const row: Record<string, unknown> = {
      album: meta.album,
      caption: meta.caption?.trim() || '',
      taken_on: meta.takenOn || null,
      path,
      thumb_path: thumbPath,
      width: image.width,
      height: image.height,
      bytes: image.full.size + image.thumb.size,
      tags: meta.tags,
      program_id: meta.programId || null,
      program_title: meta.programTitle?.trim() || '',
    };
    const insert = (values: Record<string, unknown>) =>
      client().from('moments').insert(values).select('*').single();
    let { data, error } = await insert(row);
    // Tương thích ngược nếu chưa chạy migration 0009 (bytes) hoặc 0011 (program_id / program_title).
    if (error && (error.message.includes('program_id') || error.message.includes('program_title') || error.message.includes('bytes'))) {
      const fallback = { ...row };
      if (error.message.includes('program_id') || error.message.includes('program_title')) {
        delete fallback.program_id;
        delete fallback.program_title;
      }
      if (error.message.includes('bytes')) delete fallback.bytes;
      ({ data, error } = await insert(fallback));
    }
    if (error) {
      await deleteImages([path, thumbPath]);
      throw new Error(error.message);
    }
    return fromRow(data as MomentRow);
  },

  setTags: async (moment: Moment, tags: string[]): Promise<Moment> => {
    const { data, error } = await client().from('moments').update({ tags }).eq('id', moment.id).select('*').single();
    if (error) throw new Error(error.message);
    return fromRow(data as MomentRow);
  },

  updateMeta: async (
    moment: Moment,
    patch: {
      album?: string;
      caption?: string;
      takenOn?: string | null;
      tags?: string[];
      programId?: string | null;
      programTitle?: string;
    },
  ): Promise<Moment> => {
    const row: Record<string, unknown> = {};
    if (patch.album !== undefined) row.album = patch.album.trim();
    if (patch.caption !== undefined) row.caption = patch.caption.trim();
    if (patch.takenOn !== undefined) row.taken_on = patch.takenOn || null;
    if (patch.tags !== undefined) row.tags = patch.tags;
    if (patch.programId !== undefined) row.program_id = patch.programId || null;
    if (patch.programTitle !== undefined) row.program_title = patch.programTitle.trim();

    const update = (values: Record<string, unknown>) =>
      client().from('moments').update(values).eq('id', moment.id).select('*').single();

    let { data, error } = await update(row);
    if (error && (error.message.includes('program_id') || error.message.includes('program_title'))) {
      const fallback = { ...row };
      delete fallback.program_id;
      delete fallback.program_title;
      ({ data, error } = await update(fallback));
    }
    if (error) throw new Error(error.message);
    return fromRow(data as MomentRow);
  },

  bulkUpdate: async (
    items: Moment[],
    patch: {
      album?: string;
      takenOn?: string | null;
      programId?: string | null;
      programTitle?: string;
      addTags?: string[];
      replaceTags?: string[];
    },
  ): Promise<Moment[]> => {
    const results: Moment[] = [];
    const queue = [...items];
    const worker = async () => {
      for (let item = queue.shift(); item; item = queue.shift()) {
        let nextTags: string[] | undefined;
        if (patch.replaceTags !== undefined) {
          nextTags = patch.replaceTags;
        } else if (patch.addTags && patch.addTags.length > 0) {
          nextTags = parseTags([...item.tags, ...patch.addTags].join(', '));
        }
        const updated = await momentsApi.updateMeta(item, {
          album: patch.album,
          takenOn: patch.takenOn,
          programId: patch.programId,
          programTitle: patch.programTitle,
          tags: nextTags,
        });
        results.push(updated);
      }
    };
    await Promise.all(Array.from({ length: 4 }, worker));
    return results;
  },

  remove: async (moment: Moment): Promise<void> => {
    const { error } = await client().from('moments').delete().eq('id', moment.id);
    if (error) throw new Error(error.message);
    // Dòng đã xoá thì ảnh không còn hiện ở đâu — file sót lại (nếu lỗi) chỉ tốn dung lượng.
    await deleteImages([moment.path, moment.thumbPath]);
  },

  bulkRemove: async (items: Moment[]): Promise<void> => {
    if (items.length === 0) return;
    const ids = items.map((m) => m.id);
    const { error } = await client().from('moments').delete().in('id', ids);
    if (error) throw new Error(error.message);
    await deleteImages(items.flatMap((m) => [m.path, m.thumbPath]));
  },
};

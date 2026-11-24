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
  upload: async (image: GalleryImage, meta: { album: string; takenOn: string; tags: string[] }): Promise<Moment> => {
    const base = `${meta.takenOn || 'khac'}/${crypto.randomUUID()}`;
    const path = `${base}.${extensionOf(image.full)}`;
    const thumbPath = `${base}-thumb.${extensionOf(image.thumb)}`;
    try {
      await Promise.all([uploadImage(path, image.full), uploadImage(thumbPath, image.thumb)]);
    } catch (uploadError) {
      await deleteImages([path, thumbPath]);
      throw uploadError;
    }

    const row = {
      album: meta.album,
      taken_on: meta.takenOn || null,
      path,
      thumb_path: thumbPath,
      width: image.width,
      height: image.height,
      bytes: image.full.size + image.thumb.size,
      tags: meta.tags,
    };
    const insert = (values: Partial<typeof row>) =>
      client().from('moments').insert(values).select('*').single();
    let { data, error } = await insert(row);
    // Chưa chạy migration 0009 (chưa có cột bytes) → vẫn đăng được, chỉ thiếu số dung lượng.
    if (error && error.message.includes('bytes')) {
      const { bytes: _bytes, ...withoutBytes } = row;
      ({ data, error } = await insert(withoutBytes));
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

  remove: async (moment: Moment): Promise<void> => {
    const { error } = await client().from('moments').delete().eq('id', moment.id);
    if (error) throw new Error(error.message);
    // Dòng đã xoá thì ảnh không còn hiện ở đâu — file sót lại (nếu lỗi) chỉ tốn dung lượng.
    await deleteImages([moment.path, moment.thumbPath]);
  },
};

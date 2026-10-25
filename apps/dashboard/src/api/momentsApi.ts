// Thư viện ảnh "Khoảnh khắc": file ảnh nằm trong Supabase Storage (bucket công khai "moments"),
// thông tin ảnh nằm ở bảng moments (supabase/migrations/0008_moments_sermons.sql).
// Landing đọc qua /api/library?t=moments.

import { supabase } from '../lib/supabase';
import type { GalleryImage } from '../utils/imageCompress';

const BUCKET = 'moments';

export type Moment = {
  id: string;
  album: string;
  caption: string;
  takenOn: string | null;
  path: string;
  thumbPath: string;
  thumbUrl: string;
  url: string;
};

type MomentRow = {
  id: string;
  album: string;
  caption: string;
  taken_on: string | null;
  path: string;
  thumb_path: string;
};

const client = () => {
  if (!supabase) throw new Error('Supabase chưa được cấu hình');
  return supabase;
};

const publicUrl = (path: string) => client().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

const fromRow = (row: MomentRow): Moment => ({
  id: row.id,
  album: row.album,
  caption: row.caption,
  takenOn: row.taken_on,
  path: row.path,
  thumbPath: row.thumb_path,
  thumbUrl: publicUrl(row.thumb_path),
  url: publicUrl(row.path),
});

const extensionOf = (blob: Blob) => (blob.type === 'image/webp' ? 'webp' : 'jpg');

export const momentsApi = {
  list: async (): Promise<Moment[]> => {
    const { data, error } = await client()
      .from('moments')
      .select('id,album,caption,taken_on,path,thumb_path')
      .order('taken_on', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as MomentRow[]).map(fromRow);
  },

  /** Upload 2 cỡ ảnh rồi ghi 1 dòng; ghi lỗi thì dọn file vừa upload để không mồ côi. */
  upload: async (image: GalleryImage, meta: { album: string; takenOn: string }): Promise<Moment> => {
    const storage = client().storage.from(BUCKET);
    const base = `${meta.takenOn || 'khac'}/${crypto.randomUUID()}`;
    const path = `${base}.${extensionOf(image.full)}`;
    const thumbPath = `${base}-thumb.${extensionOf(image.thumb)}`;
    // Tên file không bao giờ trùng → cho trình duyệt/CDN cache 1 năm.
    const options = { cacheControl: '31536000', upsert: false };

    const [full, thumb] = await Promise.all([
      storage.upload(path, image.full, { ...options, contentType: image.full.type }),
      storage.upload(thumbPath, image.thumb, { ...options, contentType: image.thumb.type }),
    ]);
    const uploadError = full.error || thumb.error;
    if (uploadError) {
      await storage.remove([path, thumbPath]);
      throw new Error(uploadError.message);
    }

    const { data, error } = await client()
      .from('moments')
      .insert({
        album: meta.album,
        taken_on: meta.takenOn || null,
        path,
        thumb_path: thumbPath,
        width: image.width,
        height: image.height,
      })
      .select('id,album,caption,taken_on,path,thumb_path')
      .single();
    if (error) {
      await storage.remove([path, thumbPath]);
      throw new Error(error.message);
    }
    return fromRow(data as MomentRow);
  },

  remove: async (moment: Moment): Promise<void> => {
    const { error } = await client().from('moments').delete().eq('id', moment.id);
    if (error) throw new Error(error.message);
    // Dòng đã xoá thì ảnh không còn hiện ở đâu — file sót lại (nếu lỗi) chỉ tốn dung lượng.
    await client().storage.from(BUCKET).remove([moment.path, moment.thumbPath]);
  },
};

// Kho ảnh: Cloudflare R2 qua Worker (workers/images) khi có VITE_IMAGES_URL,
// chưa có thì dùng Supabase Storage (bucket "moments") như trước.
// Cùng một "path" (VD 2026-11-23/<uuid>.webp, posts/<id>/<uuid>.webp) dùng được ở cả hai nơi.

import { supabase } from './supabase';
import { compressImage } from '../utils/imageCompress';

export const IMAGES_URL = ((import.meta.env.VITE_IMAGES_URL as string | undefined) ?? '').replace(/\/$/, '');
export const usesR2 = IMAGES_URL !== '';

const BUCKET = 'moments';

const client = () => {
  if (!supabase) throw new Error('Supabase chưa được cấu hình');
  return supabase;
};

/** Link công khai của Supabase Storage (dùng cho ảnh cũ và khi chép sang R2). */
export const supabaseImageUrl = (path: string): string =>
  client().storage.from(BUCKET).getPublicUrl(path).data.publicUrl;

export const imageUrl = (path: string): string => (usesR2 ? `${IMAGES_URL}/${path}` : supabaseImageUrl(path));

const authHeader = async (): Promise<string> => {
  const { data } = await client().auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Phiên đăng nhập đã hết — hãy đăng nhập lại.');
  return `Bearer ${token}`;
};

const workerError = async (response: Response): Promise<Error> => {
  const data = (await response.json().catch(() => null)) as { error?: string } | null;
  return new Error(data?.error || `Kho ảnh lỗi (HTTP ${response.status}).`);
};

/** Upload 1 file; file đã có (cùng path) thì Worker bỏ qua. */
export async function uploadImage(path: string, blob: Blob): Promise<void> {
  if (!usesR2) {
    const { error } = await client()
      .storage.from(BUCKET)
      .upload(path, blob, { cacheControl: '31536000', upsert: false, contentType: blob.type });
    if (error) throw new Error(error.message);
    return;
  }
  const response = await fetch(`${IMAGES_URL}/${path}`, {
    method: 'PUT',
    headers: { Authorization: await authHeader(), 'Content-Type': blob.type },
    body: blob,
  });
  if (!response.ok) throw await workerError(response);
}

export async function deleteImages(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  if (!usesR2) {
    await client().storage.from(BUCKET).remove(paths);
    return;
  }
  const authorization = await authHeader();
  await Promise.all(
    paths.map((path) => fetch(`${IMAGES_URL}/${path}`, { method: 'DELETE', headers: { Authorization: authorization } })),
  );
}

export type StorageUsage = {
  bytes: number;
  objects: number;
  writes: number;
  limitBytes: number;
  warnBytes: number;
  blockBytes: number;
  writeLimit: number;
  writeBlock: number;
  measuredAt?: string;
};

/** Dung lượng R2 đã dùng (Worker theo dõi); null khi chưa dùng R2 hoặc không gọi được. */
export async function fetchStorageUsage(): Promise<StorageUsage | null> {
  if (!usesR2) return null;
  try {
    const response = await fetch(`${IMAGES_URL}/_usage`);
    return response.ok ? ((await response.json()) as StorageUsage) : null;
  } catch {
    return null;
  }
}

/** Path của file nằm trong kho (Supabase hoặc R2) từ link công khai; link ngoài → null. */
export function storedPath(url: string): string | null {
  for (const base of [usesR2 ? `${IMAGES_URL}/` : '', supabase ? supabaseImageUrl('') : '']) {
    if (base && url.startsWith(base)) return url.slice(base.length);
  }
  return null;
}

/** Ảnh chọn ở màn hình Website (ảnh thẻ, ảnh đầu trang…): nén WebP rồi tải lên thư mục site/. */
export async function uploadSiteImage(file: File): Promise<string> {
  const image = await compressImage(file);
  URL.revokeObjectURL(image.previewUrl);
  const path = `site/${crypto.randomUUID()}.${image.blob.type === 'image/webp' ? 'webp' : 'jpg'}`;
  await uploadImage(path, image.blob);
  return imageUrl(path);
}

const AUDIO_TYPES: Record<string, string> = {
  mp3: 'audio/mpeg',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  opus: 'audio/opus',
};
export const MAX_AUDIO_BYTES = 50 * 1024 * 1024;

/**
 * Audio bài giảng: tải nguyên file (không nén lại trong trình duyệt — quá nặng và dễ lỗi).
 * Nên xuất sẵn MP3 mono ~48kbps: 40 phút ≈ 14MB.
 */
export async function uploadAudio(file: File): Promise<string> {
  const extension = (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? '').toLowerCase();
  const type = AUDIO_TYPES[extension];
  if (!type) throw new Error('Chỉ nhận file MP3, M4A, OGG hoặc OPUS.');
  if (file.size > MAX_AUDIO_BYTES) {
    throw new Error(`File ${(file.size / 1024 / 1024).toFixed(1)}MB — tối đa 50MB. Hãy xuất MP3 mono ~48kbps cho nhẹ.`);
  }
  const path = `audio/${crypto.randomUUID()}.${extension}`;
  await uploadImage(path, file.type === type ? file : new Blob([file], { type }));
  return imageUrl(path);
}

/** Xoá file đã tải lên kho (bỏ qua link ngoài như YouTube). */
export async function deleteStoredUrl(url: string): Promise<void> {
  const path = storedPath(url);
  if (path) await deleteImages([path]);
}

/** Dung lượng audio bài giảng + ảnh màn hình Website trên Supabase (thanh "Đã dùng" ở Khoảnh khắc). */
export async function fetchSupabaseExtraBytes(): Promise<number> {
  if (usesR2) return 0;
  let total = 0;
  for (const folder of ['audio', 'site']) {
    // ponytail: tối đa 1.000 file mỗi thư mục — vượt số đó thì phân trang bằng offset.
    const { data } = await client().storage.from(BUCKET).list(folder, { limit: 1000 });
    for (const file of data ?? []) total += Number(file.metadata?.size) || 0;
  }
  return total;
}

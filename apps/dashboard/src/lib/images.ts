// Kho ảnh: Cloudflare R2 qua Worker (workers/images) khi có VITE_IMAGES_URL,
// chưa có thì dùng Supabase Storage (bucket "moments") như trước.
// Cùng một "path" (VD 2026-11-23/<uuid>.webp, posts/<id>/<uuid>.webp) dùng được ở cả hai nơi.

import { supabase } from './supabase';

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

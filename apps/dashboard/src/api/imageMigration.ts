// Chép toàn bộ ảnh/audio cũ từ Supabase Storage sang R2 (giữ nguyên path) và đổi link ở mọi nơi
// đang trỏ về Supabase: bài Tin tức, nội dung màn hình Website (site_content), audio bài giảng.
// Chạy lại bao nhiêu lần cũng được: file đã có trên R2 thì Worker bỏ qua, link đã đổi thì giữ nguyên.
// Bản trên Supabase KHÔNG bị xoá — kiểm tra web ổn rồi mới tự xoá bucket "moments" cũ.

import { supabase } from '../lib/supabase';
import { IMAGES_URL, supabaseImageUrl, uploadImage, usesR2 } from '../lib/images';

type StoredImage = { name: string; url: string; path: string };

const client = () => {
  if (!supabase) throw new Error('Supabase chưa được cấu hình');
  return supabase;
};

async function copyOne(path: string): Promise<void> {
  const response = await fetch(supabaseImageUrl(path));
  if (response.status === 404) return; // file đã mất trên Supabase — không có gì để chép
  if (!response.ok) throw new Error(`Không tải được ${path} từ Supabase (HTTP ${response.status}).`);
  await uploadImage(path, await response.blob());
}

// ponytail: chép tuần tự, audio vài chục MB đi qua trình duyệt — đủ cho quy mô của Ban.
export async function migrateImagesToR2(onProgress: (message: string) => void): Promise<{ files: number; failed: string[] }> {
  if (!usesR2) throw new Error('Chưa cấu hình VITE_IMAGES_URL (Worker R2).');
  const supabasePrefix = supabaseImageUrl('');
  const failed: string[] = [];

  const { data: moments, error: momentsError } = await client().from('moments').select('path,thumb_path');
  if (momentsError) throw new Error(momentsError.message);
  const { data: posts, error: postsError } = await client().from('posts').select('id,content,cover,images');
  // Chưa chạy migration 0009 (chưa có bảng posts) → chỉ chép ảnh Khoảnh khắc.
  const postRows = postsError ? [] : (posts as { id: string; content: string; cover: string; images: StoredImage[] }[]);

  const { data: siteRows } = await client().from('site_content').select('key,value');
  const { data: noteRows } = await client().from('notes').select('id,audio_url').not('audio_url', 'is', null);
  const sites = (siteRows ?? []) as { key: string; value: unknown }[];
  const notes = (noteRows ?? []) as { id: string; audio_url: string }[];

  // Mọi link Supabase nằm trong nội dung Website / audio → path cần chép.
  const linkedPaths = (text: string) =>
    text.split(supabasePrefix).slice(1).map((rest) => rest.split(/["'\s)\]]/)[0]);

  const paths = [
    ...new Set([
      ...(moments as { path: string; thumb_path: string }[]).flatMap((m) => [m.path, m.thumb_path]),
      ...postRows.flatMap((post) => (post.images ?? []).map((image) => image.path)),
      ...sites.flatMap((row) => linkedPaths(JSON.stringify(row.value))),
      ...notes.flatMap((note) => linkedPaths(note.audio_url)),
    ]),
  ];

  for (const [index, path] of paths.entries()) {
    onProgress(`Đang chép ảnh ${index + 1}/${paths.length}…`);
    try {
      await copyOne(path);
    } catch (error) {
      failed.push(`${path}: ${error instanceof Error ? error.message : error}`);
    }
  }

  const toR2 = (text: string) => text.split(supabasePrefix).join(`${IMAGES_URL}/`);
  for (const post of postRows) {
    const images = (post.images ?? []).map((image) => ({ ...image, url: toR2(image.url) }));
    const update = { content: toR2(post.content), cover: toR2(post.cover), images };
    if (update.content === post.content && update.cover === post.cover && JSON.stringify(images) === JSON.stringify(post.images)) {
      continue;
    }
    onProgress('Đang đổi link ảnh trong bài Tin tức…');
    const { error } = await client().from('posts').update(update).eq('id', post.id);
    if (error) failed.push(`Bài ${post.id}: ${error.message}`);
  }

  for (const row of sites) {
    const text = JSON.stringify(row.value);
    if (!text.includes(supabasePrefix)) continue;
    onProgress('Đang đổi link ảnh trong nội dung Website…');
    const { error } = await client().from('site_content').update({ value: JSON.parse(toR2(text)) }).eq('key', row.key);
    if (error) failed.push(`Website ${row.key}: ${error.message}`);
  }
  for (const note of notes) {
    if (!note.audio_url.startsWith(supabasePrefix)) continue;
    const { error } = await client().from('notes').update({ audio_url: toR2(note.audio_url) }).eq('id', note.id);
    if (error) failed.push(`Bài giảng ${note.id}: ${error.message}`);
  }

  return { files: paths.length, failed };
}

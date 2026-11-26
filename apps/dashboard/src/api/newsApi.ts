// Đăng bài Tin tức lên Supabase (bảng posts — supabase/migrations/0009_posts.sql).
// Ảnh trong bài đã nén sẵn ở trình duyệt, lưu trong kho ảnh (lib/images.ts) ở thư mục posts/<id bài>/.
// Landing đọc qua /api/library?t=posts và gộp thêm bài cũ trên Google Drive (chỉ xem, không sửa ở đây).

import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { deleteImages, imageUrl, uploadImage } from '../lib/images';
import { compressImage, type CompressedImage } from '../utils/imageCompress';

export type NewsPostMeta = {
  id: string;
  title: string;
  date: string;
  description: string;
  /** Link ảnh bìa ('' nếu không có). */
  cover: string;
  published: boolean;
};

/** Ảnh đã nằm trên Storage: id = link công khai (dùng thẳng làm src). */
export type NewsImage = {
  id: string;
  name: string;
  path: string;
};

export type NewsPostFull = NewsPostMeta & {
  content: string;
  images: NewsImage[];
};

export type NewsPostInput = {
  title: string;
  date: string;
  description: string;
  markdown: string;
  /** Tên ảnh được chọn làm bìa (ảnh mới hoặc ảnh đã có), '' = không bìa, hoặc URL trực tiếp. */
  cover: string;
  published?: boolean;
};

type StoredImage = { name: string; url: string; path: string; previewUrl?: string };

type PostRow = {
  id: string;
  title: string;
  date: string | null;
  description: string;
  cover: string;
  published?: boolean | null;
  content?: string;
  images?: StoredImage[];
};

const client = () => {
  if (!supabase) throw new Error('Supabase chưa được cấu hình');
  return supabase;
};

const toMeta = (row: PostRow): NewsPostMeta => ({
  id: row.id,
  title: row.title,
  date: row.date ?? '',
  description: row.description,
  cover: row.cover,
  published: row.published ?? true,
});

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Đổi ảnh cục bộ (Markdown `](ten-anh.webp)` hoặc HTML `<img src="blob:..." data-img-name="ten-anh.webp">`)
 * thành link Storage công khai của ảnh đó sau khi upload.
 */
const linkImages = (content: string, images: StoredImage[]): string => {
  let out = content;
  for (const image of images) {
    out = out.replace(new RegExp(`\\]\\(${escapeRegExp(image.name)}\\)`, 'g'), `](${image.url})`);
    if (image.previewUrl) {
      out = out.split(image.previewUrl).join(image.url);
    }
    const nameAttrPattern = new RegExp(
      `(<img\\b[^>]*\\bsrc=)(["'])[^"']*\\2([^>]*\\bdata-img-name=(["'])${escapeRegExp(image.name)}\\4)`,
      'gi',
    );
    out = out.replace(nameAttrPattern, `$1"${image.url}"$3`);
  }
  return out;
};

export const newsApi = {
  isConfigured: (): boolean => isSupabaseConfigured,

  fetchPosts: async (): Promise<NewsPostMeta[]> => {
    const { data, error } = await client()
      .from('posts')
      .select('id,title,date,description,cover,published')
      .order('date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data as PostRow[]).map(toMeta);
  },

  fetchPost: async (postId: string): Promise<NewsPostFull> => {
    const { data, error } = await client()
      .from('posts')
      .select('id,title,date,description,cover,published,content,images')
      .eq('id', postId)
      .single();
    if (error) throw new Error(error.message);
    const row = data as PostRow;
    return {
      ...toMeta(row),
      content: row.content ?? '',
      images: (row.images ?? []).map((image) => ({ id: image.url, name: image.name, path: image.path })),
    };
  },

  /** Nén và upload nhanh một ảnh chèn trực tiếp trong trình soạn thảo Rich Text. */
  uploadInlineImage: async (postId: string, file: File): Promise<NewsImage> => {
    const compressed = await compressImage(file);
    const extension = compressed.blob.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `posts/${postId}/${crypto.randomUUID()}.${extension}`;
    await uploadImage(path, compressed.blob);
    return { id: imageUrl(path), name: compressed.name, path };
  },

  /**
   * Tạo hoặc cập nhật bài: upload ảnh mới → thay tên/blob ảnh trong nội dung bằng link → ghi 1 dòng.
   * Ghi dòng lỗi thì xoá các ảnh vừa upload để không tốn dung lượng vô ích.
   */
  savePost: async (
    postId: string | null,
    input: NewsPostInput,
    newImages: CompressedImage[],
    existingImages: NewsImage[],
    onProgress: (message: string) => void,
    forcedId?: string,
  ): Promise<string> => {
    const id = postId ?? forcedId ?? crypto.randomUUID();
    const uploaded: StoredImage[] = [];

    for (const [index, image] of newImages.entries()) {
      onProgress(`Đang tải ảnh ${index + 1}/${newImages.length}: ${image.name}…`);
      const extension = image.blob.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `posts/${id}/${crypto.randomUUID()}.${extension}`;
      try {
        await uploadImage(path, image.blob);
      } catch (error) {
        await deleteImages(uploaded.map((u) => u.path));
        throw new Error(`Không tải được ảnh "${image.name}": ${error instanceof Error ? error.message : error}`);
      }
      uploaded.push({ name: image.name, path, url: imageUrl(path), previewUrl: image.previewUrl });
    }

    const images: StoredImage[] = [
      ...existingImages.map((image) => ({ name: image.name, url: image.id, path: image.path })),
      ...uploaded,
    ];
    const cleanImages = images.map(({ name, url, path }) => ({ name, url, path }));
    const resolvedCover = /^https?:\/\//i.test(input.cover)
      ? input.cover
      : images.find((image) => image.name === input.cover)?.url ?? '';

    const row = {
      id,
      title: input.title,
      date: input.date || null,
      description: input.description,
      content: linkImages(input.markdown, images),
      cover: resolvedCover,
      images: cleanImages,
      published: input.published ?? true,
    };

    onProgress(postId ? 'Đang cập nhật bài viết…' : 'Đang đăng bài viết…');
    const { error } = await client().from('posts').upsert(row);
    if (error) {
      await deleteImages(uploaded.map((u) => u.path));
      throw new Error(error.message);
    }
    return id;
  },

  deletePost: async (postId: string): Promise<void> => {
    const { images } = await newsApi.fetchPost(postId);
    const { error } = await client().from('posts').delete().eq('id', postId);
    if (error) throw new Error(error.message);
    // Bài đã xoá thì ảnh không còn hiện ở đâu — file sót lại (nếu lỗi) chỉ tốn dung lượng.
    await deleteImages(images.map((image) => image.path));
  },
};

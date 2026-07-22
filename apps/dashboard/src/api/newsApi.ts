// Đăng bài Tin tức lên Google Drive qua Apps Script webhook (tools/apps-script/News.gs).
// Cấu hình VITE_NEWS_SCRIPT_URL = "https://script.google.com/macros/s/.../exec?secret=..."
// (secret phải trùng SHARED_SECRET trong News.gs — chỉ thao tác GHI mới cần secret).
// Chưa cấu hình → chạy chế độ demo: mô phỏng toàn bộ thao tác trong bộ nhớ.

const NEWS_SCRIPT_URL: string = import.meta.env.VITE_NEWS_SCRIPT_URL || '';

const FETCH_TIMEOUT_MS = 30000;

export type NewsPostMeta = {
  id: string;
  title: string;
  date: string;
  description: string;
  cover: string;
};

export type NewsImage = {
  id: string;
  name: string;
};

export type NewsPostFull = NewsPostMeta & {
  content: string;
  images: NewsImage[];
};

export type NewsImageUpload = {
  name: string;
  mimeType: string;
  dataBase64: string;
};

export type NewsPostInput = {
  title: string;
  date: string;
  description: string;
  markdown: string;
  cover: string;
};

/* ---------- Chế độ demo (chưa cấu hình URL) ---------- */

const demoStore: NewsPostFull[] = [
  {
    id: 'demo-1',
    title: 'Bài viết mẫu (chế độ demo)',
    date: '2026-07-20',
    description: 'Cấu hình VITE_NEWS_SCRIPT_URL để đăng bài thật lên Google Drive.',
    cover: '',
    content: 'Đây là bài viết mô phỏng — mọi thao tác đăng/sửa/xoá chỉ diễn ra trong bộ nhớ.',
    images: [],
  },
];

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------- Gọi webhook ---------- */

const fetchJson = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(url, { redirect: 'follow', signal: controller.signal, ...init });
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error('Apps Script phản hồi quá lâu — kiểm tra URL deployment còn hoạt động không.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
  if (!response.ok) throw new Error(`Không gọi được Apps Script (HTTP ${response.status}).`);
  const text = await response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Apps Script không trả về JSON — kiểm tra deploy Web app "Who has access: Anyone".');
  }
};

const getUrl = (params: Record<string, string>): string => {
  const url = new URL(NEWS_SCRIPT_URL);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return url.toString();
};

type WebhookResult = { ok: boolean; error?: string; id?: string; imageId?: string };

// Content-Type text/plain để tránh CORS preflight (Apps Script không trả lời OPTIONS).
const postAction = async (payload: Record<string, unknown>): Promise<WebhookResult> => {
  const result = await fetchJson<WebhookResult>(NEWS_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
  });
  if (!result.ok) throw new Error(result.error || 'Apps Script báo lỗi không rõ nguyên nhân.');
  return result;
};

/* ---------- API công khai ---------- */

export const newsApi = {
  isConfigured: (): boolean => NEWS_SCRIPT_URL !== '',

  fetchPosts: async (): Promise<NewsPostMeta[]> => {
    if (!NEWS_SCRIPT_URL) {
      await wait(300);
      return demoStore.map(({ content: _c, images: _i, ...meta }) => meta);
    }
    const data = await fetchJson<{ posts?: NewsPostMeta[]; error?: string }>(getUrl({ refresh: '1' }));
    if (data.error) throw new Error(data.error);
    return Array.isArray(data.posts) ? data.posts : [];
  },

  fetchPost: async (postId: string): Promise<NewsPostFull> => {
    if (!NEWS_SCRIPT_URL) {
      await wait(200);
      const post = demoStore.find((p) => p.id === postId);
      if (!post) throw new Error('Không tìm thấy bài viết demo.');
      return post;
    }
    const data = await fetchJson<NewsPostFull & { error?: string }>(getUrl({ post: postId, refresh: '1' }));
    if (data.error) throw new Error(data.error);
    return data;
  },

  createPost: async (input: NewsPostInput): Promise<string> => {
    if (!NEWS_SCRIPT_URL) {
      await wait(500);
      const id = `demo-${Date.now()}`;
      demoStore.unshift({ ...input, id, content: input.markdown, images: [] });
      return id;
    }
    const result = await postAction({ action: 'create-post', ...input });
    if (!result.id) throw new Error('Apps Script không trả về ID bài viết.');
    return result.id;
  },

  updatePost: async (postId: string, input: NewsPostInput): Promise<void> => {
    if (!NEWS_SCRIPT_URL) {
      await wait(500);
      const post = demoStore.find((p) => p.id === postId);
      if (post) Object.assign(post, input, { content: input.markdown });
      return;
    }
    await postAction({ action: 'update-post', postId, ...input });
  },

  uploadImage: async (postId: string, image: NewsImageUpload): Promise<void> => {
    if (!NEWS_SCRIPT_URL) {
      await wait(400);
      const post = demoStore.find((p) => p.id === postId);
      if (post) post.images.push({ id: `demo-img-${Date.now()}`, name: image.name });
      return;
    }
    await postAction({ action: 'upload-image', postId, ...image });
  },

  deletePost: async (postId: string): Promise<void> => {
    if (!NEWS_SCRIPT_URL) {
      await wait(300);
      const index = demoStore.findIndex((p) => p.id === postId);
      if (index >= 0) demoStore.splice(index, 1);
      return;
    }
    await postAction({ action: 'delete-post', postId });
  },

  warmCache: async (): Promise<void> => {
    if (!NEWS_SCRIPT_URL) return;
    await postAction({ action: 'warm' });
  },
};

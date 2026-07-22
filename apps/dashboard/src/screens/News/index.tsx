import { useEffect, useState } from 'react';
import { newsApi, type NewsImage, type NewsPostMeta } from '../../api/newsApi';
import { driveThumbnailUrl } from '../../utils/driveImage';
import { compressImage, type CompressedImage } from '../../utils/imageCompress';
import NewsPostForm from './components/NewsPostForm';
import NewsImagePicker from './components/NewsImagePicker';
import NewsMarkdownPreview from './components/NewsMarkdownPreview';
import NewsPostList from './components/NewsPostList';

const todayIso = (): string => new Date().toISOString().slice(0, 10);

/** Chuẩn hoá tên file để so khớp: thường hoá + NFC (đồng bộ với landing). */
const normalizeName = (name: string): string => name.normalize('NFC').toLowerCase();

const stripExtension = (name: string): string => name.replace(/\.[a-z0-9]+$/i, '');

const NewsScreen = () => {
  // 1. State — danh sách bài đã đăng
  const [posts, setPosts] = useState<NewsPostMeta[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  // State — form soạn bài
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>(todayIso());
  const [description, setDescription] = useState<string>('');
  const [markdown, setMarkdown] = useState<string>('');
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [existingImages, setExistingImages] = useState<NewsImage[]>([]);
  const [coverName, setCoverName] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // State — chế độ sửa bài
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isLoadingEditingPost, setIsLoadingEditingPost] = useState<boolean>(false);

  // State — đăng bài / xoá bài
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishProgress, setPublishProgress] = useState<string>('');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  // 2. Logic thuần
  const validatePost = (): string | null => {
    if (!title.trim()) return 'Vui lòng nhập tiêu đề bài viết.';
    if (!markdown.trim()) return 'Vui lòng nhập nội dung bài viết.';
    return null;
  };

  const resolveImageUrl = (src: string): string => {
    if (/^https?:\/\//.test(src)) return src;
    const key = normalizeName(src.trim());
    const keyNoExt = stripExtension(key);
    const picked = images.find((img) => {
      const name = normalizeName(img.name);
      return name === key || stripExtension(name) === keyNoExt;
    });
    if (picked) return picked.previewUrl;
    const existing = existingImages.find((img) => {
      const name = normalizeName(img.name);
      return name === key || stripExtension(name) === keyNoExt;
    });
    return existing ? driveThumbnailUrl(existing.id, 800) : '';
  };

  const coverUrl = coverName ? resolveImageUrl(coverName) : '';

  const resetForm = (): void => {
    setTitle('');
    setDate(todayIso());
    setDescription('');
    setMarkdown('');
    setImages([]);
    setExistingImages([]);
    setCoverName('');
    setEditingPostId(null);
    setPublishError(null);
  };

  // 3. API calls
  const loadPosts = async (): Promise<void> => {
    try {
      setIsLoadingPosts(true);
      setPostsError(null);
      const list = await newsApi.fetchPosts();
      setPosts(list);
    } catch (error) {
      setPostsError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const startEditPost = async (post: NewsPostMeta): Promise<void> => {
    try {
      setIsLoadingEditingPost(true);
      setPublishError(null);
      setPublishSuccess(null);
      const full = await newsApi.fetchPost(post.id);
      setEditingPostId(post.id);
      setTitle(full.title);
      setDate(full.date || todayIso());
      setDescription(full.description || '');
      setMarkdown(full.content || '');
      setImages([]);
      setExistingImages(full.images || []);
      const coverImage = (full.images || []).find((img) => img.id === full.cover);
      setCoverName(coverImage?.name ?? '');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoadingEditingPost(false);
    }
  };

  const submitPost = async (): Promise<void> => {
    const validationError = validatePost();
    if (validationError) {
      setPublishError(validationError);
      return;
    }

    try {
      setIsPublishing(true);
      setPublishError(null);
      setPublishSuccess(null);

      const input = {
        title: title.trim(),
        date,
        description: description.trim(),
        markdown: markdown.trim(),
        cover: coverName,
      };

      let postId = editingPostId;
      if (postId) {
        setPublishProgress('Đang cập nhật nội dung bài…');
        await newsApi.updatePost(postId, input);
      } else {
        setPublishProgress('Đang tạo bài viết trên Google Drive…');
        postId = await newsApi.createPost(input);
      }

      for (let i = 0; i < images.length; i++) {
        setPublishProgress(`Đang tải ảnh ${i + 1}/${images.length}: ${images[i].name}…`);
        await newsApi.uploadImage(postId, images[i]);
      }

      setPublishProgress('Đang làm mới cache để bài hiện ngay trên web…');
      await newsApi.warmCache();

      setPublishSuccess(
        editingPostId ? 'Đã cập nhật bài viết — web sẽ hiển thị bản mới ngay.' : 'Đã đăng bài lên Google Drive — bài đã hiện trên web!',
      );
      resetForm();
      await loadPosts();
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsPublishing(false);
      setPublishProgress('');
    }
  };

  const deletePost = async (post: NewsPostMeta): Promise<void> => {
    if (!window.confirm(`Xoá bài "${post.title}"?\n(Folder bài viết được chuyển vào Thùng rác Drive, khôi phục được trong 30 ngày.)`)) {
      return;
    }
    try {
      setDeletingPostId(post.id);
      await newsApi.deletePost(post.id);
      await newsApi.warmCache();
      if (editingPostId === post.id) resetForm();
      await loadPosts();
    } catch (error) {
      setPostsError(error instanceof Error ? error.message : String(error));
    } finally {
      setDeletingPostId(null);
    }
  };

  // 4. Effects
  useEffect(() => {
    loadPosts();
  }, []);

  // 5. Handlers
  const addImages = async (files: FileList): Promise<void> => {
    try {
      setIsCompressing(true);
      setPublishError(null);
      const compressed: CompressedImage[] = [];
      for (const file of Array.from(files)) {
        compressed.push(await compressImage(file));
      }
      setImages((prev) => {
        const existingNames = new Set([...prev.map((i) => i.name), ...existingImages.map((i) => i.name)]);
        const fresh = compressed.filter((img) => !existingNames.has(img.name));
        const next = [...prev, ...fresh];
        if (!coverName && next.length > 0) setCoverName(next[0].name);
        return next;
      });
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsCompressing(false);
    }
  };

  const removeImage = (name: string): void => {
    setImages((prev) => prev.filter((img) => img.name !== name));
    if (coverName === name) setCoverName('');
  };

  const insertImageIntoMarkdown = (name: string): void => {
    setMarkdown((prev) => `${prev.trimEnd()}\n\n![Chú thích ảnh](${name})\n`);
  };

  // 6. Render
  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Truyền thông</span>
          <h2>Đăng bài Tin tức</h2>
          <p className="page-sub">
            Soạn bài bằng Markdown, ảnh tự nén rồi upload thẳng lên folder Tin Tức trên Google Drive —
            web hiển thị ngay sau khi đăng.
          </p>
        </div>
        {editingPostId && (
          <button className="btn btn-outline" onClick={resetForm}>
            + Soạn bài mới (bỏ chế độ sửa)
          </button>
        )}
      </div>

      {!newsApi.isConfigured() && (
        <div style={styles.demoNote}>
          Chưa cấu hình <code>VITE_NEWS_SCRIPT_URL</code> (kèm <code>?secret=</code>) — thao tác chỉ được
          mô phỏng, không ghi lên Google Drive thật. Xem hướng dẫn trong <code>DEPLOY.md</code> Bước 2c.
        </div>
      )}

      {isLoadingEditingPost && <div style={styles.progress}>Đang tải bài viết để sửa…</div>}
      {editingPostId && !isLoadingEditingPost && (
        <div style={styles.editNote}>
          Đang sửa bài: <strong>{title || '(chưa có tiêu đề)'}</strong>
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Cột trái: form + ảnh */}
        <div style={styles.column}>
          <NewsPostForm
            title={title}
            date={date}
            description={description}
            markdown={markdown}
            onTitleChange={setTitle}
            onDateChange={setDate}
            onDescriptionChange={setDescription}
            onMarkdownChange={setMarkdown}
          />
          <NewsImagePicker
            images={images}
            existingImages={existingImages}
            coverName={coverName}
            isCompressing={isCompressing}
            onPickFiles={addImages}
            onRemoveImage={removeImage}
            onSetCover={setCoverName}
            onInsertImage={insertImageIntoMarkdown}
          />

          {publishError && <div className="form-error">{publishError}</div>}
          {publishSuccess && <div style={styles.success}>{publishSuccess}</div>}
          {isPublishing && publishProgress && <div style={styles.progress}>{publishProgress}</div>}

          <button
            className="btn btn-primary"
            style={{ width: '100%' }}
            disabled={isPublishing || isCompressing}
            onClick={submitPost}
          >
            {isPublishing ? 'Đang xử lý…' : editingPostId ? '💾 Cập nhật bài viết' : '🚀 Đăng bài lên web'}
          </button>
        </div>

        {/* Cột phải: preview + danh sách bài */}
        <div style={styles.column}>
          <div className="card">
            <div className="card-title">Xem trước (đúng giao diện landing)</div>
            <NewsMarkdownPreview
              title={title}
              date={date}
              description={description}
              markdown={markdown}
              resolveImageUrl={resolveImageUrl}
              coverUrl={coverUrl}
            />
          </div>
          <NewsPostList
            posts={posts}
            isLoading={isLoadingPosts}
            error={postsError}
            editingPostId={editingPostId}
            deletingPostId={deletingPostId}
            onEdit={startEditPost}
            onDelete={deletePost}
          />
        </div>
      </div>
    </div>
  );
};

export default NewsScreen;

const styles = {
  column: { display: 'flex', flexDirection: 'column' as const, gap: 16 },
  demoNote: {
    background: 'rgba(240, 193, 75, 0.16)',
    color: '#9a7415',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: '0.84rem',
    marginBottom: 16,
  },
  editNote: {
    background: 'var(--brand-soft)',
    color: 'var(--brand)',
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: '0.86rem',
    marginBottom: 16,
  },
  progress: {
    background: 'var(--surface-2)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: '0.85rem',
    marginBottom: 4,
  },
  success: {
    background: 'var(--green-soft)',
    color: 'var(--green)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: '0.85rem',
  },
};

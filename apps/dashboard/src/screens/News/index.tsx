import { useEffect, useMemo, useRef, useState } from 'react';
import { FiArrowLeft, FiEye, FiImage, FiPlus, FiSave, FiSend, FiShare2 } from 'react-icons/fi';
import { isHtmlContent, markdownToBasicHtml, stripHtmlToText } from '@btnsg/shared';
import { momentsApi, type Moment } from '../../api/momentsApi';
import { newsApi, type NewsImage, type NewsPostMeta } from '../../api/newsApi';
import { useDialog } from '../../ui/DialogProvider';
import FacebookShareModal, { PUBLIC_LANDING_URL } from '../../ui/FacebookShareModal';
import Modal from '../../ui/Modal';
import RichTextEditor, { type RichEditorApi } from '../../ui/RichTextEditor';
import StorageBanner from '../../ui/StorageBanner';
import { compressImage, type CompressedImage } from '../../utils/imageCompress';
import NewsImagePicker from './components/NewsImagePicker';
import NewsMarkdownPreview from './components/NewsMarkdownPreview';
import NewsPostList from './components/NewsPostList';

const todayIso = (): string => new Date().toISOString().slice(0, 10);
const normalizeName = (name: string): string => name.normalize('NFC').toLowerCase();
const stripExtension = (name: string): string => name.replace(/\.[a-z0-9]+$/i, '');

type ViewMode = 'list' | 'editor';

const NewsScreen = () => {
  const { confirm, notify } = useDialog();
  const editorApiRef = useRef<RichEditorApi | null>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // 1. State — danh sách bài & chế độ màn hình
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [posts, setPosts] = useState<NewsPostMeta[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState<boolean>(true);
  const [postsError, setPostsError] = useState<string | null>(null);

  // State — form soạn bài kiểu WordPress
  const [draftPostId, setDraftPostId] = useState<string>(() => crypto.randomUUID());
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>(todayIso());
  const [published, setPublished] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');
  const [contentHtml, setContentHtml] = useState<string>('');
  const [images, setImages] = useState<CompressedImage[]>([]);
  const [existingImages, setExistingImages] = useState<NewsImage[]>([]);
  const [coverName, setCoverName] = useState<string>('');
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // State — lưu / preview / chia sẻ Facebook / chọn ảnh từ Khoảnh khắc
  const [isLoadingEditingPost, setIsLoadingEditingPost] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [publishProgress, setPublishProgress] = useState<string>('');
  const [publishError, setPublishError] = useState<string | null>(null);
  const [lastSavedPost, setLastSavedPost] = useState<NewsPostMeta | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [shareTarget, setShareTarget] = useState<NewsPostMeta | null>(null);

  // Khoảnh khắc gallery picker modal
  const [momentsPickerMode, setMomentsPickerMode] = useState<'content' | 'cover' | null>(null);
  const [momentsList, setMomentsList] = useState<Moment[]>([]);
  const [momentsLoading, setMomentsLoading] = useState<boolean>(false);
  const [momentsSearch, setMomentsSearch] = useState<string>('');

  // 2. Logic thuần
  const resolveImageUrl = (src: string): string => {
    if (/^(https?:\/\/|blob:|data:)/i.test(src)) return src;
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
    return existing ? existing.id : '';
  };

  const coverUrl = coverName ? resolveImageUrl(coverName) : '';

  const editorImages = useMemo(
    () => [
      ...existingImages.map((img) => ({ name: img.name, url: img.id })),
      ...images.map((img) => ({ name: img.name, url: img.previewUrl })),
    ],
    [existingImages, images],
  );

  const resetForm = (): void => {
    setDraftPostId(crypto.randomUUID());
    setEditingPostId(null);
    setTitle('');
    setDate(todayIso());
    setPublished(true);
    setDescription('');
    setContentHtml('');
    setImages([]);
    setExistingImages([]);
    setCoverName('');
    setPublishError(null);
    setLastSavedPost(null);
  };

  const openNewEditor = () => {
    resetForm();
    setViewMode('editor');
  };

  const validatePost = (): string | null => {
    if (!title.trim()) return 'Vui lòng nhập tiêu đề bài viết.';
    if (!stripHtmlToText(contentHtml) && !/<img\b/i.test(contentHtml)) {
      return 'Vui lòng nhập nội dung bài viết.';
    }
    return null;
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
      setLastSavedPost(null);
      setViewMode('editor');
      const full = await newsApi.fetchPost(post.id);
      setEditingPostId(post.id);
      setDraftPostId(post.id);
      setTitle(full.title);
      setDate(full.date || todayIso());
      setPublished(full.published);
      setDescription(full.description || '');
      const rawContent = full.content || '';
      setContentHtml(isHtmlContent(rawContent) ? rawContent : markdownToBasicHtml(rawContent));
      setImages([]);
      setExistingImages(full.images || []);
      const coverImage = (full.images || []).find((img) => img.id === full.cover);
      setCoverName(coverImage?.name ?? full.cover ?? '');
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

      const input = {
        title: title.trim(),
        date,
        description: description.trim(),
        markdown: contentHtml.trim(),
        cover: coverName,
        published,
      };

      const savedId = await newsApi.savePost(
        editingPostId,
        input,
        images,
        existingImages,
        setPublishProgress,
        draftPostId,
      );

      const savedMeta: NewsPostMeta = {
        id: savedId,
        title: input.title,
        date: input.date,
        description: input.description,
        cover: coverUrl,
        published,
      };

      // Tải lại bài đã lưu để đồng bộ URL ảnh thật vào editor (có thể bấm Chia sẻ Facebook ngay)
      const full = await newsApi.fetchPost(savedId);
      setEditingPostId(savedId);
      setDraftPostId(savedId);
      setContentHtml(full.content);
      setImages([]);
      setExistingImages(full.images || []);
      const coverImg = (full.images || []).find((img) => img.id === full.cover);
      setCoverName(coverImg?.name ?? full.cover ?? '');
      savedMeta.cover = full.cover;
      setLastSavedPost(savedMeta);

      notify(
        published
          ? editingPostId
            ? 'Đã cập nhật bài viết lên website.'
            : 'Đã đăng bài viết mới lên website!'
          : 'Đã lưu bản nháp.',
      );
      await loadPosts();
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsPublishing(false);
      setPublishProgress('');
    }
  };

  const deletePost = async (post: NewsPostMeta): Promise<void> => {
    const confirmed = await confirm({
      title: 'Xóa bài viết',
      message: `Xóa bài "${post.title}"?\nBài và ảnh trong bài sẽ bị xóa vĩnh viễn, không khôi phục được.`,
      confirmLabel: 'Xóa vĩnh viễn',
      danger: true,
    });
    if (!confirmed) return;

    try {
      setDeletingPostId(post.id);
      await newsApi.deletePost(post.id);
      if (editingPostId === post.id) {
        resetForm();
        setViewMode('list');
      }
      await loadPosts();
      notify('Đã xóa bài viết.');
    } catch (error) {
      setPostsError(error instanceof Error ? error.message : String(error));
    } finally {
      setDeletingPostId(null);
    }
  };

  const openMomentsPicker = async (mode: 'content' | 'cover') => {
    setMomentsPickerMode(mode);
    setMomentsSearch('');
    if (momentsList.length > 0 || !newsApi.isConfigured()) return;
    try {
      setMomentsLoading(true);
      setMomentsList(await momentsApi.list());
    } catch {
      notify('Không tải được danh sách Khoảnh khắc.', 'error');
    } finally {
      setMomentsLoading(false);
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

  const uploadInlineFiles = async (files: FileList): Promise<{ name: string; url: string }[]> => {
    const results: { name: string; url: string }[] = [];
    for (const file of Array.from(files)) {
      const uploaded = await newsApi.uploadInlineImage(draftPostId, file);
      setExistingImages((prev) => [...prev, uploaded]);
      if (!coverName) setCoverName(uploaded.name);
      results.push({ name: uploaded.name, url: uploaded.id });
    }
    return results;
  };

  const handleUploadCover = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      const uploaded = await uploadInlineFiles(files);
      if (uploaded[0]) setCoverName(uploaded[0].name);
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : String(error));
    }
  };

  const removeImage = (name: string): void => {
    setImages((prev) => prev.filter((img) => img.name !== name));
    if (coverName === name) setCoverName('');
  };

  const insertImageIntoEditor = (name: string): void => {
    const url = resolveImageUrl(name);
    if (!url) return;
    editorApiRef.current?.insertImage(url, name.replace(/\.[^/.]+$/, ''), '', 'center', name);
  };

  const pickMomentForPost = (moment: Moment) => {
    if (momentsPickerMode === 'cover') {
      setCoverName(moment.url);
      notify('Đã chọn ảnh đại diện từ Khoảnh khắc.');
    } else if (momentsPickerMode === 'content') {
      editorApiRef.current?.insertImage(moment.url, moment.caption || moment.album, moment.caption, 'center');
    }
    setMomentsPickerMode(null);
  };

  const filteredMoments = useMemo(() => {
    const q = momentsSearch.trim().toLowerCase();
    if (!q) return momentsList.slice(0, 48);
    return momentsList
      .filter((m) => [m.caption, m.album, m.programTitle, ...m.tags].join(' ').toLowerCase().includes(q))
      .slice(0, 48);
  }, [momentsList, momentsSearch]);

  const openShareCurrentPost = () => {
    if (!editingPostId) {
      notify('Hãy lưu hoặc đăng bài viết trước khi chia sẻ lên Facebook.', 'info');
      return;
    }
    setShareTarget({
      id: editingPostId,
      title: title.trim() || 'Bài viết mới',
      date,
      description: description.trim(),
      cover: coverUrl,
      published,
    });
  };

  // 6. Render
  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Truyền thông · WordPress Editor</span>
          <h2>{viewMode === 'list' ? 'Quản lý Tin tức & Bài viết' : editingPostId ? 'Chỉnh sửa bài viết' : 'Soạn bài viết mới'}</h2>
          <p className="page-sub">
            Soạn thảo trực quan chuẩn WordPress: định dạng phông chữ, cỡ chữ, căn lề, chèn ảnh linh hoạt, xem trước
            và chia sẻ trực tiếp lên Facebook.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {viewMode === 'editor' ? (
            <button type="button" className="btn btn-outline" onClick={() => setViewMode('list')}>
              <FiArrowLeft /> Tất cả bài viết ({posts.length})
            </button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={openNewEditor}>
              <FiPlus /> Viết bài mới
            </button>
          )}
        </div>
      </div>

      {!newsApi.isConfigured() && (
        <div className="fb-draft-warn" style={{ marginBottom: 16 }}>
          Chưa cấu hình Supabase (<code>VITE_SUPABASE_URL</code>, <code>VITE_SUPABASE_ANON_KEY</code>) — không đăng bài được.
        </div>
      )}

      <StorageBanner refreshKey={posts.length} />

      {viewMode === 'list' ? (
        <NewsPostList
          posts={posts}
          isLoading={isLoadingPosts}
          error={postsError}
          editingPostId={editingPostId}
          deletingPostId={deletingPostId}
          onEdit={startEditPost}
          onDelete={deletePost}
          onShare={(post) => setShareTarget(post)}
        />
      ) : (
        <>
          {isLoadingEditingPost && <div className="cell-muted" style={{ marginBottom: 12 }}>Đang tải nội dung bài viết…</div>}

          {lastSavedPost && (
            <div className="wp-saved-banner">
              <span>
                Đã lưu <strong>{lastSavedPost.title}</strong> ({lastSavedPost.published ? 'Công khai' : 'Bản nháp'}).
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setShareTarget(lastSavedPost)}>
                  <FiShare2 /> Chia sẻ lên Facebook ngay
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={openNewEditor}>
                  + Viết bài khác
                </button>
              </div>
            </div>
          )}

          <div className="wp-layout">
            {/* Cột chính (trái): Tiêu đề lớn + Trình soạn thảo Rich Text */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
              <input
                className="wp-title-input"
                value={title}
                placeholder="Thêm tiêu đề bài viết…"
                onChange={(e) => setTitle(e.target.value)}
              />

              <RichTextEditor
                value={contentHtml}
                onChange={setContentHtml}
                minHeight={460}
                postImages={editorImages}
                onUploadImages={uploadInlineFiles}
                onOpenMomentsPicker={() => openMomentsPicker('content')}
                editorApiRef={editorApiRef}
              />
            </div>

            {/* Cột thanh công cụ (phải): Xuất bản, Ảnh đại diện, Mô tả, Thư viện ảnh bài */}
            <aside className="wp-sidebar">
              <div className="card">
                <div className="card-title">Xuất bản</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="field" style={{ margin: 0 }}>
                    <label className="field-label">Trạng thái</label>
                    <div className="segmented" style={{ width: '100%' }}>
                      <button
                        type="button"
                        style={{ flex: 1 }}
                        className={published ? 'active' : undefined}
                        onClick={() => setPublished(true)}
                      >
                        Công khai
                      </button>
                      <button
                        type="button"
                        style={{ flex: 1 }}
                        className={!published ? 'active' : undefined}
                        onClick={() => setPublished(false)}
                      >
                        Bản nháp
                      </button>
                    </div>
                  </div>

                  <div className="field" style={{ margin: 0 }}>
                    <label className="field-label">Ngày đăng</label>
                    <input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>

                  {publishError && <div className="form-error">{publishError}</div>}
                  {isPublishing && publishProgress && <div className="cell-muted">{publishProgress}</div>}

                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%' }}
                    disabled={isPublishing || isCompressing}
                    onClick={submitPost}
                  >
                    {isPublishing ? (
                      'Đang xử lý…'
                    ) : editingPostId ? (
                      <>
                        <FiSave /> Cập nhật bài viết
                      </>
                    ) : (
                      <>
                        <FiSend /> {published ? 'Đăng bài lên web' : 'Lưu bản nháp'}
                      </>
                    )}
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => setIsPreviewModalOpen(true)}
                    >
                      <FiEye /> Xem trước
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={openShareCurrentPost}
                    >
                      <FiShare2 /> Facebook
                    </button>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-title">Ảnh đại diện (Bìa)</div>
                <input
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    handleUploadCover(e.target.files);
                    e.target.value = '';
                  }}
                />
                {coverUrl ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <img src={coverUrl} alt="Ảnh bìa" className="wp-cover-thumb" />
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => coverFileInputRef.current?.click()}
                      >
                        Đổi ảnh
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => openMomentsPicker('cover')}
                      >
                        Từ Khoảnh khắc
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setCoverName('')}>
                        Gỡ bìa
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => coverFileInputRef.current?.click()}
                    >
                      + Tải ảnh bìa
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      onClick={() => openMomentsPicker('cover')}
                    >
                      <FiImage /> Chọn từ Khoảnh khắc
                    </button>
                  </div>
                )}
              </div>

              <div className="card">
                <div className="card-title">Mô tả ngắn (Excerpt)</div>
                <textarea
                  className="textarea"
                  rows={3}
                  value={description}
                  placeholder="Tóm tắt ngắn hiện ở danh sách Tin tức & thẻ chia sẻ Facebook…"
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <NewsImagePicker
                images={images}
                existingImages={existingImages}
                coverName={coverName}
                isCompressing={isCompressing}
                onPickFiles={addImages}
                onRemoveImage={removeImage}
                onSetCover={setCoverName}
                onInsertImage={insertImageIntoEditor}
              />
            </aside>
          </div>
        </>
      )}

      {/* Modal xem trước toàn bài */}
      <Modal
        size="xl"
        isOpen={isPreviewModalOpen}
        title="Xem trước bài viết (Giao diện Landing)"
        onClose={() => setIsPreviewModalOpen(false)}
      >
        <NewsMarkdownPreview
          title={title}
          date={date}
          description={description}
          markdown={contentHtml}
          resolveImageUrl={resolveImageUrl}
          coverUrl={coverUrl}
        />
      </Modal>

      {/* Modal chọn ảnh từ Khoảnh khắc */}
      <Modal
        size="lg"
        isOpen={momentsPickerMode !== null}
        title={momentsPickerMode === 'cover' ? 'Chọn ảnh đại diện từ Khoảnh khắc' : 'Chèn ảnh từ Khoảnh khắc'}
        onClose={() => setMomentsPickerMode(null)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="input"
            value={momentsSearch}
            placeholder="Tìm ảnh theo chương trình, chú thích, tag…"
            onChange={(e) => setMomentsSearch(e.target.value)}
          />
          {momentsLoading ? (
            <div className="cell-muted">Đang tải Khoảnh khắc…</div>
          ) : filteredMoments.length === 0 ? (
            <div className="cell-muted">Không có ảnh phù hợp trong Khoảnh khắc.</div>
          ) : (
            <div className="moments-picker-grid">
              {filteredMoments.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="moments-picker-item"
                  onClick={() => pickMomentForPost(m)}
                  title={m.caption || m.programTitle || m.album}
                >
                  <img src={m.thumbUrl} alt={m.caption || m.album} loading="lazy" />
                  <span>{m.caption || m.programTitle || m.album || 'Khoảnh khắc'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal chia sẻ Facebook */}
      <FacebookShareModal
        isOpen={shareTarget !== null}
        onClose={() => setShareTarget(null)}
        url={shareTarget ? `${PUBLIC_LANDING_URL}/tin-tuc/${shareTarget.id}` : PUBLIC_LANDING_URL}
        title={shareTarget?.title ?? ''}
        description={shareTarget?.description ?? ''}
        coverUrl={shareTarget?.cover ?? ''}
        isDraft={shareTarget ? !shareTarget.published : false}
      />
    </div>
  );
};

export default NewsScreen;

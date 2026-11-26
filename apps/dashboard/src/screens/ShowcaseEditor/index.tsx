import { useEffect, useMemo, useRef, useState } from 'react';
import { FiArrowDown, FiArrowUp, FiEdit2, FiExternalLink, FiImage, FiPlus, FiSave, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import {
  blankSiteItem,
  mergeSiteContent,
  sameTag,
  SITE_SECTIONS,
  toSiteImageUrl,
  type SiteContent,
  type SiteRecord,
} from '@btnsg/shared';
import { momentsApi, type Moment } from '../../api/momentsApi';
import { LANDING_URL, siteContentApi } from '../../api/siteContentApi';
import { useAuth } from '../../auth/AuthContext';
import { uploadSiteImage } from '../../lib/images';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useDialog } from '../../ui/DialogProvider';
import LoadingState from '../../ui/LoadingState';
import Modal from '../../ui/Modal';
import CardEditModal, { type ShowcaseItemMode } from './components/CardEditModal';

const MANAGED_KEYS = ['home', 'ministries', 'schedule'] as const;
const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const ShowcaseEditorScreen = () => {
  const { profile } = useAuth();
  const { confirm, notify } = useDialog();
  const quickFileInputRef = useRef<HTMLInputElement>(null);
  const quickUploadTargetRef = useRef<{ mode: ShowcaseItemMode; index: number } | null>(null);

  const [savedContent, setSavedContent] = useState<SiteContent | null>(null);
  const [draftContent, setDraftContent] = useState<SiteContent | null>(null);
  const [activeTab, setActiveTab] = useState<ShowcaseItemMode>('ministry');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const [moments, setMoments] = useState<Moment[]>([]);
  const [pickerCallback, setPickerCallback] = useState<((url: string) => void) | null>(null);
  const [pickerSearch, setPickerSearch] = useState<string>('');

  const [modalState, setModalState] = useState<{ mode: ShowcaseItemMode; index: number | null; item: SiteRecord } | null>(null);

  const cleanDraft = useMemo(() => (draftContent ? mergeSiteContent(draftContent) : null), [draftContent]);

  const dirtyKeys = useMemo(() => {
    if (!cleanDraft || !savedContent) return [] as string[];
    return MANAGED_KEYS.filter((key) => !sameValue(cleanDraft[key], savedContent[key]));
  }, [cleanDraft, savedContent]);

  const allTags = useMemo(
    () => [...new Set(moments.flatMap((m) => m.tags))].sort((a, b) => a.localeCompare(b, 'vi')),
    [moments],
  );

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const merged = mergeSiteContent(await siteContentApi.getAll());
      setSavedContent(merged);
      setDraftContent(merged);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    if (isSupabaseConfigured) {
      momentsApi
        .list()
        .then(setMoments)
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (dirtyKeys.length === 0) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirtyKeys.length]);

  const resolveCardPreview = (item: SiteRecord, index: number): { url: string; badge: string } => {
    const own = toSiteImageUrl(item.image, 900);
    if (own) return { url: own, badge: 'Ảnh riêng' };
    const tag = String(item.tag ?? '').trim();
    if (tag) {
      const matched = moments.find((m) => m.tags.some((t) => sameTag(t, tag)));
      if (matched) return { url: matched.thumbUrl, badge: `Tag: #${tag}` };
      return { url: '', badge: `Tag: #${tag} (chưa có ảnh)` };
    }
    const spread = moments[index % Math.max(1, moments.length)];
    if (spread) return { url: spread.thumbUrl, badge: 'Ảnh tự động từ thư viện' };
    return { url: '', badge: 'Chưa gắn ảnh' };
  };

  const sectionKeyOf = (mode: ShowcaseItemMode) => (mode === 'ministry' ? 'ministries' : 'schedule');

  const getItems = (mode: ShowcaseItemMode): SiteRecord[] => {
    if (!draftContent) return [];
    const list = draftContent[sectionKeyOf(mode)];
    return Array.isArray(list) ? list : [];
  };

  const setItems = (mode: ShowcaseItemMode, next: SiteRecord[]) => {
    const key = sectionKeyOf(mode);
    setDraftContent((prev) => (prev ? { ...prev, [key]: next } : prev));
  };

  const updateHomeField = (fieldName: string, value: string) => {
    setDraftContent((prev) => {
      if (!prev) return prev;
      const home = (prev.home as SiteRecord) ?? {};
      return { ...prev, home: { ...home, [fieldName]: value } };
    });
  };

  const handleSaveChanges = async () => {
    if (!cleanDraft || dirtyKeys.length === 0) return;
    try {
      setIsSaving(true);
      const changes = Object.fromEntries(dirtyKeys.map((key) => [key, cleanDraft[key]]));
      await siteContentApi.save(changes, profile?.fullName ?? '');
      setSavedContent((prev) => (prev ? { ...prev, ...changes } : prev));
      setDraftContent((prev) => (prev ? { ...prev, ...changes } : prev));
      notify('Đã lưu cấu hình Mục vụ & Nhịp sinh hoạt lên website!');
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = async () => {
    const ok = await confirm({
      title: 'Hủy thay đổi',
      message: 'Bỏ toàn bộ chỉnh sửa chưa lưu ở màn hình này?',
      confirmLabel: 'Bỏ thay đổi',
      danger: true,
    });
    if (!ok) return;
    setDraftContent(savedContent);
  };

  const openAddModal = (mode: ShowcaseItemMode) => {
    const spec = SITE_SECTIONS.find((s) => s.key === sectionKeyOf(mode))!;
    setModalState({ mode, index: null, item: blankSiteItem(spec) });
  };

  const openEditModal = (mode: ShowcaseItemMode, index: number) => {
    const items = getItems(mode);
    setModalState({ mode, index, item: items[index] });
  };

  const handleModalSave = (nextItem: SiteRecord) => {
    if (!modalState) return;
    const items = getItems(modalState.mode);
    if (modalState.index === null) {
      setItems(modalState.mode, [...items, nextItem]);
      notify('Đã thêm mục mới — bấm "Lưu thay đổi" để đăng lên web.', 'info');
    } else {
      setItems(
        modalState.mode,
        items.map((cur, i) => (i === modalState.index ? nextItem : cur)),
      );
    }
  };

  const handleDeleteItem = async (mode: ShowcaseItemMode, index: number) => {
    const items = getItems(mode);
    const label = String(items[index]?.[mode === 'ministry' ? 'title' : 'what'] || `#${index + 1}`);
    const ok = await confirm({
      title: mode === 'ministry' ? 'Xóa mảng mục vụ' : 'Xóa buổi sinh hoạt',
      message: `Xóa "${label}" khỏi danh sách?`,
      confirmLabel: 'Xóa',
      danger: true,
    });
    if (!ok) return;
    setItems(
      mode,
      items.filter((_, i) => i !== index),
    );
    if (modalState?.mode === mode && modalState.index === index) setModalState(null);
  };

  const moveItem = (mode: ShowcaseItemMode, index: number, delta: -1 | 1) => {
    const items = [...getItems(mode)];
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    setItems(mode, items);
  };

  const triggerQuickUpload = (mode: ShowcaseItemMode, index: number) => {
    quickUploadTargetRef.current = { mode, index };
    quickFileInputRef.current?.click();
  };

  const handleQuickFilePicked = async (file: File | undefined) => {
    const target = quickUploadTargetRef.current;
    quickUploadTargetRef.current = null;
    if (!file || !target) return;
    try {
      const url = await uploadSiteImage(file);
      const items = getItems(target.mode);
      setItems(
        target.mode,
        items.map((cur, i) => (i === target.index ? { ...cur, image: url } : cur)),
      );
      notify('Đã thay ảnh nền thẻ — nhớ bấm "Lưu thay đổi" để cập nhật web.');
    } catch (err) {
      notify(err instanceof Error ? err.message : String(err), 'error');
    }
  };

  const openMomentsPicker = (onPicked: (url: string) => void) => {
    setPickerSearch('');
    setPickerCallback(() => onPicked);
  };

  const filteredMoments = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    if (!q) return moments.slice(0, 48);
    return moments
      .filter((m) => [m.caption, m.album, m.programTitle, ...m.tags].join(' ').toLowerCase().includes(q))
      .slice(0, 48);
  }, [moments, pickerSearch]);

  const homeRecord = (draftContent?.home as SiteRecord | undefined) ?? {};
  const activeItems = getItems(activeTab);

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Trình điều chỉnh</span>
          <h2>Mục vụ & Nhịp sinh hoạt</h2>
          <p className="page-sub">
            Thay đổi ảnh nền, thêm mới, chỉnh sửa nội dung và thứ tự hiển thị cho khối Accordion Mục vụ và các thẻ Nhịp
            sinh hoạt mỗi tuần trên trang chủ.
          </p>
        </div>

        <div className="cell-actions">
          {LANDING_URL && (
            <a
              href={activeTab === 'ministry' ? `${LANDING_URL}/muc-vu` : `${LANDING_URL}/sinh-hoat`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              <FiExternalLink /> Xem trên web
            </a>
          )}
          <button type="button" className="btn btn-ghost" disabled={dirtyKeys.length === 0 || isSaving} onClick={handleDiscard}>
            Hủy thay đổi
          </button>
          <button type="button" className="btn btn-primary" disabled={dirtyKeys.length === 0 || isSaving} onClick={handleSaveChanges}>
            <FiSave /> {isSaving ? 'Đang lưu…' : dirtyKeys.length > 0 ? `Lưu thay đổi (${dirtyKeys.length})` : 'Đã lưu'}
          </button>
        </div>
      </div>

      <input
        ref={quickFileInputRef}
        type="file"
        accept="image/*,.heic,.heif"
        hidden
        onChange={(e) => {
          handleQuickFilePicked(e.target.files?.[0]);
          e.target.value = '';
        }}
      />

      {loadError && (
        <div className="form-error" style={{ marginBottom: 14 }}>
          {loadError}
        </div>
      )}

      {isLoading || !draftContent ? (
        !loadError && <LoadingState label="Đang tải dữ liệu trình điều chỉnh…" />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div className="segmented" role="tablist">
              <button
                type="button"
                className={activeTab === 'ministry' ? 'active' : undefined}
                onClick={() => setActiveTab('ministry')}
              >
                Các mảng Mục vụ ({getItems('ministry').length})
              </button>
              <button
                type="button"
                className={activeTab === 'schedule' ? 'active' : undefined}
                onClick={() => setActiveTab('schedule')}
              >
                Nhịp sinh hoạt mỗi tuần ({getItems('schedule').length})
              </button>
            </div>

            <button type="button" className="btn btn-primary" onClick={() => openAddModal(activeTab)}>
              <FiPlus /> {activeTab === 'ministry' ? 'Thêm mảng mục vụ' : 'Thêm buổi sinh hoạt'}
            </button>
          </div>

          {/* Chỉnh tiêu đề & mô tả khối trên trang chủ */}
          <div className="card">
            <div className="card-title">
              {activeTab === 'ministry' ? 'Tiêu đề khối Mục vụ (Trang chủ)' : 'Tiêu đề khối Nhịp sinh hoạt (Trang chủ)'}
            </div>
            <div className="form-grid">
              <div className="field" style={{ margin: 0 }}>
                <label className="field-label">Tiêu đề (*chữ* để nhấn màu cam đất nghiêng)</label>
                <input
                  className="input"
                  value={String(homeRecord[activeTab === 'ministry' ? 'ministriesTitle' : 'scheduleTitle'] ?? '')}
                  onChange={(e) =>
                    updateHomeField(activeTab === 'ministry' ? 'ministriesTitle' : 'scheduleTitle', e.target.value)
                  }
                />
              </div>
              <div className="field" style={{ margin: 0 }}>
                <label className="field-label">Mô tả dẫn</label>
                <input
                  className="input"
                  value={String(homeRecord[activeTab === 'ministry' ? 'ministriesLead' : 'scheduleLead'] ?? '')}
                  onChange={(e) =>
                    updateHomeField(activeTab === 'ministry' ? 'ministriesLead' : 'scheduleLead', e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          {/* Lưới thẻ trực quan */}
          <div className="showcase-grid">
            {activeItems.map((item, index) => {
              const preview = resolveCardPreview(item, index);
              const title = activeTab === 'ministry' ? String(item.title || '(Chưa đặt tên)') : String(item.what || '(Chưa đặt tên)');
              const sub = activeTab === 'ministry' ? String(item.desc || '') : String(item.note || '');
              const eyebrow =
                activeTab === 'ministry'
                  ? String(item.kind || 'Mục vụ')
                  : `${String(item.day || '')} · ${String(item.time || '')}`;

              return (
                <article className="showcase-card" key={index}>
                  <div className="showcase-card-cover">
                    {preview.url ? (
                      <img src={preview.url} alt={title} loading="lazy" />
                    ) : (
                      <div className="showcase-card-empty">
                        <FiImage size={26} />
                      </div>
                    )}
                    <div className="showcase-card-scrim">
                      <span className="showcase-card-eyebrow">{eyebrow}</span>
                      <h3>{title}</h3>
                      {sub && <p>{sub}</p>}
                    </div>
                    <span className="showcase-card-badge">{preview.badge}</span>
                  </div>

                  <div className="showcase-card-actions">
                    <button type="button" className="btn btn-outline btn-sm" onClick={() => openEditModal(activeTab, index)}>
                      <FiEdit2 /> Sửa & đổi ảnh
                    </button>
                    {isSupabaseConfigured && (
                      <>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          title="Tải ảnh mới từ máy"
                          onClick={() => triggerQuickUpload(activeTab, index)}
                        >
                          <FiUploadCloud />
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          title="Chọn từ Khoảnh khắc"
                          onClick={() =>
                            openMomentsPicker((url) => {
                              const next = getItems(activeTab).map((cur, i) => (i === index ? { ...cur, image: url } : cur));
                              setItems(activeTab, next);
                              notify('Đã chọn ảnh từ Khoảnh khắc — nhớ bấm "Lưu thay đổi".', 'info');
                            })
                          }
                        >
                          <FiImage />
                        </button>
                      </>
                    )}
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={index === 0}
                        aria-label="Di chuyển lên"
                        onClick={() => moveItem(activeTab, index, -1)}
                      >
                        <FiArrowUp />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={index === activeItems.length - 1}
                        aria-label="Di chuyển xuống"
                        onClick={() => moveItem(activeTab, index, 1)}
                      >
                        <FiArrowDown />
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        aria-label="Xóa"
                        onClick={() => handleDeleteItem(activeTab, index)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      <CardEditModal
        isOpen={modalState !== null}
        mode={modalState?.mode ?? activeTab}
        item={modalState?.item ?? null}
        isNew={modalState?.index === null}
        previewImageUrl={
          modalState ? resolveCardPreview(modalState.item, modalState.index ?? 0).url : ''
        }
        allTags={allTags}
        onClose={() => setModalState(null)}
        onSave={handleModalSave}
        onDelete={
          modalState && modalState.index !== null
            ? () => handleDeleteItem(modalState.mode, modalState.index!)
            : undefined
        }
        onOpenMomentsPicker={openMomentsPicker}
      />

      <Modal
        size="lg"
        isOpen={pickerCallback !== null}
        title="Chọn ảnh nền từ Thư viện Khoảnh khắc"
        onClose={() => setPickerCallback(null)}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="input"
            value={pickerSearch}
            placeholder="Tìm theo chương trình, chú thích, tag…"
            onChange={(e) => setPickerSearch(e.target.value)}
          />
          {filteredMoments.length === 0 ? (
            <div className="cell-muted">Chưa có ảnh phù hợp trong Khoảnh khắc.</div>
          ) : (
            <div className="moments-picker-grid">
              {filteredMoments.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="moments-picker-item"
                  onClick={() => {
                    pickerCallback?.(m.url);
                    setPickerCallback(null);
                  }}
                >
                  <img src={m.thumbUrl} alt={m.caption || m.album} loading="lazy" />
                  <span>{m.caption || m.programTitle || m.album || 'Khoảnh khắc'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ShowcaseEditorScreen;

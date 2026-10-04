import { useEffect, useMemo, useState } from 'react';
import { mergeSiteContent, SITE_PAGES, SITE_SECTIONS, type SiteContent, type SiteRecord } from '@btnsg/shared';
import { siteContentApi } from '../../api/siteContentApi';
import { useAuth } from '../../auth/AuthContext';
import LoadingState from '../../ui/LoadingState';
import PreviewFrame from './components/PreviewFrame';
import SectionEditor from './components/SectionEditor';

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const WebsiteScreen = () => {
  // 1. State declarations
  const { profile } = useAuth();
  const [savedContent, setSavedContent] = useState<SiteContent | null>(null);
  const [draftContent, setDraftContent] = useState<SiteContent | null>(null);
  const [activePageId, setActivePageId] = useState<string>(SITE_PAGES[0].id);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // 2. Logic functions
  /** Bản nháp đã chuẩn hoá (bỏ dòng trống, chặn link lạ…) — đúng thứ sẽ lưu và gửi sang xem trước. */
  const cleanDraft = useMemo(() => (draftContent ? mergeSiteContent(draftContent) : null), [draftContent]);

  const dirtyKeys = useMemo(() => {
    if (!cleanDraft || !savedContent) return new Set<string>();
    return new Set(SITE_SECTIONS.filter((s) => !sameValue(cleanDraft[s.key], savedContent[s.key])).map((s) => s.key));
  }, [cleanDraft, savedContent]);

  const activePage = SITE_PAGES.find((page) => page.id === activePageId) ?? SITE_PAGES[0];

  // 3. API call functions
  const fetchContent = async (): Promise<boolean> => {
    try {
      setIsLoadingContent(true);
      setLoadError(null);
      const merged = mergeSiteContent(await siteContentApi.getAll());
      setSavedContent(merged);
      setDraftContent(merged);
      return true;
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsLoadingContent(false);
    }
  };

  const saveChanges = async (): Promise<boolean> => {
    if (!cleanDraft || dirtyKeys.size === 0) return false;
    const changes = Object.fromEntries([...dirtyKeys].map((key) => [key, cleanDraft[key]]));

    try {
      setIsSaving(true);
      setSaveError(null);
      await siteContentApi.save(changes, profile?.fullName ?? '');
      setSavedContent((prev) => ({ ...prev, ...changes }));
      setDraftContent((prev) => ({ ...prev, ...changes }));
      setSavedNotice(`Đã lưu ${dirtyKeys.size} mục — trang công khai cập nhật sau tối đa 1 phút.`);
      return true;
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : String(error));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // 4. Effects
  useEffect(() => {
    fetchContent();
  }, []);

  // Còn thay đổi chưa lưu → hỏi lại trước khi đóng / tải lại tab.
  useEffect(() => {
    if (dirtyKeys.size === 0) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirtyKeys.size]);

  useEffect(() => {
    if (dirtyKeys.size > 0) setSavedNotice(null);
  }, [dirtyKeys.size]);

  // 5. Handlers
  const handleSectionChange = (key: string, value: SiteRecord | SiteRecord[]) => {
    setDraftContent((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleDiscard = () => {
    if (!window.confirm('Bỏ mọi thay đổi chưa lưu?')) return;
    setDraftContent(savedContent);
  };

  // 6. Render
  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Website</span>
          <h2>Nội dung trang công khai</h2>
          <p className="page-sub">Sửa chữ, lịch, Ban Điều Hành, liên kết… của landing — xem trước trực tiếp trước khi lưu.</p>
        </div>
        <div className="cell-actions">
          <button type="button" className="btn btn-ghost" disabled={dirtyKeys.size === 0 || isSaving} onClick={handleDiscard}>
            Huỷ thay đổi
          </button>
          <button type="button" className="btn btn-primary" disabled={dirtyKeys.size === 0 || isSaving} onClick={saveChanges}>
            {isSaving ? 'Đang lưu…' : dirtyKeys.size > 0 ? `Lưu ${dirtyKeys.size} mục` : 'Đã lưu'}
          </button>
        </div>
      </div>

      {loadError && <div className="form-error" style={{ marginBottom: 14 }}>{loadError}</div>}
      {saveError && <div className="form-error" style={{ marginBottom: 14 }}>{saveError}</div>}
      {savedNotice && <div className="program-ok" style={{ marginBottom: 14 }}>{savedNotice}</div>}

      {isLoadingContent || !draftContent || !cleanDraft ? (
        !loadError && <LoadingState />
      ) : (
        <>
          <div className="website-tabs segmented">
            {SITE_PAGES.map((page) => (
              <button
                type="button"
                key={page.id}
                className={page.id === activePage.id ? 'active' : undefined}
                onClick={() => setActivePageId(page.id)}
              >
                {page.label}
                {page.sections.some((s) => dirtyKeys.has(s.key)) && ' •'}
              </button>
            ))}
          </div>

          <div className="website-workspace">
            <div className="website-editors">
              {activePage.sections.map((section) => (
                <SectionEditor
                  key={section.key}
                  section={section}
                  value={draftContent[section.key]}
                  isDirty={dirtyKeys.has(section.key)}
                  onChange={(value) => handleSectionChange(section.key, value)}
                />
              ))}
            </div>
            <PreviewFrame path={activePage.path} content={cleanDraft} />
          </div>
        </>
      )}
    </div>
  );
};

export default WebsiteScreen;

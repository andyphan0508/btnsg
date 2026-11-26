import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { FiImage, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi';
import { SITE_ICON_OPTIONS, SITE_TONE_OPTIONS, toSiteImageUrl, type SiteRecord } from '@btnsg/shared';
import { uploadSiteImage } from '../../../lib/images';
import { isSupabaseConfigured } from '../../../lib/supabase';
import { useDialog } from '../../../ui/DialogProvider';
import Modal from '../../../ui/Modal';

export type ShowcaseItemMode = 'ministry' | 'schedule';

type CardEditModalProps = {
  isOpen: boolean;
  mode: ShowcaseItemMode;
  item: SiteRecord | null;
  isNew: boolean;
  previewImageUrl: string;
  allTags: string[];
  onClose: () => void;
  onSave: (nextItem: SiteRecord) => void;
  onDelete?: () => Promise<void>;
  onOpenMomentsPicker: (onPicked: (url: string) => void) => void;
};

const CardEditModal = ({
  isOpen,
  mode,
  item,
  isNew,
  previewImageUrl,
  allTags,
  onClose,
  onSave,
  onDelete,
  onOpenMomentsPicker,
}: CardEditModalProps) => {
  const { notify } = useDialog();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<SiteRecord>({});
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !item) return;
    setDraft({ ...item });
    setError(null);
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const titleField = mode === 'ministry' ? 'title' : 'what';
  const resolvedPreview = toSiteImageUrl(draft.image, 800) || previewImageUrl;

  const setField = (key: string, value: unknown) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const handleUploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setUploading(true);
      setError(null);
      const url = await uploadSiteImage(file);
      setField('image', url);
      notify('Đã tải ảnh nền lên.');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!String(draft[titleField] ?? '').trim()) {
      setError(mode === 'ministry' ? 'Vui lòng nhập tên mảng mục vụ.' : 'Vui lòng nhập tên hoạt động.');
      return;
    }
    onSave(draft);
    onClose();
  };

  return (
    <Modal
      size="lg"
      isOpen={isOpen}
      onClose={onClose}
      title={
        mode === 'ministry'
          ? isNew
            ? 'Thêm mảng mục vụ'
            : 'Chỉnh sửa mảng mục vụ'
          : isNew
            ? 'Thêm buổi sinh hoạt mới'
            : 'Chỉnh sửa thẻ nhịp sinh hoạt'
      }
      footer={
        <>
          {!isNew && onDelete && (
            <button type="button" className="btn btn-danger" style={{ marginRight: 'auto' }} onClick={onDelete}>
              <FiTrash2 /> Xóa mục này
            </button>
          )}
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Hủy
          </button>
          <button type="button" className="btn btn-primary" disabled={uploading} onClick={handleSave}>
            {isNew ? 'Thêm vào danh sách' : 'Áp dụng thay đổi'}
          </button>
        </>
      }
    >
      <div className="moment-modal-grid">
        {/* Cột trái: Ảnh nền xem trước + thay ảnh */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div className="showcase-modal-preview">
            {resolvedPreview ? (
              <img src={resolvedPreview} alt="" />
            ) : (
              <div className="showcase-modal-empty">
                <FiImage size={28} />
                <span>Chưa có ảnh nền riêng (landing sẽ tự lấy ảnh thư viện)</span>
              </div>
            )}
            <div className="showcase-modal-scrim">
              <span className="badge badge-brand">
                {mode === 'ministry' ? String(draft.kind || 'Mục vụ') : `${String(draft.day || 'Chúa Nhật')} · ${String(draft.time || '')}`}
              </span>
              <strong>{String(draft[titleField] || '(Chưa nhập tiêu đề)')}</strong>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            hidden
            onChange={handleUploadFile}
          />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {isSupabaseConfigured && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <FiUploadCloud /> {uploading ? 'Đang tải…' : 'Tải ảnh mới'}
              </button>
            )}
            {isSupabaseConfigured && (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => onOpenMomentsPicker((url) => setField('image', url))}
              >
                <FiImage /> Chọn từ Khoảnh khắc
              </button>
            )}
            {Boolean(draft.image) && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setField('image', '')}>
                <FiX /> Gỡ ảnh riêng
              </button>
            )}
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label className="field-label">Hoặc dán link ảnh (https://… / Google Drive)</label>
            <input
              className="input"
              value={String(draft.image ?? '')}
              placeholder="https://..."
              onChange={(e) => setField('image', e.target.value)}
            />
          </div>
        </div>

        {/* Cột phải: Nội dung, biểu tượng, tag */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'ministry' ? (
            <>
              <div className="form-grid">
                <div className="field" style={{ margin: 0 }}>
                  <label className="field-label">Nhóm mục vụ</label>
                  <input
                    className="input"
                    value={String(draft.kind ?? '')}
                    placeholder="VD: Thuộc linh, Sứ mệnh"
                    onChange={(e) => setField('kind', e.target.value)}
                  />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label className="field-label">Biểu tượng (Icon)</label>
                  <select className="select" value={String(draft.icon ?? 'flame')} onChange={(e) => setField('icon', e.target.value)}>
                    {SITE_ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label className="field-label">Tên mục vụ *</label>
                <input
                  className="input"
                  value={String(draft.title ?? '')}
                  placeholder="VD: Bồi linh"
                  onChange={(e) => setField('title', e.target.value)}
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label className="field-label">Mô tả chi tiết</label>
                <textarea
                  className="textarea"
                  rows={4}
                  value={String(draft.desc ?? '')}
                  placeholder="Mô tả ý nghĩa và hoạt động của mảng mục vụ này…"
                  onChange={(e) => setField('desc', e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-grid">
                <div className="field" style={{ margin: 0 }}>
                  <label className="field-label">Ngày trong tuần</label>
                  <input
                    className="input"
                    value={String(draft.day ?? '')}
                    placeholder="VD: Chúa Nhật, Thứ Ba"
                    onChange={(e) => setField('day', e.target.value)}
                  />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label className="field-label">Giờ sinh hoạt</label>
                  <input
                    className="input"
                    value={String(draft.time ?? '')}
                    placeholder="VD: 14:30 hoặc Buổi tối"
                    onChange={(e) => setField('time', e.target.value)}
                  />
                </div>
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label className="field-label">Tên hoạt động *</label>
                <input
                  className="input"
                  value={String(draft.what ?? '')}
                  placeholder="VD: Nhóm thờ phượng Chúa"
                  onChange={(e) => setField('what', e.target.value)}
                />
              </div>

              <div className="field" style={{ margin: 0 }}>
                <label className="field-label">Mô tả / Ghi chú buổi nhóm</label>
                <textarea
                  className="textarea"
                  rows={3}
                  value={String(draft.note ?? '')}
                  placeholder="VD: Buổi nhóm chính trong tuần — dành cho mọi bạn trẻ."
                  onChange={(e) => setField('note', e.target.value)}
                />
              </div>

              <div className="form-grid">
                <div className="field" style={{ margin: 0 }}>
                  <label className="field-label">Biểu tượng (Icon)</label>
                  <select className="select" value={String(draft.icon ?? 'church')} onChange={(e) => setField('icon', e.target.value)}>
                    {SITE_ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label className="field-label">Màu nhấn thẻ</label>
                  <select className="select" value={String(draft.tone ?? 'sun')} onChange={(e) => setField('tone', e.target.value)}>
                    {SITE_TONE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="check-item" style={{ padding: 0 }}>
                <input type="checkbox" checked={Boolean(draft.main)} onChange={(e) => setField('main', e.target.checked)} />
                <span>Đánh dấu là buổi nhóm chính (hiện nhãn "Nhóm chính")</span>
              </label>
            </>
          )}

          <div className="field" style={{ margin: 0 }}>
            <label className="field-label">Hoặc tự động lấy ảnh Khoảnh khắc theo Tag</label>
            <input
              className="input"
              value={String(draft.tag ?? '')}
              placeholder="VD: Truyền giảng (ảnh mới nhất mang tag này sẽ làm nền)"
              onChange={(e) => setField('tag', e.target.value)}
            />
            {allTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {allTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`btn btn-sm ${String(draft.tag ?? '').toLowerCase() === t.toLowerCase() ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setField('tag', String(draft.tag ?? '').toLowerCase() === t.toLowerCase() ? '' : t)}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {error && <div className="form-error">{error}</div>}
        </div>
      </div>
    </Modal>
  );
};

export default CardEditModal;

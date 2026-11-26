import { useEffect, useState } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiCopy, FiExternalLink, FiTrash2 } from 'react-icons/fi';
import { getIsoWeekInfo, type Program } from '@btnsg/shared';
import { parseTags, type Moment } from '../../../api/momentsApi';
import Modal from '../../../ui/Modal';
import { useDialog } from '../../../ui/DialogProvider';
import { formatBytes } from '../../../utils/imageCompress';

type MomentEditModalProps = {
  moment: Moment | null;
  programs: Program[];
  albums: string[];
  allTags: string[];
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  onSave: (
    moment: Moment,
    patch: {
      album: string;
      caption: string;
      takenOn: string | null;
      tags: string[];
      programId: string | null;
      programTitle: string;
    },
  ) => Promise<void>;
  onDelete: (moment: Moment) => Promise<void>;
};

const MomentEditModal = ({
  moment,
  programs,
  albums,
  allTags,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onClose,
  onSave,
  onDelete,
}: MomentEditModalProps) => {
  const { notify } = useDialog();
  const [programId, setProgramId] = useState<string>('');
  const [album, setAlbum] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [takenOn, setTakenOn] = useState<string>('');
  const [tagsText, setTagsText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!moment) return;
    setProgramId(moment.programId ?? '');
    setAlbum(moment.album || moment.programTitle || '');
    setCaption(moment.caption || '');
    setTakenOn(moment.takenOn ?? '');
    setTagsText(moment.tags.join(', '));
    setError(null);
  }, [moment]);

  if (!moment) return null;

  const weekInfo = getIsoWeekInfo(takenOn || moment.takenOn);
  const activeTags = parseTags(tagsText);

  const onSelectProgram = (id: string) => {
    setProgramId(id);
    const chosen = programs.find((p) => p.id === id);
    if (chosen) {
      setAlbum(chosen.title);
      if (chosen.date) setTakenOn(chosen.date);
    }
  };

  const onToggleTag = (tag: string) => {
    const next = activeTags.includes(tag) ? activeTags.filter((t) => t !== tag) : [...activeTags, tag];
    setTagsText(next.join(', '));
  };

  const onCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(moment.url);
      notify('Đã sao chép đường dẫn ảnh.');
    } catch {
      notify('Không sao chép được liên kết.', 'error');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      const chosenProgram = programs.find((p) => p.id === programId) ?? null;
      await onSave(moment, {
        album: album.trim() || chosenProgram?.title || '',
        caption: caption.trim(),
        takenOn: takenOn || null,
        tags: parseTags(tagsText),
        programId: chosenProgram?.id ?? (programId || null),
        programTitle: chosenProgram?.title || album.trim(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      size="lg"
      isOpen={Boolean(moment)}
      title="Chi tiết & phân loại hình ảnh"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="btn btn-danger"
            style={{ marginRight: 'auto' }}
            disabled={isSaving}
            onClick={() => onDelete(moment)}
          >
            <FiTrash2 /> Xóa ảnh
          </button>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={isSaving}>
            Hủy
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Đang lưu…' : 'Lưu thay đổi'}
          </button>
        </>
      }
    >
      <div className="moment-modal-grid">
        <div className="moment-modal-media">
          <div className="moment-modal-img-wrap">
            <img src={moment.url} alt={moment.caption || moment.album} />
            {(hasPrev || hasNext) && (
              <div className="moment-modal-nav">
                <button type="button" className="btn btn-outline btn-sm" disabled={!hasPrev} onClick={onPrev} aria-label="Ảnh trước">
                  <FiChevronLeft /> Trước
                </button>
                <button type="button" className="btn btn-outline btn-sm" disabled={!hasNext} onClick={onNext} aria-label="Ảnh sau">
                  Sau <FiChevronRight />
                </button>
              </div>
            )}
          </div>
          <div className="moment-modal-meta">
            {weekInfo && <span className="badge badge-grey">{weekInfo.label}</span>}
            {moment.bytes && <span className="badge badge-grey">{formatBytes(moment.bytes)}</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={onCopyUrl}>
              <FiCopy /> Sao chép link
            </button>
            <a href={moment.url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
              <FiExternalLink /> Mở ảnh gốc
            </a>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {programs.length > 0 && (
            <div className="field" style={{ margin: 0 }}>
              <label className="field-label">Chương trình buổi nhóm</label>
              <select className="select" value={programId} onChange={(e) => onSelectProgram(e.target.value)}>
                <option value="">— Không gắn chương trình —</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.date} · {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="field" style={{ margin: 0 }}>
            <label className="field-label">Album / Tên chương trình</label>
            <input
              className="input"
              list="moment-edit-albums"
              value={album}
              placeholder="VD: Thờ phượng Chúa Nhật, Trại hè 2026"
              onChange={(e) => setAlbum(e.target.value)}
            />
            <datalist id="moment-edit-albums">
              {albums.map((name) => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label className="field-label">Chú thích ảnh</label>
            <input
              className="input"
              value={caption}
              placeholder="VD: Ban hát lễ tôn vinh Chúa"
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label className="field-label">Ngày chụp (tự tính Tuần ISO)</label>
            <input className="input" type="date" value={takenOn} onChange={(e) => setTakenOn(e.target.value)} />
            {weekInfo && (
              <span className="cell-muted" style={{ fontSize: '0.78rem' }}>
                <FiCalendar style={{ verticalAlign: '-2px', marginRight: 4 }} />
                {weekInfo.label}
              </span>
            )}
          </div>

          <div className="field" style={{ margin: 0 }}>
            <label className="field-label">Tag phân loại (cách nhau bằng dấu phẩy)</label>
            <input
              className="input"
              value={tagsText}
              placeholder="VD: Truyền giảng, Thờ phượng, Công tác xã hội"
              onChange={(e) => setTagsText(e.target.value)}
            />
            {allTags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                {allTags.map((tag) => {
                  const active = activeTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline'}`}
                      onClick={() => onToggleTag(tag)}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && <div className="form-error">{error}</div>}
        </div>
      </div>
    </Modal>
  );
};

export default MomentEditModal;

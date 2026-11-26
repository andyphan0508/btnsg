import { useEffect, useState } from 'react';
import type { Program } from '@btnsg/shared';
import { parseTags } from '../../../api/momentsApi';
import Modal from '../../../ui/Modal';

export type MomentBulkPatch = {
  album?: string;
  takenOn?: string | null;
  programId?: string | null;
  programTitle?: string;
  addTags?: string[];
  replaceTags?: string[];
};

type MomentBulkModalProps = {
  isOpen: boolean;
  count: number;
  programs: Program[];
  albums: string[];
  allTags: string[];
  onClose: () => void;
  onApply: (patch: MomentBulkPatch) => Promise<void>;
};

const MomentBulkModal = ({ isOpen, count, programs, albums, allTags, onClose, onApply }: MomentBulkModalProps) => {
  const [applyProgram, setApplyProgram] = useState<boolean>(false);
  const [programId, setProgramId] = useState<string>('');
  const [album, setAlbum] = useState<string>('');

  const [applyDate, setApplyDate] = useState<boolean>(false);
  const [takenOn, setTakenOn] = useState<string>('');

  const [tagMode, setTagMode] = useState<'none' | 'add' | 'replace'>('add');
  const [tagsText, setTagsText] = useState<string>('');

  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setApplyProgram(false);
    setProgramId('');
    setAlbum('');
    setApplyDate(false);
    setTakenOn('');
    setTagMode('add');
    setTagsText('');
    setError(null);
  }, [isOpen]);

  const activeTags = parseTags(tagsText);

  const onSelectProgram = (id: string) => {
    setProgramId(id);
    setApplyProgram(true);
    const chosen = programs.find((p) => p.id === id);
    if (chosen) {
      setAlbum(chosen.title);
      if (chosen.date) {
        setTakenOn(chosen.date);
      }
    }
  };

  const onToggleTag = (tag: string) => {
    const next = activeTags.includes(tag) ? activeTags.filter((t) => t !== tag) : [...activeTags, tag];
    setTagsText(next.join(', '));
  };

  const handleSubmit = async () => {
    const patch: MomentBulkPatch = {};
    if (applyProgram) {
      const chosen = programs.find((p) => p.id === programId) ?? null;
      patch.programId = chosen?.id ?? null;
      patch.programTitle = chosen?.title || album.trim();
      patch.album = album.trim() || chosen?.title || '';
    }
    if (applyDate) {
      patch.takenOn = takenOn || null;
    }
    if (tagMode === 'add' && activeTags.length > 0) {
      patch.addTags = activeTags;
    } else if (tagMode === 'replace') {
      patch.replaceTags = activeTags;
    }

    if (
      patch.album === undefined &&
      patch.takenOn === undefined &&
      patch.addTags === undefined &&
      patch.replaceTags === undefined
    ) {
      setError('Vui lòng chọn ít nhất một thông tin cần cập nhật.');
      return;
    }

    try {
      setIsApplying(true);
      setError(null);
      await onApply(patch);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <Modal
      size="md"
      isOpen={isOpen}
      title={`Phân loại hàng loạt (${count} ảnh)`}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={isApplying}>
            Hủy
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={isApplying}>
            {isApplying ? 'Đang cập nhật…' : `Áp dụng cho ${count} ảnh`}
          </button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="bulk-section">
          <label className="check-item" style={{ padding: 0, marginBottom: 8 }}>
            <input type="checkbox" checked={applyProgram} onChange={(e) => setApplyProgram(e.target.checked)} />
            <strong>Đổi Chương trình / Album</strong>
          </label>
          {applyProgram && (
            <div className="form-grid">
              {programs.length > 0 && (
                <div className="field span-2" style={{ margin: 0 }}>
                  <label className="field-label">Chọn chương trình buổi nhóm</label>
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
              <div className="field span-2" style={{ margin: 0 }}>
                <label className="field-label">Tên Album / Chương trình</label>
                <input
                  className="input"
                  list="bulk-albums"
                  value={album}
                  placeholder="VD: Trại hè 2026"
                  onChange={(e) => setAlbum(e.target.value)}
                />
                <datalist id="bulk-albums">
                  {albums.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
            </div>
          )}
        </div>

        <div className="bulk-section">
          <label className="check-item" style={{ padding: 0, marginBottom: 8 }}>
            <input type="checkbox" checked={applyDate} onChange={(e) => setApplyDate(e.target.checked)} />
            <strong>Đổi ngày buổi nhóm (Tuần ISO)</strong>
          </label>
          {applyDate && (
            <input className="input" type="date" value={takenOn} onChange={(e) => setTakenOn(e.target.value)} />
          )}
        </div>

        <div className="bulk-section">
          <label className="field-label">Cập nhật Tag</label>
          <div className="segmented" style={{ marginBottom: 10 }}>
            <button type="button" className={tagMode === 'add' ? 'active' : undefined} onClick={() => setTagMode('add')}>
              Thêm tag vào ảnh
            </button>
            <button
              type="button"
              className={tagMode === 'replace' ? 'active' : undefined}
              onClick={() => setTagMode('replace')}
            >
              Thay thế toàn bộ tag
            </button>
            <button type="button" className={tagMode === 'none' ? 'active' : undefined} onClick={() => setTagMode('none')}>
              Giữ nguyên
            </button>
          </div>

          {tagMode !== 'none' && (
            <>
              <input
                className="input"
                value={tagsText}
                placeholder="VD: Truyền giảng, Công tác xã hội"
                onChange={(e) => setTagsText(e.target.value)}
              />
              {allTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
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
            </>
          )}
        </div>

        {error && <div className="form-error">{error}</div>}
      </div>
    </Modal>
  );
};

export default MomentBulkModal;

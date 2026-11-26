import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { FiCalendar, FiCheckSquare, FiEdit2, FiImage, FiPlus, FiSearch, FiTag, FiTrash2, FiUploadCloud, FiX } from 'react-icons/fi';
import { formatWeekLabel, getIsoWeekInfo, getWeekKey, type Program } from '@btnsg/shared';
import { momentsApi, parseTags, type Moment } from '../../api/momentsApi';
import { programApi } from '../../api/resourceApi';
import { isSupabaseConfigured } from '../../lib/supabase';
import { fetchSupabaseExtraBytes, usesR2 } from '../../lib/images';
import { migrateImagesToR2 } from '../../api/imageMigration';
import { useDialog } from '../../ui/DialogProvider';
import StorageBanner from '../../ui/StorageBanner';
import EmptyState from '../../ui/EmptyState';
import LoadingState from '../../ui/LoadingState';
import MomentEditModal from './components/MomentEditModal';
import MomentBulkModal, { type MomentBulkPatch } from './components/MomentBulkModal';
import { todayIsoDate } from '../../utils/format';
import { compressForGallery, formatBytes, isImageFile } from '../../utils/imageCompress';

/** Số ảnh nén + upload cùng lúc: nhanh hơn tuần tự mà không làm treo máy khi chọn hàng trăm ảnh. */
const UPLOAD_CONCURRENCY = 3;

/** Supabase Free: 1GB lưu file. Ảnh đăng trước khi có cột bytes ước lượng ~300KB. */
const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024;
const ESTIMATED_MOMENT_BYTES = 300 * 1024;

type Progress = { done: number; total: number; failed: string[]; bytes: number };
type SortMode = 'newest' | 'oldest' | 'program';
type GroupMode = 'grid' | 'week' | 'program';

const programLabelOf = (m: Moment) => m.programTitle || m.album || 'Chưa gắn chương trình';

const MomentsScreen = () => {
  const styles = createStyles();
  const { confirm, notify } = useDialog();

  // 1. State
  const [moments, setMoments] = useState<Moment[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);
  const [listError, setListError] = useState<string | null>(null);

  // Panel đăng ảnh (mở sẵn khi chưa có ảnh nào, thu gọn được để xem gallery rộng rãi)
  const [showUploadPanel, setShowUploadPanel] = useState<boolean>(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [album, setAlbum] = useState<string>('');
  const [caption, setCaption] = useState<string>('');
  const [takenOn, setTakenOn] = useState<string>(todayIsoDate());
  const [tagsText, setTagsText] = useState<string>('');
  const [progress, setProgress] = useState<Progress | null>(null);

  // Bộ lọc, tìm kiếm, sắp xếp & gom nhóm
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [weekFilter, setWeekFilter] = useState<string>('');
  const [programFilter, setProgramFilter] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [groupMode, setGroupMode] = useState<GroupMode>('grid');

  // Chọn nhiều + Modal chỉnh sửa
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingMomentId, setEditingMomentId] = useState<string | null>(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState<boolean>(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [migration, setMigration] = useState<string | null>(null);
  const [extraBytes, setExtraBytes] = useState<number>(0);

  // 2. Logic thuần
  const isUploading = progress !== null && progress.done < progress.total;
  const usedBytes = useMemo(
    () => extraBytes + moments.reduce((sum, m) => sum + (m.bytes ?? ESTIMATED_MOMENT_BYTES), 0),
    [moments, extraBytes],
  );
  const usedPercent = Math.min(100, (usedBytes / STORAGE_LIMIT_BYTES) * 100);

  const albums = useMemo(
    () => [...new Set(moments.map((m) => m.programTitle || m.album).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'vi')),
    [moments],
  );

  const weeks = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of moments) {
      const info = getIsoWeekInfo(m.takenOn);
      if (info && !map.has(info.key)) map.set(info.key, info.label);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [moments]);

  const tagCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of moments) {
      for (const tag of m.tags) map.set(tag, (map.get(tag) ?? 0) + 1);
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'vi'));
  }, [moments]);

  const allTags = useMemo(() => tagCounts.map(([tag]) => tag), [tagCounts]);

  const untaggedCount = useMemo(() => moments.filter((m) => m.tags.length === 0).length, [moments]);

  const visibleMoments = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = moments.filter((m) => {
      const prog = m.programTitle || m.album;
      if (weekFilter && getWeekKey(m.takenOn) !== weekFilter) return false;
      if (programFilter === '__none__' ? Boolean(prog) : programFilter && prog !== programFilter) return false;
      if (tagFilter === '__untagged__' ? m.tags.length > 0 : tagFilter && !m.tags.includes(tagFilter)) return false;
      if (q) {
        const hay = [m.caption, m.album, m.programTitle, m.takenOn, ...m.tags].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortMode === 'oldest') return (a.takenOn || '').localeCompare(b.takenOn || '');
      if (sortMode === 'program') {
        const cmp = programLabelOf(a).localeCompare(programLabelOf(b), 'vi');
        return cmp !== 0 ? cmp : (b.takenOn || '').localeCompare(a.takenOn || '');
      }
      return (b.takenOn || '').localeCompare(a.takenOn || '');
    });
  }, [moments, searchQuery, weekFilter, programFilter, tagFilter, sortMode]);

  const groupedMoments = useMemo(() => {
    if (groupMode === 'grid') return null;
    const map = new Map<string, { key: string; label: string; items: Moment[] }>();
    for (const m of visibleMoments) {
      const key = groupMode === 'week' ? getWeekKey(m.takenOn) || 'unknown' : programLabelOf(m);
      const label = groupMode === 'week' ? formatWeekLabel(m.takenOn) : key;
      const bucket = map.get(key) ?? { key, label, items: [] };
      bucket.items.push(m);
      map.set(key, bucket);
    }
    const groups = [...map.values()];
    if (groupMode === 'week') {
      groups.sort((a, b) => (sortMode === 'oldest' ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key)));
    } else {
      groups.sort((a, b) => a.label.localeCompare(b.label, 'vi'));
    }
    return groups;
  }, [visibleMoments, groupMode, sortMode]);

  const hasActiveFilters = Boolean(searchQuery || weekFilter || programFilter || tagFilter);

  const editingIndex = useMemo(
    () => (editingMomentId ? visibleMoments.findIndex((m) => m.id === editingMomentId) : -1),
    [editingMomentId, visibleMoments],
  );
  const editingMoment = editingIndex >= 0 ? visibleMoments[editingIndex] : null;
  const selectedMoments = useMemo(() => moments.filter((m) => selectedIds.has(m.id)), [moments, selectedIds]);

  // 3. API calls
  const loadMoments = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setListError(null);
      const list = await momentsApi.list();
      setMoments(list);
      if (list.length === 0) setShowUploadPanel(true);
    } catch (error) {
      setListError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFiles = async (files: File[]): Promise<void> => {
    const images = files.filter(isImageFile);
    if (images.length === 0 || isUploading) return;
    const chosenProgram = programs.find((p) => p.id === selectedProgramId) ?? null;
    const programTitle = chosenProgram?.title || album.trim();
    const meta = {
      album: album.trim() || programTitle,
      caption: caption.trim(),
      takenOn,
      tags: parseTags(tagsText),
      programId: chosenProgram?.id ?? null,
      programTitle,
    };
    const queue = [...images];
    const failed: string[] = [];
    let done = 0;
    let bytes = 0;
    setProgress({ done, total: images.length, failed, bytes });

    const worker = async () => {
      for (let file = queue.shift(); file; file = queue.shift()) {
        try {
          const compressed = await compressForGallery(file);
          const moment = await momentsApi.upload(compressed, meta);
          bytes += compressed.full.size + compressed.thumb.size;
          setMoments((prev) => [moment, ...prev]);
        } catch (error) {
          failed.push(`${file.name}: ${error instanceof Error ? error.message : String(error)}`);
        }
        done += 1;
        setProgress({ done, total: images.length, failed: [...failed], bytes });
      }
    };
    await Promise.all(Array.from({ length: UPLOAD_CONCURRENCY }, worker));
    if (failed.length === 0) {
      notify(`Đã tải lên ${images.length} ảnh vào thư viện.`);
    }
  };

  const saveMomentMeta = async (
    moment: Moment,
    patch: {
      album: string;
      caption: string;
      takenOn: string | null;
      tags: string[];
      programId: string | null;
      programTitle: string;
    },
  ): Promise<void> => {
    const updated = await momentsApi.updateMeta(moment, patch);
    setMoments((prev) => prev.map((m) => (m.id === moment.id ? updated : m)));
    notify('Đã cập nhật thông tin & phân loại ảnh.');
  };

  const applyBulkUpdate = async (patch: MomentBulkPatch): Promise<void> => {
    const updatedList = await momentsApi.bulkUpdate(selectedMoments, patch);
    const byId = new Map(updatedList.map((m) => [m.id, m]));
    setMoments((prev) => prev.map((m) => byId.get(m.id) ?? m));
    setSelectedIds(new Set());
    notify(`Đã phân loại ${updatedList.length} ảnh.`);
  };

  const deleteMoment = async (moment: Moment): Promise<void> => {
    const confirmed = await confirm({
      title: 'Xóa hình ảnh',
      message: `Xóa ảnh "${moment.caption || programLabelOf(moment)}" khỏi website?\nHành động này không thể hoàn tác.`,
      confirmLabel: 'Xóa ảnh',
      danger: true,
    });
    if (!confirmed) return;

    try {
      setDeletingId(moment.id);
      await momentsApi.remove(moment);
      setMoments((prev) => prev.filter((m) => m.id !== moment.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(moment.id);
        return next;
      });
      if (editingMomentId === moment.id) setEditingMomentId(null);
      notify('Đã xóa ảnh khỏi thư viện.');
    } catch (error) {
      setListError(error instanceof Error ? error.message : String(error));
    } finally {
      setDeletingId(null);
    }
  };

  const deleteSelectedMoments = async (): Promise<void> => {
    if (selectedMoments.length === 0) return;
    const confirmed = await confirm({
      title: 'Xóa nhiều ảnh',
      message: `Xóa vĩnh viễn ${selectedMoments.length} ảnh đã chọn khỏi website và kho lưu trữ?`,
      confirmLabel: `Xóa ${selectedMoments.length} ảnh`,
      danger: true,
    });
    if (!confirmed) return;

    try {
      setIsBulkDeleting(true);
      await momentsApi.bulkRemove(selectedMoments);
      const removedIds = new Set(selectedMoments.map((m) => m.id));
      setMoments((prev) => prev.filter((m) => !removedIds.has(m.id)));
      setSelectedIds(new Set());
      notify(`Đã xóa ${removedIds.size} ảnh.`);
    } catch (error) {
      setListError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const runMigration = async (): Promise<void> => {
    const confirmed = await confirm({
      title: 'Đồng bộ ảnh sang Cloudflare R2',
      message: 'Chép toàn bộ ảnh cũ từ Supabase sang kho R2? Ảnh trên Supabase vẫn giữ nguyên, chạy lại nhiều lần cũng an toàn.',
      confirmLabel: 'Bắt đầu chép',
    });
    if (!confirmed) return;
    try {
      const result = await migrateImagesToR2(setMigration);
      setMigration(
        result.failed.length === 0
          ? `Xong — đã kiểm tra ${result.files} file, tất cả đã có trên R2.`
          : `Xong ${result.files} file, ${result.failed.length} lỗi: ${result.failed.slice(0, 3).join('; ')}`,
      );
    } catch (error) {
      setMigration(error instanceof Error ? error.message : String(error));
    }
  };

  // 4. Effects
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    loadMoments();
    fetchSupabaseExtraBytes().then(setExtraBytes).catch(() => {});
    programApi
      .getList()
      .then((list) => setPrograms([...list].sort((a, b) => b.date.localeCompare(a.date))))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isUploading) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isUploading]);

  // 5. Handlers
  const onSelectProgram = (programId: string) => {
    setSelectedProgramId(programId);
    const chosen = programs.find((p) => p.id === programId);
    if (chosen) {
      setAlbum(chosen.title);
      if (chosen.date) setTakenOn(chosen.date);
    }
  };

  const onToggleQuickTag = (tag: string) => {
    const current = parseTags(tagsText);
    const next = current.includes(tag) ? current.filter((t) => t !== tag) : [...current, tag];
    setTagsText(next.join(', '));
  };

  const onToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onSelectAllVisible = () => {
    setSelectedIds(new Set(visibleMoments.map((m) => m.id)));
  };

  const onResetFilters = () => {
    setSearchQuery('');
    setWeekFilter('');
    setProgramFilter('');
    setTagFilter('');
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) uploadFiles([...event.target.files]);
    event.target.value = '';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    uploadFiles([...event.dataTransfer.files]);
  };

  const renderTile = (moment: Moment) => {
    const weekInfo = getIsoWeekInfo(moment.takenOn);
    const isSelected = selectedIds.has(moment.id);
    return (
      <div key={moment.id} className={`moment-tile${isSelected ? ' is-selected' : ''}`}>
        <div className="moment-tile-media">
          <button
            type="button"
            className="moment-tile-open"
            onClick={() => setEditingMomentId(moment.id)}
            aria-label={`Xem và chỉnh sửa ${moment.caption || programLabelOf(moment)}`}
          >
            <img src={moment.thumbUrl} alt={moment.caption || programLabelOf(moment)} loading="lazy" />
          </button>
          <label className="moment-tile-check" title="Chọn ảnh này">
            <input type="checkbox" checked={isSelected} onChange={() => onToggleSelect(moment.id)} />
          </label>
        </div>

        <div className="moment-tile-body">
          <div className="moment-tile-title" title={moment.caption || programLabelOf(moment)}>
            {moment.caption || programLabelOf(moment)}
          </div>
          <div className="moment-tile-sub">
            {weekInfo ? `Tuần ${weekInfo.week}/${weekInfo.year}` : moment.takenOn || 'Chưa rõ ngày'}
            {moment.album && ` · ${moment.album}`}
          </div>
          {moment.tags.length > 0 ? (
            <div className="moment-tile-tags">
              {moment.tags.slice(0, 3).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className="moment-tag-pill"
                  onClick={() => setTagFilter((cur) => (cur === tag ? '' : tag))}
                >
                  #{tag}
                </button>
              ))}
              {moment.tags.length > 3 && <span className="cell-muted">+{moment.tags.length - 3}</span>}
            </div>
          ) : (
            <span className="cell-muted" style={{ fontSize: '0.72rem' }}>Chưa gắn tag</span>
          )}
        </div>

        <div className="moment-tile-foot">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setEditingMomentId(moment.id)}
          >
            <FiEdit2 /> Phân loại
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            aria-label="Xóa ảnh"
            disabled={deletingId === moment.id}
            onClick={() => deleteMoment(moment)}
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    );
  };

  // 6. Render
  if (!isSupabaseConfigured) {
    return (
      <EmptyState
        icon={<FiImage />}
        title="Cần cấu hình Supabase"
        hint="Ảnh Khoảnh khắc lưu trên Supabase Storage / R2 — chế độ demo/local chưa hỗ trợ."
      />
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Website · Kho ảnh & Buổi nhóm</span>
          <h2>Quản lý Gallery & Phân loại ảnh</h2>
          <p className="page-sub">
            Phân loại ảnh theo Chương trình buổi nhóm, Tuần ISO và Tag hiển thị lên landing. Bấm vào từng ảnh để sửa chi
            tiết hoặc chọn nhiều ảnh để gắn tag hàng loạt.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn ${showUploadPanel ? 'btn-outline' : 'btn-primary'}`}
            onClick={() => setShowUploadPanel((v) => !v)}
          >
            {showUploadPanel ? <><FiX /> Thu gọn tải ảnh</> : <><FiPlus /> Tải ảnh mới lên</>}
          </button>
        </div>
      </div>

      <div style={styles.column}>
        {/* Tổng quan phân loại nhanh */}
        <div className="stat-grid">
          <div className="stat-card">
            <span className="stat-label">Tổng số ảnh</span>
            <span className="stat-value">{moments.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Chương trình / Album</span>
            <span className="stat-value">{albums.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Số tuần đã lưu</span>
            <span className="stat-value">{weeks.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Chưa gắn tag</span>
            <span className="stat-value">{untaggedCount}</span>
          </div>
        </div>

        {showUploadPanel && (
          <div className="card">
            <div className="card-title">Đăng ảnh buổi nhóm / Khoảnh khắc</div>
            {usesR2 && <StorageBanner refreshKey={moments.length} />}
            {!usesR2 && moments.length > 0 && (
              <div style={styles.usage} title="Gói Supabase miễn phí có 1GB lưu ảnh.">
                <progress max={100} value={usedPercent} style={styles.progressBar} />
                <span className="cell-muted">
                  Đã dùng ~{formatBytes(usedBytes)} / 1 GB · còn khoảng{' '}
                  {Math.max(0, Math.floor((STORAGE_LIMIT_BYTES - usedBytes) / ESTIMATED_MOMENT_BYTES)).toLocaleString('vi-VN')} ảnh
                </span>
              </div>
            )}

            <div className="form-grid">
              {programs.length > 0 && (
                <div className="field">
                  <label className="field-label">Gắn với Chương trình buổi nhóm</label>
                  <select className="select" value={selectedProgramId} onChange={(e) => onSelectProgram(e.target.value)}>
                    <option value="">— Không gắn / nhập tay bên dưới —</option>
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.date} · {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="field">
                <label className="field-label">Chương trình / Album</label>
                <input
                  className="input"
                  list="moment-albums"
                  value={album}
                  placeholder="VD: Thờ phượng Chúa Nhật · Trại hè 2026"
                  onChange={(e) => setAlbum(e.target.value)}
                />
                <datalist id="moment-albums">
                  {albums.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
              <div className="field">
                <label className="field-label">Ngày buổi nhóm (tự tính Tuần)</label>
                <input className="input" type="date" value={takenOn} onChange={(e) => setTakenOn(e.target.value)} />
                {takenOn && getIsoWeekInfo(takenOn) && (
                  <span className="cell-muted" style={{ fontSize: '0.78rem' }}>
                    <FiCalendar style={{ verticalAlign: '-2px', marginRight: 4 }} />
                    {getIsoWeekInfo(takenOn)?.label}
                  </span>
                )}
              </div>
              <div className="field">
                <label className="field-label">Chú thích ảnh (tùy chọn)</label>
                <input
                  className="input"
                  value={caption}
                  placeholder="VD: Ban hát lễ tôn vinh Chúa"
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
              <div className="field span-2">
                <label className="field-label">Tag hình ảnh (cách nhau bằng dấu phẩy)</label>
                <input
                  className="input"
                  value={tagsText}
                  placeholder="VD: Truyền giảng, Thờ phượng, Công tác xã hội"
                  onChange={(e) => setTagsText(e.target.value)}
                />
                {allTags.length > 0 && (
                  <div style={styles.tagChips}>
                    {allTags.map((tag) => {
                      const active = parseTags(tagsText).includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          className={`btn btn-sm ${active ? 'btn-primary' : 'btn-outline'}`}
                          onClick={() => onToggleQuickTag(tag)}
                        >
                          #{tag}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <div
              role="button"
              tabIndex={0}
              style={{ ...styles.dropZone, ...(isDragging ? styles.dropZoneActive : null) }}
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !isUploading && fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <FiUploadCloud size={28} />
              <b>{isUploading ? 'Đang tải ảnh lên…' : 'Chọn hoặc kéo-thả nhiều ảnh vào đây'}</b>
              <span className="cell-muted">Chương trình, ngày (tuần) và tag ở trên áp dụng cho toàn bộ lượt ảnh này.</span>
            </div>

            {progress && (
              <div style={styles.progress}>
                <progress max={progress.total} value={progress.done} style={styles.progressBar} />
                <span className="cell-muted">
                  {progress.done}/{progress.total} ảnh
                  {progress.done > progress.failed.length &&
                    ` · TB ${formatBytes(progress.bytes / (progress.done - progress.failed.length))}/ảnh`}
                  {progress.failed.length > 0 && ` · ${progress.failed.length} lỗi`}
                  {!isUploading && progress.failed.length === 0 && ' · Xong!'}
                </span>
              </div>
            )}
            {progress && progress.failed.length > 0 && (
              <div className="form-error">
                {progress.failed.map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            )}

            {usesR2 && (
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <span className="cell-muted" style={{ fontSize: '0.8rem' }}>
                  Nếu vừa bật Cloudflare R2, bạn có thể chép ảnh cũ từ Supabase sang R2:
                </span>
                <button type="button" className="btn btn-outline btn-sm" onClick={runMigration} disabled={migration?.startsWith('Đang') ?? false}>
                  Chép ảnh cũ sang R2
                </button>
                {migration && <div className="cell-muted" style={{ width: '100%', fontSize: '0.8rem' }}>{migration}</div>}
              </div>
            )}
          </div>
        )}

        <div className="card">
          <div style={styles.libraryHead}>
            <div className="card-title" style={{ margin: 0 }}>
              Thư viện · {visibleMoments.length} / {moments.length} ảnh
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {visibleMoments.length > 0 && (
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={selectedIds.size === visibleMoments.length ? () => setSelectedIds(new Set()) : onSelectAllVisible}
                >
                  <FiCheckSquare /> {selectedIds.size === visibleMoments.length ? 'Bỏ chọn tất cả' : `Chọn tất cả (${visibleMoments.length})`}
                </button>
              )}
              <div className="segmented" role="group" aria-label="Chế độ gom nhóm">
                <button type="button" className={groupMode === 'grid' ? 'active' : undefined} onClick={() => setGroupMode('grid')}>
                  Lưới
                </button>
                <button type="button" className={groupMode === 'week' ? 'active' : undefined} onClick={() => setGroupMode('week')}>
                  Theo tuần
                </button>
                <button
                  type="button"
                  className={groupMode === 'program' ? 'active' : undefined}
                  onClick={() => setGroupMode('program')}
                >
                  Theo chương trình
                </button>
              </div>
            </div>
          </div>

          {/* Thanh phân loại nhanh theo Tag */}
          {(tagCounts.length > 0 || untaggedCount > 0) && (
            <div className="moment-filter-chips">
              <button
                type="button"
                className={`btn btn-sm ${tagFilter === '' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setTagFilter('')}
              >
                Tất cả ({moments.length})
              </button>
              {untaggedCount > 0 && (
                <button
                  type="button"
                  className={`btn btn-sm ${tagFilter === '__untagged__' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setTagFilter((c) => (c === '__untagged__' ? '' : '__untagged__'))}
                >
                  Chưa gắn tag ({untaggedCount})
                </button>
              )}
              {tagCounts.map(([tag, count]) => (
                <button
                  key={tag}
                  type="button"
                  className={`btn btn-sm ${tagFilter === tag ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setTagFilter((c) => (c === tag ? '' : tag))}
                >
                  #{tag} ({count})
                </button>
              ))}
            </div>
          )}

          {/* Thanh hành động hàng loạt khi đang chọn ảnh */}
          {selectedIds.size > 0 && (
            <div className="bulk-bar">
              <span>
                Đang chọn <strong>{selectedIds.size}</strong> ảnh
              </span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setIsBulkModalOpen(true)}>
                  <FiTag /> Phân loại / Gắn tag ({selectedIds.size})
                </button>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  disabled={isBulkDeleting}
                  onClick={deleteSelectedMoments}
                >
                  <FiTrash2 /> {isBulkDeleting ? 'Đang xóa…' : `Xóa (${selectedIds.size})`}
                </button>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelectedIds(new Set())}>
                  Bỏ chọn
                </button>
              </div>
            </div>
          )}

          <div className="toolbar" style={{ marginBottom: 14 }}>
            <div style={styles.searchWrap}>
              <FiSearch style={styles.searchIcon} />
              <input
                className="input"
                style={{ paddingLeft: 34 }}
                value={searchQuery}
                placeholder="Tìm theo chú thích, chương trình, tag…"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {weeks.length > 0 && (
              <select className="select" style={styles.filter} value={weekFilter} onChange={(e) => setWeekFilter(e.target.value)}>
                <option value="">Mọi tuần</option>
                {weeks.map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            )}
            <select className="select" style={styles.filter} value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}>
              <option value="">Mọi chương trình</option>
              <option value="__none__">Chưa gắn chương trình</option>
              {albums.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <select
              className="select"
              style={styles.filter}
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              aria-label="Sắp xếp"
            >
              <option value="newest">Sắp xếp: Mới nhất</option>
              <option value="oldest">Sắp xếp: Cũ nhất</option>
              <option value="program">Sắp xếp: Chương trình A–Z</option>
            </select>
            {hasActiveFilters && (
              <button type="button" className="btn btn-outline btn-sm" onClick={onResetFilters}>
                <FiX /> Xóa lọc
              </button>
            )}
          </div>

          {listError && <div className="form-error">{listError}</div>}
          {isLoading ? (
            <LoadingState label="Đang tải ảnh…" />
          ) : visibleMoments.length === 0 ? (
            <EmptyState
              icon={<FiImage />}
              title={hasActiveFilters ? 'Không tìm thấy ảnh phù hợp' : 'Chưa có ảnh nào'}
              hint={hasActiveFilters ? 'Thử đổi hoặc xóa bộ lọc phía trên.' : 'Bấm "Tải ảnh mới lên" ở góc phải để thêm ảnh.'}
            />
          ) : groupedMoments ? (
            <div style={styles.groupList}>
              {groupedMoments.map((group) => (
                <section key={group.key} style={styles.groupSection}>
                  <header style={styles.groupHead}>
                    <strong>{group.label}</strong>
                    <span className="cell-muted">{group.items.length} ảnh</span>
                  </header>
                  <div style={styles.grid}>{group.items.map(renderTile)}</div>
                </section>
              ))}
            </div>
          ) : (
            <div style={styles.grid}>{visibleMoments.map(renderTile)}</div>
          )}
        </div>
      </div>

      <MomentEditModal
        moment={editingMoment}
        programs={programs}
        albums={albums}
        allTags={allTags}
        hasPrev={editingIndex > 0}
        hasNext={editingIndex >= 0 && editingIndex < visibleMoments.length - 1}
        onPrev={() => editingIndex > 0 && setEditingMomentId(visibleMoments[editingIndex - 1].id)}
        onNext={() =>
          editingIndex >= 0 &&
          editingIndex < visibleMoments.length - 1 &&
          setEditingMomentId(visibleMoments[editingIndex + 1].id)
        }
        onClose={() => setEditingMomentId(null)}
        onSave={saveMomentMeta}
        onDelete={deleteMoment}
      />

      <MomentBulkModal
        isOpen={isBulkModalOpen}
        count={selectedMoments.length}
        programs={programs}
        albums={albums}
        allTags={allTags}
        onClose={() => setIsBulkModalOpen(false)}
        onApply={applyBulkUpdate}
      />
    </div>
  );
};

export default MomentsScreen;

const createStyles = () => {
  return {
    column: { display: 'flex', flexDirection: 'column' as const, gap: 16 },
    dropZone: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: 6,
      marginTop: 14,
      padding: '24px 16px',
      borderRadius: 10,
      border: '1.5px dashed var(--line-strong)',
      textAlign: 'center' as const,
      cursor: 'pointer',
    },
    dropZoneActive: { borderColor: 'var(--brand)', background: 'var(--brand-soft)' },
    progress: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 },
    progressBar: { flex: 1, height: 8 },
    usage: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
    tagChips: { display: 'flex', flexWrap: 'wrap' as const, gap: 6, marginTop: 8 },
    libraryHead: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      flexWrap: 'wrap' as const,
      marginBottom: 12,
    },
    searchWrap: { position: 'relative' as const, flex: '1 1 200px', minWidth: 180 },
    searchIcon: { position: 'absolute' as const, left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' },
    filter: { width: 'auto', minWidth: 155 },
    groupList: { display: 'flex', flexDirection: 'column' as const, gap: 20 },
    groupSection: { display: 'flex', flexDirection: 'column' as const, gap: 10 },
    groupHead: {
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      paddingBottom: 6,
      borderBottom: '1px solid var(--line)',
      fontSize: '0.92rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(186px, 1fr))',
      gap: 12,
    },
  };
};

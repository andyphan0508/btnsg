import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { FiImage, FiTag, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { momentsApi, parseTags, type Moment } from '../../api/momentsApi';
import { isSupabaseConfigured } from '../../lib/supabase';
import { fetchSupabaseExtraBytes, usesR2 } from '../../lib/images';
import { migrateImagesToR2 } from '../../api/imageMigration';
import StorageBanner from '../../ui/StorageBanner';
import EmptyState from '../../ui/EmptyState';
import LoadingState from '../../ui/LoadingState';
import { todayIsoDate } from '../../utils/format';
import { compressForGallery, formatBytes, isImageFile } from '../../utils/imageCompress';

/** Số ảnh nén + upload cùng lúc: nhanh hơn tuần tự mà không làm treo máy khi chọn hàng trăm ảnh. */
const UPLOAD_CONCURRENCY = 3;

/** Supabase Free: 1GB lưu file. Ảnh đăng trước khi có cột bytes ước lượng ~300KB. */
const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024;
const ESTIMATED_MOMENT_BYTES = 300 * 1024;

/** bytes = tổng dung lượng (bản lớn + bản nhỏ) của các ảnh đã đăng thành công trong lượt này. */
type Progress = { done: number; total: number; failed: string[]; bytes: number };

const MomentsScreen = () => {
  const styles = createStyles();

  // 1. State
  const [moments, setMoments] = useState<Moment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(isSupabaseConfigured);
  const [listError, setListError] = useState<string | null>(null);
  const [album, setAlbum] = useState<string>('');
  const [takenOn, setTakenOn] = useState<string>(todayIsoDate());
  const [progress, setProgress] = useState<Progress | null>(null);
  const [albumFilter, setAlbumFilter] = useState<string>('');
  const [tagsText, setTagsText] = useState<string>('');
  const [tagFilter, setTagFilter] = useState<string>('');
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
  const albums = useMemo(() => [...new Set(moments.map((m) => m.album).filter(Boolean))], [moments]);
  const allTags = useMemo(
    () => [...new Set(moments.flatMap((m) => m.tags))].sort((a, b) => a.localeCompare(b, 'vi')),
    [moments],
  );
  const visibleMoments = useMemo(
    () =>
      moments.filter(
        (m) => (!albumFilter || m.album === albumFilter) && (!tagFilter || m.tags.includes(tagFilter)),
      ),
    [moments, albumFilter, tagFilter],
  );

  // 3. API calls
  const loadMoments = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setListError(null);
      setMoments(await momentsApi.list());
    } catch (error) {
      setListError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFiles = async (files: File[]): Promise<void> => {
    const images = files.filter(isImageFile);
    if (images.length === 0 || isUploading) return;
    const meta = { album: album.trim(), takenOn, tags: parseTags(tagsText) };
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
  };

  const editTags = async (moment: Moment): Promise<void> => {
    const text = window.prompt('Tag của ảnh (cách nhau bằng dấu phẩy):', moment.tags.join(', '));
    if (text === null) return;
    try {
      const updated = await momentsApi.setTags(moment, parseTags(text));
      setMoments((prev) => prev.map((m) => (m.id === moment.id ? updated : m)));
    } catch (error) {
      setListError(error instanceof Error ? error.message : String(error));
    }
  };

  const deleteMoment = async (moment: Moment): Promise<void> => {
    if (!window.confirm('Xoá ảnh này khỏi website?')) return;
    try {
      setDeletingId(moment.id);
      await momentsApi.remove(moment);
      setMoments((prev) => prev.filter((m) => m.id !== moment.id));
    } catch (error) {
      setListError(error instanceof Error ? error.message : String(error));
    } finally {
      setDeletingId(null);
    }
  };

  const runMigration = async (): Promise<void> => {
    if (!window.confirm('Chép toàn bộ ảnh cũ từ Supabase sang kho R2? Ảnh trên Supabase vẫn giữ nguyên, chạy lại nhiều lần cũng an toàn.')) {
      return;
    }
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
  }, []);

  // Đang upload mà đóng tab → các ảnh chưa xong bị bỏ dở: hỏi lại cho chắc.
  useEffect(() => {
    if (!isUploading) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isUploading]);

  // 5. Handlers
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) uploadFiles([...event.target.files]);
    event.target.value = ''; // cho phép chọn lại cùng file lần sau
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    uploadFiles([...event.dataTransfer.files]);
  };

  // 6. Render
  if (!isSupabaseConfigured) {
    return (
      <EmptyState
        icon={<FiImage />}
        title="Cần cấu hình Supabase"
        hint="Ảnh Khoảnh khắc lưu trên Supabase Storage — chế độ demo/local chưa hỗ trợ."
      />
    );
  }

  return (
    <div>
      <div className="page-head">
        <div>
          <span className="page-eyebrow">Website</span>
          <h2>Khoảnh khắc</h2>
          <p className="page-sub">
            Đăng nhiều ảnh cùng lúc lên trang Thư viện ảnh — ảnh tự nén WebP còn khoảng 300KB/ảnh (bản lớn ~1600px + bản nhỏ ~800px), hiện
            trên website sau tối đa ~1 phút.
          </p>
        </div>
      </div>

      <div style={styles.column}>
        {usesR2 && (
          <div className="card">
            <div className="card-title">Chuyển ảnh cũ sang R2</div>
            <p className="cell-muted" style={{ marginBottom: 10 }}>
              Chép ảnh Khoảnh khắc và ảnh trong bài Tin tức từ Supabase sang kho R2 (giữ nguyên đường dẫn),
              rồi đổi link trong bài viết. Chỉ cần chạy một lần sau khi bật R2.
            </p>
            <button className="btn btn-outline" onClick={runMigration} disabled={migration?.startsWith('Đang') ?? false}>
              Chép ảnh sang R2
            </button>
            {migration && <div className="cell-muted" style={{ marginTop: 10 }}>{migration}</div>}
          </div>
        )}
        <div className="card">
          <div className="card-title">Đăng ảnh</div>
          {usesR2 && <StorageBanner refreshKey={moments.length} />}
          {!usesR2 && moments.length > 0 && (
            <div style={styles.usage} title="Gói Supabase miễn phí có 1GB lưu ảnh — đầy thì xoá bớt ảnh cũ hoặc giảm ngân sách nén.">
              <progress max={100} value={usedPercent} style={styles.progressBar} />
              <span className="cell-muted">
                Đã dùng ~{formatBytes(usedBytes)} / 1 GB miễn phí · còn chỗ cho khoảng{' '}
                {Math.max(0, Math.floor((STORAGE_LIMIT_BYTES - usedBytes) / ESTIMATED_MOMENT_BYTES)).toLocaleString('vi-VN')} ảnh nữa
              </span>
            </div>
          )}
          <div className="form-grid">
            <div className="field">
              <label className="field-label">Album / dịp</label>
              <input
                className="input"
                list="moment-albums"
                value={album}
                placeholder="VD: Trại hè 2026"
                onChange={(e) => setAlbum(e.target.value)}
              />
              <datalist id="moment-albums">
                {albums.map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
            <div className="field">
              <label className="field-label">Ngày chụp</label>
              <input className="input" type="date" value={takenOn} onChange={(e) => setTakenOn(e.target.value)} />
            </div>
            <div className="field span-2">
              <label className="field-label">Tag (cách nhau bằng dấu phẩy)</label>
              <input
                className="input"
                value={tagsText}
                placeholder="VD: Truyền giảng, Công tác xã hội — thẻ trên web gắn tag này sẽ lấy ảnh"
                onChange={(e) => setTagsText(e.target.value)}
              />
              {allTags.length > 0 && (
                <span className="cell-muted" style={{ fontSize: '0.8rem' }}>Tag đang có: {allTags.join(', ')}</span>
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
            <b>{isUploading ? 'Đang đăng ảnh…' : 'Chọn hoặc kéo-thả nhiều ảnh vào đây'}</b>
            <span className="cell-muted">Album, ngày và tag ở trên áp dụng cho cả lượt ảnh này.</span>
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
        </div>

        <div className="card">
          <div style={styles.libraryHead}>
            <div className="card-title" style={{ margin: 0 }}>
              Thư viện · {visibleMoments.length} ảnh
            </div>
            {albums.length > 0 && (
              <select className="select" style={styles.filter} value={albumFilter} onChange={(e) => setAlbumFilter(e.target.value)}>
                <option value="">Tất cả album</option>
                {albums.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
            {allTags.length > 0 && (
              <select className="select" style={styles.filter} value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
                <option value="">Tất cả tag</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            )}
          </div>

          {listError && <div className="form-error">{listError}</div>}
          {isLoading ? (
            <LoadingState label="Đang tải ảnh…" />
          ) : visibleMoments.length === 0 ? (
            <EmptyState icon={<FiImage />} title="Chưa có ảnh nào" hint="Ảnh đăng ở trên sẽ hiện tại đây." />
          ) : (
            <div style={styles.grid}>
              {visibleMoments.map((moment) => (
                <div key={moment.id} style={styles.tile}>
                  <a href={moment.url} target="_blank" rel="noopener noreferrer">
                    <img src={moment.thumbUrl} alt={moment.caption || moment.album} loading="lazy" style={styles.thumb} />
                  </a>
                  <div style={styles.tileBar}>
                    <span className="cell-muted" style={styles.tileLabel} title={[moment.album, ...moment.tags].join(' · ')}>
                      {moment.album || 'Không album'}
                      {moment.tags.length > 0 && ` · #${moment.tags.join(' #')}`}
                    </span>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      aria-label="Sửa tag"
                      title="Sửa tag"
                      onClick={() => editTags(moment)}
                    >
                      <FiTag />
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      aria-label="Xoá ảnh"
                      disabled={deletingId === moment.id}
                      onClick={() => deleteMoment(moment)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
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
      padding: '28px 16px',
      borderRadius: 12,
      border: '2px dashed var(--line-strong)',
      textAlign: 'center' as const,
      cursor: 'pointer',
    },
    dropZoneActive: { borderColor: 'var(--brand)', background: 'var(--brand-soft)' },
    progress: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 },
    progressBar: { flex: 1, height: 8 },
    usage: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 },
    libraryHead: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      flexWrap: 'wrap' as const,
      marginBottom: 12,
    },
    filter: { width: 'auto', minWidth: 180 },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
      gap: 10,
    },
    tile: { borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line, #e5decf)' },
    thumb: {
      display: 'block',
      width: '100%',
      aspectRatio: '1 / 1',
      objectFit: 'cover' as const,
      background: 'var(--surface-2)',
    },
    tileBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, padding: '2px 4px 2px 8px' },
    tileLabel: { fontSize: '0.75rem', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' },
  };
};

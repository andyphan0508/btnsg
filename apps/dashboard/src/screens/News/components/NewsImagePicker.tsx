import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import type { NewsImage } from '../../../api/newsApi';
import { driveThumbnailUrl } from '../../../utils/driveImage';
import { formatBytes, type CompressedImage } from '../../../utils/imageCompress';

type NewsImagePickerProps = {
  images: CompressedImage[];
  existingImages: NewsImage[];
  coverName: string;
  isCompressing: boolean;
  onPickFiles: (files: FileList) => void;
  onRemoveImage: (name: string) => void;
  onSetCover: (name: string) => void;
  onInsertImage: (name: string) => void;
};

/** Khu chọn ảnh: upload (tự nén), chọn ảnh bìa, chèn ảnh vào nội dung. */
const NewsImagePicker = ({
  images,
  existingImages,
  coverName,
  isCompressing,
  onPickFiles,
  onRemoveImage,
  onSetCover,
  onInsertImage,
}: NewsImagePickerProps) => {
  const styles = createStyles();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onPickFiles(event.target.files);
      event.target.value = ''; // cho phép chọn lại cùng file lần sau
    }
  };

  const renderImageTile = (
    key: string,
    name: string,
    previewUrl: string,
    sizeLabel: string | null,
    isNew: boolean,
  ) => (
    <div key={key} style={styles.tile}>
      <img src={previewUrl} alt={name} style={styles.thumb} />
      <div style={styles.tileInfo}>
        <div className="cell-strong" style={styles.tileName} title={name}>
          {name}
        </div>
        {sizeLabel && <div className="cell-muted">{sizeLabel}</div>}
        <label style={styles.coverRow}>
          <input
            type="radio"
            name="news-cover"
            checked={coverName === name}
            onChange={() => onSetCover(name)}
          />
          <span>Ảnh bìa</span>
        </label>
        <div style={styles.tileActions}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onInsertImage(name)}>
            Chèn vào bài
          </button>
          {isNew && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onRemoveImage(name)}>
              Bỏ
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="card">
      <div className="card-title">Hình ảnh</div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
      <button
        type="button"
        className="btn btn-outline"
        disabled={isCompressing}
        onClick={() => fileInputRef.current?.click()}
      >
        {isCompressing ? 'Đang nén ảnh…' : '+ Chọn ảnh (tự nén về ~1600px)'}
      </button>

      {existingImages.length > 0 && (
        <>
          <div className="cell-muted" style={{ marginTop: 10 }}>
            Ảnh đang có trên Drive:
          </div>
          <div style={styles.grid}>
            {existingImages.map((image) =>
              renderImageTile(image.id, image.name, driveThumbnailUrl(image.id, 400), null, false),
            )}
          </div>
        </>
      )}

      {images.length > 0 && (
        <>
          <div className="cell-muted" style={{ marginTop: 10 }}>
            Ảnh sẽ upload khi đăng:
          </div>
          <div style={styles.grid}>
            {images.map((image) =>
              renderImageTile(image.name, image.name, image.previewUrl, formatBytes(image.sizeBytes), true),
            )}
          </div>
        </>
      )}

      {images.length === 0 && existingImages.length === 0 && (
        <div className="cell-muted" style={{ marginTop: 8 }}>
          Chưa có ảnh — ảnh đầu tiên sẽ tự làm ảnh bìa (đổi được).
        </div>
      )}
    </div>
  );
};

export default NewsImagePicker;

const createStyles = () => {
  return {
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
      gap: 10,
      marginTop: 8,
    },
    tile: {
      display: 'flex',
      gap: 10,
      padding: 8,
      borderRadius: 10,
      border: '1px solid var(--line, #e5decf)',
    },
    thumb: {
      width: 72,
      height: 72,
      objectFit: 'cover' as const,
      borderRadius: 8,
      flexShrink: 0,
      background: 'var(--surface-2)',
    },
    tileInfo: { minWidth: 0, display: 'flex', flexDirection: 'column' as const, gap: 2 },
    tileName: {
      fontSize: '0.8rem',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    coverRow: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      fontSize: '0.78rem',
      cursor: 'pointer',
    },
    tileActions: { display: 'flex', gap: 4, flexWrap: 'wrap' as const },
  };
};

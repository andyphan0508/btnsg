// Nén ảnh phía trình duyệt trước khi upload lên Google Drive qua Apps Script:
// - Thu nhỏ về tối đa 1600px cạnh dài (đủ nét cho web, Drive thumbnail cũng chỉ phát tới w1600).
// - Xuất JPEG chất lượng 0.85 → ảnh điện thoại 4–6MB còn ~200–500KB.
// Nhờ đó payload webhook nhỏ, Drive nhẹ, và web tải nhanh.

import type { NewsImageUpload } from '../api/newsApi';

const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;

export type CompressedImage = NewsImageUpload & {
  /** URL tạm (objectURL) để preview ngay trong màn hình soạn bài. */
  previewUrl: string;
  /** Kích thước sau nén (bytes) — hiển thị cho người đăng biết. */
  sizeBytes: number;
};

/** Đổi đuôi file về .jpg (ảnh đã được re-encode sang JPEG). */
const toJpgName = (fileName: string): string => {
  const base = fileName.replace(/\.[a-z0-9]+$/i, '').trim() || 'anh';
  return `${base}.jpg`;
};

const loadImageElement = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`Không đọc được ảnh "${file.name}" — file có phải là ảnh không?`));
    };
    image.src = url;
  });

const canvasToBlob = (canvas: HTMLCanvasElement, type = 'image/jpeg', quality = JPEG_QUALITY): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Nén ảnh thất bại.'))),
      type,
      quality,
    );
  });

/** Vẽ ảnh thu nhỏ về tối đa maxDimension px cạnh dài (không phóng to ảnh nhỏ). */
const drawScaled = (image: HTMLImageElement, maxDimension: number): HTMLCanvasElement => {
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Trình duyệt không hỗ trợ canvas để nén ảnh.');
  // Nền trắng cho ảnh PNG trong suốt khi chuyển sang JPEG.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
};

const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result dạng "data:image/jpeg;base64,xxxx" → chỉ lấy phần sau dấu phẩy.
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(new Error('Không đọc được dữ liệu ảnh sau nén.'));
    reader.readAsDataURL(blob);
  });

/** Nén 1 file ảnh → dữ liệu sẵn sàng upload + URL preview. */
export const compressImage = async (file: File): Promise<CompressedImage> => {
  const image = await loadImageElement(file);
  const blob = await canvasToBlob(drawScaled(image, MAX_DIMENSION));
  const dataBase64 = await blobToBase64(blob);
  URL.revokeObjectURL(image.src);

  return {
    name: toJpgName(file.name),
    mimeType: 'image/jpeg',
    dataBase64,
    previewUrl: URL.createObjectURL(blob),
    sizeBytes: blob.size,
  };
};

export type GalleryImage = {
  /** Bản lớn (≤1600px, ≤250KB) cho lightbox. */
  full: Blob;
  /** Bản nhỏ (≤800px, ≤50KB) cho lưới ảnh. */
  thumb: Blob;
  width: number;
  height: number;
};

/** WebP nhẹ hơn JPEG ~30%; trình duyệt không mã hoá được WebP (toBlob trả PNG) → JPEG. */
const encodeForWeb = async (canvas: HTMLCanvasElement, quality: number): Promise<Blob> => {
  const webp = await canvasToBlob(canvas, 'image/webp', quality);
  return webp.type === 'image/webp' ? webp : canvasToBlob(canvas, 'image/jpeg', quality);
};

// Ngân sách mỗi ảnh ≈ 300KB (bản lớn + bản nhỏ): Supabase Free 1GB chứa ~3.300 ảnh,
// và mỗi lượt xem tốn ít băng thông hơn. Ảnh đã chỉnh màu/nhiều chi tiết thường vượt ngân sách
// ở chất lượng cao → hạ dần chất lượng, chỉ thu nhỏ kích thước khi chất lượng sàn vẫn quá nặng.
const FULL_MAX_BYTES = 250 * 1024;
const THUMB_MAX_BYTES = 50 * 1024;
const MAX_QUALITY = 0.86;
/** Dưới mức này WebP bắt đầu thấy vệt khối ở vùng trời/da — thà giảm kích thước còn hơn. */
const MIN_QUALITY = 0.6;

type Encoded = { blob: Blob; width: number; height: number };

/**
 * Tìm chất lượng cao nhất mà ảnh vẫn ≤ maxBytes (tìm nhị phân, tối đa 6 lần mã hoá mỗi cỡ).
 * Chất lượng sàn vẫn quá nặng → thu nhỏ 15% rồi thử lại, không nhỏ hơn một nửa maxDimension.
 */
const encodeWithinBudget = async (image: HTMLImageElement, maxDimension: number, maxBytes: number): Promise<Encoded> => {
  for (let dimension = maxDimension; ; dimension = Math.round(dimension * 0.85)) {
    const canvas = drawScaled(image, dimension);
    const result = (blob: Blob): Encoded => ({ blob, width: canvas.width, height: canvas.height });

    const best = await encodeForWeb(canvas, MAX_QUALITY);
    if (best.size <= maxBytes) return result(best);

    let fitting = await encodeForWeb(canvas, MIN_QUALITY);
    if (fitting.size > maxBytes && dimension * 0.85 >= maxDimension / 2) continue;

    let low = MIN_QUALITY;
    let high = MAX_QUALITY;
    for (let step = 0; step < 4; step += 1) {
      const quality = (low + high) / 2;
      const candidate = await encodeForWeb(canvas, quality);
      if (candidate.size <= maxBytes) {
        fitting = candidate;
        low = quality;
      } else {
        high = quality;
      }
    }
    return result(fitting);
  }
};

/** Ảnh cho thư viện Khoảnh khắc (Supabase Storage): 2 cỡ dựng sẵn để landing tải đúng cỡ cần. */
export const compressForGallery = async (file: File): Promise<GalleryImage> => {
  const image = await loadImageElement(file);
  try {
    const full = await encodeWithinBudget(image, MAX_DIMENSION, FULL_MAX_BYTES);
    const thumb = await encodeWithinBudget(image, 800, THUMB_MAX_BYTES);
    return { full: full.blob, thumb: thumb.blob, width: full.width, height: full.height };
  } finally {
    URL.revokeObjectURL(image.src);
  }
};

/** Hiển thị dung lượng dễ đọc: 245 KB, 1.2 MB. */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

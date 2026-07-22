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

const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Nén ảnh thất bại.'))),
      'image/jpeg',
      JPEG_QUALITY,
    );
  });

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

  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Trình duyệt không hỗ trợ canvas để nén ảnh.');
  // Nền trắng cho ảnh PNG trong suốt khi chuyển sang JPEG.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  const blob = await canvasToBlob(canvas);
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

/** Hiển thị dung lượng dễ đọc: 245 KB, 1.2 MB. */
export const formatBytes = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

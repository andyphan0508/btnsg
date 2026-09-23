import { PiImage } from "react-icons/pi";
import { driveImage } from "../lib/gallery.js";

/**
 * Ô ảnh dùng chung cho vòng ảnh/bento/gallery/lightbox.
 * - Ảnh thật từ Drive → <img> lazy-load.
 * - Ảnh demo (chưa cấu hình Drive) → khối gradient nắng/chàm cùng tông giao diện.
 */
export default function MediaTile({ image, width = 1000, className = "", eager = false, fit = "cover" }) {
  if (!image) return null;

  if (image.demo) {
    return (
      <div
        className={`media-tile media-demo ${className}`}
        style={{ "--h": image.hue ?? 24 }}
        role="img"
        aria-label={image.name || image.title}
      >
        <PiImage aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      className={`media-tile ${className}`}
      src={driveImage(image.id, width)}
      alt={image.title || image.name || "Ảnh hoạt động Ban Thanh Niên"}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      style={{ objectFit: fit }}
    />
  );
}

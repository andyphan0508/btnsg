import { driveImage } from "../lib/gallery.js";

/**
 * Ô ảnh dùng chung cho slider/gallery/lightbox.
 * - Ảnh thật từ Drive → <img> lazy-load.
 * - Ảnh demo (chưa cấu hình Drive) → khối gradient để xem trước offline.
 */
export default function MediaTile({
  image,
  width = 1000,
  className = "",
  eager = false,
}) {
  if (!image) return null;

  if (image.demo) {
    const hue = image.hue ?? 24;
    const style = {
      background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 75% 45%))`,
    };
    return (
      <div
        className={`media-tile media-demo ${className}`}
        style={style}
        aria-label={image.name || image.title}
      >
        <span className="media-demo-label">{image.title || image.name}</span>
      </div>
    );
  }

  return (
    <img
      className={`media-tile ${className}`}
      src={driveImage(image.id, width)}
      alt={image.title || image.name || "Ảnh hoạt động Thanh Niên"}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

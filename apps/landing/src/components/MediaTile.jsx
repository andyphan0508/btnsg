import { FiImage } from "react-icons/fi";
import { driveImage } from "../lib/gallery.js";

/**
 * Ô ảnh dùng chung cho slider/gallery/lightbox.
 * - Ảnh thật từ Drive → <img> lazy-load.
 * - Ảnh demo (chưa cấu hình Drive) → khối gradient nghệ thuật với icon React Icons.
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
      background: `linear-gradient(135deg, hsl(${hue} 65% 45%), hsl(${(hue + 45) % 360} 70% 30%))`,
    };
    return (
      <div
        className={`media-tile media-demo ${className}`}
        style={style}
        aria-label={image.name || image.title}
      >
        <div className="media-demo-pattern" />
        <div className="media-demo-content">
          <FiImage className="media-demo-icon" />
          <span className="media-demo-label">{image.title || image.name}</span>
        </div>
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
    />
  );
}

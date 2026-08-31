import { PictureOutlined } from "@ant-design/icons";
import { driveImage } from "../lib/gallery.js";

/**
 * Ô ảnh dùng chung cho slider/gallery/lightbox.
 * - Ảnh thật từ Drive → <img> lazy-load.
 * - Ảnh demo (chưa cấu hình Drive) → khối gradient nghệ thuật với icon Ant Design.
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
      background: `linear-gradient(135deg, hsl(${hue} 45% 35%), hsl(${(hue + 45) % 360} 50% 25%))`,
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "rgba(255, 255, 255, 0.8)",
      fontSize: "24px",
    };
    return (
      <div
        className={`media-tile media-demo ${className}`}
        style={style}
        aria-label={image.name || image.title}
      >
        <PictureOutlined />
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
      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
    />
  );
}

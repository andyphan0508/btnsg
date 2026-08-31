import { useEffect, useRef } from "react";
import {
  CloseOutlined,
  ExportOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";
import MediaTile from "./MediaTile.jsx";
import { driveImage } from "../lib/gallery.js";

/**
 * Lightbox: Xem ảnh phóng to toàn màn hình với hoạt ảnh Motion và Ant Design icons.
 */
export default function Lightbox({ images = [], index, onClose, onNavigate }) {
  const isOpen = index !== null && index >= 0 && Boolean(images[index]);
  const thumbStripRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !thumbStripRef.current) return;
    const activeThumb = thumbStripRef.current.querySelector(
      ".lightbox-thumb-card.active",
    );
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [isOpen, index]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onNavigate(index - 1);
      else if (e.key === "ArrowRight") onNavigate(index + 1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, index, onClose, onNavigate]);

  const image = images[index];
  const isDrive = !image?.demo && Boolean(image?.id);
  const cleanTitle =
    (image?.name || "")
      .replace(/^(Copy of |Sao chép của )/i, "")
      .replace(/\.[^/.]+$/, "") || `Khoảnh khắc #${(index ?? 0) + 1}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="lightbox-backdrop"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          {/* Header Bar */}
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              right: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              zIndex: 10,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, color: "#fff" }}>
              <span
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                }}
              >
                {index + 1} / {images.length}
              </span>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 600, color: "#fff", margin: 0 }}>
                {cleanTitle}
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {isDrive && (
                <a
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#fff",
                    background: "rgba(255, 255, 255, 0.12)",
                    padding: "6px 14px",
                    borderRadius: "var(--radius-md)",
                    fontSize: "0.85rem",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                  }}
                  href={driveImage(image.id, 1920)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Mở ảnh gốc trên Google Drive"
                >
                  <ExportOutlined />
                  <span>Ảnh gốc</span>
                </a>
              )}

              <button
                style={{
                  background: "rgba(255, 255, 255, 0.15)",
                  border: "none",
                  color: "#fff",
                  width: 36,
                  height: 36,
                  borderRadius: "var(--radius-md)",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  fontSize: 16,
                }}
                onClick={onClose}
                aria-label="Đóng"
                type="button"
              >
                <CloseOutlined />
              </button>
            </div>
          </div>

          {/* Main Stage Image */}
          <motion.div
            className="lightbox-dialog"
            onClick={(e) => e.stopPropagation()}
            key={image?.id || index}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <MediaTile
              image={image}
              width={1920}
              eager
              className="lightbox-img"
            />
          </motion.div>

          <button
            className="lightbox-btn lightbox-prev"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index - 1);
            }}
            aria-label="Ảnh trước"
            type="button"
          >
            <LeftOutlined />
          </button>

          <button
            className="lightbox-btn lightbox-next"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate(index + 1);
            }}
            aria-label="Ảnh kế tiếp"
            type="button"
          >
            <RightOutlined />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

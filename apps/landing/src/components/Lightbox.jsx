import { useEffect } from "react";
import { PiArrowSquareOut, PiCaretLeft, PiCaretRight, PiX } from "react-icons/pi";
import { motion, AnimatePresence } from "motion/react";
import MediaTile from "./MediaTile.jsx";
import { driveImage } from "../lib/gallery.js";
import { useScrollLock } from "../lib/scroll.js";

/** Lightbox: xem ảnh phóng to toàn màn hình trên nền kính tối. */
export default function Lightbox({ images = [], index, onClose, onNavigate }) {
  const isOpen = index !== null && index >= 0 && Boolean(images[index]);
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") onNavigate(index - 1);
      else if (e.key === "ArrowRight") onNavigate(index + 1);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, index, onClose, onNavigate]);

  const image = images[index];
  const isDrive = !image?.demo && Boolean(image?.id);
  const cleanTitle =
    (image?.name || "")
      .replace(/^(Copy of |Sao chép của )/i, "")
      .replace(/\.[^/.]+$/, "") || `Khoảnh khắc #${(index ?? 0) + 1}`;

  const go = (step) => (e) => {
    e.stopPropagation();
    onNavigate(index + step);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="lightbox"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={cleanTitle}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="lightbox-bar" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-info">
              <span className="lightbox-count">
                {index + 1} / {images.length}
              </span>
              <h3>{cleanTitle}</h3>
            </div>
            <div className="lightbox-actions">
              {isDrive && (
                <a
                  className="chip"
                  href={driveImage(image.id, 1920)}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Mở ảnh gốc trên Google Drive"
                >
                  <PiArrowSquareOut aria-hidden="true" />
                  <span>Ảnh gốc</span>
                </a>
              )}
              <button className="icon-btn" onClick={onClose} aria-label="Đóng" type="button">
                <PiX />
              </button>
            </div>
          </div>

          <motion.div
            className="lightbox-stage"
            onClick={(e) => e.stopPropagation()}
            key={image?.id || index}
            initial={{ opacity: 0, scale: 0.94, rotateY: -8 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <MediaTile image={image} width={1920} eager fit="contain" />
          </motion.div>

          <button className="lightbox-nav is-prev" onClick={go(-1)} aria-label="Ảnh trước" type="button">
            <PiCaretLeft />
          </button>
          <button className="lightbox-nav is-next" onClick={go(1)} aria-label="Ảnh kế tiếp" type="button">
            <PiCaretRight />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

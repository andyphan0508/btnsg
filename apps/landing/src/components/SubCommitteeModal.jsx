import { useEffect } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";

/**
 * Modal thông tin chi tiết tiểu ban với hoạt ảnh Motion mượt mà.
 */
export default function SubCommitteeModal({ committee, onClose }) {
  const isOpen = Boolean(committee);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="subcom-modal-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="subcom-modal-sheet"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button
              className="subcom-modal-close"
              onClick={onClose}
              aria-label="Đóng"
              type="button"
            >
              <CloseOutlined />
            </button>

            <div style={{ fontSize: 36, marginBottom: 12 }}>
              {committee.icon}
            </div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: 8, color: "var(--ink)" }}>
              {committee.title}
            </h3>
            <p style={{ fontSize: "0.95rem", color: "var(--ink-2)", lineHeight: 1.6 }}>
              {committee.desc}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

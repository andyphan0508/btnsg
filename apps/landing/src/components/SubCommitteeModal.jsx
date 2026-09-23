import { useEffect } from "react";
import { PiHandshake, PiMegaphone, PiMusicNotes, PiUsersThree, PiX } from "react-icons/pi";
import { motion, AnimatePresence } from "motion/react";
import { useScrollLock } from "../lib/scroll.js";

export const COMMITTEE_ICONS = {
  leaders: PiUsersThree,
  evangelism: PiMegaphone,
  visit: PiHandshake,
  music: PiMusicNotes,
};

/** Modal kính hiển thị chi tiết một tiểu ban. */
export default function SubCommitteeModal({ committee, onClose }) {
  const isOpen = Boolean(committee);
  useScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const Icon = committee ? COMMITTEE_ICONS[committee.icon] : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="modal glass is-solid"
            role="dialog"
            aria-modal="true"
            aria-labelledby="committee-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.92, opacity: 0, y: 18, rotateX: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 12 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <button className="icon-btn modal-close" onClick={onClose} aria-label="Đóng" type="button">
              <PiX />
            </button>
            <span className="modal-icon" aria-hidden="true">
              {Icon && <Icon />}
            </span>
            <h3 id="committee-title">{committee.title}</h3>
            <p>{committee.desc}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

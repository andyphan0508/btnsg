import { useEffect, useState } from "react";
import {
  PiArrowRight,
  PiChatCircleDots,
  PiCheckCircle,
  PiFacebookLogo,
  PiPaperPlaneTilt,
  PiWarningCircle,
  PiX,
} from "react-icons/pi";
import { motion, AnimatePresence } from "motion/react";
import { site } from "../data/content.js";
import { CONTACT_OPEN_EVENT, sendContactMessage } from "../lib/contact.js";
import { useScrollLock } from "../lib/scroll.js";

/**
 * FAB (nút nổi) góc phải dưới — mở panel kính "Kết nối":
 * gửi tin nhắn đến banthanhniensaigon@gmail.com qua Apps Script webhook.
 * Các nút "Nhắn tin cho Ban" khác trên trang mở panel này qua openContactPanel().
 */
export default function ContactFab() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", contact: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  useScrollLock(open);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(CONTACT_OPEN_EVENT, show);
    return () => window.removeEventListener(CONTACT_OPEN_EVENT, show);
  }, []);

  // Đóng bằng phím Esc
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const update = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendContactMessage(formData);
      setSent(true);
      setFormData({ name: "", contact: "", message: "" });
      setTimeout(() => setSent(false), 6000);
    } catch (err) {
      setError(err.message || "Gửi không thành công. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fab-backdrop"
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <div className="contact-fab">
        <AnimatePresence>
          {open && (
            <motion.div
              className="fab-panel glass is-solid"
              role="dialog"
              aria-label="Kết nối với Ban Thanh Niên"
              data-lenis-prevent
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 18 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
            >
              <div className="fab-head">
                <div>
                  <p className="fab-status">
                    <span className="live-dot" /> Hộp thư kết nối
                  </p>
                  <h3>Ban Thanh Niên</h3>
                  <p className="fab-sub">
                    Lời nhắn sẽ chuyển thẳng về <strong>banthanhniensaigon@gmail.com</strong>
                  </p>
                </div>
                <button
                  className="icon-btn"
                  onClick={() => setOpen(false)}
                  type="button"
                  aria-label="Đóng"
                >
                  <PiX />
                </button>
              </div>

              <div className="fab-body">
                <a className="fab-fb" href={site.facebook} target="_blank" rel="noopener noreferrer">
                  <span className="fab-fb-icon">
                    <PiFacebookLogo />
                  </span>
                  <span className="fab-fb-text">
                    <strong>Nhắn tin Fanpage</strong>
                    <small>Kênh phản hồi nhanh nhất</small>
                  </span>
                  <PiArrowRight aria-hidden="true" />
                </a>

                <div className="fab-divider">
                  <span>hoặc gửi lời nhắn tại đây</span>
                </div>

                <form onSubmit={handleSubmit} className="fab-form">
                  <div className="field">
                    <label htmlFor="fab-name">Họ và tên</label>
                    <input
                      type="text"
                      id="fab-name"
                      required
                      autoComplete="name"
                      placeholder="Nhập họ và tên..."
                      value={formData.name}
                      onChange={update("name")}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="fab-contact">Email hoặc Số điện thoại</label>
                    <input
                      type="text"
                      id="fab-contact"
                      required
                      placeholder="Email hoặc số điện thoại..."
                      value={formData.contact}
                      onChange={update("contact")}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="fab-message">Lời nhắn / Câu hỏi</label>
                    <textarea
                      id="fab-message"
                      rows="3"
                      required
                      placeholder="Nội dung bạn muốn nhắn gửi..."
                      value={formData.message}
                      onChange={update("message")}
                    />
                  </div>

                  <button type="submit" disabled={loading} className="btn btn-sun fab-submit">
                    <span>{loading ? "Đang gửi đi…" : "Gửi về hộp thư Ban"}</span>
                    <span className="btn-icon">
                      <PiPaperPlaneTilt />
                    </span>
                  </button>

                  {sent && (
                    <motion.div className="alert is-ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                      <PiCheckCircle aria-hidden="true" />
                      <span>
                        Đã gửi thành công tới <strong>banthanhniensaigon@gmail.com</strong>! Chúng tôi
                        sẽ phản hồi sớm nhất.
                      </span>
                    </motion.div>
                  )}
                  {error && (
                    <motion.div className="alert is-error" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                      <PiWarningCircle aria-hidden="true" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          className={`fab-btn${open ? " is-open" : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Đóng bảng kết nối" : "Kết nối với Ban Thanh Niên"}
        >
          <motion.span
            key={open ? "close" : "open"}
            initial={{ rotate: -45, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {open ? <PiX /> : <PiChatCircleDots />}
          </motion.span>
        </button>
      </div>
    </>
  );
}

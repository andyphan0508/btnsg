import { useEffect, useState } from "react";
import {
  MessageOutlined,
  CloseOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FacebookFilled,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";
import { site } from "../data/content.js";
import { sendContactMessage } from "../lib/contact.js";

/**
 * FAB (nút nổi) góc phải dưới — mở panel "Kết nối":
 * gửi tin nhắn đến banthanhniensaigon@gmail.com qua Apps Script webhook.
 */
export default function ContactFab() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  // Đóng bằng phím Esc
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await sendContactMessage(formData);
      setSent(true);
      setFormData({ name: "", contact: "", message: "" });
      setTimeout(() => {
        setSent(false);
      }, 6000);
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

      <div className={`contact-fab${open ? " open" : ""}`}>
        {/* Panel kết nối */}
        <AnimatePresence>
          {open && (
            <motion.div
              className="fab-panel"
              role="dialog"
              aria-label="Kết nối với Ban Thanh Niên"
              aria-hidden={!open}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
            >
              {/* Header */}
              <div className="fab-panel-head">
                <div>
                  <div className="fab-eyebrow">
                    <span className="fab-eyebrow-dot" />
                    <span>Hộp thư kết nối</span>
                  </div>
                  <h3 className="fab-panel-title">Ban Thanh Niên</h3>
                  <p className="fab-panel-sub">
                    Lời nhắn sẽ chuyển thẳng về <strong>banthanhniensaigon@gmail.com</strong> 🧡
                  </p>
                </div>
                <button
                  className="fab-close-btn"
                  onClick={() => setOpen(false)}
                  type="button"
                  aria-label="Đóng"
                >
                  <CloseOutlined />
                </button>
              </div>

              <div className="fab-panel-body">
                {/* Kênh liên hệ nhanh Facebook */}
                <a
                  className="fab-fb-card"
                  href={site.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="fab-fb-icon-box">
                    <FacebookFilled />
                  </div>
                  <div className="fab-fb-info">
                    <strong className="fab-fb-title">Nhắn tin Fanpage</strong>
                    <span className="fab-fb-sub">Kênh phản hồi nhanh nhất</span>
                  </div>
                  <div className="fab-fb-arrow">
                    <ArrowRightOutlined />
                  </div>
                </a>

                {/* Phân cách hoặc */}
                <div className="fab-divider">
                  <span>hoặc gửi lời nhắn tại đây</span>
                </div>

                {/* Form gửi lời nhắn */}
                <form onSubmit={handleSubmit} className="fab-form">
                  <div className="fab-field-group">
                    <label htmlFor="fab-name" className="fab-field-label">
                      Họ và tên
                    </label>
                    <input
                      type="text"
                      id="fab-name"
                      required
                      placeholder="Nhập họ và tên..."
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="fab-field-input"
                    />
                  </div>

                  <div className="fab-field-group">
                    <label htmlFor="fab-contact" className="fab-field-label">
                      Email hoặc Số điện thoại
                    </label>
                    <input
                      type="text"
                      id="fab-contact"
                      required
                      placeholder="Email hoặc số điện thoại..."
                      value={formData.contact}
                      onChange={(e) =>
                        setFormData({ ...formData, contact: e.target.value })
                      }
                      className="fab-field-input"
                    />
                  </div>

                  <div className="fab-field-group">
                    <label htmlFor="fab-message" className="fab-field-label">
                      Lời nhắn / Câu hỏi
                    </label>
                    <textarea
                      id="fab-message"
                      rows="3"
                      required
                      placeholder="Nội dung bạn muốn nhắn gửi..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="fab-field-input fab-field-textarea"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="fab-submit-btn"
                  >
                    <span className="fab-submit-text">
                      {loading ? "Đang gửi đi…" : "Gửi về hộp thư Ban"}
                    </span>
                    <span className="fab-submit-icon">
                      <SendOutlined />
                    </span>
                  </button>

                  {sent && (
                    <motion.div
                      className="fab-alert-success"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <CheckCircleOutlined className="fab-alert-icon" />
                      <span>Đã gửi thành công tới <strong>banthanhniensaigon@gmail.com</strong>! Chúng tôi sẽ phản hồi sớm nhất.</span>
                    </motion.div>
                  )}

                  {error && (
                    <motion.div
                      className="fab-alert-error"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <ExclamationCircleOutlined className="fab-alert-icon" />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nút FAB chính */}
        <button
          type="button"
          className="fab-btn"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Đóng bảng kết nối" : "Kết nối với Ban Thanh Niên"}
        >
          <motion.span
            key={open ? "close" : "open"}
            initial={{ rotate: -45, opacity: 0, scale: 0.8 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 45, opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.18 }}
            style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {open ? <CloseOutlined /> : <MessageOutlined />}
          </motion.span>
        </button>
      </div>
    </>
  );
}

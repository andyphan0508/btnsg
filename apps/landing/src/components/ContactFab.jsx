import { useEffect, useState } from "react";
import { FiX, FiMessageSquare, FiSend, FiCheckCircle, FiAlertCircle, FiMapPin, FiArrowUpRight } from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa6";
import { site, contacts, links } from "../data/content.js";
import { sendContactMessage } from "../lib/contact.js";

/**
 * FAB (nút nổi) góc phải dưới — mở panel "Kết nối":
 * gửi tin nhắn đến banthanhniensaigon@gmail.com qua Apps Script webhook.
 */
export default function ContactFab() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", contact: "", message: "" });
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
      {open && <div className="fab-backdrop" onClick={() => setOpen(false)} />}

      <div className={`contact-fab${open ? " open" : ""}`}>
        {/* Panel kết nối */}
        <div className="fab-panel" role="dialog" aria-label="Kết nối với Ban Thanh Niên" aria-hidden={!open}>
          <div className="fab-panel-head">
            <div>
              <div className="fab-panel-title">Kết nối với Ban Thanh Niên</div>
              <div className="fab-panel-sub">Lời nhắn sẽ được chuyển thẳng về banthanhniensaigon@gmail.com 🧡</div>
            </div>
            <button className="fab-close-btn" onClick={() => setOpen(false)} type="button" aria-label="Đóng">
              <FiX size={20} />
            </button>
          </div>

          <div className="fab-panel-body">
            {/* Kênh liên hệ nhanh */}
            <a
              className="fab-channel"
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="fab-channel-icon">
                <FaFacebookF size={18} />
              </span>
              <span>
                <strong>Nhắn tin Fanpage</strong>
                <small>Kênh phản hồi nhanh nhất của Ban</small>
              </span>
              <FiArrowUpRight className="fab-channel-arrow" />
            </a>

            {contacts.map((c) => (
              <div className="fab-channel fab-channel-static" key={c.title}>
                <span className="fab-channel-icon">
                  <FiMapPin size={18} />
                </span>
                <span>
                  <strong>{c.title}</strong>
                  <small>{c.desc}</small>
                </span>
              </div>
            ))}

            {/* Form gửi lời nhắn */}
            <form onSubmit={handleSubmit} className="c-form fab-form">
              <div className="fab-form-title">Gửi lời nhắn / đăng ký tham gia</div>

              <div className="form-group">
                <input
                  type="text"
                  id="fab-name"
                  required
                  placeholder=" "
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
                <label htmlFor="fab-name" className="form-label">Họ và tên của bạn</label>
              </div>

              <div className="form-group">
                <input
                  type="text"
                  id="fab-contact"
                  required
                  placeholder=" "
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  className="form-input"
                />
                <label htmlFor="fab-contact" className="form-label">Email hoặc số điện thoại liên hệ</label>
              </div>

              <div className="form-group">
                <textarea
                  id="fab-message"
                  rows="3"
                  required
                  placeholder=" "
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="form-input form-textarea"
                ></textarea>
                <label htmlFor="fab-message" className="form-label">Lời nhắn hoặc câu hỏi</label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-gold btn-glowing fab-submit"
              >
                {loading ? (
                  "Đang gửi..."
                ) : (
                  <>
                    <span>Gửi về hộp thư Ban</span>
                    <FiSend style={{ marginLeft: 6 }} />
                  </>
                )}
              </button>

              {sent && (
                <div className="form-success-alert">
                  <FiCheckCircle size={18} style={{ color: "#10b981", flexShrink: 0 }} />
                  <span>Lời nhắn đã gửi thành công tới <strong>banthanhniensaigon@gmail.com</strong>! Chúng tôi sẽ phản hồi sớm nhất.</span>
                </div>
              )}

              {error && (
                <div className="form-error-alert">
                  <FiAlertCircle size={18} style={{ color: "#ef4444", flexShrink: 0 }} />
                  <span>{error}</span>
                </div>
              )}
            </form>

            <div className="fab-links">
              {links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label} <FiArrowUpRight style={{ display: "inline" }} />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Nút FAB */}
        <button
          type="button"
          className="fab-btn"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Đóng bảng kết nối" : "Kết nối với Ban Thanh Niên"}
        >
          {open ? <FiX size={24} /> : <FiMessageSquare size={24} />}
        </button>
      </div>
    </>
  );
}

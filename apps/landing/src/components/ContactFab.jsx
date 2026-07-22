import { useEffect, useState } from "react";
import { site, contacts, links } from "../data/content.js";

/**
 * FAB (nút nổi) góc phải dưới — mở panel "Kết nối":
 * kênh liên hệ + form gửi lời nhắn (chuyển từ section Liên hệ sang đây,
 * nhường chỗ cho bản đồ Nhà Thờ).
 */
export default function ContactFab() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  // Đóng bằng phím Esc
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setFormData({ name: "", email: "", message: "" });
      setSent(false);
    }, 3000);
  };

  return (
    <>
      {open && <div className="fab-backdrop" onClick={() => setOpen(false)} />}

      <div className={`contact-fab${open ? " open" : ""}`}>
        {/* Panel kết nối */}
        <div className="fab-panel" role="dialog" aria-label="Kết nối với Ban Thanh Niên" aria-hidden={!open}>
          <div className="fab-panel-head">
            <div>
              <div className="fab-panel-title">Kết nối với chúng tôi</div>
              <div className="fab-panel-sub">Ban Thanh Niên luôn mong được gặp bạn 🧡</div>
            </div>
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </span>
              <span>
                <strong>Nhắn tin Fanpage</strong>
                <small>Kênh phản hồi nhanh nhất của Ban</small>
              </span>
              <span className="fab-channel-arrow">↗</span>
            </a>

            {contacts.map((c) => (
              <div className="fab-channel fab-channel-static" key={c.title}>
                <span className="fab-channel-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
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
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                />
                <label htmlFor="fab-contact" className="form-label">Email hoặc số điện thoại</label>
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

              <button type="submit" className="btn btn-gold btn-glowing fab-submit">
                {sent ? "Đang gửi thông tin..." : "Gửi lời nhắn"}
              </button>

              {sent && (
                <div className="form-success-alert">
                  ✨ Cảm ơn bạn! Chúng tôi sẽ liên hệ lại sớm nhất.
                </div>
              )}
            </form>

            <div className="fab-links">
              {links.map((l) => (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label} ↗
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
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}

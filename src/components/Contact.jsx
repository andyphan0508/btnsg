import { useState } from 'react'
import Reveal from './Reveal.jsx'
import { contacts, links } from '../data/content.js'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulated messaging trigger
    setSent(true)
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' })
      setSent(false)
    }, 3000)
  }

  return (
    <section className="section" id="lien-he">
      <Reveal className="sec-head" variant="slide-up">
        <p className="eyebrow">Kết nối &amp; liên hệ</p>
        <h2>Hẹn gặp bạn Chúa Nhật này</h2>
      </Reveal>
      
      <div className="contact-grid">
        <div className="contact-info-column">
          {contacts.map((c, idx) => (
            <Reveal className="c-card-new" variant="slide-right" delay={idx * 150} key={c.title}>
              <div className="c-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="c-svg">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div className="c-details">
                <h3>{c.title}</h3>
                <p>{c.desc}</p>
              </div>
            </Reveal>
          ))}
          
          <Reveal className="c-card-new c-links-card" variant="slide-right" delay={300}>
            <div className="c-icon-badge">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="c-svg">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </div>
            <div className="c-details">
              <h3>Theo dõi chúng tôi</h3>
              <ul className="c-links-new">
                {links.map((l) => (
                  <li key={l.href}>
                    <a href={l.href} target="_blank" rel="noopener noreferrer" className="c-social-link">
                      {l.label} <span className="arrow">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Messaging / Signup Form */}
        <Reveal className="contact-form-card" variant="slide-left">
          <h3>Gửi Lời Nhắn &amp; Đăng Ký Sinh Hoạt</h3>
          <p className="form-sub">Bạn muốn tìm hiểu thêm về các hoạt động của Ban Thanh Niên? Hãy để lại thông tin liên lạc.</p>
          
          <form onSubmit={handleSubmit} className="c-form">
            <div className="form-group">
              <input 
                type="text" 
                id="form-name" 
                required 
                placeholder=" "
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input" 
              />
              <label htmlFor="form-name" className="form-label">Họ và tên của bạn</label>
            </div>

            <div className="form-group">
              <input 
                type="email" 
                id="form-email" 
                required 
                placeholder=" "
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-input" 
              />
              <label htmlFor="form-email" className="form-label">Địa chỉ Email hoặc Số điện thoại</label>
            </div>

            <div className="form-group">
              <textarea 
                id="form-message" 
                rows="4" 
                required 
                placeholder=" "
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="form-input form-textarea"
              ></textarea>
              <label htmlFor="form-message" className="form-label">Lời nhắn hoặc câu hỏi của bạn</label>
            </div>

            <button type="submit" className="btn btn-gold btn-submit btn-glowing">
              {sent ? 'Đang gửi thông tin...' : 'Gửi lời nhắn ngay'}
            </button>
            
            {sent && (
              <div className="form-success-alert">
                ✨ Cảm ơn bạn! Thông tin đã được gửi. Chúng tôi sẽ liên hệ lại sớm nhất.
              </div>
            )}
          </form>
        </Reveal>
      </div>
    </section>
  )
}

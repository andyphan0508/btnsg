import Reveal from "./Reveal.jsx";
import { contacts, links } from "../data/content.js";

const CHURCH_ADDRESS =
  "Hội Thánh Tin Lành Việt Nam Chi Hội Sài Gòn, 155 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh";

const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(CHURCH_ADDRESS)}&hl=vi&z=17&output=embed`;
const MAP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CHURCH_ADDRESS)}`;

export default function Contact() {
  return (
    <section className="section" id="lien-he">
      <Reveal className="sec-head" variant="slide-up">
        <p className="eyebrow">Kết nối &amp; liên hệ</p>
        <h2>Hẹn gặp bạn Chúa Nhật này</h2>
        <p className="lead">
          Muốn nhắn tin cho chúng tôi? Bấm nút 💬 ở góc phải màn hình để gửi lời
          nhắn hoặc đăng ký tham gia.
        </p>
      </Reveal>

      <div className="contact-grid">
        <div className="contact-info-column">
          {contacts.map((c, idx) => (
            <Reveal
              className="c-card-new"
              variant="slide-right"
              delay={idx * 150}
              key={c.title}
            >
              <div className="c-icon-badge">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="c-svg"
                >
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

          <Reveal
            className="c-card-new c-links-card"
            variant="slide-right"
            delay={300}
          >
            <div className="c-icon-badge">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="c-svg"
              >
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
              </svg>
            </div>
            <div className="c-details">
              <h3>Theo dõi chúng tôi</h3>
              <ul className="c-links-new">
                {links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="c-social-link"
                    >
                      {l.label} <span className="arrow">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        {/* Bản đồ Nhà thờ */}
        <Reveal className="contact-map-card" variant="slide-left">
          <div className="map-frame">
            <iframe
              title="Bản đồ Nhà thờ Tin Lành Sài Gòn — 155 Trần Hưng Đạo, Quận 1"
              src={MAP_EMBED_URL}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="map-foot">
            <div className="map-foot-info">
              <strong>Nhà thờ Tin Lành Sài Gòn</strong>
              <span>155 Trần Hưng Đạo, Phường Cô Giang, Quận 1</span>
            </div>
            <a
              className="btn btn-gold map-directions"
              href={MAP_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Chỉ đường <span className="arrow-right">→</span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

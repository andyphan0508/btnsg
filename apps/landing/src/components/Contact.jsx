import {
  EnvironmentOutlined,
  FacebookFilled,
  GlobalOutlined,
  YoutubeFilled,
  ArrowRightOutlined,
} from "@ant-design/icons";
import Reveal from "./Reveal.jsx";
import { contacts, links } from "../data/content.js";

const CHURCH_ADDRESS =
  "Hội Thánh Tin Lành Việt Nam Chi Hội Sài Gòn, 155 Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh";

const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(CHURCH_ADDRESS)}&hl=vi&z=17&output=embed`;
const MAP_DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(CHURCH_ADDRESS)}`;

function getLinkIcon(label) {
  if (label.includes("Facebook")) return <FacebookFilled style={{ color: "#1877f2" }} />;
  if (label.includes("YouTube")) return <YoutubeFilled style={{ color: "#ff0000" }} />;
  return <GlobalOutlined />;
}

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
        <div className="contact-info-column" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {contacts.map((c, idx) => (
            <Reveal
              className="c-card-new"
              variant="slide-right"
              delay={idx * 100}
              key={c.title}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <div className="c-icon-badge">
                <EnvironmentOutlined />
              </div>
              <div className="c-details">
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: 4 }}>{c.title}</h3>
                <p style={{ fontSize: "0.92rem", color: "var(--ink-2)", lineHeight: 1.55 }}>{c.desc}</p>
              </div>
            </Reveal>
          ))}

          <Reveal
            className="c-card-new"
            variant="slide-right"
            delay={250}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
          >
            <div className="c-icon-badge">
              <GlobalOutlined />
            </div>
            <div className="c-details" style={{ width: "100%" }}>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: 12 }}>Theo dõi chúng tôi</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {links.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "10px 16px",
                        background: "var(--surface-2)",
                        border: "1.5px solid var(--ink)",
                        borderRadius: "var(--radius-pill)",
                        color: "var(--ink)",
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        boxShadow: "0 2px 0 var(--ink)",
                      }}
                    >
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        {getLinkIcon(l.label)}
                        <span>{l.label}</span>
                      </span>
                      <ArrowRightOutlined />
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
              <strong style={{ fontSize: "1.05rem", fontWeight: 800 }}>Nhà thờ Tin Lành Sài Gòn</strong>
              <span style={{ fontSize: "0.88rem", color: "var(--ink-2)", display: "block", marginTop: 2 }}>
                155 Trần Hưng Đạo, Phường Cô Giang, Quận 1
              </span>
            </div>
            <a
              className="btn-aardvark"
              href={MAP_DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="btn-text-part">Chỉ đường</span>
              <span className="btn-icon-part">
                <ArrowRightOutlined />
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

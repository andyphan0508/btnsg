import { CustomerServiceOutlined } from "@ant-design/icons";
import Reveal from "./Reveal.jsx";
import { themeYear } from "../data/content.js";

export default function ThemeYear() {
  return (
    <section className="section" id="chu-de">
      <Reveal className="theme-card-wrapper" variant="scale-up">
        <div className="theme-panel-new">
          <div className="theme-left">
            <span className="theme-eyebrow-badge">{themeYear.eyebrow}</span>
            <h2 className="theme-title-glow">{themeYear.title}</h2>
            <div className="theme-divider" />
            <p className="theme-song">
              <CustomerServiceOutlined style={{ fontSize: 20, color: "var(--color-yellow)" }} />
              <span>
                Bài hát khẩu hiệu: <b>{themeYear.song}</b>
              </span>
            </p>
          </div>
          <div className="theme-right">
            <blockquote className="verse-gold-box">
              <div className="quote-mark-start">“</div>
              <p className="verse-text">{themeYear.verse}</p>
              <cite className="verse-ref">— {themeYear.ref}</cite>
              <div className="quote-mark-end" style={{ textAlign: "right" }}>”</div>
            </blockquote>
          </div>
        </div>
      </Reveal>
      <Reveal as="p" className="theme-note" variant="fade" delay={200} style={{ textAlign: "center", marginTop: 24, fontStyle: "italic" }}>
        {themeYear.note}
      </Reveal>
    </section>
  );
}

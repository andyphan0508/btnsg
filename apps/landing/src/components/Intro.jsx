import Reveal from "./Reveal.jsx";
import { stats, nameTimeline } from "../data/content.js";

export default function Intro() {
  return (
    <section className="section" id="gioi-thieu">
      <div className="intro-intro-grid">
        <Reveal className="sec-head" variant="slide-right">
          <p className="eyebrow">Giới thiệu</p>
          <h2>Mái nhà thiêng liêng cho nhiều thế hệ bạn trẻ</h2>
          <p className="lead">
            Ban Thanh Niên là một ban ngành của Hội Thánh Tin Lành Việt Nam –
            Chi Hội Sài Gòn, Hội Thánh được thành lập năm 1920 — một trong những
            Hội Thánh Tin Lành đầu tiên tại Sài Gòn.
          </p>
        </Reveal>

        <Reveal as="div" className="prose-wrapper" variant="slide-left">
          <p className="prose">
            Ban được hình thành từ những năm đầu khi Hội Thánh mới thành lập, và
            chính thức trở thành một ban ngành trong tổ chức của Hội Thánh vào
            khoảng <b style={{ color: "var(--brand)" }}>năm 1942–1944</b>, sau Đại Hội
            Đồng Tổng Liên Hội năm 1942. Ban quy tụ các bạn trẻ cùng nhau thờ
            phượng Chúa, học Lời Chúa, gây dựng đời sống thuộc linh, phục vụ qua
            âm nhạc và chung tay trong công tác truyền giảng, thiện nguyện xã
            hội.
          </p>
        </Reveal>
      </div>

      <div className="stats-container">
        {stats.map((s, idx) => (
          <Reveal
            className="stat-card"
            variant="scale-up"
            delay={idx * 120}
            key={s.label}
          >
            <div className="stat-card-inner">
              <span className="stat-num">{s.num}</span>
              <div className="stat-lbl">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="timeline-section-wrapper">
        <Reveal className="sec-head timeline-head" variant="slide-up">
          <p className="eyebrow">Dấu ấn thời gian</p>
          <h2>Tên gọi qua các thời kỳ lịch sử</h2>
        </Reveal>

        <div className="timeline-container">
          <div className="timeline-line-bg" />
          <div className="timeline-grid">
            {nameTimeline.map((t, idx) => (
              <Reveal
                className={`timeline-card-wrapper${t.current ? " timeline-active" : ""}`}
                variant="slide-up"
                delay={idx * 150}
                key={t.name}
              >
                <div className="timeline-node">
                  <div className="timeline-node-dot" />
                </div>
                <div className="timeline-card">
                  <div className="timeline-era">{t.era}</div>
                  <h3 className="timeline-name">{t.name}</h3>
                  <p className="timeline-note">{t.note}</p>
                  {t.current && <span className="current-badge">Hiện tại</span>}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

import { useRef } from "react";
import ScrubText from "./ScrubText.jsx";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/scroll.js";
import { stats, nameTimeline } from "../data/content.js";

export default function Intro() {
  const statsRef = useRef(null);

  // Con số đếm lên khi thẻ cuộn vào khung nhìn.
  useGSAP(
    () => {
      if (prefersReducedMotion) return;
      gsap.utils.toArray(".stat-num").forEach((el) => {
        const counter = { value: 0 };
        el.textContent = "0";
        gsap.to(counter, {
          value: Number(el.dataset.value),
          duration: 2,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => {
            el.textContent = Math.round(counter.value);
          },
        });
      });
    },
    { scope: statsRef },
  );

  return (
    <>
      <section className="section">
        <div className="wrap story">
          <header className="sec-head story-head">
            <h2>
              Mái nhà cho nhiều thế hệ <em>bạn trẻ</em>
            </h2>
            <p className="lead">
              Ban Thanh Niên là một ban ngành của Hội Thánh Tin Lành Việt Nam – Chi Hội Sài Gòn,
              Hội Thánh được thành lập năm 1920 — một trong những Hội Thánh Tin Lành đầu tiên tại
              Sài Gòn.
            </p>
          </header>
          <ScrubText
            className="story-prose"
            parts={[
              "Ban được hình thành từ những năm đầu khi Hội Thánh mới thành lập, và chính thức trở thành một ban ngành trong tổ chức của Hội Thánh vào khoảng",
              { hl: "năm 1942–1944," },
              "sau Đại Hội Đồng Tổng Liên Hội năm 1942. Ban quy tụ các bạn trẻ cùng nhau thờ phượng Chúa, học Lời Chúa, gây dựng đời sống thuộc linh, phục vụ qua âm nhạc và chung tay trong công tác",
              { hl: "truyền giảng, thiện nguyện xã hội." },
            ]}
          />
        </div>

        <div className="wrap stats" ref={statsRef}>
          {stats.map((s, i) => (
            <div className="stat glass sfx-rise" style={{ "--i": i }} key={s.label} data-sheen>
              <span className="stat-num" data-value={s.num}>
                {s.num}
              </span>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section section-tight">
        <div className="wrap">
          <header className="sec-head">
            <h2>
              Tên gọi qua <em>các thời kỳ</em>
            </h2>
          </header>
          <div className="timeline">
            <span className="timeline-line sfx-draw" aria-hidden="true" />
            <ol className="timeline-list">
              {nameTimeline.map((t, i) => (
                <li
                  className={`timeline-card glass sfx-flip${t.current ? " is-current" : ""}`}
                  style={{ "--i": i }}
                  key={t.name}
                >
                  <span className="timeline-dot" aria-hidden="true" />
                  <span className="timeline-era">{t.era}</span>
                  <h3>{t.name}</h3>
                  <p>{t.note}</p>
                  {t.current && <span className="live-chip">Hiện tại</span>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}

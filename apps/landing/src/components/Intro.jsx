import { useRef } from "react";
import ScrubText from "./ScrubText.jsx";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/scroll.js";
import { content } from "../lib/siteContent.js";
import { Rich, scrubParts } from "../lib/rich.jsx";

export default function Intro() {
  const statsRef = useRef(null);
  const { about, stats, nameTimeline } = content;

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
              <Rich text={about.storyTitle} />
            </h2>
            <p className="lead">{about.storyLead}</p>
          </header>
          <ScrubText className="story-prose" parts={scrubParts(about.story)} />
        </div>

        <div className="wrap stats" ref={statsRef}>
          {stats.map((s, i) => (
            <div className="stat glass sfx-rise" style={{ "--i": i }} key={i} data-sheen>
              <span className="stat-num" data-value={Number.parseInt(s.num, 10) || 0}>
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
              <Rich text={about.timelineTitle} />
            </h2>
          </header>
          <div className="timeline">
            <span className="timeline-line sfx-draw" aria-hidden="true" />
            <ol className="timeline-list">
              {nameTimeline.map((t, i) => (
                <li
                  className={`timeline-card glass sfx-flip${t.current ? " is-current" : ""}`}
                  style={{ "--i": i }}
                  key={i}
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

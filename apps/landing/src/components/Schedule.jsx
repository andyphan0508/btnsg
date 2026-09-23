import { useRef } from "react";
import {
  PiChurch,
  PiBookOpenText,
  PiHandshake,
  PiHandsPraying,
  PiMusicNotes,
} from "react-icons/pi";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/scroll.js";
import { schedule } from "../data/content.js";

const ICONS = {
  church: PiChurch,
  book: PiBookOpenText,
  visit: PiHandshake,
  pray: PiHandsPraying,
  music: PiMusicNotes,
};

/**
 * Lịch tuần dạng chồng thẻ 3D: mỗi thẻ kính dính (sticky) ở đỉnh, thẻ sau trượt lên phủ thẻ trước;
 * thẻ phía dưới thu nhỏ, ngả ra sau và tối dần như một cỗ bài có chiều sâu.
 */
export default function Schedule() {
  const root = useRef(null);

  useGSAP(
    () => {
      if (prefersReducedMotion) return;
      const cards = gsap.utils.toArray(".stack-card");
      const last = cards[cards.length - 1];

      cards.slice(0, -1).forEach((card, i) => {
        const depth = cards.length - 1 - i;
        gsap
          .timeline({
            scrollTrigger: {
              trigger: cards[i + 1],
              start: "top bottom",
              endTrigger: last,
              // Kết thúc khi thẻ cuối chạm vị trí dính của nó.
              end: () => `top ${parseFloat(getComputedStyle(last).top)}px`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          })
          .to(
            card,
            {
              scale: 1 - depth * 0.045,
              rotationX: -9,
              transformPerspective: 1400,
              transformOrigin: "50% 0%",
              ease: "none",
            },
            0,
          )
          .to(card.querySelector(".stack-dim"), { opacity: 0.62, ease: "none" }, 0);
      });
    },
    { scope: root },
  );

  return (
    <section className="section" ref={root}>
      <div className="wrap">
        <header className="sec-head">
          <h2>
            Nhịp sinh hoạt <em>mỗi tuần</em>
          </h2>
          <p className="lead">
            Lần đầu đến? Hãy bắt đầu với buổi thờ phượng chiều Chúa Nhật — luôn có người chào
            đón bạn.
          </p>
        </header>

        <div className="stack">
          {schedule.map((s, i) => {
            const Icon = ICONS[s.icon];
            return (
              <article
                className={`stack-card glass tone-${s.tone}${s.main ? " is-main" : ""}`}
                style={{ "--i": i }}
                key={`${s.day}-${s.time}`}
              >
                <span className="stack-glow" aria-hidden="true" />
                <div className="stack-when">
                  <span className="stack-day">{s.day}</span>
                  <span className="stack-time">{s.time}</span>
                </div>
                <div className="stack-what">
                  {s.main && (
                    <span className="live-chip">
                      <span className="live-dot" /> Nhóm chính
                    </span>
                  )}
                  <h3>{s.what}</h3>
                  <p>{s.note}</p>
                </div>
                <Icon className="stack-icon" aria-hidden="true" />
                <span className="stack-dim" aria-hidden="true" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

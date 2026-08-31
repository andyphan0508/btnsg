import { useState } from "react";
import { ClockCircleOutlined } from "@ant-design/icons";
import Reveal from "./Reveal.jsx";
import SubCommitteeModal from "./SubCommitteeModal.jsx";
import { schedule, subCommittees } from "../data/content.js";

export default function Schedule() {
  const [activeCommittee, setActiveCommittee] = useState(null);

  return (
    <section className="section" id="sinh-hoat">
      <Reveal className="sec-head" variant="slide-up">
        <p className="eyebrow">Lịch sinh hoạt hằng tuần</p>
        <h2>Một tuần cùng Ban Thanh Niên</h2>
        <p className="lead">
          Bạn mới đến lần đầu? Hãy bắt đầu với giờ nhóm thờ phượng chiều Chúa
          Nhật — luôn có các ban viên chào đón bạn.
        </p>
      </Reveal>

      <div className="sched-grid">
        {schedule.map((s, idx) => (
          <Reveal
            className={`s-card-new${s.main ? " main-highlight" : ""}`}
            variant="slide-up"
            delay={idx * 80}
            key={`${s.day}-${s.time}`}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="s-header">
              <span className="s-day-badge">{s.day}</span>
              {s.main && (
                <span className="s-live-pulse">
                  <span className="pulse-dot" /> Nhóm chính
                </span>
              )}
            </div>

            <div className="s-body">
              <div className="s-time-row">
                <ClockCircleOutlined />
                <span className="s-time-text">{s.time}</span>
              </div>
              <h3 className="s-title">{s.what}</h3>
              <p className="s-desc">{s.note}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="sub-comm-wrapper" variant="slide-up" delay={150}>
        <p className="sub-comm-title">Các tiểu ban công tác phụ trách:</p>
        <div className="chips-container">
          {subCommittees.map((c) => (
            <button
              type="button"
              className="chip-badge"
              key={c.id}
              onClick={() => setActiveCommittee(c)}
            >
              <span aria-hidden="true">{c.icon}</span> {c.title}
            </button>
          ))}
        </div>
      </Reveal>

      <SubCommitteeModal
        committee={activeCommittee}
        onClose={() => setActiveCommittee(null)}
      />
    </section>
  );
}

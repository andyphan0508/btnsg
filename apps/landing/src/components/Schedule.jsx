import Reveal from './Reveal.jsx'
import { schedule, subCommittees } from '../data/content.js'

export default function Schedule() {
  return (
    <section className="section" id="sinh-hoat">
      <Reveal className="sec-head" variant="slide-up">
        <p className="eyebrow">Lịch sinh hoạt hằng tuần</p>
        <h2>Một tuần cùng Ban Thanh Niên</h2>
        <p className="lead">
          Bạn mới đến lần đầu? Hãy bắt đầu với giờ nhóm thờ phượng chiều Chúa Nhật — luôn có các ban viên chào đón bạn.
        </p>
      </Reveal>
      
      <div className="sched-grid">
        {schedule.map((s, idx) => (
          <Reveal 
            className={`s-card-new${s.main ? ' main-highlight' : ''}`} 
            variant="slide-up"
            delay={idx * 120}
            key={`${s.day}-${s.time}`}
          >
            <div className="s-card-glow-bg" />
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
                <svg className="s-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="s-time-text">{s.time}</span>
              </div>
              <h3 className="s-title">{s.what}</h3>
              <p className="s-desc">{s.note}</p>
            </div>
          </Reveal>
        ))}
      </div>
      
      <Reveal className="sub-comm-wrapper" variant="slide-up" delay={200}>
        <p className="sub-comm-title">Các tiểu ban công tác phụ trách:</p>
        <div className="chips-container">
          {subCommittees.map((c) => (
            <span className="chip-badge" key={c}>
              {c}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  )
}

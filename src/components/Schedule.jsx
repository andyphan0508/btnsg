import Reveal from './Reveal.jsx'
import { schedule, subCommittees } from '../data/content.js'

export default function Schedule() {
  return (
    <section className="section" id="sinh-hoat">
      <Reveal className="sec-head">
        <p className="eyebrow">Lịch sinh hoạt hằng tuần</p>
        <h2>Một tuần cùng Ban Thanh Niên</h2>
        <p className="lead">
          Bạn mới đến lần đầu? Hãy bắt đầu với giờ nhóm thờ phượng chiều Chúa Nhật — luôn có người
          chào đón bạn.
        </p>
      </Reveal>
      <Reveal className="sched">
        {schedule.map((s) => (
          <div className={`s-card${s.main ? ' main' : ''}`} key={`${s.day}-${s.time}`}>
            <span className="s-day">{s.day}</span>
            <span className="s-time">{s.time}</span>
            <span className="s-what">{s.what}</span>
            <span className="s-note">{s.note}</span>
          </div>
        ))}
      </Reveal>
      <Reveal className="chips" style={{ marginTop: 22 }}>
        {subCommittees.map((c) => (
          <span className="chip" key={c}>
            {c}
          </span>
        ))}
      </Reveal>
    </section>
  )
}

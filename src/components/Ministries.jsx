import Reveal from './Reveal.jsx'
import { ministries, duties, partners } from '../data/content.js'

// Helper function to render a custom hand-drawn inline SVG icon for each ministry type
function getMinistryIcon(title) {
  const stroke = "currentColor";
  const strokeWidth = 1.8;
  
  switch (title) {
    case 'Bồi linh':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} className="m-icon">
          {/* Holy Cross with circular halo */}
          <path d="M12 2v20M8 8h8" />
          <circle cx="12" cy="8" r="4" strokeDasharray="3 3" />
        </svg>
      )
    case 'Truyền giảng':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} className="m-icon">
          {/* Spirit flame */}
          <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1.5-3.5C8 11 7 12.5 7 14.5a1.5 1.5 0 0 0 1.5 0z" />
          <path d="M12 21a6 6 0 0 0 6-6c0-3.8-3.5-6-6-10-2.5 4-6 6.2-6 10a6 6 0 0 0 6 6z" />
        </svg>
      )
    case 'Công tác xã hội':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} className="m-icon">
          {/* Heart held in hands */}
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )
    case 'Du lịch – dã ngoại':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} className="m-icon">
          {/* Compass / Mountain */}
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      )
    case 'Huấn luyện':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} className="m-icon">
          {/* Open Book and lightbulb */}
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      )
    case 'Họp bạn Thanh Niên':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} className="m-icon">
          {/* Handshake/Network of people */}
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} className="m-icon">
          <circle cx="12" cy="12" r="10" />
        </svg>
      )
  }
}

export default function Ministries() {
  return (
    <section className="section" id="muc-vu">
      <Reveal className="sec-head" variant="slide-up">
        <p className="eyebrow">Mục vụ &amp; hoạt động thường niên</p>
        <h2>Được gây dựng để đi ra phục vụ</h2>
      </Reveal>
      
      <div className="grid3-new">
        {ministries.map((m, idx) => (
          <Reveal className="m-card-new" variant="slide-up" delay={idx * 100} key={m.title}>
            <div className="m-card-header">
              <div className="m-icon-box">{getMinistryIcon(m.title)}</div>
              <span className="m-kind-badge">{m.kind}</span>
            </div>
            <h3 className="m-card-title">{m.title}</h3>
            <p className="m-card-desc">{m.desc}</p>
          </Reveal>
        ))}
      </div>

      <div className="duties-wrapper">
        <Reveal className="sec-head duties-head" variant="slide-up">
          <p className="eyebrow">Công tác trọng tâm</p>
          <h2>Quản lý các cơ sở &amp; dịch vụ</h2>
        </Reveal>
        
        <div className="duty-grid">
          {duties.map((d, idx) => (
            <Reveal className="duty-card-new" variant="scale-up" delay={idx * 150} key={d.title}>
              <div className="duty-icon-indicator">✓</div>
              <div className="duty-info">
                <h3>{d.title}</h3>
                <p>{d.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="partners-section" variant="slide-up" delay={150}>
        <div className="partners-card">
          <p className="partners-eyebrow">Cộng tác phục vụ cùng các ban ngành Hội Thánh</p>
          <div className="partners-chips-grid">
            {partners.map((p) => (
              <span className="partner-chip" key={p}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}

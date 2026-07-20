import Reveal from './Reveal.jsx'
import { board } from '../data/content.js'

export default function Board() {
  return (
    <section className="section" id="ban-dieu-hanh">
      <Reveal className="sec-head">
        <p className="eyebrow">Nhân sự phục vụ</p>
        <h2>Ban Điều Hành Đương Nhiệm</h2>
        <p className="lead">
          Những người trẻ tận tụy, gánh vác các tiểu ban và công việc nhà Chúa nhằm gây dựng cộng đồng vững mạnh.
        </p>
      </Reveal>
      <Reveal className="board-grid">
        {board.map((member, idx) => (
          <div className="board-card" key={member.name}>
            <div className="board-card-inner">
              <div className="board-avatar">
                {/* SVG avatar representing a dedicated servant of Christ */}
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 6C13.93 6 15.5 7.57 15.5 9.5C15.5 11.43 13.93 13 12 13C10.07 13 8.5 11.43 8.5 9.5C8.5 7.57 10.07 6 12 6ZM12 18C9.58 18 7.48 16.77 6.25 14.9C6.28 12.98 10.07 11.92 12 11.92C13.92 11.92 17.72 12.98 17.75 14.9C16.52 16.77 14.42 18 12 18Z" fill="currentColor"/>
                </svg>
                <div className="board-badge">{idx + 1}</div>
              </div>
              <div className="board-info">
                <h3>{member.name}</h3>
                <span className="board-role">{member.role}</span>
                <div className="board-duties">
                  {member.duties.map((duty) => (
                    <span className="board-duty-tag" key={duty}>
                      {duty}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </Reveal>
    </section>
  )
}

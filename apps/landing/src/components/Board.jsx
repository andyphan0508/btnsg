import { board } from "../data/content.js";

/** Chữ cái đầu của tên gọi (từ cuối trong họ tên tiếng Việt). */
const initial = (name) => name.trim().split(/\s+/).pop().charAt(0);

/**
 * Ban Điều Hành: Trưởng Ban chiếm 2 ô + 10 thẻ = 12 ô — khớp đủ lưới 4, 3 và 2 cột.
 */
export default function Board() {
  return (
    <section className="section section-tight">
      <div className="wrap">
        <header className="sec-head">
          <h2>
            Ban Điều Hành <em>đương nhiệm</em>
          </h2>
          <p className="lead">
            Những người trẻ tận tụy gánh vác các tiểu ban và công việc nhà Chúa, cùng gây dựng một
            cộng đồng vững mạnh.
          </p>
        </header>

        <div className="board">
          {board.map((member, i) => (
            <article
              className={`member glass sfx-rise${i === 0 ? " is-lead" : ""}`}
              style={{ "--i": i % 4, "--h": (i * 29 + 12) % 360 }}
              key={member.name}
              data-sheen
            >
              <span className="member-avatar" aria-hidden="true">
                {initial(member.name)}
              </span>
              <div>
                <h3>{member.name}</h3>
                <span className="member-role">{member.role}</span>
                <div className="member-duties">
                  {member.duties.map((duty) => (
                    <span key={duty}>{duty}</span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

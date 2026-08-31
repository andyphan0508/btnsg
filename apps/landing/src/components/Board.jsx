import { UserOutlined } from "@ant-design/icons";
import Reveal from "./Reveal.jsx";
import { board } from "../data/content.js";

export default function Board() {
  return (
    <section className="section" id="ban-dieu-hanh">
      <Reveal className="sec-head">
        <p className="eyebrow">Nhân sự phục vụ</p>
        <h2>Ban Điều Hành Đương Nhiệm</h2>
        <p className="lead">
          Những người trẻ tận tụy, gánh vác các tiểu ban và công việc nhà Chúa
          nhằm gây dựng cộng đồng vững mạnh.
        </p>
      </Reveal>
      <div className="board-grid">
        {board.map((member, idx) => (
          <Reveal
            className="board-card"
            variant="slide-up"
            delay={(idx % 4) * 70}
            key={member.name}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <div className="board-card-inner">
              <div className="board-avatar">
                <UserOutlined />
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
          </Reveal>
        ))}
      </div>
    </section>
  );
}

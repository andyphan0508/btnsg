import {
  CrownOutlined,
  FireOutlined,
  HeartOutlined,
  CompassOutlined,
  ReadOutlined,
  TeamOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import Reveal from "./Reveal.jsx";
import { ministries, duties, partners } from "../data/content.js";

function getMinistryIcon(title) {
  switch (title) {
    case "Bồi linh":
      return <CrownOutlined />;
    case "Truyền giảng":
      return <FireOutlined />;
    case "Công tác xã hội":
      return <HeartOutlined />;
    case "Du lịch – dã ngoại":
      return <CompassOutlined />;
    case "Huấn luyện":
      return <ReadOutlined />;
    case "Họp bạn Thanh Niên":
      return <TeamOutlined />;
    default:
      return <HeartOutlined />;
  }
}

export default function Ministries() {
  return (
    <section className="section" id="muc-vu">
      <Reveal className="sec-head" variant="slide-up">
        <p className="eyebrow">Mục vụ &amp; hoạt động thường niên</p>
        <h2>Được gây dựng để đi ra phục vụ</h2>
        <p className="lead">Các mảng công tác và sinh hoạt giúp thanh niên trưởng thành trong đức tin và gắn kết tình thân.</p>
      </Reveal>

      <div className="grid3-new">
        {ministries.map((m, idx) => (
          <Reveal
            className="m-card-new"
            variant="slide-up"
            delay={idx * 70}
            key={m.title}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
          >
            <div className="m-card-header">
              <div className="m-icon-box">{getMinistryIcon(m.title)}</div>
              <span className="m-kind-badge">{m.kind}</span>
            </div>
            <h3 className="m-card-title">{m.title}</h3>
            <p className="m-card-desc">{m.desc}</p>
          </Reveal>
        ))}
      </div>

      <div className="duties-wrapper" style={{ marginTop: 64 }}>
        <Reveal className="sec-head" variant="slide-up">
          <p className="eyebrow">Công tác trọng tâm</p>
          <h2>Quản lý các cơ sở &amp; dịch vụ</h2>
        </Reveal>

        <div className="duty-grid">
          {duties.map((d, idx) => (
            <Reveal
              className="duty-card-new"
              variant="scale-up"
              delay={idx * 100}
              key={d.title}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <div className="duty-icon-indicator">
                <CheckOutlined />
              </div>
              <div className="duty-info">
                <h3 style={{ fontSize: "1.15rem", fontWeight: 800, marginBottom: 6 }}>{d.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--ink-2)", lineHeight: 1.55 }}>{d.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="partners-section" variant="slide-up" delay={150}>
        <div className="partners-card">
          <p style={{ fontSize: "0.8rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--ink-3)", marginBottom: 16 }}>
            Cộng tác phục vụ cùng các ban ngành Hội Thánh
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {partners.map((p) => (
              <span className="partner-chip" key={p}>
                {p}
              </span>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

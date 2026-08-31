import { Link } from "react-router-dom";
import {
  TeamOutlined,
  BookOutlined,
  CalendarOutlined,
  HeartOutlined,
  FileTextOutlined,
  EnvironmentOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import Reveal from "./Reveal.jsx";

const CARDS = [
  {
    to: "/gioi-thieu",
    icon: <TeamOutlined />,
    title: "Giới thiệu",
    desc: "Hành trình từ Ca đoàn 3 đến Ban Thanh Niên hôm nay hơn 80 năm lịch sử.",
    theme: "theme-lilac",
  },
  {
    to: "/chu-de",
    icon: <BookOutlined />,
    title: "Chủ đề năm",
    desc: "Câu Kinh Thánh gốc và định hướng sinh hoạt trọng tâm của cả năm 2026.",
    theme: "theme-yellow",
  },
  {
    to: "/sinh-hoat",
    icon: <CalendarOutlined />,
    title: "Lịch sinh hoạt",
    desc: "Các buổi nhóm trong tuần — bạn luôn được chào đón bất cứ lúc nào.",
    highlight: "Chúa Nhật 14:30",
    theme: "theme-green",
  },
  {
    to: "/muc-vu",
    icon: <HeartOutlined />,
    title: "Mục vụ",
    desc: "Bồi linh, truyền giảng, công tác xã hội, du lịch dã ngoại và gắn kết.",
    theme: "theme-plum",
  },
  {
    to: "/tin-tuc",
    icon: <FileTextOutlined />,
    title: "Tin tức",
    desc: "Hoạt động, thông báo và các bài viết mới nhất của Ban Thanh Niên.",
    theme: "theme-blue",
  },
  {
    to: "/lien-he",
    icon: <EnvironmentOutlined />,
    title: "Liên hệ",
    desc: "Địa chỉ nhà thờ, bản đồ hướng dẫn và kênh kết nối trực tiếp.",
    theme: "theme-orange",
  },
];

export default function QuickNav() {
  return (
    <section className="section quicknav-section">
      <Reveal className="sec-head" variant="slide-up">
        <p className="eyebrow">Khám phá</p>
        <h2>Bạn muốn tìm hiểu điều gì?</h2>
        <p className="lead">Chọn mục bạn quan tâm để khám phá nhịp sống và sinh hoạt cùng chúng tôi.</p>
      </Reveal>

      <div className="quicknav-grid">
        {CARDS.map((card, idx) => (
          <Reveal
            as={Link}
            to={card.to}
            className={`quicknav-card ${card.theme}`}
            variant="slide-up"
            delay={idx * 60}
            key={card.to}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="quicknav-icon">{card.icon}</span>
            <span className="quicknav-body">
              <span className="quicknav-title">
                {card.title}
                {card.highlight && (
                  <span className="quicknav-badge">{card.highlight}</span>
                )}
              </span>
              <span className="quicknav-desc">{card.desc}</span>
            </span>
            <span className="quicknav-arrow">
              <ArrowRightOutlined />
            </span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

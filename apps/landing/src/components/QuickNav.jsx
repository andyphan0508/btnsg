import { Link } from "react-router-dom";
import {
  FiArrowRight,
  FiBookOpen,
  FiCalendar,
  FiFileText,
  FiHeart,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import Reveal from "./Reveal.jsx";

/** Cửa ngõ tới từng trang — thay cho việc dồn mọi nội dung vào trang chủ. */
const CARDS = [
  {
    to: "/gioi-thieu",
    icon: <FiUsers />,
    title: "Giới thiệu",
    desc: "Hành trình từ Ca đoàn 3 đến Ban Thanh Niên hôm nay.",
  },
  {
    to: "/chu-de",
    icon: <FiBookOpen />,
    title: "Chủ đề năm",
    desc: "Câu gốc và định hướng sinh hoạt của cả năm.",
  },
  {
    to: "/sinh-hoat",
    icon: <FiCalendar />,
    title: "Lịch sinh hoạt",
    desc: "Các buổi nhóm trong tuần — bạn có thể đến bất cứ lúc nào.",
    highlight: "Chúa Nhật 14:30",
  },
  {
    to: "/muc-vu",
    icon: <FiHeart />,
    title: "Mục vụ",
    desc: "Bồi linh, truyền giảng, công tác xã hội, dã ngoại…",
  },
  {
    to: "/tin-tuc",
    icon: <FiFileText />,
    title: "Tin tức",
    desc: "Hoạt động và thông báo mới nhất của Ban.",
  },
  {
    to: "/lien-he",
    icon: <FiMapPin />,
    title: "Liên hệ",
    desc: "Địa chỉ nhà thờ, bản đồ và cách kết nối với chúng tôi.",
  },
];

export default function QuickNav() {
  return (
    <section className="section quicknav-section">
      <Reveal className="sec-head" variant="slide-up">
        <p className="eyebrow">Khám phá</p>
        <h2>Bạn muốn tìm hiểu điều gì?</h2>
      </Reveal>

      <div className="quicknav-grid">
        {CARDS.map((card, idx) => (
          <Reveal
            as={Link}
            to={card.to}
            className="quicknav-card"
            variant="slide-up"
            delay={(idx % 3) * 80}
            key={card.to}
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
            <FiArrowRight className="quicknav-arrow" />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

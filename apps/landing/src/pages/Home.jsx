import { Link } from "react-router-dom";
import { PiArrowRight } from "react-icons/pi";
import Hero from "../components/Hero.jsx";
import MarqueeStrip from "../components/MarqueeStrip.jsx";
import ScrubText from "../components/ScrubText.jsx";
import InkPill from "../components/InkPill.jsx";
import Bento from "../components/Bento.jsx";
import Ministries from "../components/Ministries.jsx";
import Schedule from "../components/Schedule.jsx";
import MomentsRing from "../components/MomentsRing.jsx";
import FinalCta from "../components/FinalCta.jsx";
import { marquee } from "../data/content.js";
import logoImg from "../assets/logobtnsg.jpg";

/**
 * Trang chủ theo mạch AIDA: Hero → băng chữ → tuyên ngôn sáng dần theo cuộn → bento →
 * accordion mục vụ → chồng thẻ lịch tuần → vòng ảnh 3D → lời mời Chúa Nhật.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <MarqueeStrip rows={marquee} />
      <main>
        <section className="section manifesto">
          <div className="wrap">
            <ScrubText
              className="manifesto-text"
              parts={[
                "Ban Thanh Niên",
                { node: <InkPill src={logoImg} size="78%" className="is-logo" /> },
                "là mái nhà của những người trẻ cùng",
                { hl: "thờ phượng Chúa," },
                "học Lời Ngài, nâng đỡ nhau qua từng mùa của cuộc sống và phục vụ bằng âm nhạc, truyền giảng, thiện nguyện — với một sứ mệnh:",
                { hl: "tất cả vì người chưa được cứu." },
              ]}
            />
            <Link className="text-link manifesto-link" to="/gioi-thieu">
              Đọc câu chuyện hơn 80 năm <PiArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>
        <Bento />
        <Ministries />
        <Schedule />
        <MomentsRing />
        <FinalCta />
      </main>
    </>
  );
}

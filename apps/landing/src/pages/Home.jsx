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
import { content } from "../lib/siteContent.js";
import { scrubParts } from "../lib/rich.jsx";
import logoImg from "../assets/logobtnsg.webp";

/**
 * Trang chủ theo mạch AIDA: Hero → băng chữ → tuyên ngôn sáng dần theo cuộn → bento →
 * accordion mục vụ → chồng thẻ lịch tuần → vòng ảnh 3D → lời mời Chúa Nhật.
 */
export default function Home() {
  const { home, marquee } = content;

  return (
    <>
      <Hero />
      <MarqueeStrip rows={[marquee.row1, marquee.row2]} />
      <main>
        <section className="section manifesto">
          <div className="wrap">
            <ScrubText
              className="manifesto-text"
              parts={scrubParts(home.manifesto, {
                logo: <InkPill src={logoImg} size="78%" className="is-logo" />,
              })}
            />
            <Link className="text-link manifesto-link" to="/gioi-thieu">
              {home.manifestoLink} <PiArrowRight aria-hidden="true" />
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

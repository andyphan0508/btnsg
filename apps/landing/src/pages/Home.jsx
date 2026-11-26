import { Fragment } from "react";
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
import CustomBlocks from "../components/CustomBlocks.jsx";
import FinalCta from "../components/FinalCta.jsx";
import { content } from "../lib/siteContent.js";
import { scrubParts } from "../lib/rich.jsx";
import logoImg from "../assets/logobtnsg.webp";

const DEFAULT_ORDER = [
  { id: "hero", visible: true },
  { id: "marquee", visible: true },
  { id: "manifesto", visible: true },
  { id: "bento", visible: true },
  { id: "ministries", visible: true },
  { id: "schedule", visible: true },
  { id: "ring", visible: true },
  { id: "custom", visible: true },
  { id: "cta", visible: true },
];

/**
 * Trang chủ: thứ tự và trạng thái ẩn/hiện các khối được điều khiển trực tiếp từ Dashboard → Cấu trúc web.
 */
export default function Home() {
  const { home, marquee, homeSections } = content;
  const sections = (Array.isArray(homeSections) && homeSections.length > 0 ? homeSections : DEFAULT_ORDER).filter(
    (s) => s.visible !== false,
  );

  const renderSection = (id) => {
    switch (id) {
      case "hero":
        return <Hero />;
      case "marquee":
        return <MarqueeStrip rows={[marquee.row1, marquee.row2]} />;
      case "manifesto":
        return (
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
        );
      case "bento":
        return <Bento />;
      case "ministries":
        return <Ministries />;
      case "schedule":
        return <Schedule />;
      case "ring":
        return <MomentsRing />;
      case "custom":
        return <CustomBlocks page="home" />;
      case "cta":
        return <FinalCta />;
      default:
        return null;
    }
  };

  return (
    <main>
      {sections.map((section, idx) => (
        <Fragment key={`${section.id}-${idx}`}>{renderSection(section.id)}</Fragment>
      ))}
    </main>
  );
}

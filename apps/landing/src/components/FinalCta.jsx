import { PiArrowUpRight, PiChatCircleDots, PiClock, PiMapPin } from "react-icons/pi";
import Rays from "./Rays.jsx";
import InkPill from "./InkPill.jsx";
import RollText from "./RollText.jsx";
import { content, heroImage } from "../lib/siteContent.js";
import { Rich } from "../lib/rich.jsx";
import { openContactPanel } from "../lib/contact.js";
import { mapLinks } from "../lib/map.js";
import logoImg from "../assets/logobtnsg.webp";

/** Lời mời cuối trang: mặt trời mọc sau tiêu đề lớn, hai hành động rõ ràng. */
export default function FinalCta() {
  const { home, general, church } = content;

  return (
    <section className="section final-cta">
      <div className="final-glow sfx-sunrise" aria-hidden="true" />
      <Rays className="final-rays" />
      <div className="wrap">
        <h2 className="final-title sfx-tilt">
          <Rich
            text={home.ctaTitle}
            tokens={{
              anh: <InkPill src={heroImage()} position="30% 70%" size="300%" />,
              logo: <InkPill src={logoImg} size="78%" className="is-logo" />,
            }}
          />
        </h2>
        <p className="final-meta">
          <span>
            <PiClock aria-hidden="true" /> {general.meeting}
          </span>
          <span>
            <PiMapPin aria-hidden="true" /> {church.room}
          </span>
        </p>
        <div className="final-actions">
          <a className="btn btn-sun" href={mapLinks(church).directions} target="_blank" rel="noopener noreferrer">
            <RollText text="Chỉ đường đến nhà thờ" />
            <span className="btn-icon">
              <PiArrowUpRight />
            </span>
          </a>
          <button type="button" className="btn btn-glass" onClick={openContactPanel}>
            <PiChatCircleDots aria-hidden="true" />
            <RollText text="Nhắn tin cho Ban" />
          </button>
        </div>
      </div>
    </section>
  );
}

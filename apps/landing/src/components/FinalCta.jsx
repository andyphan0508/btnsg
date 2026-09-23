import { PiArrowUpRight, PiChatCircleDots, PiClock, PiMapPin } from "react-icons/pi";
import Rays from "./Rays.jsx";
import InkPill from "./InkPill.jsx";
import RollText from "./RollText.jsx";
import { church } from "../data/content.js";
import { openContactPanel } from "../lib/contact.js";
import groupPhoto from "../assets/background.jpg";

/** Lời mời cuối trang: mặt trời mọc sau tiêu đề lớn, hai hành động rõ ràng. */
export default function FinalCta() {
  return (
    <section className="section final-cta">
      <div className="final-glow sfx-sunrise" aria-hidden="true" />
      <Rays className="final-rays" />
      <div className="wrap">
        <h2 className="final-title sfx-tilt">
          Hẹn gặp bạn <InkPill src={groupPhoto} position="30% 70%" size="300%" /> Chúa Nhật
          này.
        </h2>
        <p className="final-meta">
          <span>
            <PiClock aria-hidden="true" /> 14:30 mỗi Chúa Nhật
          </span>
          <span>
            <PiMapPin aria-hidden="true" /> {church.room}
          </span>
        </p>
        <div className="final-actions">
          <a className="btn btn-sun" href={church.directions} target="_blank" rel="noopener noreferrer">
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

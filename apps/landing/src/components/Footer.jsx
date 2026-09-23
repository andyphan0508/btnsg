import { Link } from "react-router-dom";
import {
  PiArrowUp,
  PiArrowUpRight,
  PiChatCircleDots,
  PiFacebookLogo,
  PiGlobe,
  PiYoutubeLogo,
} from "react-icons/pi";
import PushToggle from "./PushToggle.jsx";
import RollText from "./RollText.jsx";
import { site, nav, links, church } from "../data/content.js";
import { openContactPanel } from "../lib/contact.js";
import { scrollToTop } from "../lib/scroll.js";
import logoImg from "../assets/logobtnsg.jpg";

const LINK_ICONS = { facebook: PiFacebookLogo, youtube: PiYoutubeLogo, web: PiGlobe };

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <img src={logoImg} alt="" className="footer-logo" />
          <p>
            Ban Thanh Niên — Hội Thánh Tin Lành Việt Nam, Chi Hội Sài Gòn. Đồng hành cùng người
            trẻ thành phố từ năm 1942.
          </p>
          <p className="footer-mission">{site.mission}</p>
        </div>

        <nav className="footer-col" aria-label="Khám phá">
          <h3>Khám phá</h3>
          <ul>
            {nav.map((item) => (
              <li key={item.to}>
                <Link to={item.to}>
                  <RollText text={item.label} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer-col">
          <h3>Kết nối</h3>
          <ul>
            {links.map((l) => {
              const Icon = LINK_ICONS[l.icon];
              return (
                <li key={l.href}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label}>
                    <Icon aria-hidden="true" />
                    <RollText text={l.short} />
                    <PiArrowUpRight className="footer-ext" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
            <li>
              <button type="button" onClick={openContactPanel}>
                <PiChatCircleDots aria-hidden="true" />
                <RollText text="Nhắn tin cho Ban" />
              </button>
            </li>
          </ul>
        </div>

        <div className="footer-col">
          <h3>Ghé thăm</h3>
          <p className="footer-visit">
            <strong>Chúa Nhật · 14:30</strong>
            {church.room}
          </p>
          <PushToggle />
        </div>
      </div>

      <div className="footer-mark-wrap" aria-hidden="true">
        <span className="footer-mark sfx-stand">Ban Thanh Niên</span>
      </div>

      <div className="wrap footer-bottom">
        <p>© {new Date().getFullYear()} Ban Thanh Niên HTTL Sài Gòn.</p>
        <button type="button" className="btn btn-glass btn-sm" onClick={() => scrollToTop({ smooth: true })}>
          <RollText text="Lên đầu trang" />
          <PiArrowUp aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";
import { PiArrowUp, PiArrowUpRight, PiChatCircleDots } from "react-icons/pi";
import PushToggle from "./PushToggle.jsx";
import RollText from "./RollText.jsx";
import { nav } from "../lib/nav.js";
import { iconFor } from "../lib/icons.js";
import { content } from "../lib/siteContent.js";
import { openContactPanel } from "../lib/contact.js";
import { scrollToTop } from "../lib/scroll.js";
import logoImg from "../assets/logobtnsg.webp";

export default function Footer() {
  const { general, links, church } = content;

  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <img src={logoImg} alt="" className="footer-logo" />
          <p>{general.footerAbout}</p>
          <p className="footer-mission">{general.mission}</p>
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
            {links.map((l, i) => {
              const Icon = iconFor(l.icon);
              return (
                <li key={i}>
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
            <strong>{general.meeting}</strong>
            {church.room}
          </p>
          <PushToggle />
        </div>
      </div>

      <div className="footer-mark-wrap" aria-hidden="true">
        <span className="footer-mark sfx-stand">{general.brand}</span>
      </div>

      <div className="wrap footer-bottom">
        <p>
          © {new Date().getFullYear()} {general.brand} {general.brandCity}.
        </p>
        <button type="button" className="btn btn-glass btn-sm" onClick={() => scrollToTop({ smooth: true })}>
          <RollText text="Lên đầu trang" />
          <PiArrowUp aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}

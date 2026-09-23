import {
  PiArrowUpRight,
  PiChatCircleDots,
  PiFacebookLogo,
  PiGlobe,
  PiMapPin,
  PiYoutubeLogo,
} from "react-icons/pi";
import RollText from "./RollText.jsx";
import { church, contacts, links } from "../data/content.js";
import { openContactPanel } from "../lib/contact.js";

const LINK_ICONS = { facebook: PiFacebookLogo, youtube: PiYoutubeLogo, web: PiGlobe };

export default function Contact() {
  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <h2>
            Ghé thăm &amp; <em>kết nối</em>
          </h2>
          <p className="lead">
            Muốn nhắn tin cho chúng tôi? Bấm nút tin nhắn ở góc phải màn hình để gửi lời nhắn hoặc
            đăng ký tham gia.
          </p>
        </header>

        <div className="contact-grid">
          <div className="contact-list">
            {contacts.map((c, i) => (
              <article className="contact-card glass sfx-rise" style={{ "--i": i }} key={c.title} data-sheen>
                <span className="icon-tile">
                  <PiMapPin />
                </span>
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              </article>
            ))}

            <article className="contact-card glass sfx-rise" style={{ "--i": 2 }}>
              <span className="icon-tile">
                <PiGlobe />
              </span>
              <div className="contact-follow">
                <h3>Theo dõi chúng tôi</h3>
                <ul className="contact-links">
                  {links.map((l) => {
                    const Icon = LINK_ICONS[l.icon];
                    return (
                      <li key={l.href}>
                        <a href={l.href} target="_blank" rel="noopener noreferrer">
                          <Icon aria-hidden="true" />
                          <RollText text={l.label} />
                          <PiArrowUpRight className="contact-ext" aria-hidden="true" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
                <button type="button" className="btn btn-sun btn-sm" onClick={openContactPanel}>
                  <PiChatCircleDots aria-hidden="true" />
                  <RollText text="Gửi lời nhắn cho Ban" />
                </button>
              </div>
            </article>
          </div>

          <div className="map-card glass sfx-rise" style={{ "--i": 1 }}>
            <div className="map-frame">
              <iframe
                title="Bản đồ Nhà thờ Tin Lành Sài Gòn — 155 Trần Hưng Đạo, Quận 1"
                src={church.mapEmbed}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="map-foot">
              <div>
                <strong>{church.name}</strong>
                <span>{church.address}</span>
              </div>
              <a className="btn btn-sun" href={church.directions} target="_blank" rel="noopener noreferrer">
                <RollText text="Chỉ đường" />
                <span className="btn-icon">
                  <PiArrowUpRight />
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

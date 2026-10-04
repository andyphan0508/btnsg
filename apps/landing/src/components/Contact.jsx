import { PiArrowUpRight, PiChatCircleDots, PiGlobe, PiMapPin } from "react-icons/pi";
import RollText from "./RollText.jsx";
import { iconFor } from "../lib/icons.js";
import { content } from "../lib/siteContent.js";
import { mapLinks } from "../lib/map.js";
import { Rich } from "../lib/rich.jsx";
import { openContactPanel } from "../lib/contact.js";

export default function Contact() {
  const { contactPage, contacts, links, church } = content;
  const map = mapLinks(church);

  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <h2>
            <Rich text={contactPage.title} />
          </h2>
          <p className="lead">{contactPage.lead}</p>
        </header>

        <div className="contact-grid">
          <div className="contact-list">
            {contacts.map((c, i) => (
              <article className="contact-card glass sfx-rise" style={{ "--i": i }} key={i} data-sheen>
                <span className="icon-tile">
                  <PiMapPin />
                </span>
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.desc}</p>
                </div>
              </article>
            ))}

            <article className="contact-card glass sfx-rise" style={{ "--i": contacts.length }}>
              <span className="icon-tile">
                <PiGlobe />
              </span>
              <div className="contact-follow">
                <h3>{contactPage.followTitle}</h3>
                <ul className="contact-links">
                  {links.map((l, i) => {
                    const Icon = iconFor(l.icon);
                    return (
                      <li key={i}>
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
                title={`Bản đồ ${church.name} — ${church.address}`}
                src={map.embed}
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
              <a className="btn btn-sun" href={map.directions} target="_blank" rel="noopener noreferrer">
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

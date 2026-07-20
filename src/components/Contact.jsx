import Reveal from './Reveal.jsx'
import { contacts, links } from '../data/content.js'

export default function Contact() {
  return (
    <section className="section" id="lien-he">
      <Reveal className="sec-head">
        <p className="eyebrow">Kết nối &amp; liên hệ</p>
        <h2>Hẹn gặp bạn Chúa Nhật này</h2>
      </Reveal>
      <Reveal className="contact">
        {contacts.map((c) => (
          <div className="c-card" key={c.title}>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </div>
        ))}
        <div className="c-card">
          <h3>Theo dõi chúng tôi</h3>
          <ul className="c-links">
            {links.map((l) => (
              <li key={l.href}>
                <a href={l.href} target="_blank" rel="noopener noreferrer">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Reveal>
    </section>
  )
}

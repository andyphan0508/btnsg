import Reveal from './Reveal.jsx'
import { themeYear } from '../data/content.js'

export default function ThemeYear() {
  return (
    <section className="section" id="chu-de">
      <Reveal className="theme-card-wrapper" variant="scale-up">
        <div className="theme-panel-new">
          <div className="theme-left">
            <span className="theme-eyebrow-badge">{themeYear.eyebrow}</span>
            <h2 className="theme-title-glow">{themeYear.title}</h2>
            <div className="theme-divider" />
            <p className="theme-song">
              <span className="music-note-icon">🎵</span> Bài hát khẩu hiệu: <b>{themeYear.song}</b>
            </p>
          </div>
          <div className="theme-right">
            <blockquote className="verse-gold-box">
              <div className="quote-mark-start">“</div>
              <p className="verse-text">{themeYear.verse}</p>
              <cite className="verse-ref">{themeYear.ref}</cite>
              <div className="quote-mark-end">”</div>
            </blockquote>
          </div>
        </div>
        {/* Decorative corner trims */}
        <div className="corner-trim trim-tl" />
        <div className="corner-trim trim-tr" />
        <div className="corner-trim trim-bl" />
        <div className="corner-trim trim-br" />
      </Reveal>
      <Reveal as="p" className="theme-note" variant="fade" delay={300}>
        {themeYear.note}
      </Reveal>
    </section>
  )
}

import Reveal from './Reveal.jsx'
import { themeYear } from '../data/content.js'

export default function ThemeYear() {
  return (
    <section className="section" id="chu-de">
      <Reveal className="theme-panel">
        <div>
          <p className="eyebrow">{themeYear.eyebrow}</p>
          <h2 className="theme-title">{themeYear.title}</h2>
          <p className="theme-song">
            Bài hát khẩu hiệu · <b>{themeYear.song}</b>
          </p>
        </div>
        <blockquote className="verse">
          <p>{themeYear.verse}</p>
          <cite>{themeYear.ref}</cite>
        </blockquote>
      </Reveal>
      <Reveal as="p" className="theme-note">
        {themeYear.note}
      </Reveal>
    </section>
  )
}

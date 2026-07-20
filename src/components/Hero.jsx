import { site, heroMeta } from '../data/content.js'

export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="hero-in">
        <p className="eyebrow">{site.church}</p>
        <h1>{site.title}</h1>
        <p className="hero-tag">{site.tagline}</p>
        <div className="mission">{site.mission}</div>
        <div className="hero-cta">
          <a className="btn btn-gold" href="#sinh-hoat">
            Tham gia sinh hoạt
          </a>
          <a className="btn btn-ghost" href={site.facebook} target="_blank" rel="noopener noreferrer">
            Fanpage Facebook
          </a>
        </div>
        <div className="hero-meta">
          {heroMeta.map((m) => (
            <span key={m.strong}>
              {m.pre} <b>{m.strong}</b>
            </span>
          ))}
        </div>
        <div className="hero-year" aria-hidden="true">
          1942
        </div>
      </div>
    </header>
  )
}

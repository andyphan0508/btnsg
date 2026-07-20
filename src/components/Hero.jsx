import { site, heroMeta } from '../data/content.js'
import logoImg from '../assets/logobtnsg.jpg'

export default function Hero() {
  return (
    <header className="hero" id="top">
      {/* Dynamic floating light blobs in the background */}
      <div className="hero-orbs">
        <div className="hero-orb orb-1"></div>
        <div className="hero-orb orb-2"></div>
        <div className="hero-orb orb-3"></div>
      </div>
      
      <div className="hero-in hero-split">
        <div className="hero-content">
          <p className="eyebrow hero-church-badge">
            <span className="church-icon">⛪</span> {site.church}
          </p>
          <h1 className="hero-title-main">
            {site.title}
            <span className="hero-accent-text" style={{ whiteSpace: 'nowrap' }}> Sài Gòn</span>
          </h1>
          <p className="hero-tag">{site.tagline}</p>
          
          <div className="mission-wrapper">
            <div className="mission">{site.mission}</div>
          </div>
          
          <div className="hero-cta">
            <a className="btn btn-gold btn-glowing" href="#sinh-hoat">
              Tham gia sinh hoạt <span className="arrow-right">→</span>
            </a>
            <a className="btn btn-ghost btn-glass" href={site.facebook} target="_blank" rel="noopener noreferrer">
              Fanpage Facebook
            </a>
          </div>
          
          <div className="hero-meta">
            {heroMeta.map((m) => (
              <span className="hero-meta-item" key={m.strong}>
                {m.pre} <b>{m.strong}</b>
              </span>
            ))}
          </div>
        </div>

        {/* Visual side: Logo on an interactive 3D glass panel */}
        <div className="hero-visual">
          <div className="logo-card-container">
            <div className="logo-glass-card">
              <div className="glass-card-reflection" />
              <img src={logoImg} alt="Ban Thanh Niên HTTL Sài Gòn Logo" className="logo-card-img" />
              <div className="logo-card-glow" />
            </div>
            {/* Pulsing halo behind the card */}
            <div className="logo-halo" />
          </div>
        </div>
        
        <div className="hero-year" aria-hidden="true">
          1942
        </div>
      </div>
    </header>
  )
}

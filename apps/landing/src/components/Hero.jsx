import { useEffect, useRef } from "react";
import { FiBookOpen, FiArrowRight } from "react-icons/fi";
import { FaChurch, FaFacebookF, FaFire } from "react-icons/fa6";
import { site, heroMeta } from "../data/content.js";
import logoImg from "../assets/logobtnsg.jpg";
import { assets } from "../assets/index.ts";

/**
 * Ảnh nền hero có parallax: lớp ảnh trượt chậm hơn nội dung khi cuộn
 * (tạo chiều sâu) + hiệu ứng ánh sáng dịu.
 */
function HeroBackdrop() {
  const layerRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;

    const el = layerRef.current;
    const onScroll = () => {
      const y = Math.min(window.scrollY, window.innerHeight * 1.5);
      if (el) el.style.transform = `translate3d(0, ${y * 0.28}px, 0)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="hero-bg" aria-hidden="true">
      <div className="hero-bg-layer" ref={layerRef}>
        <img
          className="hero-bg-img"
          src={assets.images.background}
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </div>
      <div className="hero-bg-veil" />
      <div className="hero-light-beams" />
    </div>
  );
}

export default function Hero() {
  return (
    <header className="hero" id="top">
      <HeroBackdrop />

      {/* Dynamic floating light ambient orbs */}
      <div className="hero-orbs" aria-hidden="true">
        <div className="hero-orb orb-1"></div>
        <div className="hero-orb orb-2"></div>
        <div className="hero-orb orb-3"></div>
      </div>

      <div className="hero-in hero-split">
        {/* Left narrative content */}
        <div className="hero-content">
          {/* Church Badge */}
          <p className="eyebrow hero-church-badge">
            <FaChurch style={{ marginRight: 6 }} /> {site.church}
          </p>

          {/* Main Title */}
          <h1 className="hero-title-main">
            <span>{site.title}</span>{" "}
            <span className="hero-accent-text" style={{ whiteSpace: "nowrap" }}>
              Sài Gòn
            </span>
          </h1>

          {/* Tagline */}
          <p className="hero-tag">
            {site.tagline}
          </p>

          {/* Sứ mệnh Box */}
          <div className="hero-mission-box">
            <FaFire className="hero-mission-icon" />
            <span className="hero-mission-title">SỨ MỆNH:</span>
            <span className="hero-mission-text">{site.mission}</span>
          </div>

          {/* CTA Group */}
          <div className="hero-cta">
            <a className="btn btn-gold btn-glowing" href="#sinh-hoat">
              <span>Tham gia sinh hoạt</span>
              <FiArrowRight className="arrow-right" />
            </a>
            <a className="btn btn-ghost btn-glass" href="#chu-de">
              <FiBookOpen className="btn-icon" />
              <span>Chủ đề 2026</span>
            </a>
            <a
              className="btn btn-glass btn-icon-only"
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              title="Fanpage Facebook"
              aria-label="Fanpage Facebook"
            >
              <FaFacebookF size={18} />
            </a>
          </div>

          {/* Clean Meta Info */}
          <div className="hero-meta">
            {heroMeta.map((m) => (
              <span className="hero-meta-item" key={m.strong}>
                {m.pre} <b>{m.strong}</b>
              </span>
            ))}
          </div>
        </div>

        {/* Right Visual Stage — Elegant 3D Glass Medallion */}
        <div className="hero-visual">
          <div className="logo-card-container">
            <div className="logo-glass-card">
              <img
                src={logoImg}
                alt="Ban Thanh Niên HTTL Sài Gòn Logo"
                className="logo-card-img"
              />
            </div>
            <div className="logo-halo" />
          </div>
        </div>

        {/* Background Watermark Year */}
        <div className="hero-year" aria-hidden="true">
          1942
        </div>
      </div>
    </header>
  );
}

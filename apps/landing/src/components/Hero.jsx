import { useEffect, useRef } from "react";
import { site, heroMeta } from "../data/content.js";
import logoImg from "../assets/logobtnsg.jpg";
import { assets } from "../assets/index.js";

/**
 * Ảnh nền hero có parallax: lớp ảnh trượt chậm hơn nội dung khi cuộn
 * (tạo chiều sâu) + zoom chầm chậm liên tục. Ảnh là asset tĩnh đã bundle
 * sẵn nên hiển thị ngay, không chờ mạng.
 */
function HeroBackdrop() {
  const layerRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;

    const el = layerRef.current;
    // Trình duyệt hiện đại đã gộp sự kiện scroll theo nhịp khung hình,
    // set transform trực tiếp là đủ mượt và chạy được cả khi rAF bị throttle.
    const onScroll = () => {
      // Lớp ảnh dịch xuống ~28% quãng cuộn → di chuyển chậm hơn nội dung.
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
          fetchpriority="high"
          decoding="async"
        />
      </div>
      <div className="hero-bg-veil" />
    </div>
  );
}

export default function Hero() {
  return (
    <header className="hero" id="top">
      <HeroBackdrop />
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
            <span>{site.title}</span>{" "}
            <span className="hero-accent-text" style={{ whiteSpace: "nowrap" }}>
              Sài Gòn
            </span>
          </h1>

          <div className="hero-cta">
            <a className="btn btn-gold btn-glowing" href="#sinh-hoat">
              Tham gia sinh hoạt <span className="arrow-right">→</span>
            </a>
            <a
              className="btn btn-ghost btn-glass"
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
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
              <img
                src={logoImg}
                alt="Ban Thanh Niên HTTL Sài Gòn Logo"
                className="logo-card-img"
              />
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
  );
}

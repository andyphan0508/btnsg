import { useEffect, useRef } from "react";
import { FiBookOpen, FiClock, FiMapPin, FiUsers, FiArrowRight } from "react-icons/fi";
import { FaChurch, FaFacebookF, FaFire } from "react-icons/fa6";
import { site, themeYear } from "../data/content.js";
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
          {/* Live Heartbeat Status Badge */}
          <div className="hero-status-pill">
            <span className="status-ping">
              <span className="status-ping-dot"></span>
              <span className="status-ping-wave"></span>
            </span>
            <span className="status-church">
              <FaChurch style={{ marginRight: 6, verticalAlign: "middle" }} /> Chi Hội Sài Gòn
            </span>
            <span className="status-sep">•</span>
            <span className="status-tag">Thắp Sáng Niềm Tin Từ 1942</span>
          </div>

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
        </div>

        {/* Right Visual Stage — 3D Glass Medallion & Interactive Floating Cards */}
        <div className="hero-visual">
          <div className="hero-stage">
            {/* Pulsing halo behind main card */}
            <div className="stage-halo" />

            {/* Central Medallion */}
            <div className="logo-card-container">
              <div className="logo-glass-card">
                <img
                  src={logoImg}
                  alt="Ban Thanh Niên HTTL Sài Gòn Logo"
                  className="logo-card-img"
                />
              </div>
            </div>

            {/* Floating Glass Card 1: Worship Schedule */}
            <div className="floating-card float-card-worship">
              <div className="float-card-icon">
                <FaChurch />
              </div>
              <div className="float-card-info">
                <span className="float-card-label">Thờ phượng Chúa Nhật</span>
                <strong className="float-card-val">14:30 Hàng Tuần</strong>
                <span className="float-card-sub">Lầu 2, 161 Đề Thám, Q.1</span>
              </div>
            </div>

            {/* Floating Glass Card 2: Theme Year 2026 */}
            <div className="floating-card float-card-theme">
              <div className="float-card-badge">CHỦ ĐỀ 2026</div>
              <div className="float-card-title">{themeYear.title}</div>
              <div className="float-card-verse">"{themeYear.ref}"</div>
            </div>

            {/* Floating Glass Card 3: Community Stat */}
            <div className="floating-card float-card-stat">
              <div className="float-stat-num">200+</div>
              <div className="float-stat-desc">Ban viên gắn kết & sinh hoạt</div>
            </div>
          </div>
        </div>

        {/* Background Watermark Year */}
        <div className="hero-year" aria-hidden="true">
          1942
        </div>
      </div>

      {/* Hero Dock Bar: Quick Info at the bottom of hero */}
      <div className="hero-dock-wrap">
        <div className="hero-dock">
          <div className="dock-item">
            <FaChurch className="dock-icon" />
            <div className="dock-text">
              <strong>Chi Hội Sài Gòn</strong>
              <span>Từ năm 1942</span>
            </div>
          </div>
          <div className="dock-divider"></div>
          <div className="dock-item">
            <FiClock className="dock-icon" />
            <div className="dock-text">
              <strong>14:30 Chúa Nhật</strong>
              <span>Buổi nhóm thờ phượng</span>
            </div>
          </div>
          <div className="dock-divider"></div>
          <div className="dock-item">
            <FiMapPin className="dock-icon" />
            <div className="dock-text">
              <strong>161 Đề Thám, Q.1</strong>
              <span>Phòng Nhóm Lầu 2</span>
            </div>
          </div>
          <div className="dock-divider"></div>
          <div className="dock-item">
            <FiUsers className="dock-icon" />
            <div className="dock-text">
              <strong>5+ Tiểu Ban</strong>
              <span>Phục vụ & Mục vụ</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

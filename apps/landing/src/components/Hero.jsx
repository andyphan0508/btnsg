import { Link } from "react-router-dom";
import {
  BankOutlined,
  ArrowRightOutlined,
  BookOutlined,
  FacebookFilled,
  FireOutlined,
} from "@ant-design/icons";
import { motion } from "motion/react";
import { site, heroMeta } from "../data/content.js";
import logoImg from "../assets/logobtnsg.jpg";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  return (
    <header className="hero" id="top">
      <div className="hero-in hero-split">
        {/* Left narrative content */}
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Church Badge */}
          <motion.p className="eyebrow hero-church-badge" variants={itemVariants}>
            <BankOutlined style={{ marginRight: 6, fontSize: 15 }} /> {site.church}
          </motion.p>

          {/* Main Title */}
          <motion.h1 className="hero-title-main" variants={itemVariants}>
            <span>{site.title}</span>{" "}
            <span className="hero-accent-text" style={{ whiteSpace: "nowrap" }}>
              Sài Gòn
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p className="hero-tag" variants={itemVariants}>
            {site.tagline}
          </motion.p>

          {/* Handwritten Annotation */}
          <motion.div className="hero-handwritten-note" variants={itemVariants}>
            ✦ Mái nhà yêu thương &amp; nơi kết nối những câu chuyện đáng nhớ
          </motion.div>

          {/* Sứ mệnh Box */}
          <motion.div className="hero-mission-box" variants={itemVariants}>
            <FireOutlined className="hero-mission-icon" />
            <span className="hero-mission-title">SỨ MỆNH:</span>
            <span className="hero-mission-text">{site.mission}</span>
          </motion.div>

          {/* CTA Group: Aardvark Split Button */}
          <motion.div className="hero-cta" variants={itemVariants}>
            <Link className="btn-aardvark" to="/sinh-hoat">
              <span className="btn-text-part">Tham gia sinh hoạt</span>
              <span className="btn-icon-part">
                <ArrowRightOutlined />
              </span>
            </Link>

            <Link className="btn-pill-ghost" to="/chu-de">
              <BookOutlined style={{ fontSize: 16 }} />
              <span>Chủ đề 2026</span>
            </Link>

            <a
              className="btn btn-ghost btn-icon-only"
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              title="Fanpage Facebook"
              aria-label="Fanpage Facebook"
            >
              <FacebookFilled style={{ fontSize: 18, color: "#1877f2" }} />
            </a>
          </motion.div>

          {/* Clean Meta Info */}
          <motion.div className="hero-meta" variants={itemVariants}>
            {heroMeta.map((m) => (
              <span className="hero-meta-item" key={m.strong}>
                {m.pre} <b>{m.strong}</b>
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Right Visual Stage — Aardvark Tactile Box Card */}
        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        >
          <div className="logo-card-container">
            <div className="logo-glass-card">
              <img
                src={logoImg}
                alt="Ban Thanh Niên HTTL Sài Gòn Logo"
                className="logo-card-img"
              />
            </div>
          </div>
        </motion.div>

        {/* Background Watermark Year */}
        <div className="hero-year" aria-hidden="true">
          1942
        </div>
      </div>
    </header>
  );
}

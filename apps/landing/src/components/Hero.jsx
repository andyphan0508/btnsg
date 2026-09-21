import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  BankOutlined,
  ArrowRightOutlined,
  BookOutlined,
  FacebookFilled,
  FireOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  StarFilled,
} from "@ant-design/icons";
import { motion, useMotionValue, useTransform, useSpring } from "motion/react";
import { site, heroMeta } from "../data/content.js";
import logoImg from "../assets/logobtnsg.jpg";
import RollText from "./RollText.jsx";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Hero() {
  const cardRef = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 180, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 180, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <header className="hero" id="top">
      {/* Background Ambient Warm Glow */}
      <div className="hero-bg-shapes" aria-hidden="true">
        <div className="hero-glow-circle" />
      </div>

      <div className="hero-in hero-split">
        {/* Left Narrative Column */}
        <motion.div
          className="hero-content"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Church Badge */}
          <motion.div className="hero-badge-wrap" variants={itemVariants}>
            <span className="hero-church-badge">
              <BankOutlined style={{ fontSize: 14, color: "var(--brand)" }} />
              <span>{site.church}</span>
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1 className="hero-title-main" variants={itemVariants}>
            <span className="hero-title-line">Ban Thanh Niên</span>
            <span className="hero-accent-text">Sài Gòn</span>
          </motion.h1>

          {/* Tagline */}
          <motion.p className="hero-tag" variants={itemVariants}>
            {site.tagline}
          </motion.p>

          {/* Handwritten Annotation */}
          <motion.div className="hero-handwritten-note" variants={itemVariants}>
            <StarFilled style={{ color: "var(--color-yellow-dark)", fontSize: 13 }} />
            <span>Mái nhà yêu thương &amp; nơi kết nối những câu chuyện đáng nhớ</span>
          </motion.div>

          {/* Sứ mệnh Ribbon */}
          <motion.div className="hero-mission-box" variants={itemVariants}>
            <div className="hero-mission-badge">
              <FireOutlined className="hero-mission-icon" />
              <span>SỨ MỆNH</span>
            </div>
            <span className="hero-mission-text">{site.mission}</span>
          </motion.div>

          {/* CTA Action Group */}
          <motion.div className="hero-cta" variants={itemVariants}>
            <Link className="btn-aardvark hero-btn-main" to="/sinh-hoat">
              <span className="btn-text-part">
                <RollText text="Tham gia sinh hoạt" />
              </span>
              <span className="btn-icon-part">
                <ArrowRightOutlined />
              </span>
            </Link>

            <Link className="btn-pill-ghost hero-btn-sub" to="/chu-de">
              <BookOutlined style={{ fontSize: 16 }} />
              <RollText text="Chủ đề 2026" />
            </Link>

            <a
              className="btn btn-ghost btn-icon-only hero-fb-btn"
              href={site.facebook}
              target="_blank"
              rel="noopener noreferrer"
              title="Fanpage Facebook"
              aria-label="Fanpage Facebook"
            >
              <FacebookFilled style={{ fontSize: 18, color: "#1877f2" }} />
            </a>
          </motion.div>

          {/* Ticket Info Cards */}
          <motion.div className="hero-meta-tickets" variants={itemVariants}>
            <div className="hero-ticket-card">
              <ClockCircleOutlined className="hero-ticket-icon" />
              <div>
                <span className="hero-ticket-label">Thờ phượng</span>
                <strong className="hero-ticket-val">14:30 Chúa Nhật</strong>
              </div>
            </div>

            <div className="hero-ticket-card">
              <EnvironmentOutlined className="hero-ticket-icon" />
              <div>
                <span className="hero-ticket-label">Địa điểm</span>
                <strong className="hero-ticket-val">Lầu 2, 161 Đề Thám, Q.1</strong>
              </div>
            </div>

            <div className="hero-ticket-card">
              <TeamOutlined className="hero-ticket-icon" />
              <div>
                <span className="hero-ticket-label">Quy mô</span>
                <strong className="hero-ticket-val">Khoảng 200 ban viên</strong>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right WOW Visual Stage — Layered 3D Showcase */}
        <motion.div
          className="hero-visual-showcase"
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        >
          {/* Circular Decorative Halo Ring */}
          <div className="hero-halo-ring" aria-hidden="true" />

          {/* Interactive 3D Tilt Container */}
          <motion.div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="hero-showcase-stage"
          >
            {/* Center Medallion Art Card */}
            <div className="hero-medallion-card">
              <div className="hero-medallion-inner">
                <img
                  src={logoImg}
                  alt="Biểu trưng Ban Thanh Niên HTTL Sài Gòn"
                  className="hero-medallion-img"
                />
              </div>
              <div className="hero-card-tag-bottom">
                <span>✦ BAN THANH NIÊN SÀI GÒN ✦</span>
              </div>
            </div>

            {/* Satellite Floating Badge 1 (Top-Right): History Stamp */}
            <motion.div
              className="hero-float-badge badge-top-right"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <span className="badge-sparkle">✦</span>
              <div>
                <strong>80+ Năm</strong>
                <small>Từ năm 1942</small>
              </div>
            </motion.div>

            {/* Satellite Floating Badge 2 (Bottom-Left): Live Pulse Time */}
            <motion.div
              className="hero-float-badge badge-bottom-left"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            >
              <span className="live-pulse-dot" />
              <div>
                <strong>Chúa Nhật</strong>
                <small>14:30 · Nhóm lại</small>
              </div>
            </motion.div>

            {/* Satellite Floating Badge 3 (Top-Left): Heritage Stamp */}
            <div className="hero-float-seal badge-top-left">
              <span>1942</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Background Watermark Year */}
        <div className="hero-year-watermark" aria-hidden="true">
          1942
        </div>
      </div>
    </header>
  );
}

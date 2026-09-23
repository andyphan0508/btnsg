import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { PiArrowRight, PiMoon, PiSun } from "react-icons/pi";
import { site, nav } from "../data/content.js";
import { useTheme } from "../lib/theme.js";
import logoImg from "../assets/logobtnsg.jpg";
import RollText from "./RollText.jsx";

/**
 * Thanh điều hướng dạng viên kính nổi: nền kính đặc dần khi cuộn, ẩn khi cuộn xuống,
 * hiện lại khi cuộn lên. Mục đang xem có "viên sáng" trượt theo (layoutId).
 */
export default function Nav() {
  const [theme, toggleTheme] = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 24);
    setHidden(y > 320 && y > (scrollY.getPrevious() ?? 0));
  });

  return (
    <header className={`nav${scrolled ? " is-scrolled" : ""}${hidden ? " is-hidden" : ""}`}>
      <motion.div className="nav-progress" style={{ scaleX: progress }} />
      <nav className="nav-pill glass" aria-label="Điều hướng chính">
        <Link className="nav-brand" to="/" aria-label="Ban Thanh Niên Sài Gòn — Trang chủ">
          <img src={logoImg} alt="" />
          <span>
            {site.brand}
            <em>{site.brandCity}</em>
          </span>
        </Link>

        <ul className="nav-links">
          {nav.map((item) => (
            <li key={item.to}>
              <NavLink to={item.to} className="nav-link">
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="nav-link-active"
                        transition={{ type: "spring", stiffness: 420, damping: 34 }}
                      />
                    )}
                    <RollText text={item.label} />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <button
            type="button"
            className="icon-btn"
            onClick={toggleTheme}
            aria-label="Chuyển chế độ sáng/tối"
            title="Chuyển chế độ sáng/tối"
          >
            {theme === "light" ? <PiMoon /> : <PiSun />}
          </button>
          <Link className="btn btn-sun btn-sm nav-cta" to="/sinh-hoat">
            <RollText text="Tham gia" />
            <PiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </nav>
    </header>
  );
}

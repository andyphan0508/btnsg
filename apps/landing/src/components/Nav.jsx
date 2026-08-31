import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { SunOutlined, MoonOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { motion, useScroll, useSpring } from "motion/react";
import { site, nav } from "../data/content.js";
import logoImg from "../assets/logobtnsg.jpg";

/**
 * Thanh điều hướng Aardvark Editorial:
 * Nền kem ấm, bo góc pill, nút Split Capsule Button "Tham gia sinh hoạt".
 */
export default function Nav() {
  const [theme, setTheme] = useState("light");
  const [isScrolled, setIsScrolled] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    } else {
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const initialTheme = systemDark ? "dark" : "light";
      setTheme(initialTheme);
      document.documentElement.setAttribute("data-theme", initialTheme);
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  };

  return (
    <nav className={`nav${isScrolled ? " nav-scrolled" : ""}`}>
      {/* Scroll progress indicator */}
      <motion.div className="scroll-indicator" style={{ scaleX }} />

      <div className="nav-in">
        <Link className="brand" to="/">
          <img src={logoImg} alt="Logo BTNSG" className="brand-logo-img" />
          <span className="brand-text">
            {site.brand}
            <span className="brand-city">&nbsp;{site.brandCity}</span>
          </span>
        </Link>

        <div className="nav-links">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-link-item${isActive ? " active" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link to="/sinh-hoat" className="btn-aardvark" style={{ display: "none" }}>
            <span className="btn-text-part">Sinh hoạt</span>
            <span className="btn-icon-part">
              <ArrowRightOutlined />
            </span>
          </Link>

          <button
            onClick={toggleTheme}
            className="theme-btn"
            aria-label="Chuyển chế độ sáng/tối"
            title="Chuyển chế độ sáng/tối"
            type="button"
          >
            {theme === "light" ? <MoonOutlined /> : <SunOutlined />}
          </button>
        </div>
      </div>
    </nav>
  );
}

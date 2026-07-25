import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { FiSun, FiMoon } from "react-icons/fi";
import { site, nav } from "../data/content.js";
import logoImg from "../assets/logobtnsg.jpg";

/**
 * Thanh điều hướng trên: đầy đủ các trang ở desktop.
 * Trên mobile chỉ còn thương hiệu + nút đổi giao diện — điều hướng do
 * BottomNav (thanh dưới, logo tròn ở giữa) đảm nhiệm.
 */
export default function Nav() {
  const [theme, setTheme] = useState("light");
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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
      setIsScrolled(window.scrollY > 10);
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(docHeight > 0 ? window.scrollY / docHeight : 0);
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
      {/* Scroll progress bar */}
      <div
        className="scroll-indicator"
        style={{ "--scroll-progress": scrollProgress }}
      />
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

        <button
          onClick={toggleTheme}
          className="theme-btn"
          aria-label="Chuyển chế độ sáng/tối"
          title="Chuyển chế độ sáng/tối"
          type="button"
        >
          {theme === "light" ? <FiMoon size={18} /> : <FiSun size={18} />}
        </button>
      </div>
    </nav>
  );
}

import { useState, useEffect } from "react";
import { site, nav } from "../data/content.js";
import logoImg from "../assets/logobtnsg.jpg";

export default function Nav() {
  const [theme, setTheme] = useState("light");
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
        <a className="brand" href="#top">
          <img src={logoImg} alt="Logo BTNSG" className="brand-logo-img" />
          <span className="brand-text">
            {site.brand}
            <span className="brand-city">&nbsp;{site.brandCity}</span>
          </span>
        </a>
        <div className="nav-links">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="nav-link-item">
              {item.label}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {/* Sun/Moon Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-btn"
            aria-label="Chuyển chế độ sáng/tối"
            title="Chuyển chế độ sáng/tối"
          >
            {theme === "light" ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="icon-moon"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="icon-sun"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="nav-burger"
            aria-label="Mở menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown panel */}
      <div className={`nav-mobile-panel${isMenuOpen ? " open" : ""}`}>
        {nav.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="nav-link-item"
            onClick={() => setIsMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}

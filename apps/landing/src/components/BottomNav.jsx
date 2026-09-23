import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  PiHouse,
  PiCalendarDots,
  PiNewspaper,
  PiImages,
  PiCaretRight,
  PiSun,
  PiMoon,
  PiX,
  PiFacebookLogo,
} from "react-icons/pi";
import { motion, AnimatePresence } from "motion/react";
import { bottomNav, sheetNav, site } from "../data/content.js";
import { useTheme } from "../lib/theme.js";
import { useScrollLock } from "../lib/scroll.js";
import logoImg from "../assets/logobtnsg.jpg";

const ICONS = {
  home: PiHouse,
  calendar: PiCalendarDots,
  news: PiNewspaper,
  image: PiImages,
};

/**
 * Dock kính cho mobile: 2 mục trái + logo tròn nổi ở giữa + 2 mục phải.
 * Bấm logo mở bottom sheet kính với các trang còn lại.
 */
export default function BottomNav() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [theme, toggleTheme] = useTheme();
  const location = useLocation();
  useScrollLock(sheetOpen);

  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sheetOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  const renderItem = (item) => {
    const Icon = ICONS[item.icon] ?? PiHouse;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === "/"}
        className={({ isActive }) => `bnav-item${isActive ? " active" : ""}`}
      >
        <Icon className="bnav-icon" />
        <span>{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            className="bnav-backdrop"
            onClick={() => setSheetOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sheetOpen && (
          <motion.div
            className="bnav-sheet glass is-solid"
            role="dialog"
            aria-modal="true"
            aria-label="Menu Ban Thanh Niên"
            data-lenis-prevent
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            exit={{ y: "110%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <div className="bnav-handle" />
            <div className="bnav-sheet-head">
              <div className="bnav-brand">
                <img src={logoImg} alt="" />
                <div>
                  <strong>
                    {site.brand} {site.brandCity}
                  </strong>
                  <small>HTTL Việt Nam · Chi Hội Sài Gòn</small>
                </div>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setSheetOpen(false)}
                aria-label="Đóng menu"
              >
                <PiX />
              </button>
            </div>

            <div className="bnav-links">
              {sheetNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `bnav-link${isActive ? " active" : ""}`}
                >
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.desc}</small>
                  </span>
                  <PiCaretRight aria-hidden="true" />
                </NavLink>
              ))}
            </div>

            <div className="bnav-sheet-foot">
              <button type="button" className="bnav-action" onClick={toggleTheme}>
                {theme === "light" ? <PiMoon /> : <PiSun />}
                <span>{theme === "light" ? "Chế độ tối" : "Chế độ sáng"}</span>
              </button>
              <a
                className="bnav-action"
                href={site.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <PiFacebookLogo />
                <span>Fanpage</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bottom-nav glass is-solid" aria-label="Điều hướng nhanh">
        <div className="bnav-side">{bottomNav.slice(0, 2).map(renderItem)}</div>

        <button
          type="button"
          className={`bnav-logo${sheetOpen ? " is-open" : ""}`}
          onClick={() => setSheetOpen((o) => !o)}
          aria-expanded={sheetOpen}
          aria-label={sheetOpen ? "Đóng menu" : "Mở menu Ban Thanh Niên"}
        >
          <img src={logoImg} alt="" />
        </button>

        <div className="bnav-side">{bottomNav.slice(2).map(renderItem)}</div>
      </nav>
    </>
  );
}

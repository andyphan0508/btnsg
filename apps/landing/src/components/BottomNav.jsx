import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PictureOutlined,
  RightOutlined,
  SunOutlined,
  MoonOutlined,
  CloseOutlined,
  FacebookFilled,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";
import { bottomNav, sheetNav, site } from "../data/content.js";
import logoImg from "../assets/logobtnsg.jpg";

const ICONS = {
  home: HomeOutlined,
  calendar: CalendarOutlined,
  news: FileTextOutlined,
  image: PictureOutlined,
};

/**
 * Thanh điều hướng dưới cho mobile:
 * 2 mục trái + logo BTN tròn nổi ở giữa + 2 mục phải.
 * Bấm logo mở Bottom Sheet với hoạt ảnh Motion AnimatePresence mượt mà.
 */
export default function BottomNav() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const location = useLocation();

  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current) setTheme(current);
  }, [sheetOpen]);

  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sheetOpen) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [sheetOpen]);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const left = bottomNav.slice(0, 2);
  const right = bottomNav.slice(2);

  const renderItem = (item) => {
    const Icon = ICONS[item.icon] ?? HomeOutlined;
    return (
      <NavLink
        key={item.to}
        to={item.to}
        end={item.to === "/"}
        className={({ isActive }) => `bnav-item${isActive ? " active" : ""}`}
      >
        <Icon className="bnav-icon" />
        <span className="bnav-label">{item.label}</span>
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
            className="bnav-sheet open"
            role="dialog"
            aria-label="Menu Ban Thanh Niên"
            aria-hidden={!sheetOpen}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
          >
            <div className="bnav-sheet-handle" />
            <div className="bnav-sheet-head">
              <div className="bnav-sheet-brand">
                <img src={logoImg} alt="" className="bnav-sheet-logo" />
                <div>
                  <div className="bnav-sheet-title">
                    {site.brand} {site.brandCity}
                  </div>
                  <div className="bnav-sheet-sub">
                    HTTL Việt Nam · Chi Hội Sài Gòn
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="bnav-sheet-close"
                onClick={() => setSheetOpen(false)}
                aria-label="Đóng menu"
              >
                <CloseOutlined />
              </button>
            </div>

            <div className="bnav-sheet-list">
              {sheetNav.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `bnav-sheet-link${isActive ? " active" : ""}`
                  }
                >
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.desc}</small>
                  </span>
                  <RightOutlined style={{ fontSize: 12 }} />
                </NavLink>
              ))}
            </div>

            <div className="bnav-sheet-foot">
              <button
                type="button"
                className="bnav-sheet-action"
                onClick={toggleTheme}
              >
                {theme === "light" ? <MoonOutlined /> : <SunOutlined />}
                <span>{theme === "light" ? "Chế độ tối" : "Chế độ sáng"}</span>
              </button>
              <a
                className="bnav-sheet-action"
                href={site.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <FacebookFilled style={{ color: "#1877f2" }} />
                <span>Fanpage</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="bottom-nav" aria-label="Điều hướng chính">
        <div className="bnav-side">{left.map(renderItem)}</div>

        <button
          type="button"
          className={`bnav-logo-btn${sheetOpen ? " open" : ""}`}
          onClick={() => setSheetOpen((o) => !o)}
          aria-expanded={sheetOpen}
          aria-label={sheetOpen ? "Đóng menu" : "Mở menu Ban Thanh Niên"}
        >
          <img src={logoImg} alt="" className="bnav-logo-img" />
        </button>

        <div className="bnav-side">{right.map(renderItem)}</div>
      </nav>
    </>
  );
}

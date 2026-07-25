import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  FiHome,
  FiCalendar,
  FiFileText,
  FiImage,
  FiChevronRight,
  FiSun,
  FiMoon,
  FiX,
} from "react-icons/fi";
import { FaFacebookF } from "react-icons/fa6";
import { bottomNav, sheetNav, site } from "../data/content.js";
import logoImg from "../assets/logobtnsg.jpg";

const ICONS = {
  home: FiHome,
  calendar: FiCalendar,
  news: FiFileText,
  image: FiImage,
};

/**
 * Thanh điều hướng dưới cho mobile: 2 mục trái + logo BTN tròn nổi ở giữa + 2 mục phải.
 * Bấm logo mở sheet chứa các mục còn lại (Giới thiệu, Chủ đề năm, Mục vụ, Liên hệ).
 */
export default function BottomNav() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const location = useLocation();

  // Đồng bộ theme hiện tại (Nav là nơi khởi tạo giá trị ban đầu).
  useEffect(() => {
    const current = document.documentElement.getAttribute("data-theme");
    if (current) setTheme(current);
  }, [sheetOpen]);

  // Đổi trang thì đóng sheet.
  useEffect(() => {
    setSheetOpen(false);
  }, [location.pathname]);

  // Khoá cuộn nền + đóng bằng Esc khi sheet mở.
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
    const Icon = ICONS[item.icon] ?? FiHome;
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
      {/* Sheet menu mở từ logo */}
      {sheetOpen && (
        <div className="bnav-backdrop" onClick={() => setSheetOpen(false)} />
      )}
      <div
        className={`bnav-sheet${sheetOpen ? " open" : ""}`}
        role="dialog"
        aria-label="Menu Ban Thanh Niên"
        aria-hidden={!sheetOpen}
      >
        <div className="bnav-sheet-handle" />
        <div className="bnav-sheet-head">
          <div className="bnav-sheet-brand">
            <img src={logoImg} alt="" className="bnav-sheet-logo" />
            <div>
              <div className="bnav-sheet-title">{site.brand} {site.brandCity}</div>
              <div className="bnav-sheet-sub">HTTL Việt Nam · Chi Hội Sài Gòn</div>
            </div>
          </div>
          <button
            type="button"
            className="bnav-sheet-close"
            onClick={() => setSheetOpen(false)}
            aria-label="Đóng menu"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="bnav-sheet-list">
          {sheetNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `bnav-sheet-link${isActive ? " active" : ""}`}
            >
              <span>
                <strong>{item.label}</strong>
                <small>{item.desc}</small>
              </span>
              <FiChevronRight />
            </NavLink>
          ))}
        </div>

        <div className="bnav-sheet-foot">
          <button type="button" className="bnav-sheet-action" onClick={toggleTheme}>
            {theme === "light" ? <FiMoon size={16} /> : <FiSun size={16} />}
            <span>{theme === "light" ? "Chế độ tối" : "Chế độ sáng"}</span>
          </button>
          <a
            className="bnav-sheet-action"
            href={site.facebook}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF size={15} />
            <span>Fanpage</span>
          </a>
        </div>
      </div>

      {/* Thanh dưới */}
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

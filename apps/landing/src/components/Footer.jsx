import { ArrowUpOutlined } from "@ant-design/icons";
import PushToggle from "./PushToggle.jsx";

export default function Footer() {
  const handleScrollTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="footer">
      <div className="foot-in">
        <div className="foot-left">
          <span className="foot-brand">
            Ban Thanh Niên — Hội Thánh Tin Lành Việt Nam
          </span>
          <span className="foot-sub">Chi Hội Sài Gòn · Từ 1942</span>
        </div>
        <div className="foot-center">
          <span className="foot-slogan">"TẤT CẢ VÌ NGƯỜI CHƯA ĐƯỢC CỨU"</span>
        </div>
        <div className="foot-right" style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <PushToggle />
          <a
            href="#top"
            onClick={handleScrollTop}
            className="btn-aardvark is-yellow"
            title="Lên đầu trang"
          >
            <span className="btn-text-part" style={{ padding: "8px 16px", fontSize: "0.82rem" }}>
              Lên đầu trang
            </span>
            <span className="btn-icon-part" style={{ padding: "8px 12px", fontSize: "0.82rem" }}>
              <ArrowUpOutlined />
            </span>
          </a>
        </div>
      </div>
      <div className="foot-bottom">
        <p>
          © {new Date().getFullYear()} Ban Thanh Niên HTTL Sài Gòn. Toàn bộ bản
          quyền được bảo lưu.
        </p>
      </div>
    </footer>
  );
}

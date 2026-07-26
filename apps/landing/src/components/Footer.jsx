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
          <span className="foot-sub">Chi Hội Sài Gòn</span>
        </div>
        <div className="foot-center">
          <span className="foot-slogan">"TẤT CẢ VÌ NGƯỜI CHƯA ĐƯỢC CỨU"</span>
        </div>
        <div className="foot-right">
          <PushToggle />
          <a
            href="#top"
            onClick={handleScrollTop}
            className="back-to-top-btn"
            title="Lên đầu trang"
          >
            Lên đầu trang <span className="arrow-up">↑</span>
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

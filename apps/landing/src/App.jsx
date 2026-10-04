import { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Nav from "./components/Nav.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Footer from "./components/Footer.jsx";
import ContactFab from "./components/ContactFab.jsx";
import PushPrompt from "./components/PushPrompt.jsx";
import Home from "./pages/Home.jsx";
import { scrollToTop } from "./lib/scroll.js";
import { isPreview, useSiteContent } from "./lib/siteContent.js";

// Trang chủ nằm trong bundle chính; các trang con tách chunk riêng và được tải trước
// khi trình duyệt rảnh, nên lượt vào đầu nhẹ hơn mà chuyển trang vẫn tức thì.
const pages = {
  About: () => import("./pages/About.jsx"),
  Theme: () => import("./pages/Theme.jsx"),
  Activities: () => import("./pages/Activities.jsx"),
  Ministry: () => import("./pages/Ministry.jsx"),
  ContactPage: () => import("./pages/ContactPage.jsx"),
  Gallery: () => import("./pages/Gallery.jsx"),
  News: () => import("./pages/News.jsx"),
  NewsPost: () => import("./pages/NewsPost.jsx"),
};
const About = lazy(pages.About);
const Theme = lazy(pages.Theme);
const Activities = lazy(pages.Activities);
const Ministry = lazy(pages.Ministry);
const ContactPage = lazy(pages.ContactPage);
const Gallery = lazy(pages.Gallery);
const News = lazy(pages.News);
const NewsPost = lazy(pages.NewsPost);

const whenIdle = window.requestIdleCallback ?? ((callback) => setTimeout(callback, 1500));

/** Cuộn lên đầu khi đổi route (trừ khi có anchor #) — trước khi trang mới đo ScrollTrigger. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (!hash) scrollToTop();
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const location = useLocation();
  useSiteContent();

  useEffect(() => {
    whenIdle(() => Object.values(pages).forEach((load) => load().catch(() => {})));
  }, []);

  return (
    <>
      <ScrollManager />
      {/* Nguồn sáng nền: các quầng màu trôi nhẹ theo cuộn, kính phía trên sẽ bắt sáng từ đây. */}
      <div className="ambient" aria-hidden="true">
        <span className="orb orb-1" />
        <span className="orb orb-2" />
        <span className="orb orb-3" />
        <span className="orb orb-4" />
      </div>
      <div className="grain" aria-hidden="true" />

      <Nav />
      <div className="page" key={location.pathname}>
        <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/gioi-thieu" element={<About />} />
            <Route path="/chu-de" element={<Theme />} />
            <Route path="/sinh-hoat" element={<Activities />} />
            <Route path="/muc-vu" element={<Ministry />} />
            <Route path="/lien-he" element={<ContactPage />} />
            <Route path="/thu-vien" element={<Gallery />} />
            <Route path="/tin-tuc" element={<News />} />
            <Route path="/tin-tuc/:postId" element={<NewsPost />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
      <ContactFab />
      {!isPreview && <PushPrompt />}
      {isPreview && <div className="preview-badge">Bản xem trước</div>}
      <BottomNav />
    </>
  );
}

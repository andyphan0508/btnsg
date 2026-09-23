import { useLayoutEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Nav from "./components/Nav.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Footer from "./components/Footer.jsx";
import ContactFab from "./components/ContactFab.jsx";
import PushPrompt from "./components/PushPrompt.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Theme from "./pages/Theme.jsx";
import Activities from "./pages/Activities.jsx";
import Ministry from "./pages/Ministry.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import Gallery from "./pages/Gallery.jsx";
import News from "./pages/News.jsx";
import NewsPost from "./pages/NewsPost.jsx";
import { scrollToTop } from "./lib/scroll.js";

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
      </div>
      <Footer />
      <ContactFab />
      <PushPrompt />
      <BottomNav />
    </>
  );
}

import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Nav from "./components/Nav.jsx";
import Footer from "./components/Footer.jsx";
import ContactFab from "./components/ContactFab.jsx";
import Home from "./pages/Home.jsx";
import Gallery from "./pages/Gallery.jsx";
import News from "./pages/News.jsx";
import NewsPost from "./pages/NewsPost.jsx";

/** Cuộn lên đầu khi đổi route (trừ khi có anchor #). */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/thu-vien" element={<Gallery />} />
        <Route path="/tin-tuc" element={<News />} />
        <Route path="/tin-tuc/:postId" element={<NewsPost />} />
      </Routes>
      <Footer />
      <ContactFab />
    </>
  );
}

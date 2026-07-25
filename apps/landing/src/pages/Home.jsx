import Hero from "../components/Hero.jsx";
import Slider from "../components/Slider.jsx";
import QuickNav from "../components/QuickNav.jsx";

/**
 * Trang chủ giữ tối giản: giới thiệu nhanh (Hero), vài khoảnh khắc nổi bật,
 * rồi dẫn sang từng trang riêng — không dồn toàn bộ nội dung vào một trang.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <main className="wrap">
        <Slider />
        <QuickNav />
      </main>
    </>
  );
}

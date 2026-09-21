import Hero from "../components/Hero.jsx";
import Slider from "../components/Slider.jsx";
import QuickNav from "../components/QuickNav.jsx";
import MarqueeStrip from "../components/MarqueeStrip.jsx";

/**
 * Trang chủ giữ tối giản: giới thiệu nhanh (Hero), dải băng chạy chữ Marquee,
 * vài khoảnh khắc nổi bật, rồi dẫn sang từng trang riêng.
 */
export default function Home() {
  return (
    <>
      <Hero />
      <MarqueeStrip />
      <main className="wrap">
        <Slider />
        <QuickNav />
      </main>
    </>
  );
}

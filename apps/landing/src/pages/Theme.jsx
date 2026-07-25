import PageHero from "../components/PageHero.jsx";
import PhotoStrip from "../components/PhotoStrip.jsx";
import ThemeYear from "../components/ThemeYear.jsx";

export default function Theme() {
  return (
    <>
      <PageHero
        eyebrow="Định hướng cả năm"
        title="Chủ đề năm"
        lead="Mỗi năm, Ban Thanh Niên chọn một chủ đề gắn với câu Kinh Thánh gốc và một bài hát khẩu hiệu."
      />
      <main className="wrap page-view">
        <ThemeYear />
        <PhotoStrip title="Sống chủ đề năm cùng nhau" count={4} />
      </main>
    </>
  );
}

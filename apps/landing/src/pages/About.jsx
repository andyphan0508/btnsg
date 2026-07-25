import PageHero from "../components/PageHero.jsx";
import PhotoStrip from "../components/PhotoStrip.jsx";
import Intro from "../components/Intro.jsx";
import Board from "../components/Board.jsx";

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="Về chúng tôi"
        title="Giới thiệu Ban Thanh Niên"
        lead="Hành trình từ Ca đoàn 3 đến Ban Thanh Niên hôm nay — hơn 80 năm cùng người trẻ Sài Gòn."
      />
      <main className="wrap page-view">
        <Intro />
        <Board />
        <PhotoStrip title="Chúng tôi trong những buổi nhóm" count={4} />
      </main>
    </>
  );
}

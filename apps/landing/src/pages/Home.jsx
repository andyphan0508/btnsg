import Hero from "../components/Hero.jsx";
import Intro from "../components/Intro.jsx";
import Slider from "../components/Slider.jsx";
import Board from "../components/Board.jsx";
import ThemeYear from "../components/ThemeYear.jsx";
import Schedule from "../components/Schedule.jsx";
import Ministries from "../components/Ministries.jsx";
import Contact from "../components/Contact.jsx";

export default function Home() {
  return (
    <>
      <Hero />
      <main className="wrap">
        <Intro />
        <Slider />
        {/* <Board /> */}
        <ThemeYear />
        <Schedule />
        <Ministries />
        <Contact />
      </main>
    </>
  );
}

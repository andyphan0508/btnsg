import PageHero from "../components/PageHero.jsx";
import PhotoStrip from "../components/PhotoStrip.jsx";
import Intro from "../components/Intro.jsx";
import Board from "../components/Board.jsx";
import CustomBlocks from "../components/CustomBlocks.jsx";
import { content } from "../lib/siteContent.js";

export default function About() {
  const { about } = content;

  return (
    <>
      <PageHero title={about.pageTitle} lead={about.pageLead} />
      <main>
        <Intro />
        <Board />
        <CustomBlocks page="about" />
        <PhotoStrip title={about.photoTitle} tag={about.photoTag} />
      </main>
    </>
  );
}

import PageHero from "../components/PageHero.jsx";
import PhotoStrip from "../components/PhotoStrip.jsx";
import ThemeYear from "../components/ThemeYear.jsx";
import { content } from "../lib/siteContent.js";

export default function Theme() {
  const { themeYear } = content;

  return (
    <>
      <PageHero title={themeYear.pageTitle} lead={themeYear.pageLead} />
      <main>
        <ThemeYear />
        <PhotoStrip title={themeYear.photoTitle} />
      </main>
    </>
  );
}

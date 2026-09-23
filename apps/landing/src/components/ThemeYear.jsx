import { PiMusicNotes, PiQuotes } from "react-icons/pi";
import ScrubText from "./ScrubText.jsx";
import { themeYear } from "../data/content.js";

/** Chủ đề năm: tiêu đề nắng rực, câu gốc trên tấm kính dựng đứng dần và sáng lên theo cuộn. */
export default function ThemeYear() {
  return (
    <section className="section theme-year">
      <div className="wrap">
        <p className="chip theme-kicker">{themeYear.eyebrow}</p>
        <h2 className="theme-title">{themeYear.title}</h2>

        <figure className="verse-card glass sfx-tilt">
          <PiQuotes className="verse-mark" aria-hidden="true" />
          <ScrubText as="blockquote" className="verse-text" parts={[themeYear.verse.replace(/^"|"$/g, "")]} />
          <figcaption>— {themeYear.ref}</figcaption>
        </figure>

        <p className="chip theme-song">
          <PiMusicNotes aria-hidden="true" />
          Bài hát khẩu hiệu: <strong>{themeYear.song}</strong>
        </p>
        <p className="theme-note">{themeYear.note}</p>
      </div>
    </section>
  );
}

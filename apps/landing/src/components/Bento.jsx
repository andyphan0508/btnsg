import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PiArrowUpRight, PiMusicNotes, PiNewspaper } from "react-icons/pi";
import Rays from "./Rays.jsx";
import MediaTile from "./MediaTile.jsx";
import { iconFor } from "../lib/icons.js";
import { content } from "../lib/siteContent.js";
import { Rich } from "../lib/rich.jsx";
import { loadImages, pickImages } from "../lib/gallery.js";

// Thứ Hai → Chúa Nhật; ngày có trong lịch tuần được thắp sáng.
const WEEK = [
  ["T2", "thứ hai"],
  ["T3", "thứ ba"],
  ["T4", "thứ tư"],
  ["T5", "thứ năm"],
  ["T6", "thứ sáu"],
  ["T7", "thứ bảy"],
  ["CN", "chúa nhật"],
];

const Arrow = () => (
  <span className="bento-arrow" aria-hidden="true">
    <PiArrowUpRight />
  </span>
);

/**
 * Lưới bento 4 cột, xếp dày (dense): 2×2 + 2×1 + 1×1 + 1×1 + 4×1 = 12 ô = 4 × 3, không khoảng trống.
 */
export default function Bento() {
  const [photos, setPhotos] = useState([]);
  const { home, themeYear, ministries, schedule, general } = content;
  const meetingDays = new Set(schedule.map((s) => s.day.trim().toLowerCase()));

  useEffect(() => {
    let alive = true;
    loadImages()
      .then((all) => alive && setPhotos(pickImages(all, "home-bento", 4)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="section">
      <div className="wrap">
        <header className="sec-head">
          <h2>
            <Rich text={home.bentoTitle} />
          </h2>
          <p className="lead">{home.bentoLead}</p>
        </header>

        <div className="bento">
          <Link to="/chu-de" className="bento-card glass bento-theme sfx-rise" data-sheen>
            <Rays className="bento-rays" />
            <h3>{themeYear.eyebrow}</h3>
            <p className="bento-theme-title">{themeYear.title}</p>
            <p className="bento-verse">
              “{themeYear.excerpt}”<cite>{themeYear.ref}</cite>
            </p>
            <span className="bento-pill">
              <PiMusicNotes /> {themeYear.song}
            </span>
            <Arrow />
          </Link>

          <Link
            to="/sinh-hoat"
            className="bento-card glass bento-schedule sfx-rise"
            style={{ "--i": 1 }}
            data-sheen
          >
            <h3>Lịch sinh hoạt</h3>
            <p className="bento-big">{general.meeting}</p>
            <p className="bento-note">{home.bentoScheduleNote}</p>
            <div className="bento-week" aria-hidden="true">
              {WEEK.map(([day, name]) => (
                <span className={meetingDays.has(name) ? "is-on" : undefined} key={day}>
                  {day}
                </span>
              ))}
            </div>
            <Arrow />
          </Link>

          <Link
            to="/muc-vu"
            className="bento-card glass bento-ministry sfx-rise"
            style={{ "--i": 2 }}
            data-sheen
          >
            <div className="bento-icons" aria-hidden="true">
              {ministries.map((m, i) => {
                const Icon = iconFor(m.icon);
                return (
                  <span key={i} style={{ "--i": i }}>
                    <Icon />
                  </span>
                );
              })}
            </div>
            <h3>Mục vụ</h3>
            <p className="bento-mid">{ministries.length} mảng phục vụ</p>
            <Arrow />
          </Link>

          <Link
            to="/tin-tuc"
            className="bento-card glass bento-news sfx-rise"
            style={{ "--i": 3 }}
            data-sheen
          >
            <PiNewspaper className="bento-news-icon" aria-hidden="true" />
            <h3>Tin tức</h3>
            <p className="bento-mid">{home.bentoNews}</p>
            <Arrow />
          </Link>

          <Link to="/thu-vien" className="bento-card glass bento-gallery sfx-rise" data-sheen>
            <div className="bento-gallery-copy">
              <h3>Thư viện ảnh</h3>
              <p className="bento-big">{home.bentoGalleryTitle}</p>
              <p className="bento-note">{home.bentoGalleryNote}</p>
            </div>
            <div className="bento-fan" aria-hidden="true">
              {photos.map((image, i) => (
                <div className="bento-fan-card" style={{ "--i": i }} key={image.id}>
                  <MediaTile image={image} width={500} />
                </div>
              ))}
            </div>
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}

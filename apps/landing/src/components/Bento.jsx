import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PiArrowUpRight, PiMusicNotes, PiNewspaper } from "react-icons/pi";
import Rays from "./Rays.jsx";
import MediaTile from "./MediaTile.jsx";
import { MINISTRY_ICONS } from "./Ministries.jsx";
import { ministries, themeYear } from "../data/content.js";
import { loadImages, pickImages } from "../lib/gallery.js";

// Thứ Hai → Chúa Nhật; ngày có buổi nhóm được thắp sáng.
const WEEK = [
  ["T2", false],
  ["T3", true],
  ["T4", false],
  ["T5", true],
  ["T6", false],
  ["T7", true],
  ["CN", true],
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
            Một nơi để bạn <em>thuộc về</em>
          </h2>
          <p className="lead">
            Từ câu Kinh Thánh định hướng cả năm đến những buổi nhóm mỗi tuần — đây là nhịp sống
            của Ban Thanh Niên.
          </p>
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
            <p className="bento-big">Chúa Nhật · 14:30</p>
            <p className="bento-note">Nhóm thờ phượng tại Lầu 2, số 161 Đề Thám, Quận 1.</p>
            <div className="bento-week" aria-hidden="true">
              {WEEK.map(([day, on]) => (
                <span className={on ? "is-on" : undefined} key={day}>
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
                const Icon = MINISTRY_ICONS[m.icon];
                return (
                  <span key={m.title} style={{ "--i": i }}>
                    <Icon />
                  </span>
                );
              })}
            </div>
            <h3>Mục vụ</h3>
            <p className="bento-mid">6 mảng phục vụ</p>
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
            <p className="bento-mid">Thông báo &amp; bài viết mới</p>
            <Arrow />
          </Link>

          <Link to="/thu-vien" className="bento-card glass bento-gallery sfx-rise" data-sheen>
            <div className="bento-gallery-copy">
              <h3>Thư viện ảnh</h3>
              <p className="bento-big">Hành trình thắp sáng niềm tin</p>
              <p className="bento-note">Những khoảnh khắc thờ phượng, nhóm lại và phục vụ.</p>
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

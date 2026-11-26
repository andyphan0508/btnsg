import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadImages, pickImage } from "../lib/gallery.js";
import { useHeroMotion } from "../lib/scroll.js";
import { content, heroImage } from "../lib/siteContent.js";
import MediaTile from "./MediaTile.jsx";
import Rays from "./Rays.jsx";
import { HeroWords } from "./Hero.jsx";

/**
 * Đầu trang con cùng ngôn ngữ với Hero: tiêu đề lớn lệch trái, khung ảnh kính nghiêng 3D
 * bên phải (ảnh chọn ổn định theo trang), lùi sâu khi cuộn.
 */
export default function PageHero({ title, lead, seed, offset = 0 }) {
  const { pathname } = useLocation();
  const key = seed || pathname;
  const [image, setImage] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const root = useRef(null);
  useHeroMotion(root);

  // Mỗi trang con một tiêu đề tab riêng (SEO + lịch sử trình duyệt); rời trang → về tiêu đề chung.
  useEffect(() => {
    const siteTitle = content.general.seoTitle;
    document.title = title ? `${title} — ${siteTitle}` : siteTitle;
    return () => {
      document.title = siteTitle;
    };
  }, [title]);

  useEffect(() => {
    let alive = true;
    loadImages()
      .then((images) => alive && setImage(pickImage(images, key, offset)))
      .catch(() => {})
      .finally(() => alive && setLoaded(true));
    return () => {
      alive = false;
    };
  }, [key, offset]);

  const fallbackPhoto = loaded && !image ? { id: "hero-fallback", src: heroImage(), thumb: heroImage(), name: title } : null;
  const displayImage = image || fallbackPhoto;

  return (
    <header className="page-hero" ref={root}>
      <div className="wrap page-hero-grid">
        <div className="hero-copy">
          <h1 className="page-hero-title">
            <HeroWords text={title} />
          </h1>
          {lead && <p className="hero-lead hero-fade">{lead}</p>}
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual-in">
            <div className="hero-glow" />
            <Rays className="hero-rays" />
            <figure className="hero-frame">
              {displayImage ? <MediaTile image={displayImage} width={1200} eager /> : <span className="frame-empty" />}
              <span className="hero-frame-sheen" />
            </figure>
          </div>
        </div>
      </div>
    </header>
  );
}

import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { loadImages, pickImage } from "../lib/gallery.js";
import { useHeroMotion } from "../lib/scroll.js";
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
  const root = useRef(null);
  useHeroMotion(root);

  useEffect(() => {
    let alive = true;
    loadImages()
      .then((images) => alive && setImage(pickImage(images, key, offset)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [key, offset]);

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
              {image ? <MediaTile image={image} width={1200} eager /> : <span className="frame-empty" />}
              <span className="hero-frame-sheen" />
            </figure>
          </div>
        </div>
      </div>
    </header>
  );
}

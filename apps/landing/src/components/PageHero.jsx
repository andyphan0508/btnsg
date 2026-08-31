import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { driveImage, loadImages, pickImage } from "../lib/gallery.js";

/**
 * Banner đầu trang theo phong cách Aardvark Editorial:
 * Nền kem ấm/vàng nhẹ, tiêu đề đậm nét, tag phân loại nổi bật,
 * lớp ảnh nền nằm chìm tinh tế phía sau mà không che khuất nội dung.
 */
export default function PageHero({
  eyebrow,
  title,
  lead,
  seed,
  offset = 0,
  compact = false,
}) {
  const { pathname } = useLocation();
  const key = seed || pathname;
  const [image, setImage] = useState(null);
  const layerRef = useRef(null);

  useEffect(() => {
    let alive = true;
    loadImages()
      .then((images) => {
        if (alive) setImage(pickImage(images, key, offset));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [key, offset]);

  // Parallax nhẹ
  useEffect(() => {
    if (!image) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return undefined;
    const el = layerRef.current;
    const onScroll = () => {
      const y = Math.min(window.scrollY, 400);
      if (el) el.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [image]);

  const demo = image?.demo;

  return (
    <header className={`page-hero${compact ? " compact" : ""}`}>
      {image && (
        <div className="page-hero-media" aria-hidden="true">
          <div className="page-hero-layer" ref={layerRef}>
            {demo ? (
              <div
                className="page-hero-img page-hero-demo"
                style={{
                  background: `linear-gradient(135deg, hsl(${image.hue} 50% 45%), hsl(${(image.hue + 45) % 360} 55% 35%))`,
                }}
              />
            ) : (
              <img
                className="page-hero-img"
                src={driveImage(image.id, 1920)}
                alt=""
                decoding="async"
              />
            )}
          </div>
          <div className="page-hero-veil" />
        </div>
      )}

      <div className="page-hero-content wrap">
        {eyebrow && <span className="page-hero-eyebrow">{eyebrow}</span>}
        <h1 className="page-hero-title">{title}</h1>
        {lead && <p className="page-hero-lead">{lead}</p>}
      </div>
    </header>
  );
}

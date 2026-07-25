import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { driveImage, loadImages, pickImage } from "../lib/gallery.js";

/**
 * Banner đầu trang: ảnh lấy từ thư viện Drive, phủ gradient tan dần xuống
 * đúng màu nền trang, tiêu đề nổi bật. Ảnh chọn ổn định theo đường dẫn nên
 * mỗi trang có một ảnh riêng, không đổi mỗi lần render.
 */
export default function PageHero({ eyebrow, title, lead, seed, offset = 0, compact = false }) {
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

  // Parallax nhẹ: ảnh trôi chậm hơn nội dung khi cuộn.
  useEffect(() => {
    if (!image) return undefined;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const el = layerRef.current;
    const onScroll = () => {
      const y = Math.min(window.scrollY, 600);
      if (el) el.style.transform = `translate3d(0, ${y * 0.22}px, 0)`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [image]);

  const demo = image?.demo;

  return (
    <header className={`page-hero${compact ? " compact" : ""}`}>
      <div className="page-hero-media" aria-hidden="true">
        <div className="page-hero-layer" ref={layerRef}>
          {image &&
            (demo ? (
              <div
                className="page-hero-img page-hero-demo"
                style={{
                  background: `linear-gradient(135deg, hsl(${image.hue} 65% 45%), hsl(${(image.hue + 45) % 360} 70% 35%))`,
                }}
              />
            ) : (
              <img className="page-hero-img" src={driveImage(image.id, 1920)} alt="" decoding="async" />
            ))}
        </div>
        {/* Lớp tối phía trên để chữ + thanh nav đọc rõ */}
        <div className="page-hero-veil" />
        {/* Nửa dưới mờ dần (blur tăng dần theo mask) */}
        <div className="page-hero-blur" />
        {/* Lớp tan dần xuống đúng màu nền trang */}
        <div className="page-hero-fade" />
      </div>

      <div className="page-hero-content wrap">
        {eyebrow && <p className="page-hero-eyebrow">{eyebrow}</p>}
        <h1 className="page-hero-title">{title}</h1>
        {lead && <p className="page-hero-lead">{lead}</p>}
      </div>
    </header>
  );
}

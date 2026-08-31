import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRightOutlined } from "@ant-design/icons";
import Reveal from "./Reveal.jsx";
import MediaTile from "./MediaTile.jsx";
import { loadImages, pickImages } from "../lib/gallery.js";

/**
 * Dải ảnh cuối trang phong cách Aardvark Archive Strip:
 * Khung ảnh bo tròn có viền nổi, nút Split Capsule dẫn sang Thư viện ảnh.
 */
export default function PhotoStrip({
  title = "Khoảnh khắc của Ban",
  count = 4,
  seed,
}) {
  const { pathname } = useLocation();
  const [images, setImages] = useState([]);

  useEffect(() => {
    let alive = true;
    loadImages()
      .then((all) => {
        if (alive) setImages(pickImages(all, seed || `${pathname}-strip`, count));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pathname, seed, count]);

  if (images.length === 0) return null;

  return (
    <section className="section photostrip-section">
      <Reveal
        className="sec-head"
        variant="slide-up"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span className="eyebrow">Hình ảnh</span>
          <h3 style={{ fontSize: "1.45rem", fontWeight: 800, margin: 0, color: "var(--ink)" }}>
            {title}
          </h3>
        </div>
        <Link
          to="/thu-vien"
          className="btn-aardvark is-yellow"
        >
          <span className="btn-text-part">Xem toàn bộ thư viện</span>
          <span className="btn-icon-part">
            <ArrowRightOutlined />
          </span>
        </Link>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
        {images.map((image, idx) => (
          <Reveal
            as={Link}
            to="/thu-vien"
            className="photo-strip-item"
            variant="scale-up"
            delay={idx * 60}
            key={image.id}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
          >
            <MediaTile image={image} width={600} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

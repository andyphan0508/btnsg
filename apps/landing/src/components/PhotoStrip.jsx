import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import Reveal from "./Reveal.jsx";
import MediaTile from "./MediaTile.jsx";
import { loadImages, pickImages } from "../lib/gallery.js";

/**
 * Dải ảnh cuối trang: lấy vài ảnh từ thư viện cho trang bớt khô,
 * đồng thời dẫn người xem sang trang Thư viện ảnh.
 */
export default function PhotoStrip({ title = "Khoảnh khắc của Ban", count = 4, seed }) {
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
      <Reveal className="photostrip-head" variant="slide-up">
        <h3>{title}</h3>
        <Link to="/thu-vien" className="photostrip-more">
          Xem thư viện <FiArrowRight />
        </Link>
      </Reveal>

      <div className="photostrip-grid">
        {images.map((image, idx) => (
          <Reveal
            as={Link}
            to="/thu-vien"
            className="photostrip-item"
            variant="scale-up"
            delay={idx * 70}
            key={image.id}
          >
            <MediaTile image={image} width={600} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}

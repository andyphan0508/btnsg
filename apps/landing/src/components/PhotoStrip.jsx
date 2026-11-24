import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PiArrowRight } from "react-icons/pi";
import MediaTile from "./MediaTile.jsx";
import RollText from "./RollText.jsx";
import { loadImages, pickImages, withTag } from "../lib/gallery.js";

/** Dải ảnh cuối trang: bốn khung so le, nghiêng 3D khi cuộn tới, phóng nhẹ khi di chuột. */
export default function PhotoStrip({ title = "Khoảnh khắc của Ban", count = 4, seed, tag }) {
  const { pathname } = useLocation();
  const [images, setImages] = useState([]);

  useEffect(() => {
    let alive = true;
    loadImages()
      .then((all) => {
        // Trang đặt tag ở dashboard → ưu tiên ảnh mang tag đó (mới nhất trước); chưa có ảnh nào thì lấy ảnh bất kỳ.
        const tagged = withTag(all, tag).slice(0, count);
        const usedIds = new Set(tagged.map((image) => image.id));
        // Ít ảnh mang tag → lấp chỗ còn lại bằng ảnh khác để dải ảnh không trơ trọi.
        const filler = pickImages(all, seed || `${pathname}-strip`, count).filter((image) => !usedIds.has(image.id));
        if (alive) setImages([...tagged, ...filler].slice(0, count));
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pathname, seed, count, tag]);

  if (images.length === 0) return null;

  return (
    <section className="section">
      <div className="wrap">
        <header className="photostrip-head">
          <h2>{title}</h2>
          <Link to="/thu-vien" className="btn btn-glass">
            <RollText text="Xem toàn bộ thư viện" />
            <span className="btn-icon">
              <PiArrowRight />
            </span>
          </Link>
        </header>

        <div className="photostrip">
          {images.map((image, i) => (
            <Link
              to="/thu-vien"
              className="photostrip-item sfx-rise"
              style={{ "--i": i }}
              key={image.id}
              aria-label="Mở thư viện ảnh"
              data-sheen
            >
              <MediaTile image={image} width={700} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

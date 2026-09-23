import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { PiArrowRight } from "react-icons/pi";
import { gsap, useGSAP, prefersReducedMotion } from "../lib/scroll.js";
import MediaTile from "./MediaTile.jsx";
import RollText from "./RollText.jsx";
import { loadImages, pickImages } from "../lib/gallery.js";

const COUNT = 10;
const STEP = 360 / COUNT;

/**
 * Vòng ảnh 3D: mười tấm ảnh xếp quanh một hình trụ, sân khấu dính (sticky) giữa màn hình
 * và cả vòng xoay theo nhịp cuộn; ảnh quay ra sau thì mờ và tối dần.
 */
export default function MomentsRing() {
  const root = useRef(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    let alive = true;
    loadImages()
      .then((all) => alive && setImages(pickImages(all, "home-ring", COUNT)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useGSAP(
    () => {
      const ring = root.current.querySelector(".ring");
      const cards = gsap.utils.toArray(".ring-card");
      // --facing: 1 khi ảnh quay thẳng vào người xem, -1 khi ở mặt sau vòng.
      const shade = (rotation) =>
        cards.forEach((card, i) => {
          const facing = Math.cos(((i * STEP + rotation) * Math.PI) / 180);
          card.style.setProperty("--facing", facing.toFixed(3));
        });
      shade(0);
      if (prefersReducedMotion) return;

      gsap.to(ring, {
        rotationY: -STEP * (COUNT - 1),
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 },
        onUpdate: () => shade(gsap.getProperty(ring, "rotationY")),
      });
    },
    { scope: root },
  );

  return (
    <section className="ring-section" ref={root}>
      <div className="ring-stage">
        <h2 className="ring-title">
          Những ngày <em>ta có nhau</em>
        </h2>
        <div className="ring-scene">
          <div className="ring-tilt">
            <div className="ring">
              {Array.from({ length: COUNT }, (_, i) => (
                <div className="ring-card" style={{ "--i": i }} key={i} aria-hidden="true">
                  {images[i] ? (
                    <MediaTile image={images[i]} width={600} />
                  ) : (
                    <span className="ring-placeholder" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ring-foot">
          <p>Mỗi bức ảnh là một câu chuyện về sự thờ phượng, tình thân và phục vụ.</p>
          <Link className="btn btn-glass" to="/thu-vien">
            <RollText text="Xem thư viện ảnh" />
            <span className="btn-icon">
              <PiArrowRight />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

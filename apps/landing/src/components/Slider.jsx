import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  LeftOutlined,
  RightOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "motion/react";
import Reveal from "./Reveal.jsx";
import MediaTile from "./MediaTile.jsx";
import { fetchFeatured } from "../lib/gallery.js";

const AUTO_MS = 6000;

export default function Slider() {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    let alive = true;
    fetchFeatured(6)
      .then((items) => {
        if (alive) setSlides(items);
      })
      .catch(() => {
        if (alive) setSlides([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    timerRef.current = setInterval(() => {
      setDirection(1);
      setIndex((i) => (i + 1) % slides.length);
    }, AUTO_MS);
    return () => clearInterval(timerRef.current);
  }, [slides]);

  const goTo = (i, dir = 1) => {
    setDirection(dir);
    setIndex((i + slides.length) % slides.length);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  if (loading || slides.length === 0) return null;

  const active = slides[index];

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <section className="section slider-section" id="hoat-dong">
      <Reveal className="sec-head" variant="slide-up">
        <p className="eyebrow">Khoảnh khắc Thanh Niên</p>
        <h2>Những hoạt động nổi bật</h2>
        <p className="lead">
          Hình ảnh tiêu biểu từ đời sống sinh hoạt và phục vụ của Ban Thanh Niên.
        </p>
      </Reveal>

      <Reveal className="slider" variant="scale-up">
        <div className="slider-stage">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={active?.id || index}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{ position: "absolute", inset: 0 }}
            >
              <Link to="/thu-vien" style={{ display: "block", width: "100%", height: "100%" }}>
                <MediaTile
                  image={active}
                  width={1600}
                  eager={true}
                  className="slider-img"
                />
                <div className="slider-caption">
                  <span className="tag-pill tag-pill-yellow" style={{ width: "fit-content" }}>
                    Thư viện ảnh
                  </span>
                  <span className="slider-caption-title">
                    {active?.name || "Khoảnh khắc Ban Thanh Niên"}
                  </span>
                </div>
              </Link>
            </motion.div>
          </AnimatePresence>

          <button
            className="slider-arrow slider-prev"
            onClick={() => goTo(index - 1, -1)}
            aria-label="Ảnh trước"
            type="button"
          >
            <LeftOutlined />
          </button>
          <button
            className="slider-arrow slider-next"
            onClick={() => goTo(index + 1, 1)}
            aria-label="Ảnh kế tiếp"
            type="button"
          >
            <RightOutlined />
          </button>
        </div>

        <div className="slider-dots">
          {slides.map((slide, i) => (
            <button
              key={slide.id || i}
              className={`slider-dot${i === index ? " active" : ""}`}
              onClick={() => goTo(i, i > index ? 1 : -1)}
              aria-label={`Chuyển tới ảnh ${i + 1}`}
              type="button"
            />
          ))}
        </div>
      </Reveal>

      <Reveal className="slider-cta" variant="slide-up" delay={100}>
        <Link className="btn-aardvark" to="/thu-vien">
          <span className="btn-text-part">Xem toàn bộ thư viện ảnh</span>
          <span className="btn-icon-part">
            <ArrowRightOutlined />
          </span>
        </Link>
      </Reveal>
    </section>
  );
}

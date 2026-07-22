import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from './Reveal.jsx'
import MediaTile from './MediaTile.jsx'
import { fetchFeatured } from '../lib/gallery.js'

const AUTO_MS = 5000

export default function Slider() {
  const [slides, setSlides] = useState([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    let alive = true
    fetchFeatured(6)
      .then((items) => {
        if (alive) setSlides(items)
      })
      .catch(() => {
        if (alive) setSlides([])
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    if (slides.length <= 1) return
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, AUTO_MS)
    return () => clearInterval(timerRef.current)
  }, [slides])

  const goTo = (i) => {
    setIndex((i + slides.length) % slides.length)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  if (loading || slides.length === 0) return null

  const active = slides[index]

  return (
    <section className="section slider-section" id="hoat-dong">
      <Reveal className="sec-head" variant="slide-up">
        <p className="eyebrow">Khoảnh khắc Thanh Niên</p>
        <h2>Những hoạt động nổi bật</h2>
        <p className="lead">Một vài hình ảnh tiêu biểu từ đời sống sinh hoạt của Ban Thanh Niên.</p>
      </Reveal>

      <Reveal className="slider" variant="scale-up">
        <div className="slider-stage">
          {slides.map((slide, i) => (
            <Link
              to="/thu-vien"
              key={slide.id}
              className={`slider-slide${i === index ? ' active' : ''}`}
              aria-hidden={i !== index}
              tabIndex={i === index ? 0 : -1}
            >
              <MediaTile image={slide} width={1600} eager={i === 0} className="slider-img" />
              <div className="slider-caption">
                <span className="slider-caption-eyebrow">Thư viện ảnh</span>
                <span className="slider-caption-title">Khoảnh khắc Ban Thanh Niên</span>
              </div>
            </Link>
          ))}

          <button
            className="slider-arrow slider-prev"
            onClick={() => goTo(index - 1)}
            aria-label="Ảnh trước"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            className="slider-arrow slider-next"
            onClick={() => goTo(index + 1)}
            aria-label="Ảnh kế tiếp"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        <div className="slider-dots">
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              className={`slider-dot${i === index ? ' active' : ''}`}
              onClick={() => goTo(i)}
              aria-label={`Chuyển tới ảnh ${i + 1}`}
              type="button"
            />
          ))}
        </div>
      </Reveal>

      <Reveal className="slider-cta" variant="slide-up" delay={100}>
        <Link className="btn btn-gold btn-glowing" to="/thu-vien">
          Xem toàn bộ thư viện ảnh
          <span className="arrow-right">→</span>
        </Link>
      </Reveal>
    </section>
  )
}

import { useEffect, useRef } from 'react'
import { FiX, FiExternalLink, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import MediaTile from './MediaTile.jsx'
import { driveImage } from '../lib/gallery.js'

/** Xem ảnh phóng to toàn màn hình cao cấp với react-icons & thumbnail carousel. */
export default function Lightbox({ images = [], index, onClose, onNavigate }) {
  const isOpen = index !== null && index >= 0 && Boolean(images[index])
  const thumbStripRef = useRef(null)

  // Cuộn ảnh thumbnail active vào giữa danh sách khi đổi index
  useEffect(() => {
    if (!isOpen || !thumbStripRef.current) return
    const activeThumb = thumbStripRef.current.querySelector('.lightbox-thumb-card.active')
    if (activeThumb) {
      activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    }
  }, [isOpen, index])

  // Điều hướng bằng phím ← → Esc
  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onNavigate(index - 1)
      else if (e.key === 'ArrowRight') onNavigate(index + 1)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, index, onClose, onNavigate])

  if (!isOpen) return null

  const image = images[index]
  const isDrive = !image.demo && Boolean(image.id)
  const cleanTitle = (image.name || '')
    .replace(/^(Copy of |Sao chép của )/i, '')
    .replace(/\.[^/.]+$/, '') || `Khoảnh khắc #${index + 1}`

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true">
      {/* Ambient Cinema Blur Background */}
      <div className="lightbox-ambient-bg" aria-hidden="true">
        <MediaTile image={image} width={400} className="ambient-blur-img" />
        <div className="ambient-vignette" />
      </div>

      {/* Floating Header Bar */}
      <div className="lightbox-header-wrap" onClick={(e) => e.stopPropagation()}>
        <div className="lightbox-glass-header">
          <div className="lightbox-title-group">
            <span className="lightbox-counter-badge">
              {index + 1} / {images.length}
            </span>
            <h3 className="lightbox-title-text">{cleanTitle}</h3>
          </div>

          <div className="lightbox-header-actions">
            {isDrive && (
              <a
                className="lightbox-glass-btn"
                href={driveImage(image.id, 1920)}
                target="_blank"
                rel="noopener noreferrer"
                title="Mở ảnh gốc trên Google Drive"
              >
                <FiExternalLink />
                <span>Xem ảnh gốc</span>
              </a>
            )}

            <button
              className="lightbox-close-circle"
              onClick={onClose}
              aria-label="Đóng màn hình xem ảnh"
              type="button"
              title="Đóng (Esc)"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Stage */}
      <div className="lightbox-stage">
        <button
          className="lightbox-nav-btn lightbox-nav-prev"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(index - 1)
          }}
          aria-label="Ảnh trước (Mũi tên trái)"
          type="button"
          title="Ảnh trước (←)"
        >
          <FiChevronLeft size={28} />
        </button>

        <figure className="lightbox-figure-frame" onClick={(e) => e.stopPropagation()}>
          <div className="lightbox-image-container">
            <MediaTile image={image} width={1920} eager className="lightbox-main-img" />
          </div>
        </figure>

        <button
          className="lightbox-nav-btn lightbox-nav-next"
          onClick={(e) => {
            e.stopPropagation()
            onNavigate(index + 1)
          }}
          aria-label="Ảnh kế tiếp (Mũi tên phải)"
          type="button"
          title="Ảnh sau (→)"
        >
          <FiChevronRight size={28} />
        </button>
      </div>

      {/* Bottom Thumbnail Dock */}
      {images.length > 1 && (
        <div className="lightbox-dock-wrap" onClick={(e) => e.stopPropagation()}>
          <div className="lightbox-glass-dock">
            <div className="lightbox-thumb-strip" ref={thumbStripRef}>
              {images.map((img, i) => (
                <button
                  key={img.id || i}
                  className={`lightbox-thumb-card ${i === index ? 'active' : ''}`}
                  onClick={() => onNavigate(i)}
                  aria-label={`Xem ảnh ${i + 1}`}
                  type="button"
                >
                  <MediaTile image={img} width={200} />
                  {i === index && <span className="thumb-active-glow" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

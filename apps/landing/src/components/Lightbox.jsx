import { useEffect } from 'react'
import MediaTile from './MediaTile.jsx'

/** Xem ảnh phóng to toàn màn hình, điều hướng bằng phím ← → Esc. */
export default function Lightbox({ images, index, onClose, onNavigate }) {
  const isOpen = index !== null && index >= 0 && Boolean(images[index])

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

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Đóng" type="button">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <button
        className="lightbox-arrow lightbox-prev"
        onClick={(e) => {
          e.stopPropagation()
          onNavigate(index - 1)
        }}
        aria-label="Ảnh trước"
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>

      <figure className="lightbox-figure" onClick={(e) => e.stopPropagation()}>
        <MediaTile image={image} width={1920} eager className="lightbox-img" />
        <figcaption className="lightbox-caption">
          {image.name} · {index + 1}/{images.length}
        </figcaption>
      </figure>

      <button
        className="lightbox-arrow lightbox-next"
        onClick={(e) => {
          e.stopPropagation()
          onNavigate(index + 1)
        }}
        aria-label="Ảnh kế tiếp"
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  )
}

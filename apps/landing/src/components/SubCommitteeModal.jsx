import { useEffect } from 'react'

/**
 * Modal thông tin chi tiết tiểu ban, mở khi nhấn vào chip trong Schedule.
 * Ảnh minh hoạ dùng khối gradient demo (giống MediaTile) cho đến khi có ảnh thật.
 */
export default function SubCommitteeModal({ committee, onClose }) {
  const isOpen = Boolean(committee)

  useEffect(() => {
    if (!isOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const gallery = [0, 1, 2].map((i) => ({
    hue: (committee.hue + i * 24) % 360,
  }))

  return (
    <div className="subcomm-modal-overlay" onClick={onClose}>
      <div className="subcomm-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="subcomm-modal-close"
          onClick={onClose}
          aria-label="Đóng"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <span className="subcomm-modal-icon" aria-hidden="true">
          {committee.icon}
        </span>
        <h3 className="subcomm-modal-title">{committee.title}</h3>
        <p className="subcomm-modal-desc">{committee.desc}</p>

        <div className="subcomm-modal-gallery">
          {gallery.map((img, i) => (
            <div
              key={i}
              className="subcomm-modal-img"
              style={{
                background: `linear-gradient(135deg, hsl(${img.hue} 70% 55%), hsl(${(img.hue + 40) % 360} 75% 45%))`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

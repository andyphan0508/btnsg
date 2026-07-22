import { useEffect, useState } from 'react'
import Reveal from '../components/Reveal.jsx'
import MediaTile from '../components/MediaTile.jsx'
import Lightbox from '../components/Lightbox.jsx'
import { fetchImages, isGalleryConfigured } from '../lib/gallery.js'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  useEffect(() => {
    let alive = true
    fetchImages()
      .then((data) => {
        if (alive) setImages(data)
      })
      .catch((err) => {
        if (alive) setError(err.message || 'Không tải được thư viện.')
      })
      .finally(() => {
        if (alive) setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const navigate = (i) => {
    if (images.length === 0) return
    setLightboxIndex(((i % images.length) + images.length) % images.length)
  }

  return (
    <main className="wrap gallery-page">
      <Reveal className="sec-head" variant="slide-up">
        <p className="eyebrow">Thư viện ảnh</p>
        <h2>Khoảnh khắc Ban Thanh Niên</h2>
        <p className="lead">
          Những hình ảnh sinh hoạt, thờ phượng và phục vụ của Ban Thanh Niên HTTL Sài Gòn.
        </p>
      </Reveal>

      {!isGalleryConfigured && (
        <div className="gallery-note">
          Đang xem dữ liệu mẫu — cấu hình <code>VITE_GALLERY_SCRIPT_URL</code> (Google Apps Script đọc
          folder Google Drive) để hiển thị ảnh thật. Xem hướng dẫn trong <code>DEPLOY.md</code>.
        </div>
      )}

      {loading && <div className="gallery-status">Đang tải thư viện…</div>}
      {error && <div className="gallery-status gallery-error">{error}</div>}
      {!loading && !error && images.length === 0 && (
        <div className="gallery-status">Thư viện chưa có ảnh nào.</div>
      )}

      {!loading && !error && images.length > 0 && (
        <>
          <p className="gallery-count">{images.length} ảnh</p>
          <div className="photo-grid">
            {images.map((image, idx) => (
              <button
                key={image.id}
                className="photo-tile"
                onClick={() => setLightboxIndex(idx)}
                aria-label={`Xem ${image.name}`}
                type="button"
              >
                <MediaTile image={image} width={600} />
              </button>
            ))}
          </div>
        </>
      )}

      <Lightbox
        images={images}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={navigate}
      />
    </main>
  )
}

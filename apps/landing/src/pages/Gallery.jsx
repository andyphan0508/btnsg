import { useEffect, useState, useMemo } from 'react'
import {
  FiSearch,
  FiX,
  FiGrid,
  FiColumns,
  FiLayers,
  FiMaximize2,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi'
import Reveal from '../components/Reveal.jsx'
import PageHero from '../components/PageHero.jsx'
import MediaTile from '../components/MediaTile.jsx'
import Lightbox from '../components/Lightbox.jsx'
import { fetchImages, isGalleryConfigured } from '../lib/gallery.js'

export default function Gallery() {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lightboxIndex, setLightboxIndex] = useState(null)

  // Bộ lọc & Chế độ xem
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'masonry' | 'spotlight'

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(6)

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

  // Lọc ảnh theo từ khóa tìm kiếm
  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images
    const q = searchQuery.toLowerCase()
    return images.filter((img) => (img.name || '').toLowerCase().includes(q))
  }, [images, searchQuery])

  // Tính toán phân trang
  const totalCount = filteredImages.length
  const isAll = pageSize === 0 || pageSize >= totalCount
  const effectivePageSize = isAll ? totalCount : pageSize
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalCount / effectivePageSize))

  const validPage = Math.min(currentPage, totalPages)
  const startIndex = isAll ? 0 : (validPage - 1) * effectivePageSize
  const endIndex = isAll ? totalCount : Math.min(startIndex + effectivePageSize, totalCount)

  const currentImages = useMemo(() => {
    return filteredImages.slice(startIndex, endIndex)
  }, [filteredImages, startIndex, endIndex])

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    const target = document.getElementById('gallery-grid-top')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handlePageSizeChange = (size) => {
    setPageSize(size)
    setCurrentPage(1)
  }

  const navigate = (i) => {
    if (filteredImages.length === 0) return
    const nextIdx = ((i % filteredImages.length) + filteredImages.length) % filteredImages.length
    const targetImg = filteredImages[nextIdx]
    const realIdx = images.findIndex((img) => img.id === targetImg?.id)
    setLightboxIndex(realIdx >= 0 ? realIdx : nextIdx)
  }

  // Danh sách trang số
  const getPageNumbers = () => {
    const pages = []
    const delta = 1
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= validPage - delta && i <= validPage + delta)
      ) {
        pages.push(i)
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...')
      }
    }
    return pages
  }

  return (
    <>
      <PageHero
        eyebrow="Thư viện khoảnh khắc"
        title="Hành trình thắp sáng niềm tin"
        lead="Những hình ảnh chân thật trong sự thờ phượng, nhóm lại và phục vụ của Ban Thanh Niên HTTL Sài Gòn."
      />
      <main className="wrap gallery-page page-view">

      {!isGalleryConfigured && (
        <div className="gallery-note">
          Đang xem dữ liệu mẫu — cấu hình <code>VITE_GALLERY_SCRIPT_URL</code> (Google Apps Script đọc
          folder Google Drive) để hiển thị ảnh thật. Xem hướng dẫn trong <code>DEPLOY.md</code>.
        </div>
      )}

      {loading && <div className="gallery-status">Đang tải thư viện ảnh…</div>}
      {error && <div className="gallery-status gallery-error">{error}</div>}
      {!loading && !error && images.length === 0 && (
        <div className="gallery-status">Thư viện chưa có ảnh nào.</div>
      )}

      {!loading && !error && images.length > 0 && (
        <>
          {/* Toolbar Tối Giản: Tìm kiếm, Chế độ xem, Số lượng ảnh */}
          <div className="gallery-toolbar" id="gallery-grid-top">
            {/* Ô tìm kiếm */}
            <div className="gallery-search-box">
              <FiSearch className="search-icon" />
              <input
                type="text"
                className="gallery-search-input"
                placeholder="Tìm kiếm khoảnh khắc..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
              />
              {searchQuery && (
                <button
                  className="search-clear-btn"
                  onClick={() => setSearchQuery('')}
                  type="button"
                  title="Xóa tìm kiếm"
                >
                  <FiX />
                </button>
              )}
            </div>

            {/* Chuyển đổi Chế độ xem */}
            <div className="gallery-view-modes">
              <button
                className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                type="button"
                title="Lưới chuẩn"
              >
                <FiGrid className="mode-icon" />
                <span>Lưới</span>
              </button>
              <button
                className={`view-mode-btn ${viewMode === 'masonry' ? 'active' : ''}`}
                onClick={() => setViewMode('masonry')}
                type="button"
                title="Art Masonry"
              >
                <FiColumns className="mode-icon" />
                <span>Masonry</span>
              </button>
              <button
                className={`view-mode-btn ${viewMode === 'spotlight' ? 'active' : ''}`}
                onClick={() => setViewMode('spotlight')}
                type="button"
                title="Spotlight"
              >
                <FiLayers className="mode-icon" />
                <span>Spotlight</span>
              </button>
            </div>

            {/* Chọn Kích thước trang */}
            <div className="gallery-size-pills">
              <span className="size-label">Xem:</span>
              {[6, 12, 24, 0].map((size) => (
                <button
                  key={size}
                  className={`size-pill ${pageSize === size ? 'active' : ''}`}
                  onClick={() => handlePageSizeChange(size)}
                  type="button"
                >
                  {size === 0 ? 'Tất cả' : `${size} ảnh`}
                </button>
              ))}
            </div>
          </div>

          {/* Info Line & Top Pagination Mini */}
          <div className="gallery-info-bar">
            <p className="gallery-count-info">
              Hiển thị <strong>{totalCount > 0 ? startIndex + 1 : 0}–{endIndex}</strong> trên tổng số <strong>{totalCount}</strong> ảnh
              {searchQuery && ` (lọc từ ${images.length} ảnh)`}
            </p>

            {totalPages > 1 && (
              <div className="pagination-mini">
                <button
                  className="pag-btn"
                  onClick={() => handlePageChange(validPage - 1)}
                  disabled={validPage === 1}
                  type="button"
                  title="Trang trước"
                >
                  <FiChevronLeft />
                </button>
                <span className="pag-page-text">
                  Trang <strong>{validPage}</strong> / {totalPages}
                </span>
                <button
                  className="pag-btn"
                  onClick={() => handlePageChange(validPage + 1)}
                  disabled={validPage === totalPages}
                  type="button"
                  title="Trang sau"
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>

          {/* Gallery Card Items Grid */}
          {currentImages.length === 0 ? (
            <div className="gallery-empty-search">
              <FiSearch size={36} />
              <p>Không tìm thấy ảnh nào khớp với từ khóa "{searchQuery}"</p>
              <button
                className="btn btn-ghost"
                onClick={() => setSearchQuery('')}
                type="button"
              >
                Xem toàn bộ thư viện
              </button>
            </div>
          ) : (
            <div className={`gallery-grid-container view-${viewMode}`}>
              {currentImages.map((image, idx) => {
                const currentFilteredIdx = startIndex + idx
                const realImageIdx = images.findIndex((img) => img.id === image.id)
                const targetIdx = realImageIdx >= 0 ? realImageIdx : currentFilteredIdx

                return (
                  <button
                    key={image.id || idx}
                    className={`gallery-card-item ${idx === 0 && viewMode === 'spotlight' ? 'spotlight-featured' : ''}`}
                    onClick={() => setLightboxIndex(targetIdx)}
                    type="button"
                    aria-label={`Xem ảnh ${image.name}`}
                  >
                    <div className="card-media-wrapper">
                      <MediaTile image={image} width={800} />
                      <div className="card-overlay">
                        <div className="card-zoom-badge">
                          <FiMaximize2 className="badge-icon" />
                          <span>Phóng to</span>
                        </div>
                        <div className="card-info-bottom">
                          <span className="card-tag">#{(currentFilteredIdx + 1).toString().padStart(2, '0')}</span>
                          <strong className="card-name">{image.name || `Khoảnh khắc ${currentFilteredIdx + 1}`}</strong>
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Bottom Pagination Bar */}
          {totalPages > 1 && (
            <div className="pagination-wrap">
              <button
                className="pagination-btn pagination-prev"
                onClick={() => handlePageChange(validPage - 1)}
                disabled={validPage === 1}
                type="button"
                aria-label="Trang trước"
              >
                <FiChevronLeft size={18} />
                <span>Trang trước</span>
              </button>

              <div className="pagination-numbers">
                {getPageNumbers().map((p, index) =>
                  p === '...' ? (
                    <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      className={`pagination-num ${validPage === p ? 'active' : ''}`}
                      onClick={() => handlePageChange(p)}
                      type="button"
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              <button
                className="pagination-btn pagination-next"
                onClick={() => handlePageChange(validPage + 1)}
                disabled={validPage === totalPages}
                type="button"
                aria-label="Trang sau"
              >
                <span>Trang sau</span>
                <FiChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Lightbox Modal */}
      <Lightbox
        images={images}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={navigate}
      />
      </main>
    </>
  )
}

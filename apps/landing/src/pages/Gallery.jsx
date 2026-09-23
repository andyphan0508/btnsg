import { useEffect, useState, useMemo } from "react";
import {
  PiMagnifyingGlass,
  PiX,
  PiSquaresFour,
  PiRows,
  PiArrowsOut,
  PiCaretLeft,
  PiCaretRight,
} from "react-icons/pi";
import PageHero from "../components/PageHero.jsx";
import MediaTile from "../components/MediaTile.jsx";
import Lightbox from "../components/Lightbox.jsx";
import { fetchImages, isGalleryConfigured } from "../lib/gallery.js";

const PAGE_SIZES = [12, 24, 48, 0];

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Bộ lọc & Chế độ xem
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    let alive = true;
    fetchImages()
      .then((data) => {
        if (alive) setImages(data);
      })
      .catch((err) => {
        if (alive) setError(err.message || "Không tải được thư viện.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const filteredImages = useMemo(() => {
    if (!searchQuery.trim()) return images;
    const q = searchQuery.toLowerCase();
    return images.filter((img) => (img.name || "").toLowerCase().includes(q));
  }, [images, searchQuery]);

  const totalCount = filteredImages.length;
  const isAll = pageSize === 0 || pageSize >= totalCount;
  const effectivePageSize = isAll ? totalCount : pageSize;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalCount / effectivePageSize));

  const validPage = Math.min(currentPage, totalPages);
  const startIndex = isAll ? 0 : (validPage - 1) * effectivePageSize;
  const endIndex = isAll ? totalCount : Math.min(startIndex + effectivePageSize, totalCount);

  const currentImages = useMemo(
    () => filteredImages.slice(startIndex, endIndex),
    [filteredImages, startIndex, endIndex],
  );

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    document.getElementById("gallery-grid-top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const navigate = (i) => {
    if (filteredImages.length === 0) return;
    const nextIdx = ((i % filteredImages.length) + filteredImages.length) % filteredImages.length;
    const targetImg = filteredImages[nextIdx];
    const realIdx = images.findIndex((img) => img.id === targetImg?.id);
    setLightboxIndex(realIdx >= 0 ? realIdx : nextIdx);
  };

  const getPageNumbers = () => {
    const pages = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= validPage - delta && i <= validPage + delta)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }
    return pages;
  };

  return (
    <>
      <PageHero
        title="Hành trình thắp sáng niềm tin"
        lead="Những hình ảnh chân thật trong sự thờ phượng, nhóm lại và phục vụ của Ban Thanh Niên HTTL Sài Gòn."
      />
      <main className="section section-tight">
        <div className="wrap">
          {!isGalleryConfigured && (
            <div className="notice glass">
              Đang xem dữ liệu mẫu — cấu hình <code>VITE_GALLERY_SCRIPT_URL</code> để hiển thị ảnh
              thật từ Google Drive.
            </div>
          )}

          {loading && <div className="status">Đang tải thư viện ảnh…</div>}
          {error && <div className="status is-error">{error}</div>}
          {!loading && !error && images.length === 0 && (
            <div className="status">Thư viện chưa có ảnh nào.</div>
          )}

          {!loading && !error && images.length > 0 && (
            <>
              <div className="toolbar glass" id="gallery-grid-top">
                <label className="search-box">
                  <PiMagnifyingGlass aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm khoảnh khắc..."
                    aria-label="Tìm kiếm ảnh"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery("")} aria-label="Xóa tìm kiếm">
                      <PiX />
                    </button>
                  )}
                </label>

                <div className="seg" role="group" aria-label="Chế độ xem">
                  <button
                    type="button"
                    className={viewMode === "grid" ? "is-active" : undefined}
                    onClick={() => setViewMode("grid")}
                    aria-pressed={viewMode === "grid"}
                  >
                    <PiSquaresFour aria-hidden="true" />
                    <span>Lưới</span>
                  </button>
                  <button
                    type="button"
                    className={viewMode === "list" ? "is-active" : undefined}
                    onClick={() => setViewMode("list")}
                    aria-pressed={viewMode === "list"}
                  >
                    <PiRows aria-hidden="true" />
                    <span>Danh sách</span>
                  </button>
                </div>

                <div className="seg" role="group" aria-label="Số ảnh mỗi trang">
                  {PAGE_SIZES.map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={pageSize === size ? "is-active" : undefined}
                      onClick={() => handlePageSizeChange(size)}
                      aria-pressed={pageSize === size}
                    >
                      {size === 0 ? "Tất cả" : size}
                    </button>
                  ))}
                </div>
              </div>

              <p className="gallery-meta">
                Hiển thị{" "}
                <strong>
                  {totalCount > 0 ? startIndex + 1 : 0}–{endIndex}
                </strong>{" "}
                trên tổng số <strong>{totalCount}</strong> ảnh
                {searchQuery && ` (lọc từ ${images.length} ảnh)`}
              </p>

              {currentImages.length === 0 ? (
                <div className="status">
                  <p>Không tìm thấy ảnh nào khớp với từ khóa "{searchQuery}"</p>
                  <button className="btn btn-glass" onClick={() => setSearchQuery("")} type="button">
                    Xem toàn bộ thư viện
                  </button>
                </div>
              ) : (
                <div className={`gallery-grid${viewMode === "list" ? " is-list" : ""}`}>
                  {currentImages.map((image, idx) => {
                    const realImageIdx = images.findIndex((img) => img.id === image.id);
                    const targetIdx = realImageIdx >= 0 ? realImageIdx : startIndex + idx;
                    return (
                      <button
                        key={image.id || idx}
                        className="gallery-item sfx-rise"
                        style={{ "--i": idx % 4 }}
                        onClick={() => setLightboxIndex(targetIdx)}
                        type="button"
                        aria-label={`Xem ảnh ${image.name}`}
                        data-sheen
                      >
                        <MediaTile image={image} width={800} />
                        <span className="gallery-item-bar">
                          <span className="tag">#{(startIndex + idx + 1).toString().padStart(2, "0")}</span>
                          <span className="tag">
                            <PiArrowsOut aria-hidden="true" /> Phóng to
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {totalPages > 1 && (
                <nav className="pagination" aria-label="Phân trang">
                  <button
                    className="chip"
                    onClick={() => handlePageChange(validPage - 1)}
                    disabled={validPage === 1}
                    type="button"
                  >
                    <PiCaretLeft aria-hidden="true" />
                    <span>Trước</span>
                  </button>
                  {getPageNumbers().map((p, index) =>
                    p === "..." ? (
                      <span key={`ellipsis-${index}`} className="page-gap">
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={`page-num${validPage === p ? " is-active" : ""}`}
                        onClick={() => handlePageChange(p)}
                        aria-current={validPage === p ? "page" : undefined}
                        type="button"
                      >
                        {p}
                      </button>
                    ),
                  )}
                  <button
                    className="chip"
                    onClick={() => handlePageChange(validPage + 1)}
                    disabled={validPage === totalPages}
                    type="button"
                  >
                    <span>Sau</span>
                    <PiCaretRight aria-hidden="true" />
                  </button>
                </nav>
              )}
            </>
          )}

          <Lightbox
            images={images}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={navigate}
          />
        </div>
      </main>
    </>
  );
}

import { useEffect, useState, useMemo } from "react";
import {
  SearchOutlined,
  CloseOutlined,
  AppstoreOutlined,
  UnorderedListOutlined,
  ExpandOutlined,
  LeftOutlined,
  RightOutlined,
} from "@ant-design/icons";
import PageHero from "../components/PageHero.jsx";
import MediaTile from "../components/MediaTile.jsx";
import Lightbox from "../components/Lightbox.jsx";
import { fetchImages, isGalleryConfigured } from "../lib/gallery.js";

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
  const totalPages = isAll
    ? 1
    : Math.max(1, Math.ceil(totalCount / effectivePageSize));

  const validPage = Math.min(currentPage, totalPages);
  const startIndex = isAll ? 0 : (validPage - 1) * effectivePageSize;
  const endIndex = isAll
    ? totalCount
    : Math.min(startIndex + effectivePageSize, totalCount);

  const currentImages = useMemo(() => {
    return filteredImages.slice(startIndex, endIndex);
  }, [filteredImages, startIndex, endIndex]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    const target = document.getElementById("gallery-grid-top");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const navigate = (i) => {
    if (filteredImages.length === 0) return;
    const nextIdx =
      ((i % filteredImages.length) + filteredImages.length) %
      filteredImages.length;
    const targetImg = filteredImages[nextIdx];
    const realIdx = images.findIndex((img) => img.id === targetImg?.id);
    setLightboxIndex(realIdx >= 0 ? realIdx : nextIdx);
  };

  const getPageNumbers = () => {
    const pages = [];
    const delta = 1;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= validPage - delta && i <= validPage + delta)
      ) {
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
        eyebrow="Thư viện khoảnh khắc"
        title="Hành trình thắp sáng niềm tin"
        lead="Những hình ảnh chân thật trong sự thờ phượng, nhóm lại và phục vụ của Ban Thanh Niên HTTL Sài Gòn."
      />
      <main className="wrap gallery-page page-view">
        {!isGalleryConfigured && (
          <div className="gallery-note" style={{ margin: "24px 0", padding: "14px 20px", background: "var(--color-yellow-light)", border: "1.5px solid var(--ink)", borderRadius: "var(--radius-lg)", fontSize: "0.88rem", fontWeight: 600 }}>
            Đang xem dữ liệu mẫu — cấu hình <code>VITE_GALLERY_SCRIPT_URL</code> để hiển thị ảnh thật từ Google Drive.
          </div>
        )}

        {loading && <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink-2)" }}>Đang tải thư viện ảnh…</div>}
        {error && <div style={{ textAlign: "center", padding: "48px 0", color: "#ef4444" }}>{error}</div>}
        {!loading && !error && images.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "var(--ink-2)" }}>Thư viện chưa có ảnh nào.</div>
        )}

        {!loading && !error && images.length > 0 && (
          <>
            {/* Toolbar Aardvark Style */}
            <div className="gallery-toolbar" id="gallery-grid-top">
              {/* Ô tìm kiếm */}
              <div className="gallery-search-box">
                <SearchOutlined style={{ color: "var(--ink)" }} />
                <input
                  type="text"
                  className="gallery-search-input"
                  placeholder="Tìm kiếm khoảnh khắc..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {searchQuery && (
                  <button
                    style={{ background: "transparent", border: "none", color: "var(--ink)", cursor: "pointer" }}
                    onClick={() => setSearchQuery("")}
                    type="button"
                    title="Xóa tìm kiếm"
                  >
                    <CloseOutlined />
                  </button>
                )}
              </div>

              {/* Chuyển đổi Chế độ xem */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className={`view-mode-btn ${viewMode === "grid" ? "active" : ""}`}
                  onClick={() => setViewMode("grid")}
                  type="button"
                  title="Lưới ảnh"
                >
                  <AppstoreOutlined />
                  <span>Lưới</span>
                </button>
                <button
                  className={`view-mode-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                  type="button"
                  title="Danh sách"
                >
                  <UnorderedListOutlined />
                  <span>Danh sách</span>
                </button>
              </div>

              {/* Chọn Kích thước trang */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--ink-2)" }}>Xem:</span>
                {[12, 24, 48, 0].map((size) => (
                  <button
                    key={size}
                    className={`size-pill ${pageSize === size ? "active" : ""}`}
                    onClick={() => handlePageSizeChange(size)}
                    type="button"
                  >
                    {size === 0 ? "Tất cả" : `${size} ảnh`}
                  </button>
                ))}
              </div>
            </div>

            {/* Info Line */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, fontSize: "0.88rem", fontWeight: 600, color: "var(--ink-2)" }}>
              <p>
                Hiển thị <strong>{totalCount > 0 ? startIndex + 1 : 0}–{endIndex}</strong> trên tổng số <strong>{totalCount}</strong> ảnh
                {searchQuery && ` (lọc từ ${images.length} ảnh)`}
              </p>
            </div>

            {/* Gallery Grid */}
            {currentImages.length === 0 ? (
              <div style={{ textAlign: "center", padding: "64px 0" }}>
                <SearchOutlined style={{ fontSize: 36, color: "var(--ink-3)", marginBottom: 12 }} />
                <p style={{ color: "var(--ink-2)", marginBottom: 16 }}>Không tìm thấy ảnh nào khớp với từ khóa "{searchQuery}"</p>
                <button
                  className="btn-pill-ghost"
                  onClick={() => setSearchQuery("")}
                  type="button"
                >
                  Xem toàn bộ thư viện
                </button>
              </div>
            ) : (
              <div className="gallery-grid-container" style={{ gridTemplateColumns: viewMode === "list" ? "1fr" : undefined }}>
                {currentImages.map((image, idx) => {
                  const currentFilteredIdx = startIndex + idx;
                  const realImageIdx = images.findIndex(
                    (img) => img.id === image.id,
                  );
                  const targetIdx =
                    realImageIdx >= 0 ? realImageIdx : currentFilteredIdx;

                  return (
                    <button
                      key={image.id || idx}
                      className="gallery-card-item"
                      onClick={() => setLightboxIndex(targetIdx)}
                      type="button"
                      aria-label={`Xem ảnh ${image.name}`}
                    >
                      <div className="card-media-wrapper" style={{ aspectRatio: viewMode === "list" ? "16 / 7" : "4 / 3" }}>
                        <MediaTile image={image} width={800} />
                        <div
                          style={{
                            position: "absolute",
                            bottom: 12,
                            left: 12,
                            right: 12,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                          }}
                        >
                          <span className="tag-pill tag-pill-yellow">
                            #{(currentFilteredIdx + 1).toString().padStart(2, "0")}
                          </span>
                          <span
                            style={{
                              background: "var(--ink)",
                              color: "#fff",
                              padding: "4px 10px",
                              borderRadius: "var(--radius-pill)",
                              fontSize: "0.74rem",
                              fontWeight: 700,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            <ExpandOutlined /> Phóng to
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-wrap">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(validPage - 1)}
                  disabled={validPage === 1}
                  type="button"
                >
                  <LeftOutlined />
                  <span>Trước</span>
                </button>

                <div className="pagination-numbers">
                  {getPageNumbers().map((p, index) =>
                    p === "..." ? (
                      <span key={`ellipsis-${index}`} style={{ padding: "8px 4px", color: "var(--ink-3)", fontWeight: 700 }}>
                        …
                      </span>
                    ) : (
                      <button
                        key={p}
                        className={`pagination-num ${validPage === p ? "active" : ""}`}
                        onClick={() => handlePageChange(p)}
                        type="button"
                      >
                        {p}
                      </button>
                    ),
                  )}
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(validPage + 1)}
                  disabled={validPage === totalPages}
                  type="button"
                >
                  <span>Sau</span>
                  <RightOutlined />
                </button>
              </div>
            )}
          </>
        )}

        <Lightbox
          images={images}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={navigate}
        />
      </main>
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  PiArrowsOut,
  PiCalendarBlank,
  PiCaretLeft,
  PiCaretRight,
  PiFolderOpen,
  PiMagnifyingGlass,
  PiRows,
  PiSquaresFour,
  PiX,
} from "react-icons/pi";
import { formatWeekLabel, getIsoWeekInfo, getWeekKey } from "@btnsg/shared";
import PageHero from "../components/PageHero.jsx";
import MediaTile from "../components/MediaTile.jsx";
import Lightbox from "../components/Lightbox.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { GallerySkeleton } from "../components/Skeleton.jsx";
import { loadImages, withTag } from "../lib/gallery.js";
import { content } from "../lib/siteContent.js";

const PAGE_SIZES = [12, 24, 48, 0];
const programOf = (img) => img.program || img.album || "";

export default function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Bộ lọc, sắp xếp & chế độ xem (đồng bộ với Dashboard Khoảnh khắc)
  const [searchQuery, setSearchQuery] = useState("");
  const [year, setYear] = useState("");
  const [week, setWeek] = useState("");
  const [program, setProgram] = useState("");
  const [tag, setTag] = useState("");
  const [sortMode, setSortMode] = useState("newest"); // "newest" | "oldest" | "program"
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "list" | "week" | "program"

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  useEffect(() => {
    let alive = true;
    loadImages()
      .then((data) => {
        if (alive) setImages(data);
      })
      .catch((err) => {
        if (alive) setError(err.message || "Không tải được thư viện ảnh.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const years = useMemo(
    () => [...new Set(images.map((img) => (img.date || "").slice(0, 4)).filter(Boolean))].sort().reverse(),
    [images],
  );

  const weeks = useMemo(() => {
    const map = new Map();
    for (const img of images) {
      if (year && !(img.date || "").startsWith(year)) continue;
      const info = getIsoWeekInfo(img.date);
      if (info && !map.has(info.key)) map.set(info.key, info.label);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [images, year]);

  const programs = useMemo(
    () =>
      [
        ...new Set(
          images
            .filter((img) => (!year || (img.date || "").startsWith(year)) && (!week || getWeekKey(img.date) === week))
            .map(programOf)
            .filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b, "vi")),
    [images, year, week],
  );

  const tags = useMemo(
    () => [...new Set(images.flatMap((img) => img.tags || []))].sort((a, b) => a.localeCompare(b, "vi")),
    [images],
  );
  const taggedIds = useMemo(() => (tag ? new Set(withTag(images, tag).map((img) => img.id)) : null), [images, tag]);

  const filteredImages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = images.filter((img) => {
      const prog = programOf(img);
      if (year && !(img.date || "").startsWith(year)) return false;
      if (week && getWeekKey(img.date) !== week) return false;
      if (program && prog !== program) return false;
      if (taggedIds && !taggedIds.has(img.id)) return false;
      if (q) {
        const hay = `${img.name || ""} ${img.caption || ""} ${prog} ${img.date || ""} ${(img.tags || []).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortMode === "oldest") return (a.date || "").localeCompare(b.date || "");
      if (sortMode === "program") {
        const cmp = (programOf(a) || "zzz").localeCompare(programOf(b) || "zzz", "vi");
        return cmp !== 0 ? cmp : (b.date || "").localeCompare(a.date || "");
      }
      return (b.date || "").localeCompare(a.date || "");
    });
  }, [images, searchQuery, year, week, program, taggedIds, sortMode]);

  const isGrouped = viewMode === "week" || viewMode === "program";
  const totalCount = filteredImages.length;
  const isAll = isGrouped || pageSize === 0 || pageSize >= totalCount;
  const effectivePageSize = isAll ? totalCount : pageSize;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalCount / effectivePageSize));

  const validPage = Math.min(currentPage, totalPages);
  const startIndex = isAll ? 0 : (validPage - 1) * effectivePageSize;
  const endIndex = isAll ? totalCount : Math.min(startIndex + effectivePageSize, totalCount);

  const currentImages = useMemo(
    () => filteredImages.slice(startIndex, endIndex),
    [filteredImages, startIndex, endIndex],
  );

  const groups = useMemo(() => {
    if (!isGrouped) return null;
    const map = new Map();
    filteredImages.forEach((img, index) => {
      const key = viewMode === "week" ? getWeekKey(img.date) || "unknown" : programOf(img) || "Chưa phân chương trình";
      const label = viewMode === "week" ? formatWeekLabel(img.date) : key;
      const bucket = map.get(key) || { key, label, items: [] };
      bucket.items.push({ image: img, index });
      map.set(key, bucket);
    });
    const list = [...map.values()];
    if (viewMode === "week") {
      list.sort((a, b) => (sortMode === "oldest" ? a.key.localeCompare(b.key) : b.key.localeCompare(a.key)));
    } else {
      list.sort((a, b) => a.label.localeCompare(b.label, "vi"));
    }
    return list;
  }, [filteredImages, isGrouped, viewMode, sortMode]);

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
    setLightboxIndex(((i % filteredImages.length) + filteredImages.length) % filteredImages.length);
  };

  const onResetFilters = () => {
    setSearchQuery("");
    setYear("");
    setWeek("");
    setProgram("");
    setTag("");
    setCurrentPage(1);
  };

  const onRetry = () => {
    setLoading(true);
    setError(null);
    loadImages()
      .then((data) => setImages(data))
      .catch((err) => setError(err.message || "Không tải được thư viện ảnh."))
      .finally(() => setLoading(false));
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

  const hasActiveFilters = Boolean(searchQuery || year || week || program || tag);

  const renderTile = (image, idx, targetIdx) => {
    const prog = programOf(image);
    const weekInfo = getIsoWeekInfo(image.date);
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
          <span className="tag">{prog || (weekInfo ? `Tuần ${weekInfo.week}` : `#${(targetIdx + 1).toString().padStart(2, "0")}`)}</span>
          <span className="tag">
            <PiArrowsOut aria-hidden="true" /> Phóng to
          </span>
        </span>
      </button>
    );
  };

  return (
    <>
      <PageHero title={content.galleryPage.pageTitle} lead={content.galleryPage.pageLead} />
      <main className="section section-tight">
        <div className="wrap">
          {loading && <GallerySkeleton />}
          {error && (
            <EmptyState
              icon="error"
              variant="error"
              eyebrow="Không thể kết nối"
              title="Chưa tải được thư viện ảnh"
              description={error}
              action={{ label: "Thử lại", onClick: onRetry, icon: "retry" }}
              secondaryAction={{ label: "Về trang chủ", to: "/" }}
            />
          )}
          {!loading && !error && images.length === 0 && (
            <EmptyState
              icon="gallery"
              eyebrow="Thư viện ảnh"
              title="Chưa có khoảnh khắc nào được đăng tải"
              description="Những hình ảnh thờ phượng, sinh hoạt và phục vụ của Ban Thanh Niên sẽ sớm được cập nhật tại đây."
              action={{ label: "Xem lịch sinh hoạt", to: "/sinh-hoat", icon: "arrow" }}
              secondaryAction={{ label: "Về trang chủ", to: "/" }}
            />
          )}

          {!loading && !error && images.length > 0 && (
            <>
              <div className="toolbar glass" id="gallery-grid-top">
                <label className="search-box">
                  <PiMagnifyingGlass aria-hidden="true" />
                  <input
                    type="text"
                    placeholder="Tìm khoảnh khắc, chương trình, tag..."
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

                <select
                  className="gallery-select"
                  aria-label="Sắp xếp ảnh"
                  value={sortMode}
                  onChange={(e) => {
                    setSortMode(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="oldest">Cũ nhất</option>
                  <option value="program">Chương trình A–Z</option>
                </select>

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
                    className={viewMode === "week" ? "is-active" : undefined}
                    onClick={() => setViewMode("week")}
                    aria-pressed={viewMode === "week"}
                  >
                    <PiCalendarBlank aria-hidden="true" />
                    <span>Theo tuần</span>
                  </button>
                  <button
                    type="button"
                    className={viewMode === "program" ? "is-active" : undefined}
                    onClick={() => setViewMode("program")}
                    aria-pressed={viewMode === "program"}
                  >
                    <PiFolderOpen aria-hidden="true" />
                    <span>Chương trình</span>
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

                {!isGrouped && (
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
                )}
              </div>

              {(years.length > 1 || weeks.length > 0 || programs.length > 0) && (
                <div className="gallery-filters">
                  {years.length > 1 && (
                    <select
                      className="gallery-select"
                      aria-label="Lọc theo năm"
                      value={year}
                      onChange={(e) => {
                        setYear(e.target.value);
                        setWeek("");
                        setProgram("");
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">Mọi năm</option>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          Năm {y}
                        </option>
                      ))}
                    </select>
                  )}

                  {weeks.length > 0 && (
                    <select
                      className="gallery-select"
                      aria-label="Lọc theo tuần"
                      value={week}
                      onChange={(e) => {
                        setWeek(e.target.value);
                        setProgram("");
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">Mọi tuần</option>
                      {weeks.map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  )}

                  {programs.length > 0 && (
                    <select
                      className="gallery-select"
                      aria-label="Lọc theo chương trình"
                      value={program}
                      onChange={(e) => {
                        setProgram(e.target.value);
                        setCurrentPage(1);
                      }}
                    >
                      <option value="">Mọi chương trình</option>
                      {programs.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  )}

                  {hasActiveFilters && (
                    <button type="button" className="chip" onClick={onResetFilters}>
                      <PiX aria-hidden="true" /> Xóa bộ lọc
                    </button>
                  )}
                </div>
              )}

              {tags.length > 0 && (
                <div className="chip-row album-row" role="group" aria-label="Lọc theo tag">
                  {["", ...tags].map((name) => (
                    <button
                      key={name || "all-tags"}
                      type="button"
                      className={`chip${tag === name ? " is-active" : ""}`}
                      onClick={() => {
                        setTag(name);
                        setCurrentPage(1);
                      }}
                      aria-pressed={tag === name}
                    >
                      {name ? `#${name}` : "Mọi chủ đề"}
                    </button>
                  ))}
                </div>
              )}

              <p className="gallery-meta">
                Hiển thị{" "}
                <strong>
                  {totalCount > 0 ? startIndex + 1 : 0}–{endIndex}
                </strong>{" "}
                trên tổng số <strong>{totalCount}</strong> ảnh
                {hasActiveFilters && ` (lọc từ ${images.length} ảnh)`}
              </p>

              {currentImages.length === 0 ? (
                <EmptyState
                  icon="search"
                  variant="search"
                  compact
                  title="Không tìm thấy khoảnh khắc phù hợp"
                  description={
                    searchQuery.trim()
                      ? `Không có ảnh nào khớp với từ khóa "${searchQuery.trim()}" cùng bộ lọc hiện tại.`
                      : "Không có ảnh nào khớp với bộ lọc bạn đã chọn."
                  }
                  action={{ label: "Xóa bộ lọc", onClick: onResetFilters }}
                />
              ) : groups ? (
                <div className="gallery-groups">
                  {groups.map((group) => (
                    <section key={group.key} className="gallery-group">
                      <header className="gallery-group-head">
                        <h2>{group.label}</h2>
                        <span>{group.items.length} ảnh</span>
                      </header>
                      <div className="gallery-grid">
                        {group.items.map(({ image, index }, i) => renderTile(image, i, index))}
                      </div>
                    </section>
                  ))}
                </div>
              ) : (
                <div className={`gallery-grid${viewMode === "list" ? " is-list" : ""}`}>
                  {currentImages.map((image, idx) => renderTile(image, idx, startIndex + idx))}
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
            images={filteredImages}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onNavigate={navigate}
          />
        </div>
      </main>
    </>
  );
}

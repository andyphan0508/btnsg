/**
 * Khung chờ tải (Skeleton) đồng bộ với giao diện kính mờ — giúp chuyển trang và tải dữ liệu
 * mượt mà, không bị giật bố cục (CLS) hay màn hình trắng.
 */

export const PageSkeleton = () => (
  <div className="skeleton-page wrap" aria-busy="true" aria-label="Đang tải trang">
    <div className="skeleton-hero">
      <div className="skeleton-hero-copy">
        <span className="sk sk-pill" />
        <span className="sk sk-title" />
        <span className="sk sk-title is-short" />
        <span className="sk sk-line" />
        <span className="sk sk-line is-mid" />
      </div>
      <div className="sk skeleton-hero-frame" />
    </div>
    <div className="skeleton-grid">
      {Array.from({ length: 3 }, (_, i) => (
        <div className="skeleton-card glass" key={i}>
          <span className="sk sk-media" />
          <div className="skeleton-card-body">
            <span className="sk sk-pill" />
            <span className="sk sk-heading" />
            <span className="sk sk-line" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const GallerySkeleton = ({ count = 6 }) => (
  <div className="skeleton-gallery" aria-busy="true" aria-label="Đang tải thư viện ảnh">
    <div className="skeleton-toolbar glass">
      <span className="sk sk-input" />
      <span className="sk sk-seg" />
      <span className="sk sk-seg" />
    </div>
    <div className="gallery-grid">
      {Array.from({ length: count }, (_, i) => (
        <div className="sk skeleton-tile" style={{ "--i": i % 4 }} key={i} />
      ))}
    </div>
  </div>
);

export const NewsSkeleton = () => (
  <div className="skeleton-news" aria-busy="true" aria-label="Đang tải tin tức">
    <div className="news-featured glass skeleton-featured">
      <div className="sk sk-media" />
      <div className="skeleton-card-body">
        <span className="sk sk-pill" />
        <span className="sk sk-title" />
        <span className="sk sk-line" />
        <span className="sk sk-line is-mid" />
        <span className="sk sk-btn" />
      </div>
    </div>
    <div className="news-grid">
      {Array.from({ length: 3 }, (_, i) => (
        <div className="news-card glass skeleton-card" key={i}>
          <div className="news-media">
            <span className="sk sk-media" />
          </div>
          <div className="skeleton-card-body">
            <span className="sk sk-pill" />
            <span className="sk sk-heading" />
            <span className="sk sk-line" />
            <span className="sk sk-line is-short" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const SermonListSkeleton = ({ count = 3 }) => (
  <div className="skeleton-sermons" aria-busy="true" aria-label="Đang tải bài giảng">
    <div className="skeleton-toolbar glass">
      <span className="sk sk-input" />
    </div>
    <div className="news-grid">
      {Array.from({ length: count }, (_, i) => (
        <div className="news-card glass skeleton-card" key={i}>
          <div className="skeleton-card-body">
            <span className="sk sk-pill" />
            <span className="sk sk-heading" />
            <span className="sk sk-line" />
            <span className="sk sk-line is-mid" />
            <span className="sk sk-line is-short" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ArticleSkeleton = () => (
  <div className="article skeleton-article" aria-busy="true" aria-label="Đang tải nội dung">
    <span className="sk sk-pill" />
    <div className="skeleton-article-head">
      <span className="sk sk-pill" />
      <span className="sk sk-title" />
      <span className="sk sk-title is-short" />
      <span className="sk sk-line is-mid" />
    </div>
    <span className="sk skeleton-article-cover" />
    <div className="skeleton-article-body">
      <span className="sk sk-line" />
      <span className="sk sk-line" />
      <span className="sk sk-line is-mid" />
      <span className="sk sk-line" />
      <span className="sk sk-line is-short" />
    </div>
  </div>
);

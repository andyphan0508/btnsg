import { Link } from "react-router-dom";
import { ArrowRightOutlined, CalendarOutlined } from "@ant-design/icons";
import { driveImage } from "../lib/gallery.js";
import { formatNewsDate, prefetchPost } from "../lib/news.js";

/** Thẻ bài viết mới nhất phong cách Aardvark Monthly Featured Drop. */
export default function NewsFeaturedCard({ post }) {
  return (
    <Link
      to={`/tin-tuc/${post.id}`}
      className="news-featured-card"
      onMouseEnter={() => prefetchPost(post.id)}
      onFocus={() => prefetchPost(post.id)}
    >
      <div className="news-card-media" style={{ height: "100%", minHeight: 300, borderBottom: "none" }}>
        {post.demo ? (
          <div
            className="news-card-demo"
            style={{
              background: `linear-gradient(135deg, hsl(${post.hue ?? 24} 60% 50%), hsl(${((post.hue ?? 24) + 40) % 360} 65% 40%))`,
              width: "100%",
              height: "100%",
            }}
          />
        ) : post.cover ? (
          <img
            src={driveImage(post.cover, 1200)}
            alt={post.title}
            className="news-card-img"
            loading="eager"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="news-card-demo news-card-nocover" style={{ width: "100%", height: "100%", background: "var(--surface-2)" }} />
        )}
      </div>
      <div className="news-card-body" style={{ padding: 36, justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="tag-pill tag-pill-orange">Mới nhất</span>
          <time style={{ fontSize: "0.84rem", fontWeight: 600, color: "var(--ink-2)" }} dateTime={post.date}>
            <CalendarOutlined style={{ marginRight: 6 }} />
            {formatNewsDate(post.date)}
          </time>
        </div>
        <h2 style={{ fontSize: "1.6rem", fontWeight: 900, margin: "14px 0 10px", color: "var(--ink)", lineHeight: 1.25 }}>
          {post.title}
        </h2>
        {post.description && (
          <p style={{ fontSize: "0.98rem", color: "var(--ink-2)", lineHeight: 1.65, marginBottom: 20 }}>
            {post.description}
          </p>
        )}
        <div className="btn-aardvark" style={{ width: "fit-content" }}>
          <span className="btn-text-part">Đọc toàn bộ bài viết</span>
          <span className="btn-icon-part">
            <ArrowRightOutlined />
          </span>
        </div>
      </div>
    </Link>
  );
}

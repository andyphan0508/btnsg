import { Link } from "react-router-dom";
import { ArrowRightOutlined, CalendarOutlined } from "@ant-design/icons";
import { driveImage } from "../lib/gallery.js";
import { formatNewsDate, prefetchPost } from "../lib/news.js";

/** Thẻ bài viết trong lưới Tin tức theo phong cách Aardvark Book Drop. */
export default function NewsCard({ post }) {
  return (
    <Link
      to={`/tin-tuc/${post.id}`}
      className="news-card"
      onMouseEnter={() => prefetchPost(post.id)}
      onFocus={() => prefetchPost(post.id)}
    >
      <div className="news-card-media">
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
            src={driveImage(post.cover, 800)}
            alt={post.title}
            className="news-card-img"
            loading="lazy"
            decoding="async"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div className="news-card-demo news-card-nocover" style={{ width: "100%", height: "100%", background: "var(--surface-2)" }} />
        )}
      </div>
      <div className="news-card-body">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span className="tag-pill tag-pill-yellow">Tin tức</span>
          <time style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--ink-3)" }} dateTime={post.date}>
            <CalendarOutlined style={{ marginRight: 4 }} />
            {formatNewsDate(post.date)}
          </time>
        </div>
        <h3 className="news-card-title">{post.title}</h3>
        {post.description && <p className="news-card-desc">{post.description}</p>}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--brand)", fontSize: "0.9rem", marginTop: "auto" }}>
          <span>Đọc bài viết</span>
          <ArrowRightOutlined />
        </div>
      </div>
    </Link>
  );
}

import { Link } from "react-router-dom";
import { PiArrowRight, PiCalendarBlank } from "react-icons/pi";
import { driveImage } from "../lib/gallery.js";
import { formatNewsDate, prefetchPost } from "../lib/news.js";
import RollText from "./RollText.jsx";

/** Ảnh bìa bài viết: ảnh Drive, gradient demo, hoặc nền trống khi bài chưa có bìa. */
export function NewsCover({ post, width }) {
  if (post.demo) return <div className="media-tile media-demo" style={{ "--h": post.hue ?? 24 }} />;
  if (!post.cover) return <div className="media-tile news-nocover" />;
  return (
    <img
      className="media-tile"
      src={driveImage(post.cover, width)}
      alt={post.title}
      loading="lazy"
      decoding="async"
    />
  );
}

/** Thẻ bài viết kính trong lưới Tin tức. */
export default function NewsCard({ post, index = 0 }) {
  return (
    <Link
      to={`/tin-tuc/${post.id}`}
      className="news-card glass sfx-rise"
      style={{ "--i": index % 3 }}
      onMouseEnter={() => prefetchPost(post.id)}
      onFocus={() => prefetchPost(post.id)}
      data-sheen
    >
      <div className="news-media">
        <NewsCover post={post} width={800} />
      </div>
      <div className="news-body">
        <time className="news-date" dateTime={post.date}>
          <PiCalendarBlank aria-hidden="true" />
          {formatNewsDate(post.date)}
        </time>
        <h3 className="news-title">{post.title}</h3>
        {post.description && <p className="news-desc">{post.description}</p>}
        <span className="news-more">
          <RollText text="Đọc bài viết" />
          <PiArrowRight aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

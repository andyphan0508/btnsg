import { Link } from "react-router-dom";
import { PiArrowRight, PiCalendarBlank } from "react-icons/pi";
import { formatNewsDate, prefetchPost } from "../lib/news.js";
import { NewsCover } from "./NewsCard.jsx";
import RollText from "./RollText.jsx";

/** Bài viết mới nhất: thẻ kính lớn chia đôi ảnh / chữ. */
export default function NewsFeaturedCard({ post }) {
  return (
    <Link
      to={`/tin-tuc/${post.id}`}
      className="news-featured glass sfx-rise"
      onMouseEnter={() => prefetchPost(post.id)}
      onFocus={() => prefetchPost(post.id)}
      data-sheen
    >
      <div className="news-media">
        <NewsCover post={post} width={1200} />
      </div>
      <div className="news-body">
        <div className="news-meta">
          <span className="live-chip">Mới nhất</span>
          <time className="news-date" dateTime={post.date}>
            <PiCalendarBlank aria-hidden="true" />
            {formatNewsDate(post.date)}
          </time>
        </div>
        <h2 className="news-title">{post.title}</h2>
        {post.description && <p className="news-desc">{post.description}</p>}
        <span className="btn btn-sun news-cta">
          <RollText text="Đọc toàn bộ bài viết" />
          <span className="btn-icon">
            <PiArrowRight />
          </span>
        </span>
      </div>
    </Link>
  );
}

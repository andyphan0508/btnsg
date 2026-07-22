import { Link } from 'react-router-dom'
import { driveImage } from '../lib/gallery.js'
import { formatNewsDate, prefetchPost } from '../lib/news.js'

/** Thẻ lớn cho bài viết mới nhất — ảnh một bên, nội dung một bên. */
export default function NewsFeaturedCard({ post }) {
  return (
    <Link
      to={`/tin-tuc/${post.id}`}
      className="news-featured"
      onMouseEnter={() => prefetchPost(post.id)}
      onFocus={() => prefetchPost(post.id)}
    >
      <div className="news-featured-media">
        {post.demo ? (
          <div
            className="news-card-demo"
            style={{
              background: `linear-gradient(135deg, hsl(${post.hue ?? 24} 70% 55%), hsl(${((post.hue ?? 24) + 40) % 360} 75% 45%))`,
            }}
          />
        ) : post.cover ? (
          <img src={driveImage(post.cover, 1200)} alt={post.title} loading="eager" decoding="async" />
        ) : (
          <div className="news-card-demo news-card-nocover" />
        )}
      </div>
      <div className="news-featured-body">
        <span className="news-featured-badge">Mới nhất</span>
        <time className="news-card-date" dateTime={post.date}>
          {formatNewsDate(post.date)}
        </time>
        <h3 className="news-featured-title">{post.title}</h3>
        {post.description && <p className="news-featured-desc">{post.description}</p>}
        <span className="news-card-more">
          Đọc bài viết <span className="news-arrow">→</span>
        </span>
      </div>
    </Link>
  )
}

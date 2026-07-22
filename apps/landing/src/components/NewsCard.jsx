import { Link } from 'react-router-dom'
import { driveImage } from '../lib/gallery.js'
import { formatNewsDate, prefetchPost } from '../lib/news.js'

/** Thẻ bài viết trong lưới Tin tức: ảnh bìa (kèm nhãn ngày) + tiêu đề + mô tả. */
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
              background: `linear-gradient(135deg, hsl(${post.hue ?? 24} 70% 55%), hsl(${((post.hue ?? 24) + 40) % 360} 75% 45%))`,
            }}
          />
        ) : post.cover ? (
          <img src={driveImage(post.cover, 800)} alt={post.title} loading="lazy" decoding="async" />
        ) : (
          <div className="news-card-demo news-card-nocover" />
        )}
        <time className="news-card-chip" dateTime={post.date}>
          {formatNewsDate(post.date)}
        </time>
      </div>
      <div className="news-card-body">
        <h3 className="news-card-title">{post.title}</h3>
        {post.description && <p className="news-card-desc">{post.description}</p>}
        <span className="news-card-more">
          Đọc tiếp <span className="news-arrow">→</span>
        </span>
      </div>
    </Link>
  )
}

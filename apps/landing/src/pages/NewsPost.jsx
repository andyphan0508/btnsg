import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Markdown from '../components/Markdown.jsx'
import { driveImage } from '../lib/gallery.js'
import { fetchPost, formatNewsDate, readNewsCache, subscribeWindowFocus } from '../lib/news.js'

/** Ước lượng thời gian đọc (phút) theo ~200 từ/phút. */
const estimateReadMinutes = (content) => {
  if (!content) return 1
  const words = content.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

export default function NewsPost() {
  const { postId } = useParams()
  // Vẽ ngay từ cache trình duyệt (đã prefetch khi rê chuột hoặc đọc lần trước),
  // rồi fetch bản mới phía sau cập nhật đè.
  const [post, setPost] = useState(() => readNewsCache(`post:${postId}`))
  const [isLoadingPost, setIsLoadingPost] = useState(!post)
  const [postError, setPostError] = useState(null)

  // silent = làm mới ngầm (đã có bài trên màn hình): lỗi lẻ tẻ không cần làm phiền người xem.
  const loadPost = async (silent) => {
    try {
      const data = await fetchPost(postId)
      setPost(data)
      setPostError(null)
    } catch (error) {
      if (!silent) setPostError(error.message || 'Không tải được bài viết.')
    } finally {
      setIsLoadingPost(false)
    }
  }

  useEffect(() => {
    const cachedPost = readNewsCache(`post:${postId}`)
    setPost(cachedPost)
    setIsLoadingPost(!cachedPost)
    setPostError(null)
    loadPost(Boolean(cachedPost))
    // Mỗi lần focus lại tab → gọi Apps Script làm mới bài viết ngầm.
    return subscribeWindowFocus(() => loadPost(true))
  }, [postId])

  // Map "tên file ảnh (thường, chuẩn hoá NFC)" → Drive ID để Markdown resolve ![...](ten-anh.jpg).
  // Đăng ký cả tên bỏ đuôi file — ảnh upload lên Drive nhiều khi mất đuôi .jpg,
  // trong khi người viết bài vẫn quen tay gõ kèm đuôi (và ngược lại).
  const imageMap = {}
  for (const image of post?.images || []) {
    const name = image.name.normalize('NFC').toLowerCase()
    imageMap[name] = image.id
    imageMap[name.replace(/\.[a-z0-9]+$/i, '')] = image.id
  }

  return (
    <main className="wrap gallery-page news-post-page">
      {isLoadingPost && <div className="gallery-status">Đang tải bài viết…</div>}
      {postError && <div className="gallery-status gallery-error">{postError}</div>}

      {!isLoadingPost && !postError && post && (
        <article className="news-post">
          <Link to="/tin-tuc" className="news-back">
            <span className="news-back-arrow">←</span> Tất cả tin tức
          </Link>
          <header className="news-post-head">
            <p className="news-post-meta">
              <time dateTime={post.date}>{formatNewsDate(post.date)}</time>
              <span className="news-post-meta-dot">·</span>
              {estimateReadMinutes(post.content)} phút đọc
            </p>
            <h1 className="news-post-title">{post.title}</h1>
            {post.description && <p className="news-post-lead">{post.description}</p>}
          </header>
          {post.cover && !post.demo && (
            <img
              className="news-post-cover"
              src={driveImage(post.cover, 1600)}
              alt={post.title}
              decoding="async"
            />
          )}
          <Markdown content={post.content} imageMap={imageMap} coverId={post.cover} />
          <footer className="news-post-foot">
            <Link to="/tin-tuc" className="news-back">
              <span className="news-back-arrow">←</span> Xem các bài viết khác
            </Link>
          </footer>
        </article>
      )}
    </main>
  )
}

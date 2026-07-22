import { useEffect, useState } from 'react'
import Reveal from '../components/Reveal.jsx'
import NewsCard from '../components/NewsCard.jsx'
import NewsFeaturedCard from '../components/NewsFeaturedCard.jsx'
import { fetchPosts, isNewsConfigured, readNewsCache, subscribeWindowFocus } from '../lib/news.js'

export default function News() {
  // Vẽ ngay từ cache trình duyệt (nếu có), rồi fetch bản mới phía sau cập nhật đè.
  const cachedPosts = readNewsCache('list')
  const [posts, setPosts] = useState(cachedPosts || [])
  const [isLoadingPosts, setIsLoadingPosts] = useState(!cachedPosts)
  const [postsError, setPostsError] = useState(null)

  // silent = làm mới ngầm (đã có bài trên màn hình): lỗi lẻ tẻ không cần làm phiền người xem.
  const loadPosts = async (silent) => {
    try {
      const data = await fetchPosts()
      setPosts(data)
      setPostsError(null)
    } catch (error) {
      if (!silent) setPostsError(error.message || 'Không tải được tin tức.')
    } finally {
      setIsLoadingPosts(false)
    }
  }

  useEffect(() => {
    loadPosts(Boolean(cachedPosts))
    // Mỗi lần focus lại tab → gọi Apps Script làm mới danh sách ngầm.
    return subscribeWindowFocus(() => loadPosts(true))
  }, [])

  const [featuredPost, ...otherPosts] = posts

  return (
    <main className="wrap gallery-page">
      <Reveal className="sec-head" variant="slide-up">
        <p className="eyebrow">Tin tức</p>
        <h2>Tin tức &amp; bài viết</h2>
        <p className="lead">
          Tin tức, thông báo và bài viết về các hoạt động của Ban Thanh Niên HTTL Sài Gòn.
        </p>
      </Reveal>

      {!isNewsConfigured && (
        <div className="gallery-note">
          Đang xem dữ liệu mẫu — cấu hình <code>VITE_NEWS_SCRIPT_URL</code> (Google Apps Script đọc
          folder Tin tức trên Google Drive) để hiển thị bài viết thật. Xem hướng dẫn trong{' '}
          <code>DEPLOY.md</code>.
        </div>
      )}

      {isLoadingPosts && <div className="gallery-status">Đang tải tin tức…</div>}
      {postsError && <div className="gallery-status gallery-error">{postsError}</div>}
      {!isLoadingPosts && !postsError && posts.length === 0 && (
        <div className="gallery-status">Chưa có bài viết nào.</div>
      )}

      {!isLoadingPosts && !postsError && featuredPost && (
        <Reveal variant="slide-up">
          <NewsFeaturedCard post={featuredPost} />
        </Reveal>
      )}

      {!isLoadingPosts && !postsError && otherPosts.length > 0 && (
        <Reveal variant="slide-up">
          <div className="news-grid">
            {otherPosts.map((post) => (
              <NewsCard key={post.id} post={post} />
            ))}
          </div>
        </Reveal>
      )}
    </main>
  )
}

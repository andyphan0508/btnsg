import { useEffect, useState } from 'react'
import PageHero from '../components/PageHero.jsx'
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
  const ready = !isLoadingPosts && !postsError

  return (
    <>
      <PageHero
        title="Tin tức & bài viết"
        lead="Tin tức, thông báo và bài viết về các hoạt động của Ban Thanh Niên HTTL Sài Gòn."
      />
      <main className="section section-tight">
        <div className="wrap">
          {!isNewsConfigured && (
            <div className="notice glass">
              Đang xem dữ liệu mẫu — cấu hình <code>VITE_NEWS_SCRIPT_URL</code> (Google Apps Script
              đọc folder Tin tức trên Google Drive) để hiển thị bài viết thật. Xem hướng dẫn trong{' '}
              <code>DEPLOY.md</code>.
            </div>
          )}

          {isLoadingPosts && <div className="status">Đang tải tin tức…</div>}
          {postsError && <div className="status is-error">{postsError}</div>}
          {ready && posts.length === 0 && <div className="status">Chưa có bài viết nào.</div>}

          {ready && featuredPost && <NewsFeaturedCard post={featuredPost} />}

          {ready && otherPosts.length > 0 && (
            <div className="news-grid">
              {otherPosts.map((post, i) => (
                <NewsCard key={post.id} post={post} index={i} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  )
}

import { useEffect, useState } from 'react'
import PageHero from '../components/PageHero.jsx'
import NewsCard from '../components/NewsCard.jsx'
import NewsFeaturedCard from '../components/NewsFeaturedCard.jsx'
import EmptyState from '../components/EmptyState.jsx'
import { NewsSkeleton } from '../components/Skeleton.jsx'
import { fetchPosts, readNewsCache, subscribeWindowFocus } from '../lib/news.js'
import { content } from '../lib/siteContent.js'

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

  const onRetry = () => {
    setIsLoadingPosts(true)
    setPostsError(null)
    loadPosts(false)
  }

  return (
    <>
      <PageHero title={content.newsPage.pageTitle} lead={content.newsPage.pageLead} />
      <main className="section section-tight">
        <div className="wrap">
          {isLoadingPosts && <NewsSkeleton />}
          {postsError && (
            <EmptyState
              icon="error"
              variant="error"
              eyebrow="Không thể kết nối"
              title="Chưa tải được tin tức"
              description={postsError}
              action={{ label: 'Thử lại', onClick: onRetry, icon: 'retry' }}
              secondaryAction={{ label: 'Về trang chủ', to: '/' }}
            />
          )}
          {ready && posts.length === 0 && (
            <EmptyState
              icon="news"
              eyebrow="Tin tức & bài viết"
              title="Chưa có bài viết nào được đăng tải"
              description="Các thông báo mới nhất và bài viết về hoạt động của Ban Thanh Niên sẽ sớm được chia sẻ tại đây."
              action={{ label: 'Xem lịch sinh hoạt', to: '/sinh-hoat', icon: 'arrow' }}
              secondaryAction={{ label: 'Về trang chủ', to: '/' }}
            />
          )}

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

// Lớp lấy dữ liệu Tin tức. Nguồn chính: bài đăng từ dashboard (bảng posts trên Supabase, đọc qua
// /api/library?t=posts). Bài cũ trên Google Drive (Apps Script, VITE_NEWS_SCRIPT_URL) vẫn được gộp
// vào danh sách để không mất bài. Không có nguồn nào → dữ liệu demo.

const NEWS_URL = import.meta.env.VITE_NEWS_SCRIPT_URL || ''
// Production đi qua proxy có cache CDN (api/feed.js); chạy dev không có /api nên gọi thẳng Apps Script.
const NEWS_FEED = import.meta.env.DEV ? NEWS_URL : '/api/feed?src=news'

export const isNewsConfigured = Boolean(NEWS_URL)
const POSTS_FEED = '/api/library?t=posts'
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
/** Bài Supabase có id dạng UUID; bài Drive dùng id folder Drive. */
const isLibraryPost = (postId) => UUID.test(postId)

/** /api/library trả JSON; chạy dev (không có /api) hoặc lỗi mạng → null. */
const getLibrary = (url) =>
  fetch(url)
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null)

/* ---------- Cache trình duyệt (stale-while-revalidate) ----------
   Lượt xem sau hiển thị NGAY từ localStorage, rồi âm thầm fetch bản mới để cập nhật.
   Cache chỉ để vẽ nhanh — mỗi lần mở trang vẫn luôn fetch lại phía sau. */

const CACHE_PREFIX = 'btnsg-news:'

export function readNewsCache(key) {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeNewsCache(key, data) {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data))
  } catch {
    // localStorage đầy/bị chặn → bỏ qua, chỉ mất tối ưu chứ không lỗi.
  }
}

/** Ngày yyyy-mm-dd → "20 tháng 7, 2026" cho giao diện. */
export function formatNewsDate(isoDate) {
  if (!isoDate) return ''
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return isoDate
  return `${day} tháng ${month}, ${year}`
}

/* ---------- API công khai ---------- */

// Quá thời gian này coi như URL script chết/mạng lỗi — báo lỗi thay vì treo "Đang tải" mãi.
const FETCH_TIMEOUT_MS = 15000

async function fetchJson(url) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  let response
  try {
    response = await fetch(url, { redirect: 'follow', signal: controller.signal })
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(
        'Máy chủ tin tức phản hồi quá lâu — kiểm tra URL Apps Script còn hoạt động không (mở URL /exec trực tiếp trên trình duyệt).',
      )
    }
    throw error
  } finally {
    clearTimeout(timeoutId)
  }
  if (!response.ok) {
    throw new Error(
      `Không gọi được Apps Script (HTTP ${response.status}) — URL deployment có thể đã đổi, kiểm tra lại VITE_NEWS_SCRIPT_URL.`,
    )
  }
  const text = await response.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    // Apps Script trả về HTML thay vì JSON → thường do deploy sai quyền truy cập.
    throw new Error(
      'Apps Script không trả về JSON — kiểm tra deploy Web app với "Who has access: Anyone" và dùng đúng URL /exec.',
    )
  }
  if (data && data.error) throw new Error(data.error)
  return data
}

/** Danh sách bài viết (metadata), gộp bài Supabase + bài Drive cũ, sắp mới → cũ. */
export async function fetchPosts() {
  const [library, drive] = await Promise.all([
    getLibrary(POSTS_FEED),
    isNewsConfigured ? fetchJson(NEWS_FEED).catch((error) => ({ error })) : { posts: [] },
  ])
  const libraryPosts = Array.isArray(library?.posts) ? library.posts : []
  // Drive lỗi mà Supabase cũng không có bài → báo lỗi như trước; có bài Supabase thì vẫn hiện.
  if (drive.error && libraryPosts.length === 0) throw drive.error
  const drivePosts = Array.isArray(drive.posts) ? drive.posts : []
  const posts = [...libraryPosts, ...drivePosts].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  writeNewsCache('list', posts)
  return posts
}

/** Một bài viết đầy đủ: nội dung Markdown + danh sách ảnh của bài. */
export async function fetchPost(postId) {
  if (!postId) return null
  if (isLibraryPost(postId)) {
    const data = await getLibrary(`${POSTS_FEED}&id=${postId}`)
    if (!data?.post) throw new Error('Không tìm thấy bài viết.')
    writeNewsCache(`post:${postId}`, data.post)
    return data.post
  }
  if (!isNewsConfigured) throw new Error('Không tìm thấy bài viết.')
  const separator = NEWS_FEED.includes('?') ? '&' : '?'
  const post = await fetchJson(`${NEWS_FEED}${separator}post=${encodeURIComponent(postId)}`)
  if (post && post.id) writeNewsCache(`post:${post.id}`, post)
  return post
}

/* ---------- Làm mới khi focus lại tab ---------- */

const FOCUS_REFETCH_MIN_GAP_MS = 5000

let lastFocusRefetchAt = 0

/**
 * Gắn listener: mỗi lần cửa sổ được focus lại → gọi refetch (làm mới dữ liệu ngầm).
 * Chặn gọi dồn dập trong 5 giây (focus event có thể bắn liên tiếp).
 * Trả về hàm cleanup cho useEffect.
 */
export function subscribeWindowFocus(refetch) {
  const handleWindowFocus = () => {
    const now = Date.now()
    if (now - lastFocusRefetchAt < FOCUS_REFETCH_MIN_GAP_MS) return
    lastFocusRefetchAt = now
    refetch()
  }
  window.addEventListener('focus', handleWindowFocus)
  return () => window.removeEventListener('focus', handleWindowFocus)
}

/* ---------- Prefetch khi rê chuột lên thẻ bài viết ---------- */

const prefetchedIds = new Set()

/** Tải trước bài viết (fire-and-forget) — bấm vào là bài đã nằm sẵn trong cache. */
export function prefetchPost(postId) {
  if (!postId || (!isNewsConfigured && !isLibraryPost(postId))) return
  if (prefetchedIds.has(postId)) return
  prefetchedIds.add(postId)
  fetchPost(postId).catch(() => {
    prefetchedIds.delete(postId) // lỗi mạng → cho phép thử lại lần rê chuột sau
  })
}

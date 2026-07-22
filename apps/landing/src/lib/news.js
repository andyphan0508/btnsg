// Lớp lấy dữ liệu Tin tức từ Google Apps Script (mỗi bài viết = 1 folder con trong
// folder "Tin tức" trên Google Drive, chứa 1 file .md + ảnh — xem tools/apps-script/News.gs).
// Chưa cấu hình VITE_NEWS_SCRIPT_URL → dùng dữ liệu demo (không cần mạng).

const NEWS_URL = import.meta.env.VITE_NEWS_SCRIPT_URL || ''

export const isNewsConfigured = Boolean(NEWS_URL)

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

/* ---------- Dữ liệu demo khi chưa cấu hình ---------- */

const DEMO_CONTENT = `Đây là **bài viết mẫu** hiển thị khi chưa cấu hình \`VITE_NEWS_SCRIPT_URL\`.

## Cách đăng bài thật

1. Tạo folder con trong folder *Tin tức* trên Google Drive.
2. Thả vào 1 file \`.md\` (nội dung bài) và các ảnh của bài.
3. Web tự cập nhật — không cần sửa code.

> Xem hướng dẫn chi tiết trong DEPLOY.md, Bước 2c.

Ảnh chèn trong bài viết bằng cú pháp \`![Chú thích](ten-file-anh.jpg)\`.`

const DEMO_POSTS = [
  {
    id: 'demo-post-1',
    title: 'Chào mừng đến trang Tin tức',
    date: '2026-07-20',
    description: 'Bài viết mẫu — cấu hình Google Drive + Apps Script để đăng tin thật.',
    demo: true,
    hue: 24,
  },
  {
    id: 'demo-post-2',
    title: 'Đăng bài bằng Markdown trên Google Drive',
    date: '2026-07-12',
    description: 'Mỗi bài là một folder con chứa file .md và hình ảnh, kèm ngày đăng.',
    demo: true,
    hue: 152,
  },
  {
    id: 'demo-post-3',
    title: 'Ảnh bìa lấy tự động từ folder bài viết',
    date: '2026-07-01',
    description: 'Đặt tên ảnh là cover.jpg hoặc khai báo cover: trong frontmatter.',
    demo: true,
    hue: 268,
  },
]

function demoPost(id) {
  const post = DEMO_POSTS.find((item) => item.id === id) || DEMO_POSTS[0]
  return { ...post, content: DEMO_CONTENT, images: [] }
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

/** Danh sách bài viết (metadata, đã sắp mới → cũ từ phía script). */
export async function fetchPosts() {
  if (!isNewsConfigured) return DEMO_POSTS
  const data = await fetchJson(NEWS_URL)
  const posts = Array.isArray(data.posts) ? data.posts : []
  if (posts.length > 0) writeNewsCache('list', posts)
  return posts
}

/** Một bài viết đầy đủ: nội dung Markdown + danh sách ảnh của bài. */
export async function fetchPost(postId) {
  if (!postId) return null
  if (!isNewsConfigured) return demoPost(postId)
  const separator = NEWS_URL.includes('?') ? '&' : '?'
  const post = await fetchJson(`${NEWS_URL}${separator}post=${encodeURIComponent(postId)}`)
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
  if (!postId || !isNewsConfigured) return
  if (prefetchedIds.has(postId)) return
  prefetchedIds.add(postId)
  fetchPost(postId).catch(() => {
    prefetchedIds.delete(postId) // lỗi mạng → cho phép thử lại lần rê chuột sau
  })
}

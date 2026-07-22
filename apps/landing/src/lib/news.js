// Lớp lấy dữ liệu Tin tức từ Google Apps Script (mỗi bài viết = 1 folder con trong
// folder "Tin tức" trên Google Drive, chứa 1 file .md + ảnh — xem tools/apps-script/News.gs).
// Chưa cấu hình VITE_NEWS_SCRIPT_URL → dùng dữ liệu demo (không cần mạng).

const NEWS_URL = import.meta.env.VITE_NEWS_SCRIPT_URL || ''

export const isNewsConfigured = Boolean(NEWS_URL)

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

async function fetchJson(url) {
  const response = await fetch(url, { redirect: 'follow' })
  if (!response.ok) throw new Error(`Không gọi được Apps Script (HTTP ${response.status}).`)
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
  return Array.isArray(data.posts) ? data.posts : []
}

/** Một bài viết đầy đủ: nội dung Markdown + danh sách ảnh của bài. */
export async function fetchPost(postId) {
  if (!postId) return null
  if (!isNewsConfigured) return demoPost(postId)
  const separator = NEWS_URL.includes('?') ? '&' : '?'
  return fetchJson(`${NEWS_URL}${separator}post=${encodeURIComponent(postId)}`)
}

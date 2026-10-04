// Lớp lấy dữ liệu Thư viện ảnh từ Google Apps Script (đọc MỘT folder Google Drive
// chứa toàn bộ ảnh, không chia album).
// Chưa cấu hình VITE_GALLERY_SCRIPT_URL → dùng dữ liệu demo (gradient, không cần mạng).

const GALLERY_URL = import.meta.env.VITE_GALLERY_SCRIPT_URL || ''
// Production đi qua proxy có cache CDN (api/feed.js); chạy dev không có /api nên gọi thẳng Apps Script.
const GALLERY_FEED = import.meta.env.DEV ? GALLERY_URL : '/api/feed?src=gallery'
const CACHE_KEY = 'btnsg-gallery'

export const isGalleryConfigured = Boolean(GALLERY_URL)

/**
 * Link ảnh Drive theo bề rộng mong muốn (px), dạng WebP.
 * Gọi thẳng máy chủ ảnh của Google (lh3) — link drive.google.com/thumbnail cũng chuyển hướng về đây
 * nhưng tốn thêm ~1 giây mỗi ảnh; hậu tố -rw trả WebP nhẹ hơn JPEG ~30%.
 */
export function driveImage(id, width = 1200) {
  if (!id) return ''
  return `https://lh3.googleusercontent.com/d/${id}=w${width}-rw`
}

/* ---------- Dữ liệu demo khi chưa cấu hình ---------- */

const DEMO_COUNT = 36
// Tông nắng/chàm theo bảng màu của giao diện, để dữ liệu mẫu vẫn hài hoà.
const DEMO_HUES = [22, 250, 34, 330, 14, 268, 42, 205]

function demoImages() {
  return Array.from({ length: DEMO_COUNT }, (_, i) => ({
    id: `demo-img-${i}`,
    name: `Khoảnh khắc ${i + 1}`,
    demo: true,
    hue: DEMO_HUES[i % DEMO_HUES.length],
  }))
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

function readCache() {
  try {
    const images = JSON.parse(localStorage.getItem(CACHE_KEY))
    return Array.isArray(images) && images.length > 0 ? images : null
  } catch {
    return null
  }
}

function writeCache(images) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(images))
  } catch {
    // localStorage đầy/bị chặn → chỉ mất tối ưu lần sau.
  }
}

/** Toàn bộ ảnh của thư viện (bản mới nhất từ máy chủ). */
export async function fetchImages() {
  if (!isGalleryConfigured) return demoImages()
  // index.html đã bắt đầu tải danh sách từ lúc mở trang — dùng luôn kết quả đó (chỉ một lần).
  const early = window.__galleryFeed
  window.__galleryFeed = null
  const data = (early && (await early)) || (await fetchJson(GALLERY_FEED))
  const images = Array.isArray(data.images) ? data.images : []
  if (images.length > 0) writeCache(images)
  return images
}

/** Ảnh nổi bật cho slider trang chủ: vài ảnh rải đều trong thư viện. */
export async function fetchFeatured(limit = 6) {
  const images = await fetchImages()
  if (images.length <= limit) return images
  // Rải đều: lấy ảnh ở các vị trí cách đều nhau để slider đa dạng hơn.
  const step = images.length / limit
  return Array.from({ length: limit }, (_, i) => images[Math.floor(i * step)])
}

/* ---------- Cache dùng chung + chọn ảnh theo trang ---------- */

let imagesPromise = null

/**
 * Tải danh sách ảnh một lần cho cả phiên, các trang dùng chung.
 * (Chuyển trang không gọi lại Apps Script.)
 */
export function loadImages() {
  if (!imagesPromise) {
    // Lượt quay lại: vẽ ngay bằng danh sách đã lưu, bản mới tải ngầm cho lần sau
    // (không thay ảnh đang hiển thị giữa chừng).
    const cached = isGalleryConfigured ? readCache() : null
    const fresh = fetchImages()
    imagesPromise = cached ? Promise.resolve(cached) : fresh
    fresh.catch(() => {
      if (!cached) imagesPromise = null // cho phép thử lại ở lần sau
    })
  }
  return imagesPromise
}

/** Băm chuỗi → số, để mỗi trang luôn nhận cùng một ảnh (không nhảy loạn khi re-render). */
function hashSeed(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return h
}

/** Chọn 1 ảnh ổn định theo seed (thường là đường dẫn trang). */
export function pickImage(images, seed, offset = 0) {
  if (!images || images.length === 0) return null
  return images[(hashSeed(seed) + offset) % images.length]
}

/** Chọn n ảnh liên tiếp, không trùng, bắt đầu từ vị trí theo seed. */
export function pickImages(images, seed, count) {
  if (!images || images.length === 0) return []
  const start = hashSeed(seed) % images.length
  const total = Math.min(count, images.length)
  return Array.from({ length: total }, (_, i) => images[(start + i) % images.length])
}

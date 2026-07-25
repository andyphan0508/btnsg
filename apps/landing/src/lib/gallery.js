// Lớp lấy dữ liệu Thư viện ảnh từ Google Apps Script (đọc MỘT folder Google Drive
// chứa toàn bộ ảnh, không chia album).
// Chưa cấu hình VITE_GALLERY_SCRIPT_URL → dùng dữ liệu demo (gradient, không cần mạng).

const GALLERY_URL = import.meta.env.VITE_GALLERY_SCRIPT_URL || ''

export const isGalleryConfigured = Boolean(GALLERY_URL)

/** Link ảnh Drive theo bề rộng mong muốn (px). */
export function driveImage(id, width = 1200) {
  if (!id) return ''
  return `https://drive.google.com/thumbnail?id=${id}&sz=w${width}`
}

/* ---------- Dữ liệu demo khi chưa cấu hình ---------- */

const DEMO_COUNT = 36

function demoImages() {
  return Array.from({ length: DEMO_COUNT }, (_, i) => ({
    id: `demo-img-${i}`,
    name: `Khoảnh khắc ${i + 1}`,
    demo: true,
    hue: (i * 37) % 360,
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

/** Toàn bộ ảnh của thư viện. */
export async function fetchImages() {
  if (!isGalleryConfigured) return demoImages()
  const data = await fetchJson(GALLERY_URL)
  return Array.isArray(data.images) ? data.images : []
}

/** Ảnh nổi bật cho slider trang chủ: vài ảnh rải đều trong thư viện. */
export async function fetchFeatured(limit = 6) {
  const images = await fetchImages()
  if (images.length <= limit) return images
  // Rải đều: lấy ảnh ở các vị trí cách đều nhau để slider đa dạng hơn.
  const step = images.length / limit
  return Array.from({ length: limit }, (_, i) => images[Math.floor(i * step)])
}

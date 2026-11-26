import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './lib/scroll.js'
import App from './App.jsx'
import { hydrateCachedSiteContent, listenForPreview, loadSiteContent } from './lib/siteContent.js'
import 'lenis/dist/lenis.css'
import './fonts.css'
import './index.css'

// Sau mỗi lần deploy, tab đang mở có thể xin chunk trang cũ đã bị thay → tải lại trang
// (tối đa 1 lần / 10 giây) thay vì để người xem kẹt ở màn hình trắng.
window.addEventListener('vite:preloadError', (event) => {
  try {
    const last = Number(sessionStorage.getItem('btnsg-chunk-reload'))
    if (Date.now() - last < 10_000) return
    sessionStorage.setItem('btnsg-chunk-reload', String(Date.now()))
  } catch {
    // sessionStorage bị chặn → vẫn thử tải lại.
  }
  event.preventDefault()
  window.location.reload()
})

// Ảnh tải xong hoặc lỗi đều đánh dấu để bỏ trạng thái chờ nhấp nháy.
// Dùng data-loaded thay vì class: React không quản lý thuộc tính này nên không bao giờ xóa mất khi vẽ lại.
const markImgDone = (event) => {
  if (event.target?.tagName === 'IMG') event.target.dataset.loaded = ''
}
document.addEventListener('load', markImgDone, true)
document.addEventListener('error', markImgDone, true)

/** Làm mờ dần màn chờ trong index.html sau khi trang đã vẽ khung hình đầu tiên. */
function hideSplash() {
  const splash = document.getElementById('splash')
  if (!splash) return
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      splash.classList.add('is-done')
      setTimeout(() => splash.remove(), 600)
    }),
  )
}

// Vẽ ngay bằng cache/mặc định (không chặn màn hình chờ theo độ trễ mạng),
// rồi âm thầm cập nhật nội dung mới từ /api/site-content khi phản hồi về.
hydrateCachedSiteContent()
listenForPreview()
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
hideSplash()
loadSiteContent().catch(() => {})

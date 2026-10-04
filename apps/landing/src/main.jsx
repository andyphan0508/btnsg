import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './lib/scroll.js'
import App from './App.jsx'
import { listenForPreview, loadSiteContent } from './lib/siteContent.js'
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

// Lỗi gì ở bước tải nội dung cũng vẫn vẽ trang (bằng giá trị mặc định).
loadSiteContent().catch(() => {}).then(() => {
  listenForPreview()
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>,
  )
})

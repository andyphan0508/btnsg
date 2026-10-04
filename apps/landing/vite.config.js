import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Đường dẫn tương đối (không qua '@btnsg/shared') để Vite bundle + biên dịch TS khi nạp config.
import { SITE_SECTIONS } from '../../packages/shared/src/siteContent.ts'

const SITE_URL = 'https://btnsg.vercel.app'

/** Trang con → mục nội dung chứa pageTitle / pageLead của trang đó. */
const ROUTE_SECTIONS = {
  'gioi-thieu': 'about',
  'chu-de': 'themeYear',
  'sinh-hoat': 'activities',
  'muc-vu': 'ministryPage',
  'lien-he': 'contactPage',
  'tin-tuc': 'newsPage',
  'thu-vien': 'galleryPage',
}

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/**
 * Bot Facebook/Zalo/Google không chạy JS → mỗi trang con có một file HTML riêng (gioi-thieu.html…)
 * với tiêu đề, mô tả, og:* và canonical đúng trang đó; vercel.json bật cleanUrls để /gioi-thieu trỏ vào.
 * Lấy từ nội dung mặc định — sửa tiêu đề trong dashboard thì tab trình duyệt đổi ngay, thẻ chia sẻ đổi
 * ở lần build sau.
 */
const routeMetaPages = () => ({
  name: 'btnsg-route-meta',
  apply: 'build',
  enforce: 'post',
  generateBundle(_, bundle) {
    const html = bundle['index.html'].source
    const general = SITE_SECTIONS.find((s) => s.key === 'general').defaults
    for (const [route, key] of Object.entries(ROUTE_SECTIONS)) {
      const page = SITE_SECTIONS.find((s) => s.key === key).defaults
      const title = escapeHtml(`${page.pageTitle} — ${general.seoTitle}`)
      const description = escapeHtml(page.pageLead)
      const url = `${SITE_URL}/${route}`
      const source = html
        .replace(/<title>[^<]*<\/title>/, `<title>${title}</title>\n    <link rel="canonical" href="${url}" />`)
        .replace(/(<meta\s+name="description"\s+content=")[^"]*/, `$1${description}`)
        .replace(/(<meta property="og:title" content=")[^"]*/, `$1${title}`)
        .replace(/(<meta\s+property="og:description"\s+content=")[^"]*/, `$1${description}`)
        .replace(/(<meta property="og:url" content=")[^"]*/, `$1${url}`)
      this.emitFile({ type: 'asset', fileName: `${route}.html`, source })
    }
  },
})

export default defineConfig({
  plugins: [react(), routeMetaPages()],
  build: {
    rollupOptions: {
      output: {
        // Thư viện tách chunk riêng: mỗi lần deploy chỉ đổi code app, người xem cũ giữ cache thư viện.
        manualChunks: (id) => (id.includes('node_modules') ? 'vendor' : undefined),
      },
    },
  },
})

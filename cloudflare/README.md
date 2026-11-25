# Deploy lên Cloudflare (Pages + Worker R2)

| Thành phần | Địa chỉ | Deploy |
|---|---|---|
| Landing | https://btnsg-landing.pages.dev | `npm run deploy:cf:landing` |
| Dashboard | https://btnsg-dashboard.pages.dev | `npm run deploy:cf:dashboard` |
| Kho ảnh / audio (Worker R2) | https://btnsg-images.banthanhniensaigon.workers.dev | `cd workers/images && npx wrangler@4 deploy` |

Push lên `main` deploy cả Vercel lẫn Cloudflare: Worker `btnsg` (Workers Builds, kết nối GitHub) chạy
`npm run build:cf` rồi `npm run deploy:cf:ci` để đẩy hai project Pages. Biến `VITE_*` đặt ở Build variables
của Worker đó (repo public — không commit). Deploy tay từ máy: `npm run deploy:cf` (cần `npx wrangler login`
bằng tài khoản banthanhniensaigon@gmail.com, biến build lấy từ `apps/*/.env.production.local`).

## Cấu hình

- **Biến build (`VITE_*`)**: `apps/<app>/.env.production.local` — chỉ nằm trên máy (gitignore).
- **Biến chạy API (Functions)**: secret của project Pages
  (`npx wrangler@4 pages secret put <TÊN> --project-name btnsg-landing`, rồi deploy lại):
  - landing: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (thông báo đẩy),
    `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `IMAGES_BASE_URL`,
    `VITE_GALLERY_SCRIPT_URL`, `VITE_NEWS_SCRIPT_URL`
  - dashboard: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Cách hoạt động

- API vẫn là các file Vercel ở `apps/<app>/api/*`; `apps/<app>/functions/api/*` chỉ bọc lại bằng
  `cloudflare/pages-adapter.js` (req/res kiểu Vercel → Request/Response, cache theo `s-maxage`).
- `public/_routes.json`: chỉ `/api/*` chạy Function — file tĩnh không tốn lượt request.
- `public/_headers`: header bảo mật + cache, tương đương `vercel.json`.
- Supabase keep-alive (Vercel Cron cũ) chạy trong cron 6 giờ/lần của Worker R2.

## Giới hạn miễn phí cần nhớ

Workers Free: **100.000 request/ngày cho cả tài khoản** — gồm mọi lượt gọi `/api/*` của landing và
dashboard **cộng** mọi lượt tải ảnh/audio qua Worker R2. Vượt thì lỗi đến 7:00 sáng hôm sau, không tính
tiền. File tĩnh của Pages (HTML/JS/CSS) không tính vào con số này.

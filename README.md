# Ban Thanh Niên — HTTL Sài Gòn (Monorepo)

Hệ thống web của Ban Thanh Niên, Hội Thánh Tin Lành Việt Nam – Chi Hội Sài Gòn, gồm:

| Workspace | Mô tả | Cổng dev |
|---|---|---|
| `apps/landing` | Trang giới thiệu công khai (React + Vite, JSX) | 5173 |
| `apps/dashboard` | Dashboard quản lý nội bộ (React + TypeScript) | 5174 |
| `apps/api` | Backend API cho chế độ local/demo (Express + JSON) | 5080 |
| `packages/shared` | Types, hằng số & hàm tính tuổi/giai đoạn dùng chung | — |
| `supabase/` | SQL migration cho database production (Supabase) | — |
| `tools/apps-script/` | Google Apps Script gửi email hàng loạt cho BĐH | — |

**Hai chế độ chạy** (tự chọn theo biến môi trường, xem [DEPLOY.md](DEPLOY.md)):

- **Demo/local** — không cấu hình gì: dữ liệu qua `apps/api`, bỏ qua đăng nhập (quyền admin).
- **Production** — có `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`: chạy trên Supabase
  (Postgres + Auth), đăng nhập bắt buộc, phân quyền Quản trị / Ban Điều Hành, host trên Vercel.

## Chạy dự án

```bash
npm install            # cài toàn bộ workspace

npm run dev:landing    # trang giới thiệu   → http://localhost:5173
npm run dev:admin      # API + dashboard    → http://localhost:5174 (API: 4000)

# hoặc chạy riêng lẻ:
npm run dev:api
npm run dev:dashboard

npm run build:landing
npm run build:dashboard
npm run typecheck      # typecheck mọi workspace TS
```

Dashboard gọi API qua proxy `/api` của Vite (xem `apps/dashboard/vite.config.ts`).
Cổng API đổi bằng biến môi trường `API_PORT` (mặc định 4000).

## Dashboard quản lý

Các chức năng chính (mỗi màn hình là một thư mục trong `apps/dashboard/src/screens/`):

- **Tổng quan** — thống kê thành viên, tỷ lệ tham gia, công việc, request, số dư quỹ.
- **Thành viên** — tìm kiếm, lọc theo vai trò/trạng thái/nhóm nhỏ/giai đoạn, sắp xếp theo
  tên/nhóm/tuổi/năm tham gia; import từ Excel, xuất Excel; cột tuổi + số năm tham gia;
  bảng cảnh báo *chuẩn bị lên Thanh tráng* (đủ 30 tuổi) và *Thiếu niên lên Thanh niên*
  (đủ 18 tuổi), báo trước 1 năm; lịch sử thay đổi danh sách trực quan.
- **Email BĐH** — chọn template, điền trường là nội dung tự điền vào template (preview tức thì),
  gửi hàng loạt cho BĐH qua Google Apps Script; quản lý template ngay trên màn hình.
- **Tài khoản** (chỉ Quản trị) — duyệt tài khoản mới, phân quyền Quản trị / BĐH.
- **Điểm danh** — tạo buổi điểm danh theo lịch sinh hoạt, đánh dấu có mặt / vắng / vắng phép.
- **Lịch sinh hoạt** — các buổi định kỳ hằng tuần và sự kiện một lần.
- **Công việc** — bảng Kanban (Cần làm / Đang làm / Hoàn thành), phân công cho thành viên.
- **Thông báo** — đăng và ghim thông báo lịch nhóm, sự kiện.
- **Đề xuất / Request** — ghi nhận yêu cầu với trạng thái xử lý, tránh miss thông tin.
- **Thu chi** — ghi các khoản thu/chi theo hạng mục, lọc theo tháng, tổng hợp số dư.
- **Kế hoạch** — kế hoạch với checklist hạng mục và thanh tiến độ.

## Backend & dữ liệu

`apps/api` lưu dữ liệu dạng JSON tại `apps/api/data/*.json` (gitignore, ghi atomic).
Lần chạy đầu tiên tự seed: 11 thành viên Ban Điều Hành, lịch sinh hoạt tuần, thông báo chào mừng
và kế hoạch chủ đề năm. Muốn làm lại từ đầu chỉ cần xoá thư mục `data/`.

REST endpoints: `/api/members`, `/api/member-changes`, `/api/email-templates`, `/api/attendance`,
`/api/schedule`, `/api/announcements`, `/api/tasks`, `/api/requests`, `/api/expenses`,
`/api/plans`, `/api/stats/overview`, `/api/health`.

Ở production, dashboard bỏ qua Express và nói chuyện thẳng với Supabase (Postgres + RLS);
schema nằm ở `supabase/migrations/0001_init.sql` — lịch sử thay đổi thành viên được ghi tự động
bằng trigger trong database.

## Trang giới thiệu (landing)

Toàn bộ nội dung (lịch sinh hoạt, chủ đề năm, mục vụ, liên hệ…) nằm trong
`apps/landing/src/data/content.js` — chỉ cần sửa file này, không cần đụng vào component.

- `apps/landing/src/components/` — `Nav`, `Hero`, `Intro`, `Board`, `ThemeYear`, `Schedule`, `Ministries`, `Contact`, `Footer`; `Reveal` là wrapper hiệu ứng hiện dần khi cuộn.
- `apps/landing/src/index.css` — design system "Ember & Ivory", hỗ trợ sáng/tối.
- `apps/landing/src/fonts.css` + `public/fonts/` — font tự phục vụ, không phụ thuộc CDN.

**Slider + Thư viện ảnh (Google Drive):** trang chủ có slider hoạt động; route `/thu-vien`
(react-router) hiển thị lưới ảnh + lightbox, lấy từ **một folder Google Drive duy nhất** qua
Google Apps Script ([Gallery.gs](tools/apps-script/Gallery.gs)) — bỏ thêm ảnh vào folder là
web tự cập nhật. Cấu hình `VITE_GALLERY_SCRIPT_URL`; bỏ trống thì hiển thị dữ liệu mẫu.
Xem [DEPLOY.md](DEPLOY.md) Bước 2b.

**Tin tức (Markdown + Google Drive, kiểu "WordPress mini"):** route `/tin-tuc` là trang
danh sách bài viết, `/tin-tuc/:id` là trang đọc bài. Mỗi bài viết = **một folder con** trong
folder "Tin tức" trên Drive, chứa 1 file `.md` (frontmatter `title/date/description/cover`
+ nội dung Markdown) và các ảnh của bài — ảnh bìa tự nhận (`cover.*` hoặc ảnh đầu tiên),
ảnh chèn trong bài viết bằng `![Chú thích](tên-ảnh.jpg)`. Dữ liệu qua Apps Script
([News.gs](tools/apps-script/News.gs)), cấu hình `VITE_NEWS_SCRIPT_URL`; bỏ trống thì hiển
thị dữ liệu mẫu. Xem [DEPLOY.md](DEPLOY.md) Bước 2c.

## Triển khai

Xem [DEPLOY.md](DEPLOY.md): hướng dẫn từng bước tạo Supabase + chạy SQL, deploy Google
Apps Script (gửi email) và deploy 2 project Vercel (landing + dashboard).

## Việc cần làm tiếp

- Thông báo đẩy về thiết bị thành viên (web push) — chưa ưu tiên.
- Mục **Hoạt động qua các năm** trên landing: tổng hợp nội dung từ Fanpage Facebook.

# Ban Thanh Niên — HTTL Sài Gòn (Monorepo)

Hệ thống web của Ban Thanh Niên, Hội Thánh Tin Lành Việt Nam – Chi Hội Sài Gòn, gồm:

| Workspace | Mô tả | Cổng dev |
|---|---|---|
| `apps/landing` | Trang giới thiệu công khai (React + Vite, JSX) | 5173 |
| `apps/dashboard` | Dashboard quản lý nội bộ (React + TypeScript) | 5174 |
| `apps/api` | Backend API (Express + TypeScript, lưu trữ JSON) | 4000 |
| `packages/shared` | Types & hằng số TypeScript dùng chung | — |

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
- **Thành viên** — quản lý ban viên & Ban Điều Hành: tìm kiếm, lọc, thêm/sửa/xoá.
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

REST endpoints: `/api/members`, `/api/attendance`, `/api/schedule`, `/api/announcements`,
`/api/tasks`, `/api/requests`, `/api/expenses`, `/api/plans`, `/api/stats/overview`, `/api/health`.

> Lưu ý: dashboard chưa có đăng nhập — chỉ dùng trong mạng nội bộ tin cậy.
> Khi cần triển khai công khai, bổ sung lớp xác thực (đây là hạng mục kế tiếp).

## Trang giới thiệu (landing)

Toàn bộ nội dung (lịch sinh hoạt, chủ đề năm, mục vụ, liên hệ…) nằm trong
`apps/landing/src/data/content.js` — chỉ cần sửa file này, không cần đụng vào component.

- `apps/landing/src/components/` — `Nav`, `Hero`, `Intro`, `Board`, `ThemeYear`, `Schedule`, `Ministries`, `Contact`, `Footer`; `Reveal` là wrapper hiệu ứng hiện dần khi cuộn.
- `apps/landing/src/index.css` — design system "Ember & Ivory", hỗ trợ sáng/tối.
- `apps/landing/src/fonts.css` + `public/fonts/` — font tự phục vụ, không phụ thuộc CDN.

## Việc cần làm tiếp

- Thêm xác thực (đăng nhập) cho dashboard trước khi triển khai công khai.
- Mục **Hoạt động qua các năm** trên landing: tổng hợp nội dung từ Fanpage Facebook.
- Cân nhắc chuyển JSON storage sang SQLite/Postgres khi dữ liệu lớn dần.

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
- **Thành viên** — hồ sơ đầy đủ: 2 số điện thoại, email, **địa chỉ**, **ngành nghề/ngành học**,
  **nơi làm việc/trường**, công tác đảm nhiệm, nhóm nhỏ, giai đoạn; tìm kiếm trên toàn bộ các
  trường này, lọc theo vai trò/trạng thái/nhóm nhỏ/giai đoạn, sắp xếp theo
  tên/nhóm/tuổi/năm tham gia; import từ Excel, xuất Excel; cột tuổi + số năm tham gia;
  bảng cảnh báo *chuẩn bị lên Thanh tráng* (đủ 30 tuổi) và *Thiếu niên lên Thanh niên*
  (đủ 18 tuổi), báo trước 1 năm; lịch sử thay đổi danh sách trực quan.
- **Email BĐH** — chọn template, điền trường là nội dung tự điền vào template (preview tức thì),
  gửi hàng loạt cho BĐH qua Google Apps Script; quản lý template ngay trên màn hình.
- **Đăng bài Tin tức** — soạn bài Markdown có preview đúng giao diện landing, ảnh tự nén
  (~1600px) rồi upload thẳng lên folder Tin Tức trên Google Drive qua Apps Script webhook
  (`VITE_NEWS_SCRIPT_URL` kèm `?secret=`); hỗ trợ sửa/xoá bài, chọn ảnh bìa, chèn ảnh vào bài.
- **Tài khoản** (chỉ Quản trị) — duyệt tài khoản mới, phân quyền Quản trị / BĐH.
- **Điểm danh** — tạo buổi điểm danh theo lịch sinh hoạt, đánh dấu có mặt / vắng / vắng phép.
- **Lịch sinh hoạt** — các buổi định kỳ hằng tuần và sự kiện một lần.
- **Công việc** — bảng Kanban (Cần làm / Đang làm / Hoàn thành), phân công cho thành viên.
- **Thông báo** — đăng và ghim thông báo lịch nhóm, sự kiện.
- **Đề xuất / Request** — ghi nhận yêu cầu với trạng thái xử lý, tránh miss thông tin.
- **Thu chi** — sổ quỹ chi tiết: hạng mục + hạng mục con (có gợi ý sẵn), số chứng từ,
  hình thức thanh toán, người nộp/nhận, thủ quỹ, thuộc hoạt động nào, link ảnh chứng từ;
  lọc theo loại/hạng mục/tháng và tìm kiếm toàn văn. **Phân tích** thu chi theo ngày/tháng/năm
  (biểu đồ cột đôi + so sánh kỳ trước + cơ cấu theo hạng mục). **Xuất phiếu thu/phiếu chi**
  theo mẫu để in và ký (có số tiền bằng chữ, ô ký Trưởng ban / Thủ quỹ / Người lập phiếu /
  Người nhận tiền) — xem `apps/dashboard/src/utils/voucher.ts`; chọn nhiều giao dịch bằng
  checkbox rồi **in gộp thành một PDF**, mỗi phiếu một trang. **Xuất sổ quỹ Excel** cho thủ quỹ
  (`apps/dashboard/src/utils/financeExcel.ts`) gồm 3 sheet: *Sổ quỹ* (đầy đủ cột + số dư luỹ kế
  + dòng tổng cộng), *Tổng hợp tháng*, *Theo hạng mục*; xuất đúng phần đang lọc.
- **Kế hoạch** — kế hoạch với checklist hạng mục và thanh tiến độ.

## Backend & dữ liệu

`apps/api` lưu dữ liệu dạng JSON tại `apps/api/data/*.json` (gitignore, ghi atomic).
Lần chạy đầu tiên tự seed: 11 thành viên Ban Điều Hành, lịch sinh hoạt tuần, thông báo chào mừng
và kế hoạch chủ đề năm. Muốn làm lại từ đầu chỉ cần xoá thư mục `data/`.

REST endpoints: `/api/members`, `/api/member-changes`, `/api/email-templates`, `/api/attendance`,
`/api/schedule`, `/api/announcements`, `/api/tasks`, `/api/requests`, `/api/expenses`,
`/api/plans`, `/api/stats/overview`, `/api/health`.

**Giao diện:** toàn bộ icon dùng [react-icons](https://react-icons.github.io/react-icons/) (vector,
không phụ thuộc bộ emoji của hệ điều hành). Layout trải hết bề ngang màn hình (hợp màn 2K/4K),
lưới tự chia cột theo không gian còn trống. Trên điện thoại, sidebar được thay bằng **thanh tab
dưới** (`layout/components/MobileTabBar.tsx`) với 4 mục chính + nút "Thêm" mở sheet chứa phần
còn lại; bảng dữ liệu tự chuyển thành **thẻ** (mỗi dòng một thẻ, nhãn cột lấy từ `data-label`).

Ở production, dashboard bỏ qua Express và nói chuyện thẳng với Supabase (Postgres + RLS);
schema nằm ở `supabase/migrations/0001_init.sql` — lịch sử thay đổi thành viên được ghi tự động
bằng trigger trong database.

## Trang giới thiệu (landing)

Toàn bộ nội dung (lịch sinh hoạt, chủ đề năm, mục vụ, liên hệ…) nằm trong
`apps/landing/src/data/content.js` — chỉ cần sửa file này, không cần đụng vào component.

**Điều hướng đa trang (không còn one-page scroll):** mỗi mục là một route riêng —
`/` (trang chủ rút gọn: Hero + slider + card khám phá), `/gioi-thieu`, `/chu-de`,
`/sinh-hoat`, `/muc-vu`, `/lien-he`, `/tin-tuc`, `/thu-vien`. Danh sách route khai báo ở
`nav` trong `data/content.js`.

**Mobile:** thay menu xổ xuống bằng **thanh điều hướng dưới** (`components/BottomNav.jsx`):
2 mục trái + **logo BTN tròn nổi ở giữa** + 2 mục phải; bấm logo mở sheet chứa các mục còn
lại (khai báo ở `bottomNav` / `sheetNav` trong `data/content.js`). Thanh nav trên cùng ở
mobile chỉ còn thương hiệu + nút sáng/tối.

**Banner ảnh đầu mỗi trang:** `components/PageHero.jsx` lấy **ảnh thật từ thư viện Drive**
(chọn ổn định theo đường dẫn nên mỗi trang một ảnh riêng, không đổi khi re-render), phủ
gradient + blur tan dần xuống đúng màu nền trang, tiêu đề nổi bật, có parallax nhẹ khi cuộn.
Thanh nav trên cùng **trong suốt khi ở đầu trang** để hoà vào ảnh, chỉ đặc lại khi cuộn.
`components/PhotoStrip.jsx` chèn dải 4 ảnh cuối trang dẫn sang Thư viện. Danh sách ảnh được
`lib/gallery.js` cache một lần cho cả phiên (`loadImages`), chuyển trang không gọi lại Apps Script.

- `apps/landing/src/components/` — `Nav`, `BottomNav`, `Hero`, `PageHero`, `PhotoStrip`, `QuickNav`, `Intro`, `Board`, `ThemeYear`, `Schedule`, `Ministries`, `Contact`, `ContactFab`, `Footer`; `Reveal` là wrapper hiệu ứng hiện dần khi cuộn.
- `apps/landing/src/pages/` — mỗi route một file: `Home`, `About`, `Theme`, `Activities`, `Ministry`, `ContactPage`, `Gallery`, `News`, `NewsPost`.
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

**Thông báo đẩy (Web Push):** khách vào landing được mời *“Theo dõi Ban Thanh Niên?”*
(`components/PushPrompt.jsx` — chỉ xin quyền khi người dùng bấm nút, bấm “Để sau” thì 7 ngày
sau mới hỏi lại). Thiết bị đồng ý được lưu vào Supabase qua Vercel Function
`apps/landing/api/push-subscribe.js`; service worker `public/sw.js` nhận và hiển thị thông báo,
bấm vào sẽ mở đúng trang. Dashboard có màn hình **Thông báo đẩy** (`/thong-bao-day`) để soạn
và gửi tới mọi thiết bị qua `apps/landing/api/push-send.js` — Function xác thực token đăng nhập
Supabase nên chỉ tài khoản đã duyệt mới gửi được, đồng thời tự dọn thiết bị hết hạn và ghi
nhật ký vào bảng `push_messages`. Xem [DEPLOY.md](DEPLOY.md) Bước 2d.

## Triển khai

Xem [DEPLOY.md](DEPLOY.md): hướng dẫn từng bước tạo Supabase + chạy SQL, deploy Google
Apps Script (gửi email) và deploy 2 project Vercel (landing + dashboard).

## Việc cần làm tiếp

- Mục **Hoạt động qua các năm** trên landing: tổng hợp nội dung từ Fanpage Facebook.

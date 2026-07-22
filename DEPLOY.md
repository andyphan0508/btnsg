# Hướng dẫn triển khai BTNSG (Vercel + Supabase + Google Apps Script)

Kiến trúc production:

```
Người dùng ──▶ Vercel (dashboard React)  ──▶ Supabase (Postgres + Auth + RLS)
                        │
                        └──▶ Google Apps Script (gửi email hàng loạt cho BĐH qua Gmail)
```

Khi **không** cấu hình Supabase, dashboard tự chạy **chế độ demo/local**: dữ liệu qua
`apps/api` (Express + JSON) như trước, bỏ qua đăng nhập với quyền admin. Chạy local:
`npm run dev:admin`.

---

## Bước 1 — Tạo project Supabase

1. Vào <https://supabase.com> → **New project** (chọn region Singapore cho gần VN).
2. Mở **SQL Editor** → dán toàn bộ nội dung file [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**.
   - Script tạo đủ bảng (thành viên, điểm danh, lịch, công việc, đề xuất, thu chi, kế hoạch,
     template email, audit log), bật RLS 2 cấp quyền (Quản trị / BĐH), trigger tự ghi lịch sử
     thay đổi thành viên và seed sẵn 11 thành viên BĐH + 3 template email.
3. Lấy thông tin kết nối: **Project Settings → API**:
   - `Project URL` → biến `VITE_SUPABASE_URL`
   - `anon public key` → biến `VITE_SUPABASE_ANON_KEY`
4. (Khuyến nghị) **Authentication → Providers → Email**: tắt "Confirm email" nếu muốn
   tài khoản đăng ký dùng được ngay sau khi admin duyệt (không cần bấm link xác nhận).

### Tạo tài khoản Quản trị đầu tiên

1. Deploy dashboard (Bước 3) hoặc chạy local với `.env` đã điền Supabase → mở màn hình
   **Đăng ký**, tạo tài khoản bằng email của bạn.
2. Quay lại **SQL Editor**, chạy:

   ```sql
   update public.profiles set role = 'admin', approved = true
   where email = 'email-cua-ban@example.com';
   ```

3. Từ giờ, tài khoản mới đăng ký sẽ ở trạng thái **Chờ duyệt** — bạn duyệt và phân quyền
   ngay trong dashboard, mục **Tài khoản** (chỉ admin thấy).

---

## Bước 2 — Deploy Google Apps Script (gửi email BĐH)

1. Vào <https://script.google.com> → **New project**, đặt tên `BTNSG Mail`.
2. Dán toàn bộ nội dung [`tools/apps-script/Code.gs`](tools/apps-script/Code.gs) vào `Code.gs`.
3. Sửa dòng `var SHARED_SECRET = 'doi-chuoi-bi-mat-nay';` thành chuỗi bí mật của riêng bạn.
4. **Deploy → New deployment → Web app**:
   - *Execute as*: **Me** (email gửi đi sẽ là Gmail của bạn)
   - *Who has access*: **Anyone**
5. Copy **Web app URL** (dạng `https://script.google.com/macros/s/AKfyc.../exec`).
6. Ghép secret vào URL và đặt làm biến môi trường của dashboard:

   ```
   VITE_APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfyc.../exec?secret=<chuoi-bi-mat>
   ```

Ghi chú:
- Gmail miễn phí gửi tối đa ~100 email/ngày qua Apps Script — quá đủ cho BĐH (script cũng
  chặn >50 người nhận/lần).
- Trong nội dung template có thể dùng `{{ten_nguoi_nhan}}` — script tự thay bằng tên từng
  người nhận.
- Nếu chưa cấu hình biến này, màn hình **Email BĐH** vẫn hoạt động ở chế độ mô phỏng.

---

## Bước 2b — Thư viện ảnh landing (Google Drive qua Apps Script)

Trang landing có **slider hoạt động** ở trang chủ và **trang Thư viện ảnh** (`/thu-vien`).
Mô hình đơn giản: **MỘT folder Google Drive chứa toàn bộ ảnh** (không chia album) —
bỏ thêm ảnh vào folder là web tự hiện, không phải sửa code.

1. Trên Google Drive chuẩn bị 1 folder chứa toàn bộ ảnh cho web (VD `Hình website`).
   Ảnh phải nằm **trực tiếp** trong folder này — ảnh trong folder con sẽ KHÔNG hiển thị.
2. Chuột phải **folder → Share → "Anyone with the link" → Viewer** (ảnh phải công khai
   trình duyệt mới hiển thị được).
3. Lấy **Folder ID** từ URL `https://drive.google.com/drive/folders/<ID>`.
4. Vào <https://script.google.com> → New project → dán [`tools/apps-script/Gallery.gs`](tools/apps-script/Gallery.gs).
   Sửa dòng `var FOLDER_ID = '...'` thành Folder ID ở bước 3.
5. Chạy hàm `doGet` một lần để cấp quyền đọc Drive (Review permissions → Allow).
6. **Deploy → New deployment → bánh răng ⚙ → Web app**: Execute as **Me**,
   Who has access **Anyone** → Deploy.
7. Copy **Web app URL** — dạng `https://script.google.com/macros/s/AKfycb.../exec`.
   ⚠️ KHÔNG lấy nhầm **Library URL** (dạng `.../macros/library/d/.../2`) — loại đó không dùng được.
8. Đặt URL `/exec` vào biến `VITE_GALLERY_SCRIPT_URL` của **project landing** (local:
   `apps/landing/.env`; Vercel: Environment Variables của project landing).

Ghi chú:
- Khác với webhook email, thư viện ảnh chỉ **đọc** dữ liệu công khai nên **không cần `?secret=`**.
- Kết quả được cache 10 phút; thêm ảnh mới có thể chờ tới 10 phút mới xuất hiện
  (hoặc mở `<URL>/exec?refresh=1` để làm mới ngay).
- Chưa cấu hình biến này thì trang Thư viện vẫn chạy ở chế độ **dữ liệu mẫu**.

### Web không hiện ảnh / hiện sai? Kiểm tra theo thứ tự

1. **Mở `<URL>/exec?debug=1` trong trình duyệt** — script trả về tên folder, số ảnh thấy được,
   danh sách subfolder (nếu ảnh lọt vào subfolder thì sẽ không hiển thị). Đây là cách nhanh
   nhất để biết lỗi ở Apps Script hay ở web.
2. **Đã Deploy "New version" chưa?** Mỗi lần sửa `Code.gs` (kể cả chỉ đổi `FOLDER_ID`)
   phải vào **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy**.
   Nếu chỉ bấm Save, URL `/exec` vẫn chạy bản cũ.
3. **Cache 10 phút**: vừa thêm/xoá ảnh thì mở `<URL>/exec?refresh=1` một lần.
4. **`FOLDER_ID` đúng chưa?** — ID nằm trong URL `https://drive.google.com/drive/folders/<ID>`.
5. **Folder đã share "Anyone with the link" chưa?** Danh sách ảnh có thể trả về được nhưng
   ảnh sẽ không hiển thị nếu chưa công khai.
6. **Biến môi trường của web**: chạy local thì `VITE_GALLERY_SCRIPT_URL` phải nằm trong
   `apps/landing/.env` và phải **khởi động lại `npm run dev:landing`**; trên Vercel thì thêm
   biến xong phải **Redeploy** (biến `VITE_*` được "nướng" vào lúc build).
7. **Shortcut không được hỗ trợ** — ảnh phải nằm thật trong folder, không phải shortcut
   trỏ từ nơi khác.

---

## Bước 2c — Tin tức landing (Markdown + ảnh trên Google Drive, kiểu "WordPress mini")

Trang landing có **trang Tin tức** (`/tin-tuc`): danh sách bài viết + trang đọc từng bài.
Mô hình: **MỘT folder Google Drive "Tin tức"**, trong đó **mỗi bài viết là một folder con**
chứa 1 file `.md` (nội dung) + các ảnh của bài — đăng bài mới chỉ là tạo folder mới trên
Drive, không phải sửa code.

```
📁 Tin tức
├── 📁 Trại hè 2026
│   ├── 📄 bai-viet.md        ← nội dung Markdown (tên file tuỳ ý, đuôi .md)
│   ├── 🖼️ cover.jpg          ← ảnh bìa (headline picture)
│   └── 🖼️ sinh-hoat-1.jpg    ← ảnh chèn trong bài
└── 📁 Thông báo tháng 8
    └── ...
```

File `.md` có thể mở đầu bằng **frontmatter** (không bắt buộc):

```markdown
---
title: Trại hè Thanh Niên 2026
date: 2026-07-20
description: Tóm tắt ngắn hiện ở trang danh sách tin.
cover: cover.jpg
---
Nội dung bài viết bằng Markdown...

![Chú thích ảnh](sinh-hoat-1.jpg)
```

Thiếu trường nào script tự suy ra: `title` = tên folder bài viết; `date` = ngày tạo file `.md`
(cũng nhận `date: 20/7/2026`); `description` = đoạn văn đầu tiên; `cover` = ảnh tên `cover.*`
hoặc ảnh đầu tiên theo tên. Ảnh chèn trong bài chỉ cần `![Chú thích](tên-file-ảnh)` với ảnh
nằm cùng folder bài viết.

Triển khai (y hệt Bước 2b, chỉ khác file script và tên biến):

1. Tạo folder `Tin tức` trên Drive → Share → **"Anyone with the link" → Viewer**.
2. Lấy **Folder ID** từ URL `https://drive.google.com/drive/folders/<ID>`.
3. <https://script.google.com> → New project → dán [`tools/apps-script/News.gs`](tools/apps-script/News.gs),
   sửa `var NEWS_FOLDER_ID = '...'`.
4. Chạy `doGet` một lần để cấp quyền → **Deploy → Web app** (Execute as **Me**,
   Who has access **Anyone**).
5. Copy URL `/exec` → đặt vào biến `VITE_NEWS_SCRIPT_URL` của **project landing**
   (local: `apps/landing/.env`; Vercel: Environment Variables → Redeploy).

**Đăng bài từ Dashboard (màn hình "Đăng bài Tin tức"):** dashboard soạn bài bằng Markdown
(có preview), tự nén ảnh về ~1600px rồi upload thẳng lên folder Tin Tức — không cần mở
Google Drive thủ công nữa. Cách bật:

1. Trong `News.gs`, sửa `var SHARED_SECRET = '...'` thành một chuỗi bí mật của riêng bạn
   (chỉ thao tác GHI cần secret — GET đọc tin của landing vẫn công khai như cũ).
2. Deploy **New version** (Manage deployments → ✏️ — nhớ GIỮ NGUYÊN deployment cũ).
3. Đặt biến cho **project dashboard** (local: `apps/dashboard/.env`; Vercel: project dashboard):

   ```
   VITE_NEWS_SCRIPT_URL=https://script.google.com/macros/s/AKfyc.../exec?secret=CHUOI_BI_MAT
   ```

   (Cùng URL /exec với landing nhưng **kèm `?secret=`** — landing thì KHÔNG kèm secret.)
4. Chưa cấu hình biến này thì màn hình Đăng bài chạy chế độ **mô phỏng** (không ghi Drive thật).

Màn hình hỗ trợ: đăng bài mới, sửa bài (đổi nội dung/metadata, thêm ảnh), xoá bài (folder
được chuyển vào Thùng rác Drive — khôi phục được trong 30 ngày), chọn ảnh bìa, chèn ảnh vào
nội dung, và tự làm mới cache sau mỗi thao tác để web hiển thị ngay.

**Nên làm — cài trigger hâm nóng cache (giúp web luôn tải nhanh):** trong editor Apps
Script → **Triggers** (biểu tượng ⏰ cột trái) → **Add Trigger** → Function `warmCache` ·
Event source **Time-driven** · **Minutes timer** · **Every 10 minutes** → Save. Từ đó cache
không bao giờ nguội (không người xem nào phải chờ script đọc Drive) và bài mới đăng tự
xuất hiện trong tối đa ~10 phút, không cần mở `?refresh=1`.

Ghi chú:
- Cache 30 phút, trigger `warmCache` làm mới mỗi 10 phút. Muốn bài mới hiện NGAY thì mở
  `<URL>/exec?refresh=1` một lần.
- Web cũng cache kết quả trong trình duyệt (localStorage): lượt xem sau hiển thị tức thì
  rồi tự cập nhật ngầm; rê chuột lên thẻ bài viết là bài được tải trước.
- `<URL>/exec?debug=1` liệt kê từng bài script thấy được (bài thiếu file `.md` sẽ báo rõ).
- ⚠️ Mỗi lần sửa `News.gs` phải **Deploy → Manage deployments → ✏️ → New version** — cách này
  GIỮ NGUYÊN URL cũ. Nếu lỡ bấm **New deployment** thì URL /exec ĐỔI MỚI HOÀN TOÀN và URL cũ
  chết (trả 404 rất chậm, web sẽ báo "phản hồi quá lâu") → phải cập nhật lại
  `VITE_NEWS_SCRIPT_URL` trong `apps/landing/.env` và trên Vercel (rồi Redeploy).
- Chưa cấu hình biến này thì trang Tin tức chạy ở chế độ **dữ liệu mẫu**.
- Soạn `.md` bằng app ghi chú bất kỳ rồi upload, hoặc dùng tiện ích chỉnh sửa text
  ngay trên Drive; lưu file với **UTF-8** để tiếng Việt hiển thị đúng (mặc định của
  hầu hết editor hiện nay).

---

## Bước 3 — Deploy Vercel

Tạo **2 project** trên <https://vercel.com> trỏ cùng repo Git này:

### Project 1: dashboard (quản lý nội bộ)

| Cài đặt | Giá trị |
|---|---|
| Root Directory | `apps/dashboard` |
| Framework Preset | Vite |
| Build Command | (mặc định) `npm run build` |
| Environment Variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APPS_SCRIPT_URL`, `VITE_NEWS_SCRIPT_URL` (kèm `?secret=` — đăng bài Tin tức, Bước 2c) |

Vercel tự nhận ra npm workspaces và cài dependency từ gốc repo. File
`apps/dashboard/vercel.json` đã có sẵn rewrite SPA (`/* → index.html`) cho react-router.

### Project 2: landing (trang giới thiệu công khai)

| Cài đặt | Giá trị |
|---|---|
| Root Directory | `apps/landing` |
| Framework Preset | Vite |
| Environment Variables | `VITE_GALLERY_SCRIPT_URL` (thư viện ảnh — Bước 2b), `VITE_NEWS_SCRIPT_URL` (tin tức — Bước 2c) |

File `apps/landing/vercel.json` đã có sẵn rewrite SPA cho react-router (`/thu-vien`, `/tin-tuc`).

Sau đó gán domain tuỳ ý, ví dụ `btnsg.vercel.app` (landing) và `quanly-btnsg.vercel.app` (dashboard).

---

## Checklist sau khi deploy

- [ ] Đăng nhập dashboard bằng tài khoản admin, thấy đủ menu **Tài khoản**.
- [ ] Mục **Thành viên**: import file Excel danh sách thật (cột bắt buộc duy nhất: *Họ tên*;
      nhận diện linh hoạt các cột *Giới tính, Ngày sinh, SĐT, Email, Vai trò, Chức vụ, Nhiệm vụ,
      Nhóm nhỏ, Ngày tham gia, Trạng thái, Giai đoạn, Ghi chú*).
- [ ] Kiểm tra 2 bảng cảnh báo: *Chuẩn bị lên Thanh tráng* (đủ 30 tuổi năm nay/năm sau) và
      *Thiếu niên chuẩn bị lên Thanh niên* (đủ 18 tuổi năm nay/năm sau).
- [ ] Xuất Excel từ danh sách đang lọc để kiểm tra file tải về.
- [ ] Gửi thử một email template cho chính bạn từ mục **Email BĐH**.
- [ ] Đăng ký thử một tài khoản thứ hai → xác nhận nó bị chặn ở màn "Chờ duyệt" → duyệt trong
      mục **Tài khoản** với vai trò BĐH.

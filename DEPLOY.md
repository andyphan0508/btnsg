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

## Bước 3 — Deploy Vercel

Tạo **2 project** trên <https://vercel.com> trỏ cùng repo Git này:

### Project 1: dashboard (quản lý nội bộ)

| Cài đặt | Giá trị |
|---|---|
| Root Directory | `apps/dashboard` |
| Framework Preset | Vite |
| Build Command | (mặc định) `npm run build` |
| Environment Variables | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APPS_SCRIPT_URL` |

Vercel tự nhận ra npm workspaces và cài dependency từ gốc repo. File
`apps/dashboard/vercel.json` đã có sẵn rewrite SPA (`/* → index.html`) cho react-router.

### Project 2: landing (trang giới thiệu công khai)

| Cài đặt | Giá trị |
|---|---|
| Root Directory | `apps/landing` |
| Framework Preset | Vite |
| Environment Variables | (không cần) |

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

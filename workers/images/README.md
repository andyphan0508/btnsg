# Kho ảnh R2 + soft limit (Cloudflare Worker `btnsg-images`)

Worker này là **cửa duy nhất** vào bucket R2: phát ảnh cho web, nhận ảnh từ dashboard (chỉ thành viên
đã duyệt), và tự chặn trước khi vượt hạn mức miễn phí:

| Hạn mức free R2 | Cách chặn |
|---|---|
| 10 GB lưu trữ | 80% → email + banner vàng; **95% → từ chối upload** (banner đỏ) |
| 1 triệu lượt ghi/tháng | 80% → email; **90% → từ chối upload** đến tháng sau |
| 10 triệu lượt đọc/tháng | Workers Free tối đa 100.000 request/ngày ≈ 3 triệu/tháng → không thể vượt |

Mỗi lần upload/xoá Worker cộng/trừ ngay vào bộ đếm (an toàn khi upload song song), gửi email ngay khi
vừa lên mức 80% hoặc 95% (mỗi mức báo 1 lần; xoá bớt ảnh rồi vượt lại thì báo lại). Ngoài ra cứ 6 giờ
cron đếm lại dung lượng thật của bucket để sửa sai lệch (bucket rất lớn thì đếm nối tiếp qua vài lần).

> Để chắc chắn không phát sinh phí, giữ đủ 4 điều: **không bật** "Public access / r2.dev" hay custom
> domain cho bucket; **không tạo** R2 API token (S3); tài khoản ở gói **Workers Free** (gói trả phí bỏ
> giới hạn 100.000 request/ngày vốn đang chặn lượt đọc); bucket dùng storage class **Standard**.
> Mọi truy cập phải đi qua Worker.
> Giới hạn của Worker: quá 100.000 request/ngày (khoảng 2–5 nghìn lượt xem thư viện ảnh) thì ảnh
> tạm không tải được đến 7:00 sáng hôm sau — không tính tiền.

## Cài đặt (làm 1 lần)

1. **Bật R2**: Cloudflare Dashboard → Storage & databases → R2 → hoàn tất bước thêm gói R2 (cần thẻ).
2. **Tạo bucket** tên `btnsg-images`, storage class **Standard** (Infrequent Access không có free tier).
3. **(Nên làm)** Cloudflare → Notifications: nếu có mục cảnh báo chi phí / usage-based billing thì bật
   làm lưới an toàn thứ hai.
4. Trong thư mục repo:

   ```bash
   cd workers/images
   npx wrangler login
   npx wrangler secret put SUPABASE_ANON_KEY     # dán anon key (giống VITE_SUPABASE_ANON_KEY)
   npx wrangler secret put ALERT_WEBHOOK_URL     # URL Apps Script gửi mail, kèm ?secret=... (giống VITE_APPS_SCRIPT_URL)
   npx wrangler secret put ALERT_EMAIL           # email nhận cảnh báo
   npx wrangler deploy
   ```

   Lệnh deploy in ra URL dạng `https://btnsg-images.<tên>.workers.dev` — đó là **URL Worker**.
   Domain dashboard khác danh sách trong `wrangler.toml` → sửa `ALLOWED_ORIGINS` rồi deploy lại.

## Chuyển sang R2 (theo đúng thứ tự)

1. Chạy `supabase/migrations/0009_posts.sql` trong Supabase SQL Editor (nếu chưa chạy).
2. Vercel → project **btnsg-dashboard** → Environment Variables: `VITE_IMAGES_URL` = URL Worker.
3. Push code (hoặc Redeploy dashboard).
4. Mở dashboard → **Khoảnh khắc** → **Chép ảnh sang R2**. Chạy lại được nhiều lần.
5. Vercel → project **btnsg-landing**: `IMAGES_BASE_URL` = URL Worker → Redeploy landing.
6. Mở web kiểm tra Thư viện ảnh và Tin tức. Ổn rồi mới (tuỳ chọn) xoá ảnh trong bucket `moments`
   của Supabase cho nhẹ.

Giữa bước 3 và 5 đừng đăng ảnh mới (ảnh mới chỉ nằm trên R2, landing lúc đó còn đọc Supabase).

## Kiểm tra cục bộ

```bash
node workers/images/test.mjs
```

Chạy Worker bằng `wrangler dev` với R2 giả lập, Supabase giả và webhook email giả (không cần đăng nhập
Cloudflare): auth, chặn file lạ/PNG/>2MB, chặn mềm 95%, xoá rồi upload lại, 12 upload song song đếm đủ,
email chỉ gửi 1 lần mỗi mức, cron đếm nối tiếp qua nhiều lần.

## Thử email cảnh báo sau khi deploy

Cloudflare → Workers → `btnsg-images` → Settings → Variables: thêm tạm `LIMIT_BYTES` = `1000`
(bucket phải có ít nhất 1 ảnh → đang dùng đã > 95%), vào tab Triggers bấm chạy thử cron, kiểm tra hộp thư, rồi **xoá biến đó**.
Lưu ý: trong lúc có biến này dashboard sẽ không upload được.

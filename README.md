# Ban Thanh Niên — HTTL Sài Gòn

Trang web giới thiệu Ban Thanh Niên, Hội Thánh Tin Lành Việt Nam – Chi Hội Sài Gòn.
Dựng bằng React + Vite.

## Chạy dự án

```bash
npm install
npm run dev      # chạy máy chủ phát triển tại http://localhost:5173
npm run build    # build production vào thư mục dist/
npm run preview  # xem thử bản build
```

## Cập nhật nội dung

Toàn bộ nội dung (lịch sinh hoạt, chủ đề năm, mục vụ, liên hệ…) nằm trong
[`src/data/content.js`](src/data/content.js) — chỉ cần sửa file này, không cần đụng vào component.

Ví dụ khi có chủ đề năm mới, sửa khối `themeYear`:

```js
export const themeYear = {
  eyebrow: 'Chủ đề năm 2026',
  title: '…',
  song: '…',
  verse: '…',
  ref: '…',
}
```

## Cấu trúc

- `src/components/` — các phần của trang: `Nav`, `Hero`, `Intro`, `ThemeYear`, `Schedule`, `Ministries`, `Contact`, `Footer`; `Reveal` là wrapper hiệu ứng hiện dần khi cuộn (tự tắt khi người xem bật giảm chuyển động).
- `src/index.css` — toàn bộ style, gồm token màu cho cả chế độ sáng và tối (`prefers-color-scheme` + `data-theme`).
- `src/fonts.css` + `public/fonts/` — font Be Vietnam Pro và Lora (subset Latin + tiếng Việt) phục vụ tại chỗ, không phụ thuộc CDN.

## Việc cần làm tiếp

- Trang **Ban Điều Hành**: cần danh sách thành viên đương nhiệm (tên, vai trò, ảnh).
- Mục **Hoạt động qua các năm**: cần tổng hợp nội dung từ Fanpage Facebook.
- Cập nhật **chủ đề năm** mới nhất (dữ liệu hiện tại là năm 2023).

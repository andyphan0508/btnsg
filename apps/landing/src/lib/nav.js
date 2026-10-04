// Điều hướng gắn với các route trong App.jsx nên nằm trong code, không chỉnh từ dashboard.

/** Điều hướng chính — mỗi mục là một trang riêng (routing, không cuộn trong trang). */
export const nav = [
  { to: "/gioi-thieu", label: "Giới thiệu" },
  { to: "/chu-de", label: "Chủ đề năm" },
  { to: "/sinh-hoat", label: "Sinh hoạt" },
  { to: "/muc-vu", label: "Mục vụ" },
  { to: "/tin-tuc", label: "Tin tức" },
  { to: "/thu-vien", label: "Thư viện ảnh" },
  { to: "/lien-he", label: "Liên hệ" },
];

/**
 * 4 mục cố định trên thanh điều hướng dưới (mobile) — logo tròn chèn ở giữa
 * (2 mục trái, 2 mục phải). Các mục còn lại nằm trong sheet mở từ logo.
 */
export const bottomNav = [
  { to: "/", label: "Trang chủ", icon: "home" },
  { to: "/sinh-hoat", label: "Sinh hoạt", icon: "calendar" },
  { to: "/tin-tuc", label: "Tin tức", icon: "news" },
  { to: "/thu-vien", label: "Thư viện", icon: "image" },
];

/** Các mục hiện trong sheet khi bấm logo ở bottom nav. */
export const sheetNav = [
  { to: "/gioi-thieu", label: "Giới thiệu", desc: "Lịch sử & con số của Ban" },
  { to: "/chu-de", label: "Chủ đề năm", desc: "Câu gốc và định hướng năm nay" },
  { to: "/muc-vu", label: "Mục vụ", desc: "Các mảng phục vụ thường niên" },
  { to: "/lien-he", label: "Liên hệ", desc: "Địa chỉ, bản đồ, kết nối" },
];

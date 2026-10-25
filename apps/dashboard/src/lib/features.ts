/**
 * Bật/tắt module của dashboard. Tắt chỉ ẩn khỏi giao diện (menu, route, ô Tổng quan) —
 * code và dữ liệu Supabase giữ nguyên, bật lại là dùng tiếp.
 */

/** Thu chi / sổ quỹ (phần thủ quỹ) — tạm ẩn từ 2026-10-04. */
export const FINANCE_ENABLED = false;

/**
 * Các module quản lý nội bộ (Tổng quan, Thành viên, Điểm danh, Lịch, Công việc, Thông báo,
 * Đề xuất, Kế hoạch, Email BĐH) — tạm ẩn từ 2026-10-25: dashboard chỉ còn phần đăng tải lên
 * website (Tin tức, Khoảnh khắc, Bài giảng), Chương trình thờ phượng và thông báo đẩy.
 */
export const INTERNAL_ENABLED = false;

-- ============================================================
-- BTNSG — Giờ bắt đầu buổi nhóm (tính giờ dự kiến từng mục). Chạy sau 0006_programs.sql.
-- An toàn khi chạy lại nhiều lần.
-- ============================================================

alter table public.programs add column if not exists start_time text;  -- "HH:MM", ví dụ "09:00"

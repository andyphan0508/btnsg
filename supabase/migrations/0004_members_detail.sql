-- ============================================================
-- BTNSG — Bổ sung thông tin liên hệ & nghề nghiệp cho thành viên
-- Chạy trong Supabase Dashboard → SQL Editor (sau 0003).
-- An toàn khi chạy lại nhiều lần.
-- ============================================================

alter table public.members
  add column if not exists phone2 text,
  add column if not exists address text,
  add column if not exists occupation text,
  add column if not exists workplace text;

-- Tìm theo tên / nghề nghiệp là thao tác thường dùng ở màn hình Thành viên.
create index if not exists members_name_idx on public.members (name);
create index if not exists members_group_idx on public.members (group_name);

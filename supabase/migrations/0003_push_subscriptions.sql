-- ============================================================
-- BTNSG — Đăng ký nhận thông báo đẩy (Web Push) từ trang landing
-- Chạy trong Supabase Dashboard → SQL Editor (sau 0002).
-- ============================================================

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  -- endpoint là định danh duy nhất của một thiết bị/trình duyệt
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  -- Lần cuối gửi push thành công tới thiết bị này
  last_success_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger push_subscriptions_updated_at
  before update on public.push_subscriptions
  for each row execute function public.set_updated_at();

alter table public.push_subscriptions enable row level security;

-- Chỉ BĐH/Quản trị đã duyệt mới đọc được danh sách thiết bị.
-- Việc ghi/xoá do Vercel Function thực hiện bằng service role key
-- (service role bỏ qua RLS) nên KHÔNG cần policy insert cho khách ẩn danh.
create policy "push_subscriptions_select" on public.push_subscriptions
  for select using (public.is_approved());

-- Nhật ký các thông báo đã gửi — để BĐH biết đã đẩy gì, cho ai, lúc nào.
create table if not exists public.push_messages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  url text,
  sent_count int not null default 0,
  failed_count int not null default 0,
  sent_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger push_messages_updated_at
  before update on public.push_messages
  for each row execute function public.set_updated_at();

alter table public.push_messages enable row level security;

create policy "push_messages_select" on public.push_messages
  for select using (public.is_approved());

-- ============================================================
-- BTNSG — Nội dung trang landing chỉnh từ dashboard (màn hình "Website")
-- Chạy sau 0001_init.sql. An toàn khi chạy lại nhiều lần.
-- Mỗi dòng = một mục nội dung (key) — mục chưa có dòng thì landing dùng mặc định trong code
-- (packages/shared/src/siteContent.ts).
-- ============================================================

create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists site_content_updated_at on public.site_content;
create trigger site_content_updated_at before update on public.site_content
for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;

drop policy if exists "site_content_select" on public.site_content;
drop policy if exists "site_content_insert" on public.site_content;
drop policy if exists "site_content_update" on public.site_content;
drop policy if exists "site_content_delete" on public.site_content;

-- Nội dung công khai: ai cũng đọc được (landing đọc bằng anon key qua /api/site-content).
create policy "site_content_select" on public.site_content for select to anon, authenticated using (true);
-- Chỉ Quản trị viên được sửa.
create policy "site_content_insert" on public.site_content for insert with check (public.is_admin());
create policy "site_content_update" on public.site_content for update using (public.is_admin()) with check (public.is_admin());
create policy "site_content_delete" on public.site_content for delete using (public.is_admin());

-- ============================================================
-- BTNSG — Chương trình thờ phượng hằng tuần (đồng bộ sang OpenPresenter)
-- Chạy sau 0001_init.sql. An toàn khi chạy lại nhiều lần.
-- ============================================================

create table if not exists public.programs (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,                 -- mỗi ngày một chương trình
  title text not null default '',
  -- [{ id, kind: 'text'|'bible'|'song', label, text?, ref?, song?: { title, book?, number?, lyrics? }, note? }]
  items jsonb not null default '[]'::jsonb,
  published boolean not null default false,  -- chỉ bản đã công bố mới lộ ra API /api/program
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists programs_updated_at on public.programs;
create trigger programs_updated_at before update on public.programs
for each row execute function public.set_updated_at();

alter table public.programs enable row level security;

drop policy if exists "programs_select" on public.programs;
drop policy if exists "programs_insert" on public.programs;
drop policy if exists "programs_update" on public.programs;
drop policy if exists "programs_delete" on public.programs;
drop policy if exists "programs_select_published" on public.programs;

create policy "programs_select" on public.programs for select using (public.is_approved());
create policy "programs_insert" on public.programs for insert with check (public.is_approved());
create policy "programs_update" on public.programs for update using (public.is_approved()) with check (public.is_approved());
create policy "programs_delete" on public.programs for delete using (public.is_approved());

-- API /api/program đọc bằng anon key (OpenPresenter không đăng nhập): chỉ thấy bản đã công bố.
create policy "programs_select_published" on public.programs for select to anon using (published);

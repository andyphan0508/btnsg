-- ============================================================
-- BTNSG — Sổ ghi chép & Bài giảng (Notebook)
-- Chạy sau khi đã chạy 0001_init.sql.
-- ============================================================

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null default 'ghi_chu' check (category in ('ghi_chu', 'bai_giang')),
  date date,
  speaker text,
  scripture text,
  tags jsonb not null default '[]'::jsonb,
  content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger notes_updated_at before update on public.notes
for each row execute function public.set_updated_at();

alter table public.notes enable row level security;

create policy "notes_select" on public.notes for select using (public.is_approved());
create policy "notes_insert" on public.notes for insert with check (public.is_approved());
create policy "notes_update" on public.notes for update using (public.is_approved()) with check (public.is_approved());
create policy "notes_delete" on public.notes for delete using (public.is_approved());

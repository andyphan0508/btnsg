-- ============================================================
-- BTNSG — Tin tức đăng từ dashboard lưu trên Supabase (thay folder Google Drive)
-- + dung lượng từng ảnh Khoảnh khắc (để dashboard hiện "đã dùng X / 1 GB").
-- Chạy sau 0008_moments_sermons.sql. An toàn khi chạy lại nhiều lần.
-- Bài cũ trên Google Drive vẫn hiện trên web (landing gộp cả hai nguồn), chỉ không sửa được nữa.
-- ============================================================

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  date date,
  description text not null default '',
  content text not null default '',        -- Markdown; ảnh trong bài là link Storage đầy đủ
  cover text not null default '',          -- link ảnh bìa (Storage)
  images jsonb not null default '[]'::jsonb, -- [{ name, url, path }] để sửa bài / xoá file
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists posts_order on public.posts (date desc nulls last, created_at desc);

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at before update on public.posts
for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

drop policy if exists "posts_select_public" on public.posts;
drop policy if exists "posts_select" on public.posts;
drop policy if exists "posts_insert" on public.posts;
drop policy if exists "posts_update" on public.posts;
drop policy if exists "posts_delete" on public.posts;

-- Landing đọc bài đã công khai bằng anon key qua /api/library?t=posts (CDN cache).
create policy "posts_select_public" on public.posts for select to anon using (published);
create policy "posts_select" on public.posts for select to authenticated using (published or public.is_approved());
create policy "posts_insert" on public.posts for insert with check (public.is_approved());
create policy "posts_update" on public.posts for update using (public.is_approved()) with check (public.is_approved());
create policy "posts_delete" on public.posts for delete using (public.is_approved());

-- Ảnh trong bài dùng chung bucket "moments" (thư mục posts/<id bài>/) — không cần bucket/policy mới.

-- Dung lượng (bytes) của bản lớn + bản nhỏ; ảnh đăng trước migration này để trống (ước lượng ~300KB).
alter table public.moments add column if not exists bytes int;

-- ============================================================
-- BTNSG — Khoảnh khắc (thư viện ảnh trên Supabase Storage) + công khai Bài giảng lên landing
-- Chạy sau 0001_init.sql và 0005_notes.sql. An toàn khi chạy lại nhiều lần.
-- ============================================================

-- ---------- Khoảnh khắc ----------
-- Mỗi dòng = một ảnh. Dashboard nén sẵn 2 cỡ WebP trước khi upload (Supabase Free không có
-- image transformation): ảnh lớn cho lightbox, ảnh nhỏ cho lưới/vòng ảnh.
create table if not exists public.moments (
  id uuid primary key default gen_random_uuid(),
  album text not null default '',      -- tên dịp/sự kiện, dùng để lọc trên trang Thư viện ảnh
  caption text not null default '',
  taken_on date,
  path text not null,                  -- ảnh lớn (≤1600px) trong bucket "moments"
  thumb_path text not null,            -- ảnh nhỏ (≤800px)
  width int,
  height int,
  created_at timestamptz not null default now()
);

create index if not exists moments_order on public.moments (taken_on desc nulls last, created_at desc);

alter table public.moments enable row level security;

drop policy if exists "moments_select" on public.moments;
drop policy if exists "moments_insert" on public.moments;
drop policy if exists "moments_update" on public.moments;
drop policy if exists "moments_delete" on public.moments;

-- Ảnh công khai: landing đọc bằng anon key qua /api/library (CDN cache).
create policy "moments_select" on public.moments for select to anon, authenticated using (true);
create policy "moments_insert" on public.moments for insert with check (public.is_approved());
create policy "moments_update" on public.moments for update using (public.is_approved()) with check (public.is_approved());
create policy "moments_delete" on public.moments for delete using (public.is_approved());

-- Bucket công khai (link ảnh đọc thẳng, không cần đăng nhập); tối đa 2MB/ảnh — ảnh đã nén chỉ ~100–400KB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('moments', 'moments', true, 2097152, array['image/webp', 'image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "moments_files_select" on storage.objects;
drop policy if exists "moments_files_insert" on storage.objects;
drop policy if exists "moments_files_delete" on storage.objects;

-- Xoá file qua API cần cả quyền select lẫn delete.
create policy "moments_files_select" on storage.objects for select to authenticated
  using (bucket_id = 'moments' and public.is_approved());
create policy "moments_files_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'moments' and public.is_approved());
create policy "moments_files_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'moments' and public.is_approved());

-- ---------- Bài giảng công khai ----------
-- Bài giảng trong Sổ ghi chép mặc định vẫn nội bộ; bật "Công khai" mới hiện trên trang /bai-giang.
alter table public.notes add column if not exists published boolean not null default false;

drop policy if exists "notes_select_published" on public.notes;
create policy "notes_select_published" on public.notes for select to anon
  using (published and category = 'bai_giang');

-- ============================================================
-- BTNSG — Liên kết ảnh buổi nhóm (moments) với Chương trình thờ phượng (programs)
-- Chạy sau 0010_tags_audio.sql. An toàn khi chạy lại nhiều lần.
-- ============================================================

alter table public.moments add column if not exists program_id uuid references public.programs(id) on delete set null;
alter table public.moments add column if not exists program_title text not null default '';

create index if not exists moments_program_idx on public.moments (program_id);
create index if not exists moments_program_title_idx on public.moments (program_title);

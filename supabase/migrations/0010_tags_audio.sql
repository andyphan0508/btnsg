-- ============================================================
-- BTNSG — Tag cho ảnh Khoảnh khắc (thẻ mục vụ / lịch tuần / dải ảnh lấy ảnh theo tag)
-- + audio cho Bài giảng + ảnh/audio tải lên từ màn hình Website.
-- Chạy sau 0009_posts.sql. An toàn khi chạy lại nhiều lần.
-- PHẢI chạy trước khi deploy code mới: dashboard ghi cột notes.audio_url, landing đọc moments.tags.
-- ============================================================

alter table public.moments add column if not exists tags text[] not null default '{}';
create index if not exists moments_tags on public.moments using gin (tags);

-- Link audio bài giảng: file tải lên (kho ảnh, thư mục audio/) hoặc link YouTube / file mp3 bên ngoài.
alter table public.notes add column if not exists audio_url text;

-- Bucket "moments" nhận thêm audio bài giảng (tối đa 50MB — giới hạn mỗi file của Supabase Free).
-- Ảnh vẫn được dashboard nén về ~100–300KB trước khi tải lên.
update storage.buckets
set file_size_limit = 52428800,
    allowed_mime_types = array['image/webp', 'image/jpeg', 'audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/ogg', 'audio/opus']
where id = 'moments';

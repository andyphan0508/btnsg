-- ============================================================
-- BTNSG — Khởi tạo database Supabase
-- Chạy toàn bộ file này trong Supabase Dashboard → SQL Editor.
-- ============================================================

-- ---------- Hàm tiện ích ----------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ---------- Tài khoản & phân quyền ----------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'bdh' check (role in ('admin', 'bdh')),
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- Tự tạo profile khi có user mới đăng ký
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'full_name', new.email, ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Helper kiểm tra quyền (security definer để đọc profiles không vướng RLS)
create or replace function public.is_approved()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and approved = true
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and approved = true and role = 'admin'
  );
$$;

-- ---------- Các bảng dữ liệu ----------

create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  gender text check (gender in ('nam', 'nu')),
  birthday date,
  phone text,
  email text,
  role text not null default 'member' check (role in ('member', 'leader')),
  board_role text,
  duties jsonb not null default '[]'::jsonb,
  group_name text,
  joined_at date,
  status text not null default 'active' check (status in ('active', 'inactive')),
  stage text check (stage in ('thieu_nien', 'thanh_nien', 'thanh_trang')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.member_changes (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null,
  member_name text not null,
  action text not null check (action in ('create', 'update', 'delete')),
  changes jsonb not null default '[]'::jsonb,
  actor_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  title text not null,
  schedule_event_id uuid,
  records jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  recurrence text not null default 'weekly' check (recurrence in ('weekly', 'once')),
  day_of_week int check (day_of_week between 0 and 6),
  date date,
  time text not null,
  location text,
  description text,
  is_main boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  pinned boolean not null default false,
  author text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assignee_ids jsonb not null default '[]'::jsonb,
  due_date date,
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.requests (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  requester_name text not null,
  status text not null default 'open' check (status in ('open', 'in_review', 'approved', 'rejected', 'done')),
  response text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  type text not null default 'expense' check (type in ('income', 'expense')),
  category text not null,
  amount numeric not null check (amount > 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plans (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  goal text,
  start_date date,
  end_date date,
  status text not null default 'draft' check (status in ('draft', 'active', 'done')),
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.email_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  subject text not null,
  body text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Trigger updated_at cho tất cả bảng dữ liệu
do $$
declare t text;
begin
  foreach t in array array[
    'members', 'member_changes', 'attendance_sessions', 'schedule_events',
    'announcements', 'tasks', 'requests', 'expenses', 'plans', 'email_templates'
  ]
  loop
    execute format(
      'create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t, t
    );
  end loop;
end $$;

-- ---------- Audit log tự động cho bảng members ----------

create or replace function public.jsonb_text(value jsonb)
returns text
language sql immutable
as $$
  select case
    when value is null then null
    when jsonb_typeof(value) = 'array'
      then (select string_agg(elem, ', ') from jsonb_array_elements_text(value) as elem)
    else value #>> '{}'
  end;
$$;

create or replace function public.log_member_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  actor text;
  diff jsonb := '[]'::jsonb;
  fields text[] := array[
    'name', 'gender', 'birthday', 'phone', 'email', 'role', 'board_role',
    'duties', 'group_name', 'joined_at', 'status', 'stage', 'notes'
  ];
  -- Tên field camelCase tương ứng để dashboard hiển thị nhất quán
  labels text[] := array[
    'name', 'gender', 'birthday', 'phone', 'email', 'role', 'boardRole',
    'duties', 'group', 'joinedAt', 'status', 'stage', 'notes'
  ];
  f text;
  old_row jsonb := to_jsonb(old);
  new_row jsonb := to_jsonb(new);
  v_from text;
  v_to text;
  i int := 1;
begin
  select full_name into actor from public.profiles where id = auth.uid();

  if tg_op = 'INSERT' then
    insert into public.member_changes (member_id, member_name, action, changes, actor_name)
    values (new.id, new.name, 'create', '[]'::jsonb, actor);
    return new;
  end if;

  if tg_op = 'DELETE' then
    insert into public.member_changes (member_id, member_name, action, changes, actor_name)
    values (old.id, old.name, 'delete', '[]'::jsonb, actor);
    return old;
  end if;

  foreach f in array fields
  loop
    v_from := public.jsonb_text(old_row -> f);
    v_to := public.jsonb_text(new_row -> f);
    if v_from is distinct from v_to then
      diff := diff || jsonb_build_array(jsonb_build_object('field', labels[i], 'from', v_from, 'to', v_to));
    end if;
    i := i + 1;
  end loop;

  if jsonb_array_length(diff) > 0 then
    insert into public.member_changes (member_id, member_name, action, changes, actor_name)
    values (new.id, new.name, 'update', diff, actor);
  end if;
  return new;
end;
$$;

create trigger members_audit
after insert or update or delete on public.members
for each row execute function public.log_member_change();

-- ---------- Row Level Security ----------

alter table public.profiles enable row level security;
alter table public.members enable row level security;
alter table public.member_changes enable row level security;
alter table public.attendance_sessions enable row level security;
alter table public.schedule_events enable row level security;
alter table public.announcements enable row level security;
alter table public.tasks enable row level security;
alter table public.requests enable row level security;
alter table public.expenses enable row level security;
alter table public.plans enable row level security;
alter table public.email_templates enable row level security;

-- profiles: ai cũng đọc được hồ sơ của chính mình; admin đọc & sửa tất cả
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_select_admin" on public.profiles
  for select using (public.is_admin());
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- Các bảng dữ liệu: thành viên đã được duyệt (BĐH/Admin) được đọc + ghi
do $$
declare t text;
begin
  foreach t in array array[
    'members', 'attendance_sessions', 'schedule_events', 'announcements',
    'tasks', 'requests', 'expenses', 'plans', 'email_templates'
  ]
  loop
    execute format('create policy "%s_select" on public.%I for select using (public.is_approved())', t, t);
    execute format('create policy "%s_insert" on public.%I for insert with check (public.is_approved())', t, t);
    execute format('create policy "%s_update" on public.%I for update using (public.is_approved()) with check (public.is_approved())', t, t);
    execute format('create policy "%s_delete" on public.%I for delete using (public.is_approved())', t, t);
  end loop;
end $$;

-- member_changes: chỉ đọc (ghi qua trigger security definer)
create policy "member_changes_select" on public.member_changes
  for select using (public.is_approved());

-- ---------- Seed dữ liệu ban đầu ----------

insert into public.members (name, role, board_role, duties, status, joined_at) values
  ('Hoàng Nguyễn Phương Uyên', 'leader', 'Trưởng Ban', '["Uỷ viên Linh vụ", "Uỷ viên nhóm nhỏ"]', 'active', '2004-01-01'),
  ('Trần Nhật Kỳ', 'leader', 'Phó Ban', '["Uỷ viên Công tác Xã hội", "Quản lý Nhà sinh viên"]', 'active', '2004-01-01'),
  ('Trương Thị Thanh Ngân', 'leader', 'Thư ký', '["Uỷ viên Đố Kinh Thánh"]', 'active', '2004-01-01'),
  ('Nguyễn Đặng Thiên Kim', 'leader', 'Thủ quỹ', '["Hậu cần"]', 'active', '2004-01-01'),
  ('Nguyễn Văn Tới', 'leader', 'Uỷ viên Du lịch dã ngoại', '["Uỷ viên Giữ xe"]', 'active', '2004-01-01'),
  ('Huỳnh Nguyên Bảo', 'leader', 'Uỷ viên Kỹ thuật', '["Uỷ viên Thăm viếng Chăm sóc"]', 'active', '2004-01-01'),
  ('Bùi Tuấn Anh', 'leader', 'Nhóm trưởng', '["Uỷ viên Truyền giảng"]', 'active', '2004-01-01'),
  ('Phan An Duy', 'leader', 'Nhóm trưởng', '["Quản lý Tài sản"]', 'active', '2004-01-01'),
  ('Dương Thảo Nhi', 'leader', 'Nhóm trưởng', '["Uỷ viên sinh hoạt"]', 'active', '2004-01-01'),
  ('Nguyễn Anh Thư', 'leader', 'Nhóm trưởng', '["Uỷ viên Cầu nguyện"]', 'active', '2004-01-01'),
  ('Trần Thảo Anh', 'leader', 'Uỷ viên Âm nhạc', '["Uỷ viên Truyền thông"]', 'active', '2004-01-01');

insert into public.schedule_events (title, recurrence, day_of_week, time, location, description, is_main) values
  ('Nhóm thờ phượng Chúa', 'weekly', 0, '14:30', 'Lầu 2, 161 Đề Thám, Quận 1', 'Buổi nhóm chính trong tuần — dành cho mọi bạn trẻ.', true),
  ('Học Kinh Thánh', 'weekly', 2, '19:00', 'Phòng sinh hoạt Ban Thanh Niên', 'Cùng đào sâu Lời Chúa giữa tuần.', false),
  ('Thăm viếng', 'weekly', 4, '19:00', null, 'Tuần thứ 2 và thứ 3 mỗi tháng.', false),
  ('Ban Điều Hành cầu nguyện', 'weekly', 6, '18:30', null, 'Cầu thay cho công việc của Ban.', false),
  ('Tập hát', 'weekly', 6, '19:30', null, 'Chuẩn bị tôn vinh Chúa cho Chúa Nhật.', false);

insert into public.announcements (title, content, pinned, author) values
  ('Chào mừng đến với Dashboard Ban Thanh Niên',
   'Đây là hệ thống quản lý nội bộ của Ban Thanh Niên HTTL Sài Gòn: quản lý thành viên, điểm danh, lịch sinh hoạt, công việc, thu chi và kế hoạch. Hãy bắt đầu bằng cách thêm các ban viên vào mục Thành viên.',
   true, 'Ban Điều Hành');

insert into public.email_templates (name, description, subject, body) values
  ('Thư mời họp BĐH', 'Mời họp Ban Điều Hành định kỳ hoặc đột xuất.',
   'Thư mời họp Ban Điều Hành — {{chu_de}}',
   E'Thân chào các anh chị em trong Ban Điều Hành,\n\nBan Thanh Niên trân trọng kính mời anh chị em tham dự buổi họp Ban Điều Hành:\n\n- Chủ đề: {{chu_de}}\n- Thời gian: {{thoi_gian}}\n- Địa điểm: {{dia_diem}}\n- Nội dung chính: {{noi_dung}}\n\nXin anh chị em sắp xếp thời gian tham dự đông đủ và đúng giờ.\n\nTrong Chúa,\n{{nguoi_gui}}'),
  ('Thông báo công tác', 'Phân công / nhắc công tác cho BĐH.',
   'Thông báo công tác — {{ten_cong_tac}}',
   E'Thân chào các anh chị em,\n\nBan Thanh Niên xin thông báo công tác sắp tới:\n\n- Công tác: {{ten_cong_tac}}\n- Thời gian: {{thoi_gian}}\n- Phụ trách: {{phu_trach}}\n- Ghi chú: {{ghi_chu}}\n\nXin Chúa ban ơn trên công việc của mỗi chúng ta.\n\nTrong Chúa,\n{{nguoi_gui}}'),
  ('Nhắc lịch sinh hoạt', 'Nhắc BĐH chuẩn bị cho buổi nhóm.',
   'Nhắc lịch — {{buoi_nhom}} ngày {{ngay}}',
   E'Thân chào các anh chị em,\n\nNhắc anh chị em buổi nhóm {{buoi_nhom}} vào {{ngay}} lúc {{gio}} tại {{dia_diem}}.\n\nPhân công chuẩn bị: {{phan_cong}}\n\nTrong Chúa,\n{{nguoi_gui}}');

-- ============================================================
-- SAU KHI CHẠY FILE NÀY:
-- 1. Đăng ký tài khoản đầu tiên trên dashboard (màn hình Đăng ký).
-- 2. Quay lại SQL Editor, cấp quyền admin cho tài khoản đó:
--    update public.profiles set role = 'admin', approved = true
--    where email = 'email-cua-ban@example.com';
-- 3. Từ đó về sau duyệt tài khoản mới ngay trong dashboard (mục Tài khoản).
-- ============================================================

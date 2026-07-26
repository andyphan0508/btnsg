-- ============================================================
-- BTNSG — Bổ sung trường chi tiết cho bảng thu chi
-- Chạy trong Supabase Dashboard → SQL Editor (sau 0001_init.sql).
-- An toàn khi chạy lại nhiều lần (dùng IF NOT EXISTS).
-- ============================================================

alter table public.expenses
  add column if not exists sub_category text,
  add column if not exists receipt_no text,
  add column if not exists payment_method text,
  add column if not exists counterparty text,
  add column if not exists handled_by text,
  add column if not exists event_name text,
  add column if not exists attachment_url text;

-- Hình thức thanh toán chỉ nhận 3 giá trị (bỏ trống vẫn được).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'expenses_payment_method_check'
  ) then
    alter table public.expenses
      add constraint expenses_payment_method_check
      check (payment_method is null or payment_method in ('cash', 'transfer', 'other'));
  end if;
end $$;

-- Lọc theo ngày và theo hạng mục là truy vấn thường dùng nhất của màn hình Thu chi.
create index if not exists expenses_date_idx on public.expenses (date desc);
create index if not exists expenses_category_idx on public.expenses (category);

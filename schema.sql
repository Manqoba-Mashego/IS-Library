-- Run this once during setup

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  book_title text not null,
  checkout_date date not null default current_date,
  return_date date,
  status text not null default 'checked_out' check (status in ('checked_out', 'returned')),
  created_at timestamptz not null default now()
);
 
alter table public.loans enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.loans to anon, authenticated;
 
create policy "Anyone can create a loan"
on public.loans
for insert
to anon, authenticated
with check (true);
 
create policy "Anyone can return a checked out book"
on public.loans
for update
to anon, authenticated
using (status = 'checked_out')
with check (true);
 
create policy "Librarians can view all loans"
on public.loans
for select
to authenticated
using (true);
 

create unique index if not exists loans_one_active_title_per_person
on public.loans (lower(email), lower(book_title))
where status = 'checked_out';
 

create or replace function public.check_in_loan(p_email text, p_title text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  update public.loans
  set status = 'returned', return_date = current_date
  where lower(email) = lower(p_email)
    and lower(book_title) = lower(p_title)
    and status = 'checked_out';
 
  get diagnostics v_count = row_count;
  return v_count > 0;
end;
$$;
 
grant execute on function public.check_in_loan(text, text) to anon, authenticated;
 
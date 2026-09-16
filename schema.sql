-- Run this once during setup

create table if not exists public.loans (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  book_title text not null,
  checkout_date date not null default current_date,
  due_date date,
  return_date date,
  status text not null default 'checked_out' check (status in ('checked_out', 'returned')),
  created_at timestamptz not null default now()
);

alter table public.loans enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.loans to anon, authenticated;

-- Anyone (a borrower, with no login) can check a book out.
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

-- Only logged-in librarians can browse/read the full list of loans.
create policy "Librarians can view all loans"
on public.loans
for select
to authenticated
using (true);
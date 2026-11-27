-- RENT MATCH V2: persist renter requirements with per-user access controls.
create table if not exists public.property_requirements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  area text not null check (length(btrim(area)) between 2 and 160),
  type text not null check (type in ('گھر','دکان')),
  max_rent bigint not null check (max_rent > 0),
  max_advance bigint not null default 0 check (max_advance >= 0),
  notes text not null default '',
  status text not null default 'active' check (status in ('active','closed')),
  created_at timestamptz not null default now()
);
create index if not exists property_requirements_user_created_idx
  on public.property_requirements(user_id, created_at desc);
create index if not exists property_requirements_area_type_idx
  on public.property_requirements(area, type, status);
alter table public.property_requirements enable row level security;
drop policy if exists "Users read own property requirements" on public.property_requirements;
create policy "Users read own property requirements"
  on public.property_requirements for select to authenticated
  using ((select auth.uid()) = user_id);
drop policy if exists "Users create own property requirements" on public.property_requirements;
create policy "Users create own property requirements"
  on public.property_requirements for insert to authenticated
  with check ((select auth.uid()) = user_id);
drop policy if exists "Users update own property requirements" on public.property_requirements;
create policy "Users update own property requirements"
  on public.property_requirements for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "Users delete own property requirements" on public.property_requirements;
create policy "Users delete own property requirements"
  on public.property_requirements for delete to authenticated
  using ((select auth.uid()) = user_id);
grant select, insert, update, delete on public.property_requirements to authenticated;

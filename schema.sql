-- Run this whole script in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now()
);
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  owner_phone text not null,
  type text not null check (type in ('گھر','دکان')),
  area text not null,
  rent bigint not null check (rent > 0),
  advance bigint not null default 0 check (advance >= 0),
  size text,
  description text,
  photo_urls text[] not null default '{}',
  status text not null default 'pending' check (status in ('pending','active','removed')),
  created_at timestamptz not null default now()
);
create table if not exists public.listing_reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now(),
  unique(listing_id,reporter_id)
);
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$ select exists(select 1 from public.profiles where id=auth.uid() and role='admin') $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public
as $$ begin
 insert into public.profiles(id,phone) values(new.id,new.phone)
 on conflict(id) do update set phone=excluded.phone;
 return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert or update of phone on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_reports enable row level security;

create policy "profiles select own or admin" on public.profiles for select
using (id=auth.uid() or public.is_admin());
create policy "profiles update own safe fields" on public.profiles for update
using (id=auth.uid()) with check (id=auth.uid() and role='user');

create policy "public reads active listings" on public.listings for select
using (status='active' or owner_id=auth.uid() or public.is_admin());
create policy "signed-in users create pending listings" on public.listings for insert
to authenticated with check (owner_id=auth.uid() and status='pending');
create policy "owners update own pending listings" on public.listings for update
to authenticated using (owner_id=auth.uid() and status='pending')
with check (owner_id=auth.uid() and status='pending');
create policy "admins moderate listings" on public.listings for update
to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "users submit own reports" on public.listing_reports for insert
to authenticated with check (reporter_id=auth.uid());
create policy "admins read reports" on public.listing_reports for select
to authenticated using (public.is_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('listing-photos','listing-photos',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;
create policy "public reads listing photos" on storage.objects for select
using (bucket_id='listing-photos');
create policy "users upload own listing photos" on storage.objects for insert
to authenticated with check (bucket_id='listing-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "users delete own listing photos" on storage.objects for delete
to authenticated using (bucket_id='listing-photos' and (storage.foldername(name))[1]=auth.uid()::text);

-- After creating your first account, promote it to admin manually:
-- update public.profiles set role='admin' where phone='+923001234567';

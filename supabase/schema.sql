-- RENT MATCH: safe migration for the existing Supabase project.
-- This project already has profiles, listings and listing_reports tables.
-- The connected live project already has latitude/longitude columns applied.

alter table public.listings
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.listings'::regclass
      and conname = 'listings_latitude_range'
  ) then
    alter table public.listings add constraint listings_latitude_range
      check (latitude is null or latitude between -90 and 90);
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.listings'::regclass
      and conname = 'listings_longitude_range'
  ) then
    alter table public.listings add constraint listings_longitude_range
      check (longitude is null or longitude between -180 and 180);
  end if;
end $$;

create index if not exists listings_coordinates_idx
  on public.listings(latitude, longitude);

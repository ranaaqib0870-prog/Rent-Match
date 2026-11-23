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


-- Security hardening applied to the connected project.
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, service_role;

DROP POLICY IF EXISTS "public reads active listings" ON public.listings;
CREATE POLICY "public reads active listings"
  ON public.listings FOR SELECT TO public
  USING (status = 'active');
DROP POLICY IF EXISTS "owners read own listings" ON public.listings;
CREATE POLICY "owners read own listings"
  ON public.listings FOR SELECT TO authenticated
  USING (owner_id = (select auth.uid()));
DROP POLICY IF EXISTS "admins read all listings" ON public.listings;
CREATE POLICY "admins read all listings"
  ON public.listings FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "profiles select own or admin" ON public.profiles;
CREATE POLICY "profiles select own or admin"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = (select auth.uid()) OR public.is_admin());
DROP POLICY IF EXISTS "profiles update own safe fields" ON public.profiles;
CREATE POLICY "profiles update own safe fields"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()) AND role = 'user');

DROP POLICY IF EXISTS "owners update own pending listings" ON public.listings;
CREATE POLICY "owners update own pending listings"
  ON public.listings FOR UPDATE TO authenticated
  USING (owner_id = (select auth.uid()) AND status = 'pending')
  WITH CHECK (owner_id = (select auth.uid()) AND status = 'pending');
DROP POLICY IF EXISTS "admins moderate listings" ON public.listings;
CREATE POLICY "admins moderate listings"
  ON public.listings FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "users submit own reports" ON public.listing_reports;
CREATE POLICY "users submit own reports"
  ON public.listing_reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = (select auth.uid()));
DROP POLICY IF EXISTS "admins read reports" ON public.listing_reports;
CREATE POLICY "admins read reports"
  ON public.listing_reports FOR SELECT TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "signed-in users create pending listings" ON public.listings;
CREATE POLICY "signed-in users create active listings"
  ON public.listings FOR INSERT TO authenticated
  WITH CHECK (owner_id = (select auth.uid()) AND status = 'active');

CREATE INDEX IF NOT EXISTS listings_owner_id_idx ON public.listings(owner_id);
CREATE INDEX IF NOT EXISTS listing_reports_reporter_id_idx ON public.listing_reports(reporter_id);


DROP POLICY IF EXISTS "owners archive own active listings" ON public.listings;
CREATE POLICY "owners archive own active listings"
  ON public.listings FOR UPDATE TO authenticated
  USING (owner_id = (select auth.uid()) AND status = 'active')
  WITH CHECK (owner_id = (select auth.uid()) AND status = 'removed');

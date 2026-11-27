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
DROP POLICY IF EXISTS "owners read own listings" ON public.listings;
DROP POLICY IF EXISTS "admins read all listings" ON public.listings;
CREATE POLICY "public reads active listings"
  ON public.listings FOR SELECT TO anon
  USING (status = 'active');
CREATE POLICY "authenticated reads active own and admin listings"
  ON public.listings FOR SELECT TO authenticated
  USING (status = 'active' OR owner_id = (select auth.uid()) OR public.is_admin());

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


-- Launch hardening: posting quotas and manual-payment protections.
ALTER TABLE private.agent_entitlements DROP CONSTRAINT IF EXISTS agent_entitlements_listing_limit_check;
ALTER TABLE private.agent_entitlements ADD CONSTRAINT agent_entitlements_listing_limit_check CHECK (listing_limit >= 1 AND listing_limit <= 20);
UPDATE private.agent_entitlements SET listing_limit = 20 WHERE listing_limit <> 20;
CREATE INDEX IF NOT EXISTS listings_owner_status_created_idx ON public.listings(owner_id, status, created_at DESC);

-- Keep both installed BEFORE INSERT triggers aligned to the same launch limits.
CREATE OR REPLACE FUNCTION private.enforce_listing_post_cooldown()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, private
AS $
DECLARE v_user_id uuid; v_active_count integer;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL OR NEW.owner_id IS DISTINCT FROM v_user_id THEN
    RAISE EXCEPTION 'AUTH_REQUIRED_TO_POST_LISTING' USING ERRCODE = '42501';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(v_user_id::text, 0));
  IF EXISTS (SELECT 1 FROM private.agent_entitlements e WHERE e.user_id=v_user_id AND e.active_until>pg_catalog.now()) THEN
    SELECT count(*) INTO v_active_count FROM public.listings l WHERE l.owner_id=v_user_id AND l.status='active';
    IF v_active_count >= 20 THEN RAISE EXCEPTION 'AGENT_LISTING_LIMIT_REACHED' USING ERRCODE='P0001'; END IF;
    NEW.created_at := pg_catalog.clock_timestamp(); RETURN NEW;
  END IF;
  IF EXISTS (SELECT 1 FROM private.user_entitlements e WHERE e.user_id=v_user_id AND e.premium_until>pg_catalog.now()) THEN
    NEW.created_at := pg_catalog.clock_timestamp(); RETURN NEW;
  END IF;
  IF EXISTS (SELECT 1 FROM public.listings l WHERE l.owner_id=v_user_id AND l.created_at>pg_catalog.now()-interval '7 days') THEN
    RAISE EXCEPTION 'FREE_LISTING_LIMIT_7_DAYS' USING ERRCODE='P0001',
      HINT='A free account can publish one listing every 7 days. Premium access allows additional listings.';
  END IF;
  NEW.created_at := pg_catalog.clock_timestamp(); RETURN NEW;
END;
$;

CREATE OR REPLACE FUNCTION private.enforce_listing_post_limit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $
DECLARE current_user_id uuid; has_premium boolean:=false; has_agent boolean:=false;
  active_count integer:=0; recent_listing boolean:=false;
BEGIN
  current_user_id:=auth.uid();
  IF current_user_id IS NULL OR NEW.owner_id IS DISTINCT FROM current_user_id THEN
    RAISE EXCEPTION 'AUTH_REQUIRED_TO_POST_LISTING' USING ERRCODE='42501';
  END IF;
  PERFORM pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(current_user_id::text,0));
  NEW.created_at:=pg_catalog.clock_timestamp();
  SELECT EXISTS(SELECT 1 FROM private.agent_entitlements e WHERE e.user_id=current_user_id AND e.active_until>pg_catalog.now()) INTO has_agent;
  IF has_agent THEN
    SELECT count(*) INTO active_count FROM public.listings l WHERE l.owner_id=current_user_id AND l.status='active';
    IF active_count>=20 THEN RAISE EXCEPTION 'AGENT_LISTING_LIMIT_REACHED' USING ERRCODE='P0001'; END IF;
    RETURN NEW;
  END IF;
  SELECT EXISTS(SELECT 1 FROM private.user_entitlements e WHERE e.user_id=current_user_id AND e.premium_until>pg_catalog.now()) INTO has_premium;
  IF has_premium THEN RETURN NEW; END IF;
  SELECT EXISTS(SELECT 1 FROM public.listings l WHERE l.owner_id=current_user_id AND l.created_at>pg_catalog.now()-interval '7 days') INTO recent_listing;
  IF recent_listing THEN
    RAISE EXCEPTION 'FREE_LISTING_LIMIT_7_DAYS' USING ERRCODE='P0001',
      HINT='A free account can publish one listing every 7 days. Premium access allows additional listings.';
  END IF;
  RETURN NEW;
END;
$;


CREATE OR REPLACE FUNCTION public.get_listing_post_status()
RETURNS TABLE(is_allowed boolean, is_premium boolean, next_free_at timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = pg_catalog, public, private, auth
AS $$
DECLARE v_uid uuid := auth.uid(); v_latest timestamptz; v_premium_until timestamptz; v_agent_until timestamptz;
BEGIN
  IF v_uid IS NULL THEN RETURN QUERY SELECT false, false, NULL::timestamptz; RETURN; END IF;
  SELECT e.active_until INTO v_agent_until FROM private.agent_entitlements e WHERE e.user_id = v_uid;
  IF v_agent_until IS NOT NULL AND v_agent_until > now() THEN RETURN QUERY SELECT true, false, NULL::timestamptz; RETURN; END IF;
  SELECT e.premium_until INTO v_premium_until FROM private.user_entitlements e WHERE e.user_id = v_uid;
  IF v_premium_until IS NOT NULL AND v_premium_until > now() THEN RETURN QUERY SELECT true, true, NULL::timestamptz; RETURN; END IF;
  SELECT max(l.created_at) INTO v_latest FROM public.listings l WHERE l.owner_id = v_uid;
  RETURN QUERY SELECT (v_latest IS NULL OR v_latest <= now() - interval '7 days'), false,
    CASE WHEN v_latest IS NULL THEN NULL ELSE v_latest + interval '7 days' END;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_premium_payment(p_payment_id uuid, p_approve boolean, p_note text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, public, private, auth
AS $
DECLARE
  v_request public.premium_payment_requests%rowtype;
  v_days integer;
  v_expected_amount integer;
  v_is_agent boolean;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id=auth.uid() AND p.role='admin') THEN
    RAISE EXCEPTION 'ADMIN_ONLY';
  END IF;
  SELECT * INTO v_request FROM public.premium_payment_requests WHERE id=p_payment_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'PAYMENT_REQUEST_NOT_FOUND'; END IF;
  IF v_request.status <> 'pending' THEN RAISE EXCEPTION 'PAYMENT_REQUEST_ALREADY_REVIEWED'; END IF;

  v_is_agent := v_request.plan_code LIKE 'agent_%';
  v_days := CASE v_request.plan_code
    WHEN 'premium_7_days' THEN 7 WHEN 'premium_15_days' THEN 15 WHEN 'premium_30_days' THEN 30
    WHEN 'agent_starter_7_days' THEN 7 WHEN 'agent_professional_15_days' THEN 15 WHEN 'agent_business_30_days' THEN 30 END;
  v_expected_amount := CASE v_request.plan_code
    WHEN 'premium_7_days' THEN 300 WHEN 'premium_15_days' THEN 500 WHEN 'premium_30_days' THEN 900
    WHEN 'agent_starter_7_days' THEN 500 WHEN 'agent_professional_15_days' THEN 900 WHEN 'agent_business_30_days' THEN 1500 END;
  IF v_days IS NULL OR v_expected_amount IS NULL THEN RAISE EXCEPTION 'INVALID_PACKAGE'; END IF;
  IF v_request.amount <> v_expected_amount THEN RAISE EXCEPTION 'PAYMENT_AMOUNT_MISMATCH'; END IF;

  IF p_approve THEN
    IF v_is_agent THEN
      INSERT INTO private.agent_entitlements(user_id,package_code,active_until,listing_limit,updated_at)
      VALUES(v_request.user_id,v_request.plan_code,now()+make_interval(days=>v_days),20,now())
      ON CONFLICT(user_id) DO UPDATE SET package_code=EXCLUDED.package_code,
        active_until=greatest(private.agent_entitlements.active_until,now())+make_interval(days=>v_days),
        listing_limit=20,updated_at=now();
    ELSE
      INSERT INTO private.user_entitlements(user_id,premium_until,updated_at)
      VALUES(v_request.user_id,now()+make_interval(days=>v_days),now())
      ON CONFLICT(user_id) DO UPDATE SET
        premium_until=greatest(coalesce(private.user_entitlements.premium_until,now()),now())+make_interval(days=>v_days),
        updated_at=now();
    END IF;
  END IF;
  UPDATE public.premium_payment_requests
  SET status=CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
      admin_note=left(coalesce(p_note,''),500),reviewed_at=now()
  WHERE id=p_payment_id;
  RETURN jsonb_build_object('success',true,'status',CASE WHEN p_approve THEN 'approved' ELSE 'rejected' END,
    'user_id',v_request.user_id,'package_type',CASE WHEN v_is_agent THEN 'agent' ELSE 'premium' END);
END;
$;

REVOKE ALL ON FUNCTION public.review_premium_payment(uuid,boolean,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.review_premium_payment(uuid,boolean,text) TO authenticated;
REVOKE ALL ON FUNCTION public.get_active_agent_profiles(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_active_agent_profiles(uuid[]) TO authenticated;
REVOKE ALL ON FUNCTION public.get_listing_post_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_listing_post_status() TO authenticated;
REVOKE ALL ON FUNCTION public.get_my_agent_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_agent_status() TO authenticated;
REVOKE ALL ON FUNCTION public.get_my_premium_status() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_premium_status() TO authenticated;
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

UPDATE storage.buckets SET file_size_limit=26214400,
  allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp','video/mp4','video/webm','video/quicktime']
WHERE id='listing-photos';
DROP POLICY IF EXISTS "Users can submit own premium payment requests" ON public.premium_payment_requests;
CREATE POLICY "Users can submit own premium payment requests" ON public.premium_payment_requests
FOR INSERT TO authenticated WITH CHECK (
  user_id=(SELECT auth.uid()) AND status='pending' AND reviewed_at IS NULL AND admin_note=''
  AND screenshot_path IS NOT NULL AND screenshot_path LIKE (user_id::text || '/%')
);

-- Supporting indexes for frequently filtered foreign keys and admin queues.
CREATE INDEX IF NOT EXISTS listing_comments_author_id_idx ON public.listing_comments(author_id);
CREATE INDEX IF NOT EXISTS notifications_comment_id_idx ON public.notifications(comment_id);
CREATE INDEX IF NOT EXISTS notifications_listing_id_idx ON public.notifications(listing_id);
CREATE INDEX IF NOT EXISTS premium_payment_requests_user_id_idx ON public.premium_payment_requests(user_id);

-- Public verified-agent card RPC is intentionally limited to 100 requested IDs.
CREATE OR REPLACE FUNCTION public.get_active_agent_profiles(p_user_ids uuid[])
RETURNS TABLE(user_id uuid, business_name text, contact_phone text, bio text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT p.user_id, p.business_name, p.contact_phone, p.bio
  FROM public.agent_profiles p
  JOIN private.agent_entitlements e ON e.user_id = p.user_id
  WHERE p_user_ids IS NOT NULL AND pg_catalog.cardinality(p_user_ids) <= 100
    AND p.user_id = ANY(p_user_ids) AND e.active_until > pg_catalog.now();
$$;
COMMENT ON FUNCTION public.get_active_agent_profiles(uuid[]) IS
'Publicly exposes limited business-card fields for currently active verified agents; accepts at most 100 user IDs.';
GRANT EXECUTE ON FUNCTION public.get_active_agent_profiles(uuid[]) TO anon, authenticated;


-- Private storage for EasyPaisa/JazzCash payment proof screenshots.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('premium-payment-screenshots', 'premium-payment-screenshots', false, 5242880,
  ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp'];

DROP POLICY IF EXISTS "Users upload own premium payment screenshots" ON storage.objects;
CREATE POLICY "Users upload own premium payment screenshots"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'premium-payment-screenshots'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);

DROP POLICY IF EXISTS "Users and admins view premium payment screenshots" ON storage.objects;
CREATE POLICY "Users and admins view premium payment screenshots"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'premium-payment-screenshots' AND (
  (storage.foldername(name))[1] = (SELECT auth.uid())::text
  OR EXISTS (SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin')
));

DROP POLICY IF EXISTS "Users delete own premium payment screenshots" ON storage.objects;
CREATE POLICY "Users delete own premium payment screenshots"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'premium-payment-screenshots'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text);


-- RENT MATCH V2: persisted renter requirements.
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

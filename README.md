# RENT MATCH

A responsive Urdu-first rental marketplace for houses and shops.

## Features
- Gmail email OTP sign-in (Supabase Auth)
- Publish a property listing immediately after submission
- Search active houses and shops by area, type, rent and advance
- Optional nearby search using the device's location (requires browser location permission and listing coordinates)
- Photo upload to Supabase Storage
- Call / WhatsApp contact
- Wanted-property matching
- User-submitted listing reports
- Admin tools to remove listings

## 1. Configure Supabase
1. Create a Supabase project.
2. Open **SQL Editor** and run the complete file `supabase/schema.sql`.
3. In **Authentication → Providers → Email**, enable Email OTP. Configure the email provider/template so the message contains the one-time code (token).
4. In **Authentication → URL Configuration**, set your deployed website URL and allowed redirect URLs.
5. Copy the Project URL and anon/publishable key from **Project Settings → API**.
6. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
7. Never put the Supabase service-role key in this website or in GitHub.

## 2. Run locally
Requires Node.js 20+.
```bash
npm install
npm run dev
```
For a production build:
```bash
npm run build
```
Deploy the generated `dist/` directory to a static host such as Netlify, Vercel or Cloudflare Pages. Add the same two VITE_ environment variables in the hosting provider's environment settings, then redeploy.

## 3. Make your account an admin
1. Sign in to the app once using your Gmail address.
2. In Supabase SQL Editor, run the following and replace the address with your own verified Gmail:
```sql
update public.profiles set role = 'admin' where email = 'YOUR_GMAIL_ADDRESS';
```
Do not expose SQL Editor access to ordinary users.

## Important setup notes
- The app's nearby search uses browser geolocation and latitude/longitude fields. Users can still type a city or area manually.
- Nearby search currently uses an approximate 20 km coordinate box, not an exact municipal/neighborhood boundary. Listings without coordinates will not appear in that nearby-only result until they are updated with coordinates.
- Email OTP delivery depends on Supabase Auth email configuration and provider limits; GitHub code alone cannot enable or verify email delivery.
- Public listing photos are stored in the public `listing-photos` bucket. Do not upload private documents or sensitive images.
- Test sign-in, listing publication, photo uploads, reports, access policies and admin actions before public launch.
- Add privacy policy, terms and contact details, and obtain appropriate legal/privacy review for Pakistan operations.
- Do not collect rental deposits through this starter app.

## Configuration files
- `supabase/schema.sql`: database tables, row-level security policies and photo storage setup.
- `.env.example`: template for the two public client-side Supabase settings.

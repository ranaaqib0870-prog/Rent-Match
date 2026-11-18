# RENT MATCH — deploy-ready starter

A responsive Urdu-first rental marketplace for houses and shops. Includes:
- Mobile OTP sign-in (Supabase Auth SMS)
- Listing submission with moderation queue
- Active listing search by area, type, rent and advance
- Photo upload to Supabase Storage
- Call / WhatsApp contact
- Wanted-property matching
- User-submitted listing reports
- Admin moderation (approve/remove)

## 1. Create backend
1. Create a Supabase project.
2. In Authentication → Providers, enable Phone and configure an SMS provider. Set OTP expiry/rate limits and allowed redirect URLs.
3. Open SQL Editor and run `supabase/schema.sql`.
4. Copy Project URL and anon/publishable key from Project Settings → API.
5. Copy `.env.example` to `.env` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   Never put the Supabase service-role key in this website.

## 2. Run locally
Requires Node.js 20+.
```bash
npm install
npm run dev
```
For production build:
```bash
npm run build
```
Upload the generated `dist/` directory to a static host (for example Netlify, Vercel or Cloudflare Pages). Add the same two VITE_ environment variables in host settings. Set the site's URL in Supabase Auth redirect/URL settings.

## 3. Make the first admin
Register/log in with the admin mobile number once. In Supabase SQL Editor run:
```sql
update public.profiles set role='admin' where phone='+923001234567';
```
Replace with your exact verified number. Never give users access to SQL Editor.

## Important launch checklist
- Configure and pay for an SMS provider; OTP will not send until this is configured.
- Set production domain and Supabase Auth site URL / redirect URLs.
- Add privacy policy, terms, contact details and moderation process.
- Test OTP, image uploads, RLS, reports and admin account before public launch.
- Obtain legal/privacy review for Pakistan operations. Do not collect rental deposits through the app in this starter.
- Listings begin as `pending`; admin must approve them to make them public.

## What is not included automatically
This package is source code, not a hosted live service. A Supabase project, SMS provider credentials/billing, and hosting/domain account are required to deploy and operate it. The included backend SQL and client are a starter implementation; do a security review and end-to-end tests before handling real users.

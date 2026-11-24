# RENT MATCH

RENT MATCH is an Urdu-first, responsive rental marketplace for houses and shops, built with Vite and Supabase.

## Current product features

- Urdu and English interface with RTL/LTR switching.
- Google and Facebook OAuth sign-in (provider credentials must be configured in Supabase).
- Browse active house/shop listings, search by area, type, rent and advance, and optional nearby search.
- Post a listing with up to five images/videos; image limit 5 MB each and video limit 25 MB each.
- One free listing per account every 10 days.
- Premium plans: 7 days Rs 300, 15 days Rs 500, 30 days Rs 900. Active Premium removes the 10-day posting interval.
- Property Agent plans: Starter 7 days Rs 500, Professional 15 days Rs 900, Business 30 days Rs 1,500. Active Agent entitlement allows up to 40 active listings.
- Manual EasyPaisa/JazzCash payment proof submission with private screenshot storage and administrator review.
- Verified Agent profiles, listing comments, owner notifications, reports, call/WhatsApp contact, and owner listing removal.
- Admin listing moderation and payment approval.

## Supabase configuration

This repository is connected to an existing Supabase project. The file `supabase/schema.sql` is an incremental migration/hardening script for the current database; it is not a complete empty-project bootstrap schema.

Required Vercel environment variables (Production and Preview):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (publishable/anon client key only)

Never place a Supabase service-role key in client code or a VITE_ variable.

### Authentication

In Supabase Authentication:
1. Enable Google and/or Facebook under Auth Providers.
2. Add each provider's OAuth Client ID and Client Secret from the provider's developer console.
3. Add the deployed domain to Supabase Auth's Site URL and Redirect URLs.
4. Add the Supabase callback URL shown in the provider settings to the provider's allowed redirect/callback URLs.

The app's Google/Facebook buttons cannot complete OAuth until the matching provider credentials and callback URLs are configured. These credentials cannot be inferred from the code repository.

### Payments

Payments are manual, not an automatic online payment gateway. Users transfer the displayed package amount to the published EasyPaisa/JazzCash account, upload a screenshot, and wait for an administrator to verify actual receipt before approval. Do not approve a request based on the screenshot alone if the funds have not arrived.

### Admin account

An existing administrator role is present in the connected database. Keep admin access limited to trusted operators. Never expose database SQL editor or service-role credentials to ordinary users.

## Local development

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

Vercel is connected to the GitHub repository and deploys the `main` branch.

## Safety and launch checklist

- Test Google and Facebook OAuth using real accounts after provider setup.
- Test first listing, second listing inside 10 days, listing after 10 days, Premium approval, Agent approval, and the 40-active-listing cap.
- Test image/video upload, removal, comments, reports, notifications, owner delete, and admin moderation.
- Add and publish a reviewed Privacy Policy and Terms of Use before broad public promotion.
- Users should view the property and verify ownership before paying any advance. RENT MATCH does not hold rental deposits or guarantee landlords, tenants, or property condition.

# The Exquisite Wine Experience: store demo

A Next.js 16 + Supabase demo of the store. It will be ported to Shopify (Dawn) once approved; see `CLAUDE.md` for
the mapping and the design rules.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

It runs straight away on the sample catalogue in `/data`. No database is needed.

To see the age check again after confirming, add `?age=reset` to any URL.

## Connect Supabase

1. Run `supabase/schema.sql` in the project's SQL editor. It is safe to re-run and only touches the store's four
   tables: `products`, `restaurants`, `contact_messages`, `newsletter_signups`.
2. Copy `.env.example` to `.env.local` and fill in the URL, the anon key and the service-role key.
3. `npm run seed` loads `/data` into `products` and `restaurants`.
4. `npm run test:supabase` checks the live database: tables and columns, that visitors can read the catalogue but
   not edit it, that the contact form and newsletter accept entries, and that visitors can't read them back. It
   deletes its own test rows.

If Supabase is unreachable or the tables are missing, pages fall back to `/data`. The contact form and newsletter
then show an error rather than silently dropping what people send.

No sign-in is needed: Shopify takes guest checkout, and the age check is a question, not an account. Visitors can
only read the catalogue and send a message or sign up. Everything else needs the service-role key.

## Test

```bash
npm run lint            # typecheck
npm run build
npm run test:supabase   # live database checks
npm run test:smoke      # every page answers with the right content; unknown URLs 404 (default http://localhost:3000)
BASE_URL=https://your-app.vercel.app npm run test:smoke   # the same against a deployment
```

## Deploy to Vercel

1. Push the repo to GitHub and import it in Vercel. `vercel.json` sets the framework, `npm ci`, the build and
   security headers.
2. In Project → Settings → Environment Variables, add for Production and Preview:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   **Do not add `SUPABASE_SERVICE_ROLE_KEY` to Vercel.** The site never needs it; only the local seed and test scripts
   do.
3. Deploy, then run `BASE_URL=https://<your-deployment> npm run test:smoke`.

Pages are rebuilt at most every 5 minutes, so price and stock edits in Supabase appear without a redeploy.

## Pages

| Page | URL |
| --- | --- |
| Home | `/` |
| Age check pop-up | on first visit to any page |
| Collections | `/collections`, `/collections/all`, `/collections/red`, `/collections/tuscany`, … |
| Product | `/products/titolo-aglianico-del-vulture`, … |
| Contact (with ordering FAQ) | `/contact` |
| Restaurants | `/restaurants`, `/restaurants/7-enoteca`, `/restaurants/centro-on-the-square` |

## Before this goes in front of customers

- The 43 products come from the client's catalogue PDF, but **prices and stock are placeholders**: the PDF has none.
  Alcohol is blank where a sheet doesn't state it. Bottle photos in `public/products/` were cut out of the PDF; 7
  products without a usable photo show a rendered bottle until a photo is added (`image_url`).
- Confirm the values marked `CONFIRM` in `lib/site.ts`: email, phone, hours, delivery terms and the six-bottle wording.
- Add addresses, phone numbers and websites for 7 Enoteca and Centro on the Square in `data/restaurants.json`.
- Photos in `public/images` are temporary Unsplash stock (see `CREDITS.md` there). Swap in the client's own photos with the same file names. Hero slides are edited in `data/slides.json`.
- Club Vitalità prices are indicative (from the strategy report) and need the client's unit-economics sign-off.

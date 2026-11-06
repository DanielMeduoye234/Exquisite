# The Exquisite Wine Experience, by Vitalita

Next.js + Supabase demo of the store for Vitalità Wines and Spirits Inc. (Vaughan, ON). Once approved, it is
**ported to a Shopify Dawn theme**, so every choice here should translate cleanly to Liquid sections, snippets,
metafields and theme settings.

Sources of truth: the *Competitive Analysis & Membership Strategy* report (5 November 2026), the project skills in
`.claude/skills/`, and the brand book for the name, voice and age check.

## Strategy (from the competitive analysis)

- **Catalogue (6 Nov 2026):** the live products are the 43 from the client's catalogue PDF (`VITALITA - FRANCE2.pdf`):
  Bordeaux, Burgundy, Loire, California, Portugal (Dão) wines and Italian grappa/amaro/liqueur. There are no Italian
  wines in it, so site copy says "the private cellar for Ontario", not "the Italian cellar". The report's
  Italian-cellar positioning is on hold until the client confirms (a `VITALITA - ITALY-22.pdf` also exists in
  Downloads). Depth over breadth and family producers still apply.
- Product photos in `public/products/` were cut out of that PDF; 7 sheets had no usable bottle photo and use the
  rendered `BottleShot`. **Prices and stock in `data/products.json` are placeholders** (the PDF has none); `abv` is
  null where a sheet doesn't state it. Taste scales are our reading of each sheet's tasting note.
- Never compete on price or discounts. Under Ontario's agency model the wine price is set upstream, and loyalty points
  cannot buy alcohol. Sell **access, curation, education and service**.
- The store must be able to take an order: real in-stock products, no stale seasonal banners, and a
  six-bottle minimum that is *explained* (see `site.minimumExplainer`), with shipping terms shown in the announcement
  bar, the cart, the product page and the FAQ.
- A **named human voice** beats crowd scores: every product carries a signed sommelier note, a drinking window and a
  pairing.
- Discovery by taste (body, acidity, sweetness) rather than by grape. Borrowed from WineOnline's finder, simplified.
- Membership is **Club Vitalità**, with three tiers: Scoperta (~$99 / 3 bottles), Cantina (~$189 / 6), Collezione
  (~$399+). Prices are indicative and must be labelled as such until the client validates unit economics. Don't build
  recurring billing in this demo.
- Restaurant "table programme": the corkage benefit is paid by Vitalità **to the member**, never framed as an
  inducement to the restaurant (AGCO rules).
- Show adults only. Never link alcohol with driving, risk or excess.

## Visual direction (decided 2026-11-05)

The site follows the `exquisite-design-direction` skill (a printed enoteca wine list), **not** the aubergine/saffron
"Tasting Room" brand book. The brand book still supplies the name, the slogan ("Pour something worth remembering."),
the voice and the age-check rules.

- Palette: paper `#F5F0E6`, paper-deep `#ECE4D4`, ink `#1F1B16`, ink-soft `#5C5348`, rule `#CFC4B0`, and one accent,
  vino `#6E1E2B`, for actions only. No gradients, glass or coloured shadows. Radius 0 to 4px.
- Type: Fraunces (display, italic kickers) and Instrument Sans (UI). Tracked uppercase labels, tabular prices.
- Hairlines and whitespace instead of boxed cards. Wine-list rows with dot leaders for lists of wines.
- No product photos yet: every product uses a rendered bottle packshot (`BottleShot` in `components/Brand.tsx`),
  shaped and coloured by wine type, with the wine's own name on the label. Never use stock photos of real bottles
  for products: they show other wineries' labels. A real `image_url` replaces the packshot.
- Product page with a real photo: `components/PhotoBottle3D.tsx` shapes a 3D bottle from the photo's own silhouette,
  projects the photo onto its front and adds moving shading and glass reflections. It turns ±0.5 rad only (a photo
  has no back). Photos that kept their background (Maillet, Wine Spots) stay flat; square flasks are flattened in
  depth (`FLASKS`).
- Product page without a photo: the bottle is an interactive 3D model (`components/Bottle3D.tsx`, three.js loaded only there). It turns
  around its upright axis by drag or the arrow buttons, never tilts, and never auto-spins. The flat packshot shows
  while it loads and stays if WebGL is unavailable. In Dawn this becomes a custom element, or Shopify's native 3D
  model media once real GLB files exist.
- Header nav: "Shop Wines", "Regions" and "Producers" open dropdown panels (`components/MegaNav.tsx`, data from
  `lib/menus.ts`); on phones the same items are collapsible groups in the menu drawer.
- **Temporary stock photography** (Unsplash, listed in `public/images/CREDITS.md`) is used in the hero slider and the
  editorial sections at the user's request, until the client supplies real photos. Replace them file for file.
- Mobile first: 2-up product grid below 768px, sticky buy bar on the PDP, filters in a bottom sheet.
- Voice: plain, specific, a little dry. Lead with taste. No banned words (see the design-direction skill).
- Age check: the visitor picks a province first, then the gate asks for that province's legal age (18 in AB, MB and
  QC, otherwise 19).

## Motion

- All animation follows the `motion-system` skill (`.claude/skills/motion-system/`), which is adapted from a code-level
  analysis of volvox.dev (`reference/volvox-analysis.md`). Use its tokens, patterns and rejections. Don't invent
  new curves or effects.
- **Partly started (2026-11-05):** the user approved the hero slider (crossfade, slow zoom, progress bars), scroll
  reveals (P1/P2, `components/Reveal.tsx`) and image hover zoom. Everything else in the motion system stays on hold
  until the user says to start it. Parts of that skill still describe the old brand-book visuals.
- Mobile (<768px) gets a lighter choreography: no pin, parallax, blur or cursor effects. Every animation has a
  reduced-motion state and leaves content visible without JS.
- No Framer Motion (it won't port to Dawn). CSS plus one vanilla module, and GSAP only for the single pinned story.

## Code map

| Here | Becomes in Dawn |
| --- | --- |
| `app/globals.css` tokens | `base.css` + theme colour settings |
| `components/Chrome.tsx` | `announcement-bar`, `header`, `footer` sections |
| `components/AgeGate.tsx` | age-verification snippet in `theme.liquid` (same localStorage key, `exq-age`) |
| `components/HeroSlider.tsx` + `data/slides.json` | `sections/slideshow.liquid`, one block per slide |
| `components/ProductCard.tsx` | `snippets/card-product.liquid` |
| `components/WineList.tsx` | `snippets/wine-list-row.liquid` |
| `components/Brand.tsx` | `snippets/wordmark.liquid`, `snippets/bottle-shot.liquid`, taste profile |
| `components/MegaNav.tsx` + `lib/menus.ts` | header mega-menu blocks |
| `components/Categories.tsx` | `sections/collection-cards.liquid` |
| `components/CollectionBrowser.tsx` | `main-collection-product-grid` + storefront filters |
| `app/products/[handle]` | `main-product` section |
| `data/products.json` fields `body`, `acidity`, `sweetness`, `notes`, `pairing`, `drink_window`, `sommelier_note`, `limited` | product metafields `tasting.*`, `custom.*` |
| `data/collections.json` `rule` | automated collection conditions |
| `lib/site.ts` | `settings_schema.json` theme settings |

## Conventions

- Plain CSS with tokens, no Tailwind (it ports to Dawn). Add styles to `globals.css` under the matching section
  comment.
- Server components by default. Client components only for interactivity (cart, gate, filters, form, mobile nav).
- Data goes through `lib/catalog.ts`, which reads Supabase when `NEXT_PUBLIC_SUPABASE_*` is set and falls back to
  `/data/*.json` otherwise. Keep JSON field names identical to `supabase/schema.sql`.
- Next 16: route `params` and `searchParams` are Promises, so always `await` them.
- Values marked `CONFIRM` in `lib/site.ts` and the restaurant addresses are placeholders awaiting the client.
- No authentication: Shopify takes guest checkout. Supabase RLS lets visitors read `products`/`restaurants` and only
  insert into `contact_messages`/`newsletter_signups`. The service-role key is for local scripts only, never Vercel.
- The Supabase project is shared with another app (wallets, listings…). `supabase/schema.sql` must only ever create
  or alter the store's four tables.
- Keep `supabase/schema.sql`, `lib/types.ts` and the `/data` JSON keys in step; `npm run test:supabase` flags drift.
- There is deliberately no root `loading.tsx`: it made unknown URLs return 200 instead of 404.
- Check: `npm run lint`, `npm run build`, `npm run test:smoke`, and `npm run test:supabase` once the schema is applied.
- Deploy: Vercel (`vercel.json`); env vars are the two `NEXT_PUBLIC_SUPABASE_*` values only.

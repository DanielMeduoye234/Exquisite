---
name: wine-product-ui
description: Specs for wine-specific UI in the Exquisite store, covering the product card (in the 2-up mobile grid), the image-less label fallback, the product detail page, the taste profile (body/acidity/sweetness), price/vintage/size formatting, stock states and cart lines. Use when building anything that shows a product.
---

# Wine product UI

Field names refer to `/data/products.json`.

## Formatting helpers (one shared module, e.g. `lib/format.ts`)

- **Price:** `new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(price)`, which gives `$425.00`.
- **Vintage:** a number shows as itself. If null, show `NV` for wine types and nothing for `Spirits`.
- **Size:** show it only when it isn't `750 ml` (for example `500 ml`). On spirits, always show it.
- **Sort title:** `title.replace(/^['‘’]/, '')` so `'Oria'` sorts under O.
- **Search normalise:** `s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()` so "rose" matches "Rosé".

## Product card (2-up on mobile)

The order is fixed. Every card has the same slots so rows line up.

```
┌───────────────┐
│               │  image or label fallback, aspect-ratio 3/4
│   [LIMITED]   │  badge top-left, only if limited (max 1 badge)
│               │
├───────────────┤
│ TUSCANY · 2019│  12px uppercase tracked, --ink-soft (region · vintage)
│ Brunello di   │  15–16px serif, clamp 2 lines, min-height 2 lines
│ Montalcino    │
│ Lambardi      │  13px, --ink-soft, 1 line ellipsis (vendor)
│ $84.95        │  tabular-nums, 15px, margin-top:auto
└───────────────┘
```

- The whole card is a single link to the product. Add to cart isn't on the mobile card: at around 160px it gets mis-tapped, and wine buyers want to read the page first. From 1024px a quiet "Add" button can show up on the card.
- Badges: **Limited**, **4 left** (only when stock ≤ 6), and **Sold out** (also dims the image to 60%). Show only one, in that priority: Sold out, then Limited, then low stock.
- Don't use stars, scores or "Bestseller". The data doesn't have them.

## Label fallback (all products right now)

When `image_url` is null, render a **typographic wine label** instead of a placeholder:

- `--paper-deep` panel with a thin inset border (`outline: 1px solid var(--rule); outline-offset: -8px`), like a label
- The vendor in small caps at the top, the title in serif italic in the centre, and the region and vintage at the bottom
- A 3px bar along the bottom edge in the type colour: Red `#6E1E2B`, White `#C9B46A`, Rosé `#D89A8E`, Sparkling `#BFB9A3`, Dessert `#A8742A`, Spirits `#7A5A3A`
- It's built from text, so it's crisp and weighs nothing. It should look deliberate, not like something's missing.

## Product detail page (mobile order)

1. Breadcrumb: collection link only ("← Red wines"), 44px target
2. Image or label, full width, 3/4 (max 60vh)
3. Kicker: `Region · Grape`
4. Title (serif, 28–32px), then vendor
5. Facts row: `Vintage · Size · ABV%`, as a small-caps label above each value
6. **Sommelier note**, the page's centrepiece. Serif italic, 18px, with a hairline above it. Start it "From the cellar:" or leave it unlabelled.
7. Taste profile (see below)
8. Tasting notes (`notes`), then **Pair it with** (`pairing`), then **Drink** (`drink_window`)
9. "Poured at" — restaurants whose `on_the_list` has this handle (hide the section if there are none)
10. Related wines: same region or type, 2-up grid, 4 items max
11. **Sticky buy bar**: price, quantity stepper (−/+, 44px), Add to cart. Sold out disables it and offers "Email me when it's back" only if that feature actually exists. Otherwise just say "Sold out".

From 1024px: image on the left (sticky), content on the right, and the buy bar goes inline under the facts.

## Taste profile

`body`, `acidity` and `sweetness` are 1–5. Show them as **5 segment bars**, not stars or charts:

```
BODY       ■■■■□    (filled segments --ink, empty --rule)
ACIDITY    ■■■■□
SWEETNESS  ■□□□□
```

- Add end labels in `--ink-soft`: Light–Full, Soft–Crisp, Dry–Sweet
- For screen readers: `aria-label="Body: 4 of 5, fuller"`
- Hide the whole block for Spirits if the values don't apply. Check the data first.

## Stock and quantity

- The stepper's minimum is 1 and its maximum is `stock` (and a per-order limit for `limited`, if the owner sets one). Disable + at the max and explain why ("Only 4 in stock").
- Re-check stock when adding to the cart and at checkout. If it dropped, lower the quantity and tell the customer.

## Cart line

`[label thumb 56px] Title (1 line) / Vendor · Vintage / stepper · price` with a remove button that's a 44px tap target. Put the subtotal and checkout button in a sticky bottom bar on mobile.

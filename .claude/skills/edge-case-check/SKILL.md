---
name: edge-case-check
description: Required first step before implementing any feature, component, page or fix in the Exquisite wine store. Lists the edge cases (data, layout, state, input, business/legal) and how each will be handled, before any code is written. Use whenever you are about to write or change code.
---

# Edge-case check (before implementing)

Project rule: no code is written until this list is in the chat.

## Process

1. **Restate the change** in one sentence.
2. **Read the real data** this change touches (`/data/*.json`, Supabase schema). Don't guess field shapes.
3. **Go through every category below.** Mark each item as relevant or not.
4. **Write the list** in the output format at the bottom.
5. **Flag design-changing cases.** If an edge case changes the UI or the scope (for example, "there are no images, so cards need a designed fallback"), say so before building.
6. **Build.**
7. **Close the loop.** After building, re-list each case as ✅ handled, ⏭ deferred (with reason) or ❌ not handled.

## Known data facts (checked against /data seed)

These are real, not hypothetical. Every product UI has to handle them:

- `image_url` is **null on all 21 products**. Every image slot needs a designed fallback, not a broken image or a grey box.
- `vintage` is **null** on non-vintage wines and spirits. Show "NV" for wine and nothing for spirits, never "null" or "0".
- `title` is 8–34 characters and can start with a quote mark (`'Oria' Fiano…`). Sort and search must ignore the leading `'`.
- `vendor` runs up to 23 characters.
- `price` ranges from **$21.95 to $425.00**, so test with 3-digit prices. Format as CAD with `Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })`. Never hand-concatenate `$`.
- `size` can be `750 ml`, `500 ml` or `700 ml`. Show the size whenever it isn't 750 ml.
- `stock` goes as low as 4. Decide how low stock, sold out (0) and quantity over stock behave.
- `limited: true` on 5 products. Allocation wines may need per-customer limits.
- `type` values: White, Red, Rosé, Sparkling, Dessert, Spirits. The "é" must survive URLs, filters and comparisons.
- Collection rules use `type`, `types[]`, `region` or `limited`, and `all` has an empty rule `{}`.
- Restaurants have `address`, `phone` and `website` all null. Hide empty fields, don't print "null".
- `on_the_list` references product handles. A handle might not exist, so skip it rather than crash.

## Checklist categories

### Data
- Missing, null or empty fields (see facts above)
- Long or short strings, accents (Rosé, d'Attimis), apostrophes and quote marks
- Zero, one or many items. Empty collection, empty search, single result
- Broken references (a handle not found)
- Supabase unavailable or env vars empty, so it falls back to `/data`

### Layout (mobile first)
- 320px width. Nothing overflows and there's no sideways scroll
- 2-column grid on mobile with mismatched title lengths: cards stay equal height
- 3-digit price plus a badge plus the size, all on a 160px-wide card
- Long words like "Montepulciano" or "Friuli Venezia Giulia" breaking the layout
- Landscape phone, 200% browser zoom, large OS font size
- Sticky elements covering content or the iOS home indicator (use `env(safe-area-inset-bottom)`)

### State
- Loading (skeleton matches the final layout so nothing shifts)
- Error (friendly message plus retry)
- Empty (says what to do next, not just "No results")
- Sold out, low stock, limited allocation
- Cart: adding the same item twice, quantity over stock, stock changing after it's in the cart, cart persisted across reloads
- Back button and refresh keep filters, scroll position and cart

### Input
- Quantity: 0, negative, non-numeric, above stock
- Search: empty, whitespace, accents ("rose" should find "Rosé"), no results
- Double-tap or double-submit on buttons
- Keyboard-only and screen-reader use

### Business / legal (Ontario alcohol retail)
- Age confirmation (19+ in Ontario) before browsing or at checkout. Decide which, and confirm with the owner
- Delivery and pickup limits. Don't promise delivery areas or times the business hasn't confirmed
- Prices: show CAD and be clear whether deposit or tax is included
- Don't invent awards, scores, reviews or "bestseller" labels that aren't in the data

### Performance
- Image weight once real photos exist (`next/image`, explicit sizes, no layout shift)
- Fonts: at most 2 families, `font-display: swap`, preloaded
- No client JS where a server component will do

## Output format

```
## Edge cases — <change>

**Design-changing:** <list, or "none">

| # | Case | Handling |
|---|------|----------|
| 1 | Product has no image (all 21 today) | Typographic label fallback (wine-product-ui §Fallback) |
| 2 | Vintage null | "NV" for wine, hidden for Spirits |
| … | … | … |

**Checked, not relevant:** <categories skipped and why>
```

After implementing, repost the table with a status column.

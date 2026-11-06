---
name: mobile-first-layout
description: Mobile-first layout rules for the Exquisite store, covering breakpoints, the mandatory 2-column product grid on mobile, touch targets, sticky add-to-cart, navigation, filters and safe areas. Use when building or changing any page, component or CSS.
---

# Mobile-first layout

## Breakpoints

Base styles are for mobile. Use `min-width` queries only.

```css
/* base: 0–767  phones           */
@media (min-width: 768px)  { /* tablet   */ }
@media (min-width: 1024px) { /* laptop   */ }
@media (min-width: 1200px) { /* desktop  */ }
```

Don't write `max-width` queries except to fix a rare one-off bug, and leave a comment explaining it.

Side gutter: 16px on mobile, 24px from 768px, 40px from 1200px. Max content width is 1280px.

## Product grid: 2 per row on mobile (project rule)

```css
.product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)); /* minmax(0,…) stops long words blowing out the column */
  gap: 24px 12px;            /* row gap larger than column gap: reads as a list */
}
@media (min-width: 768px)  { .product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 32px 20px; } }
@media (min-width: 1200px) { .product-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
```

- At 320px each card is about 138px wide, and it still has to fit the title, vendor, price and button. Design for that width.
- Make cards `display: flex; flex-direction: column;` with the price and button row at `margin-top: auto` so rows line up.
- Never switch to 1 column on small phones. If something doesn't fit at 320px, shrink the content, not the column count.
- Applies to collections, search results, related wines and restaurant "on the list" grids.

## Touch and reach

- Every tappable element is at least **44×44px** (the visual can be smaller, but pad the hit area).
- Leave at least 8px between adjacent targets.
- Primary actions go in the bottom half of the screen. On the product detail page, use a **sticky bottom bar** with the price and Add to cart:

```css
.buy-bar {
  position: sticky; bottom: 0;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  background: var(--paper); border-top: 1px solid var(--rule);
}
@media (min-width: 1024px) { .buy-bar { position: static; border: 0; padding: 0; } }
```

- Add `viewport-fit=cover` to the viewport meta so `env(safe-area-inset-*)` works.
- Hover can't be the only way to reveal anything. There's no hover on phones.

## Navigation

- Mobile header: menu button on the left, wordmark in the centre, cart with its count on the right. It's 56px tall and sticky. It can hide on scroll down and come back on scroll up.
- The menu opens as a full-height drawer, with links at 18px+ in a list separated by hairlines. Show collections grouped as the data groups them (*By colour*, *Regione*, *After dinner*).
- No mega-menus on mobile.

## Filters and sort

- On mobile, use a single "Filter & sort" button that opens a bottom sheet. Show active filters as removable chips above the grid.
- The bottom sheet's "Show 12 wines" button gives the live count. If the count is 0, say so and disable the button.
- From 1024px, filters can become a left sidebar.
- Keep filter state in the URL (`?type=Red&region=Tuscany`) so back, refresh and share all work.

## Text and inputs

- Body is 16px or more. Inputs are 16px or more, which stops iOS from zooming on focus.
- Use `inputmode="numeric"` for quantity and `type="search"` with `enterkeyhint="search"` for search.
- Truncate text with `-webkit-line-clamp`, not JS. Never cut off a price.

## Performance on phones

- Use server components by default and make only interactive islands client components (cart, filters, quantity).
- Give every image explicit dimensions or `aspect-ratio` so there's no layout shift. Product image slots are `aspect-ratio: 3 / 4`.
- `next/image` with `sizes="(min-width:1200px) 25vw, (min-width:768px) 33vw, 50vw"` for grid images.

## Verify before done

Check these at 320, 375, 414, 768, 1024 and 1440px:
- [ ] No horizontal scroll at 320px
- [ ] 2 columns below 768px, and card rows line up
- [ ] Sticky buy bar doesn't cover content or the home indicator
- [ ] All targets are 44px or more, and everything works by keyboard
- [ ] 200% zoom still usable

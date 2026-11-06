---
name: motion-system
description: The motion rules for the Exquisite store, adapted from a code-level analysis of volvox.dev — motion tokens, the reveal/hero/scroll-story/deck/expand/nav patterns with exact values, where each goes on our pages, what is rejected, mobile and reduced-motion behaviour, and how it ports to Shopify Dawn. Use before adding or changing any animation, transition, hover, scroll effect or page motion.
---

# Exquisite motion system

Reference: `reference/volvox-analysis.md` is the full breakdown of every animation on volvox.dev, with exact values.
This file is the **rule**: what we keep, how we change it for our brand, and where it goes.

> **Status: rule only.** Don't implement any of this until the user explicitly says to start the animation work
> (see CLAUDE.md "Motion"). When they do, run `edge-case-check` first, then build in the order in §9.

## 1. Principles

1. **Feels like Volvox: soft, blurred, staggered, choreographed.** Things arrive from slightly below, out of a
   light blur, one after another, on one soft-out curve. Nothing bounces and nothing spins.
2. **Speaks like the brand: a gallery wall.** Square corners, 2px black rules, one bottle per screen. Motion
   follows the layout: rules *draw*, the bottle *rises into its light*, panels *slide on rails*. No floating pills,
   glass or glow.
3. **Mobile gets its own choreography.** It's lighter and different, not the desktop version shrunk. Volvox removes
   the pin, fan, parallax and cursor effects below 768px, and we do the same.
4. **Every animation has a reduced-motion state** that shows the final layout instantly.
5. **Portable to Dawn.** Use CSS and one small vanilla JS module. GSAP only for the single scroll story. **No Framer
   Motion** (React-only, can't be ported).

## 2. Tokens (add to `:root` in `app/globals.css`, "Motion" section)

```css
:root {
  /* curves — from volvox.dev */
  --ease-out:    cubic-bezier(.2, .8, .2, 1);   /* default for everything entering */
  --ease-quart:  cubic-bezier(.25, 1, .5, 1);   /* text reveals, a touch snappier */
  --ease-std:    cubic-bezier(.4, 0, .2, 1);    /* state changes, colour, two-way moves */
  --ease-in:     cubic-bezier(.55, 0, 1, .45);  /* exits only (≈ GSAP power2.in) */
  --ease-spring: cubic-bezier(.2, .9, .25, 1.02);/* ≈ spring 280/30: tiny settle, no visible bounce */

  /* durations */
  --dur-micro:  150ms;  /* tap feedback, focus */
  --dur-fast:   200ms;  /* colour, opacity on hover */
  --dur-base:   320ms;  /* drawers, menu, header, nav indicator */
  --dur-image:  600ms;  /* image/bottle hover zoom */
  --dur-reveal: 700ms;  /* scroll reveals */
  --dur-hero:   800ms;  /* hero load sequence items */
  --dur-draw:   1600ms; /* rule/line drawing */

  /* reveal shape */
  --reveal-y:     32px;
  --reveal-blur:  10px;
  --reveal-scale: .97;

  /* stagger steps */
  --stagger-hero: 150ms;
  --stagger-grid: 80ms;
  --stagger-list: 50ms;
  --stagger-word: 40ms;
}
@media (max-width: 767px) {
  :root { --reveal-y: 16px; --reveal-blur: 0px; --reveal-scale: 1; --dur-reveal: 500ms; }
}
```

The existing `cubic-bezier(0.2, 0.7, 0.2, 1)` in `globals.css` should be replaced by `var(--ease-out)`. Don't
introduce any other curves.

## 3. Patterns (adopted)

### P1. Blur-up reveal (used most)
- From `opacity 0, translateY(var(--reveal-y)), blur(var(--reveal-blur)), scale(var(--reveal-scale))` to the
  rest state, over `var(--dur-reveal) var(--ease-out)`. **Once only.**
- Trigger: IntersectionObserver, `rootMargin: "0px 0px -10% 0px"`, threshold 0.15. Headings use 0.4 (they fire
  later). Small controls use 0.6, following Volvox's per-element thresholds.
- Markup: `data-reveal` on the element. `data-reveal-group` on a parent staggers its children by
  `--stagger-grid`.
- Hidden state only applies under `html.js` so content is visible without JS. Above-the-fold content never waits
  on a reveal.

### P2. Grid stagger (2-up mobile grid rule)
- Delay is based on the **column**, not the item: `delay = (index % columns) × var(--stagger-grid)`. Each row
  arrives as a wave, and a 21-wine collection never takes 1.6s to appear.
- Columns are 2 below 768px, 3 at 768px and up, 4 at 1200px and up (matches the grid rule).

### P3. Hero load sequence (home `.stage`)
- Order: kicker, then H1, then lede, then CTA row, then the bottle. `--stagger-hero` apart, each
  `var(--dur-hero) var(--ease-out)` with the P1 shape (blur 12px on desktop).
- The **E bottle rises into its light**: `translateY(24px) → 0`, opacity in, after the copy. The light cone
  (`.stage-light::before`) fades in 200ms after the bottle, then starts `breathe`. The bottle is never rotated, skewed
  or rescaled beyond 1.03 (brand book).
- **Scroll-out, desktop ≥768 only:** as the hero scrolls away, copy `y 0 → -120px` over the first 800px and
  `opacity 1 → 0` over 0–400px. **No blur on scroll** (too expensive). Use CSS scroll-driven animation
  (`animation-timeline: view()`) where supported, otherwise a passive, rAF-throttled listener. Mobile: none.

### P4. Word-mask headline reveal
- For Bodoni H1/H2 display lines (≥22px, so the brand rule holds): split into words, each in
  `overflow: clip` with an inner span going `translateY(100%) → 0`, `--stagger-word`, `var(--ease-quart)`.
- Use it on **at most one heading per page**. The spec includes `aria-label` on the heading with the full text and
  `aria-hidden` on the split spans.
- The 3D "flip up" variant (`rotationX -60°`, perspective 1000px) is only for the pinned story title (P8).

### P5. Rules that draw (our version of Volvox's footer curves)
- Section rules (`--rule`, 2px black) draw in `scaleX(0 → 1)` from the left, `var(--dur-draw) var(--ease-std)`,
  once, when the section enters. The tier cards' and steps' borders draw the same way, top edge first.
- Footer: the top rule draws once (not on every pass like Volvox).
- This is the brand's signature motion: the gallery wall being hung.

### P6. Hover (fine pointers only: `@media (hover: hover) and (pointer: fine)`)
- Product card: the bottle lifts `translateY(-6px) scale(1.03)` over `var(--dur-image) var(--ease-out)` (already
  in the CSS, keep it). Card border colour or underline changes in `var(--dur-fast)`.
- Link and arrow nudge: the arrow moves `translateX(3px)` in `var(--dur-fast)`. Footer links get the arrow that
  slides in from `-4px` with opacity.
- **Magnetic primary CTA** (saffron buttons in the hero and Club only): follows the cursor at **strength .3**
  (Volvox uses .5, which is too playful for wine), eased back with `var(--ease-spring)` 320ms. Tap gives
  `scale(.97)`. Never on Add to cart.

### P7. Header (`components/Chrome.tsx`)
- At `≥1024px`: hides on scroll down after 120px and returns on scroll up, `translateY(-100%)`,
  `var(--dur-base) var(--ease-std)`.
- **Compact state after 100px:** height `--header-h 76 → 60px`, logo swaps wide to narrow, and the 2px bottom rule
  stays. It's a full-width bar with square corners, **not** Volvox's floating pill.
- **Active nav indicator:** a 2px black underline that *slides* between links (Volvox's `layoutId` pill, done
  as one absolutely-positioned bar with `transform` + `width` transitions, `var(--dur-base) var(--ease-spring)`).
- Mobile: the header never hides (the cart has to stay reachable).
- No cursor spotlight and no glass blur.

### P8. Mobile menu (`components/MobileNav.tsx`)
- Full-screen sheet from the top: `translateY(-100%) → 0`, `var(--dur-base) var(--ease-out)`. It exits the same way
  with `var(--ease-in)`. Body scroll is locked.
- Links: `translateX(-20px) → 0`, opacity, `delay 100ms + index × var(--stagger-list)`. The Club link comes last.

### P9. Pinned scroll story (one per site, desktop only)
- **Where:** home "Six bottles, mixed any way you like" (`.steps`). Volvox's step-card deck is a natural fit
  for explaining the six-bottle minimum step by step. Alternatively, the Club tiers. Pick one and never both.
- GSAP + ScrollTrigger: `pin: true, scrub: 1, start: "top top", end: "+=" + (beats × 600)`. **Cap it at about 3600px
  (6 beats).** Volvox's 9500px is too long.
- Beats: title words flip up (P4 3D) → hold → step deck. The active card is centred with **rotation 0** (square
  gallery). The next card peeks at `scale .4, x 150, y 250`. The outgoing card leaves `y -300, scale .3, opacity 0`
  (no spin). Text comes in `y 40, blur 10 → 0`, 0.25 after the card. Then a hold, then the CTA.
- Every beat has a hold, and each in/out overlaps by 0.2–0.4.
- Below 768px, under reduced motion, or without JS: the plain numbered list that exists today, with P1 reveals.
- If Lenis is used (§6), call `lenis.on("scroll", ScrollTrigger.update)` and drive Lenis from `gsap.ticker`.

### P10. Fanned deck (restaurants "Poured at" / sommelier quotes)
- Cards are absolutely centred. For offset `e` from the active card: `x = (cardW / 1.5) × e`,
  `y = active ? -40 : (odd ? 12 : -12)`, `scale = active ? 1 : .94`, `z = 10 − |e|`. **Rotation is ±1.5° at most**,
  and **0 on any card showing the E bottle**.
- Transition `transform 420ms var(--ease-spring)`, with no animation on first paint.
- Prev/next buttons (48px, brand buttons), swipe on touch, and the arrow keys. No autoplay. If autoplay is ever
  added, it pauses on hover/focus and has a visible pause button (WCAG 2.2.2).

### P11. Shared-element expand
- Bottle zoom on the PDP (`.pdp-shot`), and optionally a product quick view from the card.
- FLIP: measure the source rect, open a fixed copy at that rect, and animate to centred at 85% of the viewport,
  `transform 450ms var(--ease-spring)`. The scrim (aubergine at 55%, no blur) fades in `var(--dur-fast)`. Close with
  Esc, the scrim or the close button, reversing to the source rect. Focus is trapped and then returned.
- Prefer the **View Transitions API** (`document.startViewTransition`) with `view-transition-name`, and fall back
  to a WAAPI FLIP.

### P12. Marquee (regions ribbon, already built)
- Keep `slide 60s linear infinite`. Add 48px edge fades (mask-image) like Volvox. Pause on hover **and on
  focus-within**, and add a pause/play button (it runs longer than 5s, WCAG 2.2.2). Reduced motion: static and
  wrapped (already done).

### P13. Data motion (our addition, in the Volvox spirit)
- **Taste scale** (body/acidity/sweetness): segments fill left to right, `scaleX(0 → 1)` with `--stagger-list`,
  when the scale enters view. The value is readable before and after (aria labels unchanged).
- **Cart count:** the number swaps with `translateY(-100% → 0)` in `var(--dur-micro)`. The cart drawer keeps its
  current 320ms slide.
- Add to cart confirmation: the button label cross-fades "Add to cart" → "Added ✓" in 150ms, held for 1.6s.
  **Never confetti** (the brand must not link alcohol with excess).

## 4. Rejected from Volvox (don't add)

| Volvox effect | Why not |
| --- | --- |
| Aurora gradient text | A gradient on text is an AI-template tell, and saffron can't be text on white |
| Particle field, glowing blobs, noise overlay | Generic "AI startup" look. Our background is the white gallery wall |
| Glass / progressive `backdrop-blur` header | Brand is flat colour blocks with 2px rules |
| Cursor spotlight on nav | Decoration with no function |
| Floating pill nav, rounded morph | Square corners everywhere |
| Confetti | Celebration plus alcohol conflicts with the responsible-messaging rule |
| Interactive physics canvases | Heavy, not portable, and nothing in a wine shop needs them |
| Hero gallery fan intro (2.9s) | One bottle per screen. A product fan breaks the brand |
| Footer lines redrawing every pass | Distracting. We draw once |
| Blur bound to scroll | Too expensive on mobile GPUs |
| Tilted/rotated product imagery | The E bottle can't be tilted. Product photos stay upright |

## 5. Mobile rules (<768px)

- Reveals: opacity + 16px travel, **no blur, no scale** (handled by tokens).
- No pinning, no scroll-linked parallax, no magnetic or cursor effects, no hover-only reveals.
- The 2-up grid reveals row by row (P2). Nothing in the first viewport waits on a reveal.
- Sticky buy bar and header never animate out of view.
- Animate **only `transform` and `opacity`** (plus `filter` on desktop reveals). Never animate width, height, top,
  left, box-shadow or filter on scroll.

## 6. Smooth scroll (Lenis), optional, desktop only

- Volvox config: `duration 1.2`, expo-out easing, `smoothWheel: true`, touch native.
- Only enable it for `(pointer: fine)` and without reduced motion. Add `data-lenis-prevent` to the cart drawer,
  age gate, mobile menu, and any scrollable panel. Sync it with ScrollTrigger (P9).
- If it causes any scroll-lock or anchor bugs with the drawer or age gate, leave it out. Native scroll is fine.

## 7. Reduced motion and accessibility

- `prefers-reduced-motion: reduce`: no reveals (content visible), no pin, no parallax, no marquee, no
  magnetic, no Lenis, no word splitting. Colour and opacity changes of 150ms or less are allowed. The global
  `0.01ms` override in `globals.css` stays as a safety net, but every pattern also opts out explicitly.
- Nothing moving for more than 5s without a pause control.
- Split text keeps an accessible full-text label. Focus is never moved by animation.
- No flashing. Motion never carries meaning by itself (state is also shown in text or colour).

## 8. Dawn port map

| Here | In Dawn |
| --- | --- |
| Tokens (§2) | `base.css` `:root` |
| `data-reveal` module (P1, P2, P5, P13) | `assets/exq-motion.js` (deferred, ~2 KB, IntersectionObserver), plus Dawn's own `animations_reveal_on_scroll` setting turned **off** to avoid double animation (check the Dawn version) |
| Header, menu, deck, expand (P7, P8, P10, P11) | Custom elements in `assets/exq-motion.js` (`<exq-deck>`, `<exq-zoom>`), same as Dawn's pattern |
| Pinned story (P9) | `assets/gsap.min.js` + `ScrollTrigger.min.js`, loaded **only** on the template that has the section |
| Settings | `settings_schema.json`: "Enable motion" toggle (default on), "Enable scroll story" toggle |

## 9. Build order (when implementation is approved)

1. Tokens + replace the existing curve. 2. Reveal module (P1/P2/P5) with reduced motion. 3. Hero sequence (P3/P4).
4. Header + mobile menu (P7/P8). 5. Hover polish + magnetic (P6). 6. Taste scale, cart count, add confirmation
(P13). 7. Marquee pause control (P12). 8. Bottle zoom (P11). 9. Restaurant deck (P10). 10. Pinned story (P9).
Last because it's the riskiest.

After each step: test at 320/375/768/1024/1440px, with reduced motion on, and with JS disabled. Then run
`anti-ai-design-audit`. Check `npm run lint` and `npm run build`.

## 10. Review checklist

- [ ] Uses only §2 tokens, with no new curves or durations
- [ ] Animates only transform/opacity (and blur on desktop reveals)
- [ ] Mobile behaviour per §5. Reduced motion per §7. Content visible without JS
- [ ] Brand: square corners, E bottle never tilted, no saffron text, no rejected effect from §4
- [ ] Nothing loops more than 5s without a pause control
- [ ] Runs once (reveals) and doesn't replay on scroll back
- [ ] Ports to Dawn per §8 (no React-only animation API)

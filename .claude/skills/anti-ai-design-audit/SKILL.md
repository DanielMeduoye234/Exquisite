---
name: anti-ai-design-audit
description: Reviews a built page or component of the Exquisite wine store for the visual and copy tells that make a site look AI-generated or templated, and checks it against the design direction and mobile rules. Use before calling any UI work done, or when asked whether something "looks AI".
---

# Anti-AI design audit

Run this on finished UI. Read the actual component and CSS, and look at it at 375px and 1440px if a browser is available. Report what you found and fix anything marked **Fail**.

## 1. Template tells (any one of these = Fail)

- [ ] Purple, indigo, teal or multi-colour gradients, gradient text, or a glow
- [ ] Black + gold "luxury" palette, or gold foil effects
- [ ] Glassmorphism (`backdrop-filter: blur`) on cards or the header
- [ ] Big radius everywhere (`border-radius` ≥ 12px on cards or buttons) plus soft drop shadows
- [ ] A row of 3 "feature" cards with icons in circles (🍷 Curated / 🚚 Fast delivery / ⭐ Quality)
- [ ] Centred hero with headline, subline and two buttons over a stock vineyard photo
- [ ] Emoji used as icons, or ✨ anywhere
- [ ] Stock or AI-generated photos of wine glasses, vineyards or bottles
- [ ] Plain Inter or the system font as the only typeface
- [ ] Motion outside the `motion-system` skill: particles, aurora/gradient text, glow blobs, hover tilt, confetti, or reveals/parallax that don't follow its tokens
- [ ] Fake social proof: star ratings, "Loved by 10,000+", testimonials not in the data
- [ ] A newsletter pop-up on first visit

## 2. Copy tells

- [ ] Any banned word: *elevate, curated, journey, unlock, indulge, seamless, premium, discover* (in headings), *crafted with passion*
- [ ] Rhetorical-question headings ("Looking for the perfect wine?")
- [ ] Exclamation marks in the UI
- [ ] Generic text where the data already has specific text (use `description`, `sommelier_note`, `pairing`)
- [ ] Lorem ipsum, or made-up facts (awards, scores, years in business)

## 3. Direction check (per `exquisite-design-direction`)

- [ ] Paper and ink palette, and `--vino` used only for actions
- [ ] 2 typefaces at most. Serif display, small-caps labels, tabular prices
- [ ] Hairlines and whitespace separate content, not boxes with shadows
- [ ] Left-aligned, with at least one editorial or asymmetric moment per page
- [ ] Missing images use the typographic label fallback
- [ ] Motion passes the `motion-system` §10 checklist (tokens, mobile, reduced motion, brand, Dawn)

## 4. Mobile and rules check

- [ ] Product grids are 2 per row below 768px, with rows aligned
- [ ] No horizontal scroll at 320px
- [ ] Tap targets are 44px or more, and the PDP buy bar is sticky and clears the safe area
- [ ] The edge-case table from `edge-case-check` exists and every row is resolved

## 5. The squint test

Blur your eyes (or screenshot and shrink to 25%). Could it be any shop selling anything? If yes, it's too generic. Push one of these: a bigger serif title, a stronger wine list pattern, the sommelier note given more room, or real details from the data (region, grape, drink window) brought forward.

## Output

```
## Design audit — <page/component>

**Verdict:** Pass / Needs work

| Area | Result | Notes / fix |
|------|--------|-------------|
| Template tells | Fail | Card shadow + 16px radius → flat --paper-deep, 2px radius |
| Copy | Pass | |
| …    |      | |

**Fixes applied:** …
```

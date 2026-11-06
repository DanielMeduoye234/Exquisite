---
name: exquisite-design-direction
description: Art direction for the Exquisite Italian wine store, covering palette, typography, layout, imagery, motion and copy voice, so the site looks like a real enoteca and not an AI-generated template. Use before making any visual or copy decision on the storefront.
---

# Exquisite design direction

## The idea: a wine list, not a website template

The reference is the printed **wine list of a good Italian enoteca**, along with the shelf talkers and hand-written price cards in the shop. Paper, ink, careful type, hairline rules, dot leaders between a name and its price. Confident and plain, with very little decoration.

The data's voice already works this way. Short, specific, a bit opinionated: *"One small glass is the whole dessert."* The design should sound the same.

Ask this of every decision: **would a real Italian wine shop with taste print this?** If it looks more like a SaaS landing page, change it.

## Palette

Light, warm and papery, with one strong wine colour. It isn't black and gold. That combination is the most common AI "luxury wine" look, so avoid it.

```css
:root {
  --paper:      #F5F0E6;  /* page background, uncoated paper */
  --paper-deep: #ECE4D4;  /* cards, bands, image fallback */
  --ink:        #1F1B16;  /* body text, warm near-black */
  --ink-soft:   #5C5348;  /* secondary text, ≥4.5:1 on --paper */
  --rule:       #CFC4B0;  /* hairlines */
  --vino:       #6E1E2B;  /* the single accent: buttons, links, prices on hover */
  --vino-ink:   #FFFFFF;  /* text on --vino */
  --olive:      #5E6235;  /* rare: "in stock" or region tags only */
}
```

- Use `--vino` for actions and nothing else. If everything is burgundy, nothing stands out.
- No gradients. No glass blur. No coloured shadows.
- Type colours (red, white, rosé) can show as a small dot or bar, never as card backgrounds.
- Dark mode is optional. If it's built, use warm cellar tones (`#1B1714` paper, `#EDE6DA` ink), not pure black.

## Typography

Two families at most.

- **Display: a serif with real character**, for collection titles, product names and the hero. Good choices: *Cormorant Garamond* (sparingly, at large sizes only), *Fraunces* (with restrained optical axes), *Libre Caslon*, *EB Garamond*. Use italic for the "kicker" lines in the data ("Regione", "By colour").
- **UI and body: a quiet sans or text serif.** Good choices: *Instrument Sans*, *Söhne*-like *Inter Tight* (not plain Inter), *Source Serif* for body copy.
- Small caps or letter-spaced uppercase (`letter-spacing: .08em`, 12–13px) for labels like REGION, GRAPE and VINTAGE, the way a printed wine list does it.
- Use tabular figures for prices: `font-variant-numeric: tabular-nums`.
- Mobile sizes: body 16–17px, product name on a card 15–16px, PDP title 28–32px, hero 36–44px. Line length is 60–70 characters max on desktop.

## Layout

- **Left-aligned, editorial.** Avoid a centred hero with centred paragraph and centred button.
- **Hairlines (`1px solid var(--rule)`) instead of cards with shadows.** Separate sections with rules and whitespace. If you need a card, give it a flat `--paper-deep` fill and no shadow.
- **Small corner radius.** Use 0–4px. Big rounded `2xl` pill cards are a template tell.
- **Asymmetry is fine.** A wide sommelier note next to a narrow spec column, or a collection title set big and off to one side.
- **Wine list pattern** for the restaurant pages and "on the list": name, then dot leaders, then price, on one line.
- Structure collection pages like a list: the kicker in italic, then the title, then the one-line description from the data, then the grid.

## Imagery

- Right now **no product has a photo.** Don't use stock photos of a wine glass, a vineyard at sunset, or AI-generated bottles. Use the typographic label fallback in `wine-product-ui`.
- Once photos exist: the same backdrop for every bottle (a warm paper sweep), the same angle, upright, with a soft natural shadow and no reflections. Consistency matters more than being fancy.
- Lifestyle imagery should be real: the actual restaurants on the list, real tables, real hands. If there isn't any, leave it out.
- Illustration, if used at all, should be a single-colour line drawing (a map of the Italian regions, for example). Never 3D blobs.

## Motion

Motion is defined by the `motion-system` skill, which overrides anything here. In short: soft blur-up reveals,
row-wave staggers, rules that draw, the bottle rising into its light, one pinned story on desktop, a lighter set
on mobile, and a full reduced-motion fallback. Never animated gradients, particles, glass or confetti.

## Copy voice

Match `/data`: plain, specific, a little dry, written by someone who has tasted it.

| Write | Don't write |
|---|---|
| Add to cart | Add to your collection ✨ |
| Red wines | Discover our exquisite reds |
| 4 left | Hurry! Almost gone! |
| Open it with the first course. | Elevate your dining experience. |
| Nothing here yet. Try all reds. | Oops! No results found 😢 |

Banned words: elevate, curated, journey, unlock, discover (in headings), indulge, experience (as a verb), seamless, premium, "crafted with passion". No emoji in the UI.

Use Italian lightly and correctly (*Regione*, *enoteca*, *digestivo*), the way the data already does. Don't use it as decoration.

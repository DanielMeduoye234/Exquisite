# volvox.dev — motion analysis

Source: the production JS/CSS bundles of https://www.volvox.dev/ (Next.js + Turbopack), downloaded and de-minified
on 5 November 2026. Every value below is read from the code, not estimated from video.

## Stack

| Library | Used for |
| --- | --- |
| **Framer Motion** (`motion.*`, `whileInView`, `AnimatePresence`, `layoutId`, `useScroll`, `useTransform`, `useSpring`) | ~90% of all motion: reveals, hero, nav, modals, decks |
| **GSAP 3 + ScrollTrigger + `@gsap/react` `useGSAP`** | One pinned, scrubbed scroll story ("How we work") |
| **Lenis** | Smooth wheel scrolling, site-wide |
| **Canvas 2D + `requestAnimationFrame`** | Ambient particle background, three interactive "stack" diagrams |
| **canvas-confetti** | Burst on the "Join" Discord button |
| **CSS keyframes (Tailwind v4)** | Aurora gradient text, marquees, ping/pulse |

## Signature curves and numbers

| Name | Value | Where |
| --- | --- | --- |
| "Soft out" | `cubic-bezier(.2,.8,.2,1)` | hero reveals, image hover zoom, team cards (`ease-[cubic-bezier(0.2,0.8,0.2,1)]`) |
| "Quart out" | `cubic-bezier(.25,1,.5,1)` | reviews section reveals |
| "Standard" | `cubic-bezier(.4,0,.2,1)` | hero gallery fan, Tailwind default transitions |
| Lenis easing | `t => Math.min(1, 1.001 - 2 ** (-10 * t))` (expo out), `duration: 1.2` | smooth scroll |
| GSAP eases | `power3.out` (entrances), `power2.in` (exits), `power2.inOut` (swaps), `back.out(1.1)` (bento cards), `none` (scrubbed image drift) | How we work |
| Springs | nav layout `280/28 mass .8` · active pill `400/30` · shared card `320/34` · deck `280/30` · avatar `400/25` · tooltip `380/28` · lightbox `200/25` · magnetic `150/15 mass .1` · menu `bounce 0, 0.4s` | see sections |
| Reveal blur | `8–12px → 0` | almost every reveal |
| Reveal travel | `y: 16–40px` | almost every reveal |
| Reveal duration | `0.5–0.8s` | almost every reveal |
| Stagger | `0.15` hero · `0.08` grids · `0.1` title words · `0.04` body words · `0.05` menu items · `0.15–0.18` cards/rows | |

## Global

1. **Lenis smooth scroll.** `new Lenis({ duration: 1.2, easing: expoOut, smoothWheel: true, orientation/gestureOrientation: "vertical", prevent: el => el.hasAttribute("data-lenis-prevent") })`, driven by its own rAF loop. **Skipped entirely under `prefers-reduced-motion`.** Touch scrolling is native (`syncTouch` default false). On mount it jumps to top `immediate: true`.
   - Not wired to ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)` is missing), so pinned sections can lag by a frame.
2. **Ambient background canvas** (fixed, behind everything). 150 particles spawn in a 1200×600 band (800×400 on mobile) at the bottom, rise at `0.2–0.5 px/frame` with a sine wobble, and fade in over the first 20% of life, hold, then fade out. Colours come from CSS vars `--particle-color-1/2` and update on theme change via MutationObserver. DPR-aware, debounced resize. Plus an SVG `feTurbulence` noise overlay at 5% (8% dark, `mix-blend-overlay`) and a radial top glow. Off under reduced motion.
3. **Scroll-spy.** A window `scroll` listener checks which section's `offsetTop..offsetTop+offsetHeight` contains `scrollY`, and drives the nav's active state. Not passive and not throttled.
4. **Section navigation.** Nav clicks call `window.scrollTo({ top, behavior: "smooth" })`, with an rAF retry for up to 2s if the target isn't mounted yet. Skip links move focus with `preventScroll` then `scrollIntoView({ behavior: "smooth" })`.
5. **Keyboard shortcuts.** h/p/b/t/a jump to sections and `?` opens a help panel, ignored while typing in inputs (not motion, but part of the feel).

## Header / navigation

1. **Hide on scroll.** The header translates `-100%` with `transition-transform 300ms ease-in-out`, at `lg` and up only. Mobile never hides it.
2. **Morph to floating pill.** After `scrollY > 100`, the full-width bar becomes a centred pill (`95%`, `max-w 900px`, `mt-5`, `rounded-full`) through Framer `layout` with spring `stiffness 280, damping 28, mass .8`. The width, radius and margin all animate as one shape.
3. **Cursor spotlight.** `onMouseMove` writes `--mouse-x/--mouse-y` on the nav, and a `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), primary/15%, transparent 40%)` fades in (`opacity 300ms`) on hover. Desktop only.
4. **Active pill.** The current section's link has a `motion.div layoutId="activeNavPill"` behind it, so the pill *slides* between links (spring `400/30`). Inactive links are at `opacity .6`, going to 1 on hover in `200ms`.
5. **Mobile glass.** On mobile the bar has three stacked `backdrop-blur` layers (18/24/30px) with descending gradient masks, plus a background fade, which gives a progressive blur that dissolves downward.
6. **Mobile menu.** `AnimatePresence`: a full-screen sheet from `y: -100%, opacity 0` to `0, 1`, exiting the same way, with spring `bounce 0, duration .4`. Body scroll is locked. Links enter with `x: -20 → 0, opacity 0 → 1`, `delay .1 + .05 × index`. The community link comes last at `delay .4`.
7. **Confetti CTA.** "Join" fires `confetti({ particleCount: 100, spread: 70, origin: cursor })` and then opens Discord.

## Hero

1. **Load sequence.** The container uses `staggerChildren: .15`. Each child (badge, H1, sub, CTA row, then gallery and reviews) goes from `{ opacity 0, y 30, blur 12px, scale .95 }` to `{ 1, 0, 0, 1 }`, `0.8s`, `[.2,.8,.2,1]`.
2. **Gradient headline word.** "Empowering builders." uses `.text-aurora`: `linear-gradient(110deg, primary 30%, secondary 50%, primary 70%)`, `background-size 200%`, clipped to text, `auroraFlow 4s linear infinite` (background-position to 200%).
3. **Scroll-out.** The whole hero section is bound to `scrollY`. From 768px up: `y 0 → -150px` over 0–800px of scroll, `opacity 1 → 0` and `blur 0 → 12px` over 0–400px. Below 768 these are zeroed (no hero parallax on mobile).
4. **Fanned gallery (desktop).** Five 440×248 screenshots, 18px radius, shadow `0 16px 50px rgb(0 0 0/.18)`. Final fan positions are `x: -600/-300/0/300/600`, `y: 120/42/0/42/120`, `rotate: -13/-6/0/6/13`, `scale: .88/.94/1/.94/.88`, `z: 4/7/10/7/4`. The intro uses keyframes over `2.92s` (`.72 + .6 + 1.6`) after a `.8s` delay with `[.4,0,.2,1]`. The first card rises from `y 160, scale .3`, travels to the far-right slot, then flies to the far-left slot. The other cards "appear" (opacity `.15s`) in sequence as it passes, timed by their x position. Hovered card gets `z-index 30`. Reduced motion: the fan is static.
5. **Mobile gallery → marquee.** Below 768px the fan is replaced by a duplicated row of 380×214 cards, `x: 0% → -50%`, `25s linear infinite`, with 48px gradient edge fades. Reduced motion: static, not duplicated.
6. **Lightbox (FLIP zoom).** Clicking a screenshot captures its `getBoundingClientRect()`. A fixed copy starts at that exact rect and springs (`200/25`) to the viewport centre at `scale = max(.85·vw/w, .85·vh/h)`, radius `18 → 12`. The backdrop is `black/60 + backdrop-blur-sm`, fading in `.2s`. Close by Esc or click, which reverses to the original rect. Focus moves into the dialog.
7. **Reviews widget.** A row of overlapping avatars. Autoplay advances every **5s**, **paused on hover**. The active avatar goes to `y -8, scale 1.1` (spring `400/25`). The tooltip bubble uses `layoutId="hero-review-tooltip"` so it glides between avatars (spring `380/28`). Its content cross-fades with `mode="wait"`, `y ±4, blur 2px`, `.15s easeOut`. Tap: `active:scale-[.9]`. Broken avatar images fall back to initials.
8. **Magnetic buttons.** The CTA follows the cursor by `(cursor − centre) × strength` (default `.5`) through `useSpring(150, 15, mass .1)`, returns to 0 on leave, and taps at `scale .95`. Off under reduced motion.

## "How we work": pinned GSAP story (desktop only)

Runs only when **not** `(max-width: 767px)` and **not** reduced motion. Otherwise it renders a plain vertical timeline (numbered circles, a 1px rail, cards stacked) with no scroll pinning. SVG SMIL animations inside are paused under reduced motion (`svg.pauseAnimations()`).

`ScrollTrigger: { trigger: section, start: "top top", end: "+=9500", scrub: 1, pin: true }`, one timeline, eight scenes:

1. **Title words.** Each word goes from `{ y 120, opacity 0, rotationX -60, transformOrigin "50% 50% -50px" }` to its rest state, `power3.out`, `stagger .1`, inside a `perspective: 1000px` container, so words flip up out of the floor. Hold `.4`. Exit: `scale .8, y -30, autoAlpha 0`, `power2.in`.
2. **Headline.** In: `autoAlpha 0, y 50, scale .95` → rest, `power2.out`, overlapping the previous exit by `-0.4`. Hold `.6`. Out: `y -50, scale 1.05`, `power2.in` (zooms *past* the viewer).
3. **Word-mask paragraph.** Every word sits in `overflow:hidden` with an inner span going `y 100% → 0`, opacity `0 → 1`, `stagger .04`, `power2.out`. Hold `.8`. Out `y -40`.
4. **Step card deck (5 steps).** All cards start at `scale .3, x 200, y 200, rotation 10`. The active card goes to `scale 1, x 0, y 0, rotation ±2` (alternating), `z 10`. The **next card peeks** at `scale .4, x 150, y 250, rotation ±8`, `z 5`. Each step: the active image drifts `scale 1.08` (`ease none`, scrubbed). The outgoing card flies off to `x -300, y -300, scale .3, rotation -12`, `power2.inOut`. The incoming card moves to centre at the same label. Its text comes in `+0.25` later with `y 40, blur 10px → 0`. The card after that moves into the peek slot `+0.2` later. Step text exits `y -40, blur 10px`, `power2.in`.
5. **Bento info cards.** `autoAlpha 0, y 80, scale .95, rotationX -10` → rest, `stagger .15`, `1.2`, `back.out(1.1)` (a tiny overshoot). Hold `1.5`. Out: `scale 1.05, y -30`.
6. **Values list.** Rows `y 30 → 0`, `stagger .18`, `power2.out`. Hold `1.4`. Out `scale .95, y -30`.
7. **CTA.** `y 50, scale .95` → rest, `1.2`, `power2.out`. Hold `1.5`.
8. Background: two huge blurred colour blobs (`blur 120–150px`, `opacity .3`) behind the pin, desktop only.

Pattern: **every scene enters from below and exits upward, with in and out overlapping by 0.2–0.4, and with explicit "hold" tweens (`e.to({}, {duration})`) so each scene stays readable while scrolling.**

## Stack diagrams (interactive canvases inside the bento)

All are DPR-capped at 2, use ResizeObserver, update on theme change, and stop their rAF under reduced motion.

1. **Wave lines + tech pills.** Four sine waves (`sin(x·f + t + φ)·amp + .35·amp·cos(1.8x·f − .7t)`), drawn with a transparent→colour→transparent stroke gradient and a soft fill. Pills ride on the waves with damped springs (`v = (v + Δ·.08)·.82`). **Cursor bends the waves** within 120px (cosine falloff) and **pushes pills away** within 90px. Dotted leader lines. `cursor: crosshair`.
2. **Team bubbles.** Role pills float with `sin/cos` drift and spring to targets (`·.78` damping), with connector lines whose opacity and width scale with proximity (<85px). **The layout rearranges every 260 frames** (cycles 3 configurations), and the pill size eases `·.1` to its new target.
3. **Channel bars.** Stacked rounded bars with gradient fills, a pulsing status dot (`r 5 + .5·sin`), and mouse parallax (`lerp .08`). A highlight band sweeps across.

## Products section

- Two background blobs drift `x/y` through keyframes (`0 → 30% → 0`, `30s`, and `0 → -20/-30% → 0`, `40s`, `easeInOut`, infinite) once in view. A 3% noise texture.
- **Card reveal:** `y 40, opacity 0, blur 8px` → rest, `.7s easeOut`, `once`. Image `whileHover scale 1.05`, `.6s`, `[.2,.8,.2,1]`. Title colour shifts to primary on group hover. The arrow icon fades in and nudges `+0.5, -0.5` (to the top-right).
- Empty search state: `AnimatePresence`, opacity cross-fade.

## Reviews section

- Heading: `y 24, blur 12px` → rest, `.6s`, `[.25,1,.5,1]`, `amount .4`. Body: `y 36, blur 10px`, `.7s`, `delay .06`, `amount .15`. Controls: `y 16`, `.5s`, `delay .12`, `amount .6`. **Each reveal has its own threshold**, so the heading triggers late, the body early and the controls last.
- **Fanned card deck.** Cards are absolutely centred. Offset index `e` from the active card gives `x = (width / 1.5)·e`, `y = active ? -56 : (odd ? 14 : -14)`, `rotate = active ? 0 : (odd ? 2.5 : -2.5)`, `scale = active ? 1 : .94`, `z = active ? 10 : 5 − |e|`. Spring `280/30`, and `initial: false` so there's no animation on first paint. Prev/next buttons. Clicking any card makes it active.

## Blog section

- Parallax decor: section `scrollYProgress` (`offset ["start end", "end start"]`) maps to two layers at `y 0 → 20%` and `0 → -20%` (opposite directions). Their opacity goes `.3 → 1 → 1 → .3` across `[0, .2, .8, 1]`.
- Heading `x -10 → 0` `.5s`. "View all" button `scale .95 → 1` in view. Filters panel `height 0 → auto` with opacity. Cards are the same as products.

## Team / mentorship section

- Grid container `staggerChildren .08`. Items `y 30, blur 10px` → rest, `.8s easeOut`, `once, margin -50px` (fires 50px *after* entering).
- **Shared-element expand.** Each member is a `motion.button layoutId="card-{id}"` containing `motion.span layoutId="img-{id}"`. On click, a detail card with the same layoutIds opens over a fading scrim, so the small card *grows into* the big one and the photo flies to its new spot (spring `320/34`). Closing reverses it. Photo hover `scale 1.05`, `500ms [.2,.8,.2,1]`. Label colour `300ms`.

## About section

- Bento grid `staggerChildren .08`. Items `y 40, blur 8px, scale .97` → rest, `.6s easeOut`. Plain blocks `y 30, blur 8px`, `.6s`. Arrow nudge on hover.

## Footer

- Four decorative SVG curves **draw themselves** (`pathLength 0 → 1`, opacity to `.4–.8`), `2 / 2.2 / 2.4 / 2.1s`, `easeInOut`, delays `0 / .1 / .05 / .15`, `viewport { once: false, amount .1 }`, so they **redraw every time** the footer enters.
- Columns `y 20 → 0`, `.5s`, staggered delays. Bottom bar opacity in, `delay .4`. A 1px gradient hairline on top. Links: colour `200ms`, plus an arrow that slides in from `-translate-x-1`, `opacity 0 → 1`.

## Micro-interactions (site-wide)

- Arrow nudge `translate-x 0.5` (2px) on group hover. Social icons `bg/border` change `300ms`.
- Default Tailwind transition `150ms cubic-bezier(.4,0,.2,1)`.
- Focus ring transitions are removed under reduced motion.

## What they did well

- **Mobile gets a different, lighter choreography**, not a shrunken desktop one: no pin, no fan, no hero parallax, no cursor effects. A marquee replaces the fan.
- **Reduced motion is handled at every layer**: Lenis off, canvases stop, pin off, SMIL paused, marquee static, magnetic off.
- Consistent vocabulary: blur-up reveal, soft-out curve, small travel, stagger.
- Scroll story has **hold beats** so content is readable mid-scroll.

## What to avoid copying

- `end: "+=9500"` is about 10 screens of pinned scrolling. It's long, and users can't skim past it.
- Scroll listeners aren't passive or throttled, and Lenis isn't synced with ScrollTrigger.
- Animated `filter: blur()` on the whole hero section while scrolling is expensive on low-end GPUs.
- The autoplaying review carousel and the 25s marquee have no visible pause control (WCAG 2.2.2).
- Footer lines replay on every pass (`once: false`), which gets distracting.
- Confetti, aurora gradient text, particle fields, glass blur and glowing blobs are part of the generic "AI startup" look.
- Framer Motion is React-only and won't exist in a Shopify Dawn theme.

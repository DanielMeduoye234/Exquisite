"use client";

import { useEffect } from "react";

const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)"; // --ease-out
const STAGGER = 80; // --stagger-grid

// Scroll reveals (motion-system P1/P2). CSS hides [data-reveal] elements and the children of
// [data-reveal-group] under html.js; this module plays each one in once with the Web Animations API.
// It never changes classes, styles or attributes, because the page hydrates after the layout and React
// reports any attribute it didn't render as a hydration mismatch.
export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const done = new WeakSet<Element>();
    const delays = new WeakMap<Element, number>();

    const show = (el: Element, animate: boolean) => {
      if (done.has(el)) return;
      done.add(el);
      el.animate(
        [
          { opacity: 0, transform: `translateY(${mobile ? 16 : 24}px)` },
          { opacity: 1, transform: "none" },
        ],
        { duration: animate ? (mobile ? 500 : 700) : 0, delay: animate ? (delays.get(el) ?? 0) : 0, easing: EASE, fill: "forwards" },
      );
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          show(e.target, true);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 },
    );

    const scan = () => {
      const targets: Element[] = [...document.querySelectorAll("[data-reveal]")];
      document.querySelectorAll("[data-reveal-group]").forEach((group) => {
        const cols = getComputedStyle(group).gridTemplateColumns.split(" ").filter(Boolean).length || 1;
        Array.from(group.children).forEach((child, i) => {
          if (!done.has(child)) delays.set(child, (i % cols) * STAGGER);
          targets.push(child);
        });
      });
      for (const el of targets) {
        if (done.has(el)) continue;
        // Anything already on screen shows at once; only content below the fold waits.
        if (el.getBoundingClientRect().top < window.innerHeight * 0.9) show(el, false);
        else io.observe(el);
      }
    };

    scan();
    // New content (another page, or a re-filtered grid) gets picked up as it arrives.
    let queued = 0;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(queued);
    };
  }, []);

  return null;
}

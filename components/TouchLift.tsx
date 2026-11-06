"use client";

import { useEffect } from "react";

// Touch screens have no hover, so a press on any [data-lift] element plays the same bottle lift
// (motion-system P6 values) as tap feedback. Mouse users get the CSS :hover version instead.
export function TouchLift() {
  useEffect(() => {
    let lifted: Element | null = null;
    let timer = 0;
    const drop = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        lifted?.classList.remove("is-lifted");
        lifted = null;
      }, 260);
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const el = (e.target as Element).closest("[data-lift]");
      if (!el) return;
      window.clearTimeout(timer);
      lifted?.classList.remove("is-lifted");
      lifted = el;
      el.classList.add("is-lifted");
    };
    document.addEventListener("pointerdown", down, { passive: true });
    document.addEventListener("pointerup", drop, { passive: true });
    document.addEventListener("pointercancel", drop, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", down);
      document.removeEventListener("pointerup", drop);
      document.removeEventListener("pointercancel", drop);
      window.clearTimeout(timer);
    };
  }, []);
  return null;
}

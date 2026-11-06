"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

export type Slide = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
  secondary?: { label: string; href: string };
  image: string;
  alt: string;
  focus: string;
};

const DURATION = 7000;

// Dawn: sections/slideshow.liquid (one block per slide). Autoplay pauses on hover, focus and hidden tab,
// and has a visible pause button (WCAG 2.2.2). Reduced motion: no autoplay, no slow zoom.
export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false); // user pressed pause
  const [held, setHeld] = useState(false); // hover or focus inside
  const [reduced, setReduced] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  useEffect(() => {
    const onVis = () => setHeld(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  const running = !paused && !held && !reduced && count > 1;

  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => go(index + 1), DURATION);
    return () => window.clearTimeout(t);
  }, [running, index, go]);

  return (
    <section
      className={`hero ${running ? "is-running" : ""}`}
      aria-roledescription="carousel"
      aria-label="Featured"
      onMouseEnter={() => setHeld(true)}
      onMouseLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setHeld(false)}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className="hero-slides" aria-live={running ? "off" : "polite"}>
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <div
              key={s.id}
              className={`hero-slide ${active ? "is-active" : ""}`}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}: ${s.kicker}`}
              aria-hidden={!active}
              inert={!active}
            >
              <div className="hero-media">
                <Image
                  src={s.image}
                  alt={s.alt}
                  fill
                  priority={i === 0}
                  sizes="100vw"
                  quality={72}
                  style={{ objectPosition: s.focus }}
                />
              </div>
              <div className="hero-copy wrap">
                <p className="hero-kicker">{s.kicker}</p>
                {i === 0 ? <h1 className="hero-title">{s.title}</h1> : <h2 className="hero-title">{s.title}</h2>}
                <p className="hero-body">{s.body}</p>
                <div className="hero-actions">
                  <Link className="btn" href={s.cta.href}>
                    {s.cta.label}
                  </Link>
                  {s.secondary && (
                    <Link className="btn btn-light" href={s.secondary.href}>
                      {s.secondary.label}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <div className="hero-controls wrap">
          <ol className="hero-tabs">
            {slides.map((s, i) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={i === index ? "is-active" : undefined}
                  aria-current={i === index ? "true" : undefined}
                  aria-label={`Show slide ${i + 1}: ${s.kicker}`}
                  onClick={() => go(i)}
                >
                  <span className="hero-tab-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="hero-tab-name">{s.kicker}</span>
                  <span className="hero-tab-bar">
                    <i key={i === index ? `${index}-${running}` : undefined} />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="hero-nav">
            <button type="button" className="hero-btn" onClick={() => go(index - 1)} aria-label="Previous slide">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button
              type="button"
              className="hero-btn"
              onClick={() => setPaused((p) => !p)}
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              aria-pressed={paused}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {paused || reduced ? <path d="M8 5l11 7-11 7z" className="fill" /> : <path d="M9 5v14M15 5v14" />}
              </svg>
            </button>
            <button type="button" className="hero-btn" onClick={() => go(index + 1)} aria-label="Next slide">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

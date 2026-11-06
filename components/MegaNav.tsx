"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Menu, MenuColumn, NavItem } from "@/lib/menus";

export function MenuIcon({ name }: { name: MenuColumn["icon"] }) {
  const d = {
    glass: "M8 3h8l-.5 6a3.5 3.5 0 0 1-7 0zM12 12.5V20M8.5 20h7",
    tag: "M3 12V4h8l9 9-8 8zM7.5 7.5h.01",
    taste: "M4 18V14M9 18V10M14 18V7M19 18V4",
    pin: "M12 21s-6-6.2-6-11a6 6 0 0 1 12 0c0 4.8-6 11-6 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    estate: "M3 20h18M5 20V10l7-5 7 5v10M10 20v-5h4v5",
  }[name];
  return (
    <svg className="menu-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function Chevron() {
  return (
    <svg className="chev" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// Desktop header nav with Vivino-style dropdown panels. The chevron button toggles a panel;
// on a mouse, hovering opens it after a short delay. Esc, an outside click or navigating closes it.
export function MegaNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const timer = useRef(0);
  const nav = useRef<HTMLElement>(null);
  const path = usePathname();

  useEffect(() => setOpen(null), [path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      document.getElementById(`menu-btn-${open}`)?.focus();
      setOpen(null);
    };
    const onDown = (e: MouseEvent) => !nav.current?.contains(e.target as Node) && setOpen(null);
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [open]);

  const fine = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const later = (fn: () => void, ms: number) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(fn, ms);
  };

  return (
    <nav className="header-nav" aria-label="Main" ref={nav}>
      <ul>
        {items.map((item) =>
          "columns" in item ? (
            <li
              key={item.id}
              className={open === item.id ? "is-open" : undefined}
              onMouseEnter={() => fine() && later(() => setOpen(item.id), 90)}
              onMouseLeave={() => fine() && later(() => setOpen(null), 180)}
            >
              <span className="nav-item">
                <Link href={item.href}>{item.label}</Link>
                <button
                  id={`menu-btn-${item.id}`}
                  type="button"
                  className="nav-chev"
                  aria-expanded={open === item.id}
                  aria-controls={`menu-${item.id}`}
                  aria-label={`${item.label} menu`}
                  onClick={() => setOpen((o) => (o === item.id ? null : item.id))}
                >
                  <Chevron />
                </button>
              </span>
              <Panel menu={item} open={open === item.id} onPick={() => setOpen(null)} />
            </li>
          ) : (
            <li key={item.href}>
              <span className="nav-item">
                <Link href={item.href}>{item.label}</Link>
              </span>
            </li>
          ),
        )}
      </ul>
    </nav>
  );
}

function Panel({ menu, open, onPick }: { menu: Menu; open: boolean; onPick: () => void }) {
  const wide = menu.columns.length === 1 && menu.columns[0].links.length > 8;
  return (
    <div id={`menu-${menu.id}`} className={`mega ${open ? "is-open" : ""}`}
      hidden={!open}
      onClick={(e) => (e.target as Element).closest("a") && onPick()}
    >
      <div className={`mega-cols ${wide ? "mega-wide" : ""}`}>
        {menu.columns.map((col) => (
          <div key={col.title} className="mega-col">
            <h2>
              <MenuIcon name={col.icon} />
              {col.title}
            </h2>
            <ul>
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href}>
                    {l.dot && <i className="dot" style={{ background: l.dot }} />}
                    <span>{l.label}</span>
                    {l.count !== undefined && <span className="mega-count">{l.count}</span>}
                  </Link>
                </li>
              ))}
            </ul>
            {col.more && (
              <Link className="mega-more" href={col.more.href}>
                {col.more.label}
              </Link>
            )}
          </div>
        ))}
        {menu.features && menu.features.length > 0 && (
          <div className="mega-features">
            {menu.features.map((f) => (
              <Link key={f.href} href={f.href} className="mega-feature">
                <span className="mega-thumb">
                  <Image src={f.image} alt="" fill sizes="96px" />
                </span>
                <span>
                  <b>{f.title}</b>
                  <span>{f.note}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

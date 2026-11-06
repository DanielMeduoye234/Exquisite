"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { Chevron, MenuIcon } from "./MegaNav";
import type { NavItem } from "@/lib/menus";

// Phone menu: the same items as the desktop dropdowns, as collapsible groups.
export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [group, setGroup] = useState<string | null>(null);
  const [top, setTop] = useState(0);
  const path = usePathname();

  useEffect(() => setOpen(false), [path]);

  useEffect(() => {
    document.documentElement.classList.toggle("lock", open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="mnav">
      <button
        className="icon-btn"
        type="button"
        aria-expanded={open}
        aria-controls="mnav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => {
          // Open the panel flush under the header, wherever the page is scrolled to.
          setTop(document.querySelector("[data-header]")?.getBoundingClientRect().bottom ?? 0);
          setOpen((o) => !o);
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 8h16M4 16h16" />}
        </svg>
      </button>
      <div
        id="mnav-panel"
        className={`mnav-panel ${open ? "is-open" : ""}`}
        hidden={!open}
        style={{ "--mnav-top": `${top}px` } as CSSProperties}
        onClick={(e) => (e.target as Element).closest("a") && setOpen(false)}
      >
        <nav aria-label="Mobile">
          <ul className="mnav-main">
            {items.map((item) =>
              "columns" in item ? (
                <li key={item.id}>
                  <button
                    type="button"
                    className="mnav-toggle"
                    aria-expanded={group === item.id}
                    aria-controls={`mnav-${item.id}`}
                    onClick={() => setGroup((g) => (g === item.id ? null : item.id))}
                  >
                    {item.label}
                    <Chevron />
                  </button>
                  <div id={`mnav-${item.id}`} className="mnav-sub" hidden={group !== item.id}>
                    {item.columns.map((col) => (
                      <div key={col.title} className="mnav-group">
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
                          {col.more && (
                            <li>
                              <Link href={col.more.href} className="mega-more">
                                {col.more.label}
                              </Link>
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ),
            )}
          </ul>
        </nav>
      </div>
    </div>
  );
}

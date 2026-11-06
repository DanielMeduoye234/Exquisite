"use client";

import Image from "next/image";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { BottleShot } from "./Brand";
import { bottles, money, vintageLabel } from "@/lib/format";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";

type Line = { product: Product; qty: number };

type CartState = {
  lines: Line[];
  count: number;
  subtotal: number;
  open: boolean;
  notice: string;
  setOpen: (v: boolean) => void;
  add: (p: Product, qty?: number) => boolean;
  setQty: (handle: string, qty: number) => void;
};

const CartContext = createContext<CartState | null>(null);
const KEY = "exq-cart-v3"; // bumped when the catalogue changed (Nov 2026)

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]") as Line[];
      if (Array.isArray(saved)) setLines(saved.filter((l) => l?.product?.handle && l.qty > 0));
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {}
  }, [lines]);

  // Quantities never exceed stock; returns false when nothing could be added.
  const add = useCallback(
    (p: Product, qty = 1) => {
      const have = lines.find((l) => l.product.handle === p.handle)?.qty ?? 0;
      const room = Math.max(0, p.stock - have);
      const take = Math.min(qty, room);
      setNotice(
        take === 0
          ? `All ${p.stock} bottles of ${p.title} are already in your cart.`
          : take < qty
            ? `Only ${p.stock} in stock, so we added ${take}.`
            : "",
      );
      if (take > 0) {
        setLines((ls) =>
          ls.some((l) => l.product.handle === p.handle)
            ? ls.map((l) => (l.product.handle === p.handle ? { ...l, product: p, qty: l.qty + take } : l))
            : [...ls, { product: p, qty: take }],
        );
      }
      setOpen(true);
      return take > 0;
    },
    [lines],
  );

  const setQty = useCallback((handle: string, qty: number) => {
    setNotice("");
    setLines((ls) =>
      qty <= 0
        ? ls.filter((l) => l.product.handle !== handle)
        : ls.map((l) => (l.product.handle === handle ? { ...l, qty: Math.min(qty, l.product.stock) } : l)),
    );
  }, []);

  const value = useMemo(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0);
    const subtotal = lines.reduce((n, l) => n + l.qty * l.product.price, 0);
    return { lines, count, subtotal, open, notice, setOpen, add, setQty };
  }, [lines, open, notice, add, setQty]);

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer />
    </CartContext.Provider>
  );
}

export function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button className="icon-btn cart-btn" type="button" onClick={() => setOpen(true)} aria-label={`Cart, ${bottles(count)}`}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 8h14l-1.2 12H6.2z M9 8V6a3 3 0 0 1 6 0v2" />
      </svg>
      {count > 0 && (
        <span className="cart-count" key={count}>
          {count}
        </span>
      )}
    </button>
  );
}

function Stepper({ value, max, onChange, label }: { value: number; max: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="stepper" role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="One fewer">
        &minus;
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="One more">
        +
      </button>
    </div>
  );
}

function CartDrawer() {
  const { lines, count, subtotal, open, notice, setOpen, setQty } = useCart();
  const [note, setNote] = useState("");
  const panel = useRef<HTMLDivElement>(null);
  const short = Math.max(0, site.minimumBottles - count);
  const toFree = Math.max(0, site.freeDeliveryBottles - count);

  useEffect(() => {
    if (!open) return;
    setNote("");
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.documentElement.classList.add("lock");
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("lock");
      prev?.focus();
    };
  }, [open, setOpen]);

  return (
    <div className={`drawer ${open ? "is-open" : ""}`} aria-hidden={!open} inert={!open}>
      <div className="drawer-scrim" onClick={() => setOpen(false)} />
      <div className="drawer-panel" role="dialog" aria-modal="true" aria-labelledby="cart-title" tabIndex={-1} ref={panel}>
        <div className="drawer-head">
          <h2 id="cart-title">Your cart</h2>
          <button className="icon-btn" type="button" onClick={() => setOpen(false)} aria-label="Close cart">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {notice && (
          <p className="drawer-notice" role="status">
            {notice}
          </p>
        )}

        {lines.length === 0 ? (
          <div className="drawer-empty">
            <p className="h3">Your cart is empty.</p>
            <p className="soft">Every order starts at six bottles, mixed any way you like.</p>
            <Link className="btn" href="/collections/all" onClick={() => setOpen(false)}>
              Shop the cellar
            </Link>
          </div>
        ) : (
          <>
            <div className="minimum" aria-live="polite">
              <div className="minimum-bar" aria-hidden="true">
                {Array.from({ length: site.minimumBottles }, (_, i) => (
                  <i key={i} className={i < count ? "on" : undefined} />
                ))}
              </div>
              <p>
                {short > 0
                  ? `Add ${bottles(short)} to reach the six-bottle minimum.`
                  : toFree > 0
                    ? `Minimum reached. Add ${bottles(toFree)} for free delivery.`
                    : "Free delivery across Ontario is included."}
              </p>
            </div>

            <ul className="lines">
              {lines.map(({ product: p, qty }) => (
                <li key={p.handle}>
                  <div className="line-thumb">
                    {p.image_url ? (
                      <Image src={p.image_url} alt="" fill sizes="56px" style={{ objectFit: "contain" }} />
                    ) : (
                      <BottleShot product={p} />
                    )}
                  </div>
                  <div className="line-body">
                    <Link href={`/products/${p.handle}`} onClick={() => setOpen(false)} className="line-title">
                      {p.title}
                    </Link>
                    <span className="soft small">{[p.vendor, vintageLabel(p)].filter(Boolean).join(" · ")}</span>
                    <div className="line-row">
                      <Stepper value={qty} max={p.stock} onChange={(n) => setQty(p.handle, n)} label={`Quantity of ${p.title}`} />
                      <span className="num">{money(p.price * qty)}</span>
                    </div>
                    {qty >= p.stock && <span className="soft small">Only {p.stock} in stock.</span>}
                  </div>
                  <button type="button" className="icon-btn line-remove" onClick={() => setQty(p.handle, 0)} aria-label={`Remove ${p.title}`}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M7 7l10 10M17 7L7 17" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>

            <div className="drawer-foot">
              <div className="total">
                <span>Subtotal, {bottles(count)}</span>
                <b className="num">{money(subtotal)}</b>
              </div>
              <p className="soft small">{site.deliveryNote} Taxes calculated at checkout.</p>
              <button
                className="btn btn-block"
                type="button"
                disabled={short > 0}
                onClick={() => setNote("Demo store: in the live site this opens Shopify Checkout.")}
              >
                {short > 0 ? `Add ${bottles(short)} to check out` : "Check out"}
              </button>
              <p className="small" role="status">
                {note}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Desktop-only quiet button on product cards.
export function QuickAdd({ product }: { product: Product }) {
  const { add } = useCart();
  if (product.stock <= 0) return null;
  return (
    <button className="quick-add" type="button" onClick={() => add(product)} aria-label={`Add ${product.title} to cart`}>
      Add
    </button>
  );
}

// Product page buy box. Sticky bottom bar on phones, inline from 1024px.
export function BuyBar({ product }: { product: Product }) {
  const { add, lines } = useCart();
  const inCart = lines.find((l) => l.product.handle === product.handle)?.qty ?? 0;
  const left = Math.max(0, product.stock - inCart);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const q = Math.min(Math.max(1, qty), Math.max(1, left));

  if (product.stock <= 0) {
    return (
      <div className="buy-bar">
        <span className="num buy-price">{money(product.price)}</span>
        <button className="btn grow" type="button" disabled>
          Sold out
        </button>
      </div>
    );
  }

  return (
    <div className="buy-bar">
      <span className="num buy-price">{money(product.price)}</span>
      <Stepper value={q} max={Math.max(1, left)} onChange={(n) => setQty(Math.max(1, n))} label="Quantity" />
      <button
        className="btn grow"
        type="button"
        disabled={left === 0}
        onClick={() => {
          if (add(product, q)) {
            setAdded(true);
            window.setTimeout(() => setAdded(false), 1600);
          }
        }}
      >
        {left === 0 ? "All in your cart" : added ? "Added" : "Add to cart"}
      </button>
      {q >= left && left > 0 && <p className="buy-hint small soft">Only {product.stock} in stock.</p>}
    </div>
  );
}

export function AddCase({ product }: { product: Product }) {
  const { add } = useCart();
  if (product.stock < site.minimumBottles) return null;
  return (
    <button className="btn btn-ghost btn-block" type="button" onClick={() => add(product, site.minimumBottles)}>
      Add a case of six, {money(product.price * site.minimumBottles)}
    </button>
  );
}

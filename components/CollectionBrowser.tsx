"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ProductCard } from "./ProductCard";
import { sortTitle } from "@/lib/format";
import type { Product } from "@/lib/types";

const TASTES: Record<string, { label: string; test: (p: Product) => boolean }> = {
  light: { label: "Light and crisp", test: (p) => p.body <= 2 },
  medium: { label: "Medium", test: (p) => p.body === 3 },
  full: { label: "Full and bold", test: (p) => p.body >= 4 },
};

const PRICES: Record<string, { label: string; test: (p: Product) => boolean }> = {
  u30: { label: "Under $30", test: (p) => p.price < 30 },
  u60: { label: "$30 to $60", test: (p) => p.price >= 30 && p.price < 60 },
  u100: { label: "$60 to $100", test: (p) => p.price >= 60 && p.price < 100 },
  over: { label: "$100 and over", test: (p) => p.price >= 100 },
};

const SORTS: Record<string, { label: string; fn: (a: Product, b: Product) => number }> = {
  featured: { label: "Our picks first", fn: (a, b) => Number(b.featured) - Number(a.featured) },
  name: { label: "Name, A to Z", fn: (a, b) => sortTitle(a.title).localeCompare(sortTitle(b.title)) },
  priceUp: { label: "Price, low to high", fn: (a, b) => a.price - b.price },
  priceDown: { label: "Price, high to low", fn: (a, b) => b.price - a.price },
  bodyUp: { label: "Lightest first", fn: (a, b) => a.body - b.body },
};

export type Filters = { taste?: string; type?: string; region?: string; producer?: string; price?: string; sort?: string };

const KEYS = ["taste", "type", "region", "producer", "price", "sort"] as const;

function clean(f: Filters, types: string[], regions: string[], producers: string[]): Filters {
  return {
    producer: f.producer && producers.includes(f.producer) ? f.producer : undefined,
    taste: f.taste && f.taste in TASTES ? f.taste : undefined,
    type: f.type && types.includes(f.type) ? f.type : undefined,
    region: f.region && regions.includes(f.region) ? f.region : undefined,
    price: f.price && f.price in PRICES ? f.price : undefined,
    sort: f.sort && f.sort in SORTS ? f.sort : undefined,
  };
}

function apply(products: Product[], f: Filters) {
  return products
    .filter(
      (p) =>
        (!f.taste || TASTES[f.taste].test(p)) &&
        (!f.type || p.type === f.type) &&
        (!f.region || p.region === f.region) &&
        (!f.producer || p.vendor === f.producer) &&
        (!f.price || PRICES[f.price].test(p)),
    )
    .sort(SORTS[f.sort ?? "featured"].fn);
}

// Dawn: main-collection-product-grid.liquid + facets. Filters live in the URL so back, refresh and share work.
export function CollectionBrowser({ products, initial }: { products: Product[]; initial: Filters }) {
  const types = useMemo(() => [...new Set(products.map((p) => p.type))], [products]);
  const regions = useMemo(() => [...new Set(products.map((p) => p.region))].sort(), [products]);
  const producers = useMemo(
    () => [...new Set(products.map((p) => p.vendor))].sort((a, b) => a.localeCompare(b)),
    [products],
  );
  const [f, setF] = useState<Filters>(() => clean(initial, types, regions, producers));
  const [sheet, setSheet] = useState(false);
  const [draft, setDraft] = useState<Filters>(f);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Mirror filters into the query string without a navigation.
  useEffect(() => {
    const url = new URL(window.location.href);
    KEYS.forEach((k) => (f[k] ? url.searchParams.set(k, f[k]!) : url.searchParams.delete(k)));
    window.history.replaceState(null, "", url);
  }, [f]);

  useEffect(() => {
    if (!sheet) return;
    setDraft(f);
    document.documentElement.classList.add("lock");
    sheetRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.classList.remove("lock");
      document.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sheet]);

  const shown = useMemo(() => apply(products, f), [products, f]);
  const draftCount = useMemo(() => apply(products, draft).length, [products, draft]);

  const chips = [
    f.taste && { key: "taste", label: TASTES[f.taste].label },
    f.type && { key: "type", label: f.type },
    f.region && { key: "region", label: f.region },
    f.producer && { key: "producer", label: f.producer },
    f.price && { key: "price", label: PRICES[f.price].label },
  ].filter(Boolean) as { key: keyof Filters; label: string }[];

  const groups = (value: Filters, set: (k: keyof Filters, v?: string) => void, name: string) => (
    <>
      <Group name={`${name}-taste`} title="Taste" value={value.taste} set={(v) => set("taste", v)} options={Object.entries(TASTES).map(([k, t]) => [k, t.label])} />
      {types.length > 1 && <Group name={`${name}-type`} title="Type" value={value.type} set={(v) => set("type", v)} options={types.map((t) => [t, t])} />}
      {regions.length > 1 && <Group name={`${name}-region`} title="Region" value={value.region} set={(v) => set("region", v)} options={regions.map((r) => [r, r])} />}
      {producers.length > 1 && (
        <Group name={`${name}-producer`} title="Producer" value={value.producer} set={(v) => set("producer", v)} options={producers.map((v) => [v, v])} />
      )}
      <Group name={`${name}-price`} title="Price" value={value.price} set={(v) => set("price", v)} options={Object.entries(PRICES).map(([k, t]) => [k, t.label])} />
    </>
  );

  return (
    <div className="browser">
      <aside className="facets" aria-label="Filters">
        {groups(f, (k, v) => setF((x) => ({ ...x, [k]: v })), "side")}
      </aside>

      <div className="browser-main">
        <div className="toolbar">
          <button className="btn btn-ghost filter-btn" type="button" onClick={() => setSheet(true)} aria-haspopup="dialog">
            Filter and sort{chips.length ? ` (${chips.length})` : ""}
          </button>
          <p className="count" role="status">
            {shown.length} {shown.length === 1 ? "wine" : "wines"}
          </p>
          <label className="sort">
            <span>Sort</span>
            <select value={f.sort ?? "featured"} onChange={(e) => setF((x) => ({ ...x, sort: e.target.value === "featured" ? undefined : e.target.value }))}>
              {Object.entries(SORTS).map(([k, s]) => (
                <option key={k} value={k}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {chips.length > 0 && (
          <ul className="chips" aria-label="Active filters">
            {chips.map((c) => (
              <li key={c.key}>
                <button type="button" onClick={() => setF((x) => ({ ...x, [c.key]: undefined }))} aria-label={`Remove filter ${c.label}`}>
                  {c.label}
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M7 7l10 10M17 7L7 17" />
                  </svg>
                </button>
              </li>
            ))}
            <li>
              <button type="button" className="chips-clear" onClick={() => setF((x) => ({ sort: x.sort }))}>
                Clear all
              </button>
            </li>
          </ul>
        )}

        {shown.length > 0 ? (
          <div className="grid" data-reveal-group key={JSON.stringify(f)}>
            {shown.map((p) => (
              <ProductCard key={p.handle} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <p className="h3">Nothing here yet.</p>
            <p className="soft">No wine in this collection matches all of those filters.</p>
            <button className="btn btn-ghost" type="button" onClick={() => setF((x) => ({ sort: x.sort }))}>
              Clear filters
            </button>
          </div>
        )}
      </div>

      <div className={`sheet ${sheet ? "is-open" : ""}`} aria-hidden={!sheet} inert={!sheet}>
        <div className="sheet-scrim" onClick={() => setSheet(false)} />
        <div className="sheet-panel" role="dialog" aria-modal="true" aria-labelledby="sheet-title" tabIndex={-1} ref={sheetRef}>
          <div className="sheet-head">
            <h2 id="sheet-title" className="h3">
              Filter and sort
            </h2>
            <button className="icon-btn" type="button" onClick={() => setSheet(false)} aria-label="Close filters">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="sheet-body">
            {groups(draft, (k, v) => setDraft((x) => ({ ...x, [k]: v })), "sheet")}
            <Group
              name="sheet-sort"
              title="Sort"
              value={draft.sort ?? "featured"}
              set={(v) => setDraft((x) => ({ ...x, sort: v === "featured" ? undefined : v }))}
              options={Object.entries(SORTS).map(([k, s]) => [k, s.label])}
              noAny
            />
          </div>
          <div className="sheet-foot">
            <button className="btn btn-ghost" type="button" onClick={() => setDraft((x) => ({ sort: x.sort }))}>
              Clear
            </button>
            <button
              className="btn grow"
              type="button"
              disabled={draftCount === 0}
              onClick={() => {
                setF(draft);
                setSheet(false);
              }}
            >
              {draftCount === 0 ? "No wines match" : `Show ${draftCount} ${draftCount === 1 ? "wine" : "wines"}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group({
  name,
  title,
  value,
  set,
  options,
  noAny,
}: {
  name: string;
  title: string;
  value?: string;
  set: (v?: string) => void;
  options: [string, string][];
  noAny?: boolean;
}) {
  return (
    <fieldset className="facet">
      <legend>{title}</legend>
      {!noAny && (
        <label>
          <input type="radio" name={name} checked={!value} onChange={() => set(undefined)} />
          Any
        </label>
      )}
      {options.map(([k, label]) => (
        <label key={k}>
          <input type="radio" name={name} checked={value === k} onChange={() => set(k)} />
          {label}
        </label>
      ))}
    </fieldset>
  );
}

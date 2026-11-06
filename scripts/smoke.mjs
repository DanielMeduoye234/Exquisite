// Smoke test for a running site: every page answers, shows the right content, and nothing 500s.
// Usage: npm run test:smoke                     (checks http://localhost:3000)
//        BASE_URL=https://your-app.vercel.app npm run test:smoke
import { readFileSync } from "node:fs";

const base = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const load = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const products = load("products.json");
const restaurants = load("restaurants.json");
const collections = load("collections.json");

const pages = [
  ["/", "Start with a colour"],
  ["/collections", "Collections"],
  ...collections.map((c) => [`/collections/${c.handle}`, c.title]),
  ["/collections/all?type=White", "Chablis"],
  ["/collections/all?producer=Buoncristiani%20Family%20Winery", "Buoncristiani"],
  ...products.map((p) => [`/products/${p.handle}`, p.sommelier_note.slice(0, 40)]),
  ["/contact", "Talk to the cellar"],
  ["/restaurants", "Find us at the table"],
  ...restaurants.map((r) => [`/restaurants/${r.slug}`, r.name]),
];

const decode = (s) => s.replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
let failed = 0;

for (const [path, expect] of pages) {
  const t = Date.now();
  try {
    const res = await fetch(base + path, { redirect: "manual" });
    const html = decode(await res.text());
    const ok = res.status === 200 && html.includes(decode(expect));
    if (!ok) failed++;
    console.log(`${ok ? "PASS" : "FAIL"}  ${res.status}  ${path}  ${Date.now() - t}ms${ok ? "" : `  (expected "${expect}")`}`);
  } catch (e) {
    failed++;
    console.log(`FAIL  ---  ${path}  ${e.message}`);
  }
}

// Unknown pages must 404, not crash.
for (const path of ["/products/no-such-wine", "/collections/no-such-collection", "/restaurants/nowhere", "/nope"]) {
  const res = await fetch(base + path);
  const ok = res.status === 404;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${res.status}  ${path}  (expects 404)`);
}

console.log(failed ? `\n${failed} check(s) failed on ${base}.` : `\nAll ${pages.length + 4} page checks passed on ${base}.`);
process.exit(failed ? 1 : 0);

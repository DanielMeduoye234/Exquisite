// Checks the live Supabase project against what the site expects.
// Usage: npm run test:supabase   (reads .env.local; needs the anon key and the service_role key)
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

process.loadEnvFile?.(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !anonKey || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

const anon = createClient(url, anonKey, { auth: { persistSession: false } });
const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const load = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));
const marker = `smoke-${Date.now()}`;

let failed = 0;
const check = (ok, label, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
  if (!ok) failed++;
};

// 1. Tables exist and match the seed data's fields.
for (const [table, file] of [
  ["products", "products.json"],
  ["restaurants", "restaurants.json"],
]) {
  const rows = load(file);
  const { data, error } = await anon.from(table).select("*");
  if (error) {
    check(false, `${table}: readable by visitors`, error.message);
    continue;
  }
  check(true, `${table}: readable by visitors`);
  check(data.length === rows.length, `${table}: row count matches /data`, `${data.length} in database, ${rows.length} in /data`);
  if (data.length) {
    const cols = Object.keys(data[0]);
    const missing = Object.keys(rows[0]).filter((k) => !cols.includes(k));
    check(missing.length === 0, `${table}: every /data field has a column`, missing.length ? `missing: ${missing.join(", ")}` : "");
  }
}

// 2. The data the site depends on is consistent.
const { data: products } = await anon.from("products").select("handle, price, stock, type");
const { data: restaurants } = await anon.from("restaurants").select("slug, on_the_list");
if (products && restaurants) {
  const handles = new Set(products.map((p) => p.handle));
  const broken = restaurants.flatMap((r) => r.on_the_list.filter((h) => !handles.has(h)).map((h) => `${r.slug} -> ${h}`));
  check(broken.length === 0, "restaurants: every on_the_list wine exists", broken.join(", "));
  check(products.every((p) => typeof p.price === "number"), "products: prices come back as numbers");
}

// 3. Visitors can send a contact message but cannot read messages back.
{
  const { error } = await anon
    .from("contact_messages")
    .insert({ name: marker, email: "test@example.com", topic: "Something else", message: "Automated check, safe to delete." });
  check(!error, "contact_messages: visitors can send a message", error?.message);
  const { data, error: readErr } = await anon.from("contact_messages").select("*");
  check(!!readErr || (data ?? []).length === 0, "contact_messages: visitors cannot read messages", readErr ? "denied" : `${data?.length} rows visible`);
  const { error: badErr } = await anon.from("contact_messages").insert({ name: marker, email: "not-an-email", topic: "x", message: "x" });
  check(!!badErr, "contact_messages: database rejects a bad email");
}

// 4. Newsletter: sign up, duplicate is reported as 23505 (the site treats it as success), no read-back.
{
  const email = `${marker}@example.com`;
  const first = await anon.from("newsletter_signups").insert({ email });
  check(!first.error, "newsletter_signups: visitors can sign up", first.error?.message);
  const again = await anon.from("newsletter_signups").insert({ email });
  check(again.error?.code === "23505", "newsletter_signups: duplicate email is caught", again.error?.code ?? "no error");
  const { data, error } = await anon.from("newsletter_signups").select("*");
  check(!!error || (data ?? []).length === 0, "newsletter_signups: visitors cannot read emails", error ? "denied" : `${data?.length} rows visible`);
}

// 5. Visitors cannot change the catalogue.
{
  const { data } = await anon.from("products").update({ price: 1 }).eq("handle", "trie-grappa-riserva").select();
  check((data ?? []).length === 0, "products: visitors cannot edit prices");
}

// Clean up this run's rows.
await admin.from("contact_messages").delete().eq("name", marker);
await admin.from("newsletter_signups").delete().like("email", `${marker}%`);

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll Supabase checks passed.");
process.exit(failed ? 1 : 0);

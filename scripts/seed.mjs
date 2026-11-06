// Loads /data into Supabase. Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";

process.loadEnvFile?.(".env.local");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });
const load = (f) => JSON.parse(readFileSync(new URL(`../data/${f}`, import.meta.url), "utf8"));

for (const [table, file, key] of [
  ["products", "products.json", "handle"],
  ["restaurants", "restaurants.json", "slug"],
]) {
  const rows = load(file);
  const { error } = await db.from(table).upsert(rows, { onConflict: key });
  if (error) {
    console.error(`${table}: ${error.message}`);
    process.exit(1);
  }
  // Remove rows that are no longer in /data (e.g. products dropped from the catalogue).
  const keep = rows.map((r) => r[key]);
  const { data: existing, error: listError } = await db.from(table).select(key);
  if (listError) {
    console.error(`${table}: ${listError.message}`);
    process.exit(1);
  }
  const stale = existing.map((r) => r[key]).filter((k) => !keep.includes(k));
  if (stale.length) {
    const { error: delError } = await db.from(table).delete().in(key, stale);
    if (delError) {
      console.error(`${table}: ${delError.message}`);
      process.exit(1);
    }
  }
  console.log(`${table}: ${rows.length} rows${stale.length ? `, removed ${stale.length} old` : ""}`);
}

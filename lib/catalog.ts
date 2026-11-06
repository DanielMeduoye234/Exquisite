import "server-only";
import { cache } from "react";
import { supabase } from "./supabase";
import type { Collection, Product, Restaurant } from "./types";
import seedProducts from "@/data/products.json";
import seedRestaurants from "@/data/restaurants.json";
import seedCollections from "@/data/collections.json";

export const getProducts = cache(async (): Promise<Product[]> => {
  if (supabase) {
    const { data, error } = await supabase.from("products").select("*").order("title");
    if (!error && data) return data as Product[];
    console.warn("Supabase products query failed, using seed data:", error?.message);
  }
  return seedProducts as Product[];
});

export const getRestaurants = cache(async (): Promise<Restaurant[]> => {
  if (supabase) {
    const { data, error } = await supabase.from("restaurants").select("*").order("name");
    if (!error && data) return data as Restaurant[];
    console.warn("Supabase restaurants query failed, using seed data:", error?.message);
  }
  return seedRestaurants as Restaurant[];
});

export const collections = seedCollections as Collection[];

export function getCollection(handle: string) {
  return collections.find((c) => c.handle === handle);
}

export async function getProduct(handle: string) {
  return (await getProducts()).find((p) => p.handle === handle);
}

export async function getRestaurant(slug: string) {
  return (await getRestaurants()).find((r) => r.slug === slug);
}

export function matchesRule(p: Product, rule: Collection["rule"]) {
  if (rule.type && p.type !== rule.type) return false;
  if (rule.types && !rule.types.includes(p.type)) return false;
  if (rule.region && p.region !== rule.region) return false;
  if (rule.country && p.country !== rule.country) return false;
  if (rule.limited !== undefined && p.limited !== rule.limited) return false;
  return true;
}

export async function getCollectionProducts(c: Collection) {
  return (await getProducts()).filter((p) => matchesRule(p, c.rule));
}

export async function getRelated(p: Product, n = 3) {
  const all = (await getProducts()).filter((x) => x.handle !== p.handle);
  const score = (x: Product) =>
    (x.region === p.region ? 2 : 0) + (x.type === p.type ? 2 : 0) - Math.abs(x.body - p.body);
  return all.sort((a, b) => score(b) - score(a)).slice(0, n);
}

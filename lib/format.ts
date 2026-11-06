import type { Product, WineType } from "./types";

const cad = new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD" });

export const money = (n: number) => cad.format(n);

export const bottles = (n: number) => `${n} bottle${n === 1 ? "" : "s"}`;

// "NV" only for non-vintage sparkling; otherwise nothing when the sheet gives no vintage.
export const vintageLabel = (p: Pick<Product, "vintage" | "type">) =>
  p.vintage ? String(p.vintage) : p.type === "Sparkling" ? "NV" : "";

// Size only when it isn't the standard bottle, and always on spirits.
export const sizeLabel = (p: Pick<Product, "size" | "type">) =>
  p.type === "Spirits" || p.size !== "750 ml" ? p.size : "";

export const sortTitle = (t: string) => t.replace(/^['‘’]/, "");

export const normalise = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

export const LOW_STOCK = 6;

export type Badge = { label: string; tone: "out" | "limited" | "low" };

// One badge at most: sold out, then limited, then low stock.
export function badgeFor(p: Pick<Product, "stock" | "limited">): Badge | null {
  if (p.stock <= 0) return { label: "Sold out", tone: "out" };
  if (p.limited) return { label: "Limited", tone: "limited" };
  if (p.stock <= LOW_STOCK) return { label: `${p.stock} left`, tone: "low" };
  return null;
}

export const typeColour: Record<WineType, string> = {
  Red: "#6E1E2B",
  White: "#C9B46A",
  Rosé: "#D89A8E",
  Sparkling: "#BFB9A3",
  Dessert: "#A8742A",
  Spirits: "#7A5A3A",
};

// Collection a product's breadcrumb points back to.
export const typeCollection: Record<WineType, { handle: string; title: string }> = {
  Red: { handle: "red", title: "Red wines" },
  White: { handle: "white", title: "White wines" },
  Rosé: { handle: "all", title: "All wines" },
  Sparkling: { handle: "all", title: "All wines" },
  Dessert: { handle: "all", title: "All wines" },
  Spirits: { handle: "spirits", title: "Grappa, amaro and liqueur" },
};

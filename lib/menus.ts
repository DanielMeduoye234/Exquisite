import "server-only";
import { collections, getProducts, matchesRule } from "./catalog";
import { typeColour } from "./format";
import type { WineType } from "./types";

export type MenuLink = { href: string; label: string; count?: number; dot?: string };
export type MenuColumn = { title: string; icon: "glass" | "tag" | "taste" | "pin" | "estate"; links: MenuLink[]; more?: MenuLink };
export type MenuFeature = { href: string; title: string; note: string; image: string };
export type Menu = { id: string; label: string; href: string; columns: MenuColumn[]; features?: MenuFeature[] };
export type NavItem = Menu | { label: string; href: string };

export const isMenu = (n: NavItem): n is Menu => "columns" in n;

const TYPES: { type: WineType; label: string }[] = [
  { type: "Red", label: "Red" },
  { type: "White", label: "White" },
  { type: "Sparkling", label: "Sparkling" },
  { type: "Rosé", label: "Rosé" },
  { type: "Dessert", label: "Dessert" },
  { type: "Spirits", label: "Grappa, amaro and liqueur" },
];

const PRICES = [
  { key: "u30", label: "Under $30", test: (p: number) => p < 30 },
  { key: "u60", label: "$30 to $60", test: (p: number) => p >= 30 && p < 60 },
  { key: "u100", label: "$60 to $100", test: (p: number) => p >= 60 && p < 100 },
  { key: "over", label: "$100 and over", test: (p: number) => p >= 100 },
];

const TASTES = [
  { key: "light", label: "Light and crisp", test: (b: number) => b <= 2 },
  { key: "medium", label: "Medium", test: (b: number) => b === 3 },
  { key: "full", label: "Full and bold", test: (b: number) => b >= 4 },
];

const all = (q: string) => `/collections/all?${q}`;

// Dawn: the header menu blocks (one mega-menu block per dropdown).
export async function getNav(): Promise<NavItem[]> {
  const products = await getProducts();
  const producers = [...new Set(products.map((p) => p.vendor))].sort((a, b) => a.localeCompare(b));
  const regions = collections.filter((c) => c.kicker === "Region");
  const countOf = (f: (p: (typeof products)[number]) => boolean) => products.filter(f).length;

  return [
    {
      id: "shop",
      label: "Shop Wines",
      href: "/collections/all",
      columns: [
        {
          title: "By type",
          icon: "glass",
          links: TYPES.map((t) => ({
            href: all(`type=${encodeURIComponent(t.type)}`),
            label: t.label,
            dot: typeColour[t.type],
            count: countOf((p) => p.type === t.type),
          })).filter((l) => l.count > 0),
          more: { href: "/collections/all", label: "All wines" },
        },
        {
          title: "By price",
          icon: "tag",
          links: PRICES.map((p) => ({ href: all(`price=${p.key}`), label: p.label, count: countOf((x) => p.test(x.price)) })),
          more: { href: "/collections/limited", label: "Limited allocations" },
        },
        {
          title: "By taste",
          icon: "taste",
          links: TASTES.map((t) => ({ href: all(`taste=${t.key}`), label: t.label, count: countOf((x) => t.test(x.body)) })),
          more: { href: "/collections/all?sort=bodyUp", label: "Lightest to boldest" },
        },
      ],
      features: [
        { href: "/collections/limited", title: "Limited allocations", note: "A few cases a year from small estates", image: "/images/cellar-tunnel.jpg" },
        { href: "/collections/spirits", title: "After dinner", note: "Aged grappa, amaro and liqueur", image: "/images/barrels.jpg" },
      ],
    },
    {
      id: "regions",
      label: "Regions",
      href: "/collections",
      columns: [
        {
          title: "Region",
          icon: "pin",
          links: regions.map((c) => ({ href: `/collections/${c.handle}`, label: c.title, count: countOf((p) => matchesRule(p, c.rule)) })),
          more: { href: "/collections", label: "All regions" },
        },
      ],
      features: regions
        .filter((c) => c.image)
        .slice(0, 2)
        .map((c) => ({ href: `/collections/${c.handle}`, title: c.title, note: c.description, image: c.image! })),
    },
    {
      id: "producers",
      label: "Producers",
      href: "/collections/all",
      columns: [
        {
          title: "The families we buy from",
          icon: "estate",
          links: producers.map((v) => ({ href: all(`producer=${encodeURIComponent(v)}`), label: v, count: countOf((p) => p.vendor === v) })),
          more: { href: "/collections/all", label: "All wines" },
        },
      ],
    },
    { label: "Allocations", href: "/collections/limited" },
    { label: "Restaurants", href: "/restaurants" },
    { label: "Contact", href: "/contact" },
  ];
}

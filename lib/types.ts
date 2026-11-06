// Field names mirror the Shopify product object and the custom metafields
// planned for the Dawn port (tasting.body, tasting.acidity, tasting.sweetness, …).
export type WineType = "Red" | "White" | "Sparkling" | "Rosé" | "Dessert" | "Spirits";

export type Product = {
  handle: string;
  title: string;
  vendor: string;
  type: WineType;
  region: string;
  country: string;
  grape: string;
  vintage: number | null;
  size: string;
  abv: number | null; // null when the producer's sheet doesn't state it
  price: number;
  body: number;
  acidity: number;
  sweetness: number;
  notes: string;
  pairing: string;
  drink_window: string;
  sommelier_note: string;
  featured: boolean;
  limited: boolean;
  stock: number;
  image_url: string | null;
};

export type CollectionRule = {
  type?: WineType;
  types?: WineType[];
  region?: string;
  country?: string;
  limited?: boolean;
};

export type Collection = {
  handle: string;
  title: string;
  kicker: string;
  description: string;
  rule: CollectionRule;
  image: string | null; // temporary stock photo, see public/images/CREDITS.md
};

export type Restaurant = {
  slug: string;
  name: string;
  city: string;
  province: string;
  kind: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  intro: string;
  on_the_list: string[];
  image: string | null; // temporary stock photo until the restaurant supplies its own
  image_alt: string | null;
};

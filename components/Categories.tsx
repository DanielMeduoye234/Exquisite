import Image from "next/image";
import Link from "next/link";
import { BottleShot } from "./Brand";
import type { Product } from "@/lib/types";

export type Category = { title: string; href: string; image: string; bottle: Product; count: number };

// Shop-by-category cards: a faded photo behind each card and a bottle standing over its top edge.
// The bottle lifts on hover (mouse) or on press (touch). Dawn: sections/collection-cards.liquid.
export function Categories({ items }: { items: Category[] }) {
  return (
    <div className="cats" data-reveal-group>
      {items.map((c) => (
        <Link key={c.href} href={c.href} className="cat" data-lift>
          <span className="cat-bg">
            <Image src={c.image} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" />
          </span>
          {c.bottle.image_url ? (
            <span className="shot cat-shot cat-photo">
              <Image src={c.bottle.image_url} alt="" fill sizes="(min-width:1024px) 12vw, 25vw" />
            </span>
          ) : (
            <BottleShot product={c.bottle} className="cat-shot" />
          )}
          <span className="cat-text">
            <span className="cat-title">{c.title}</span>
            <span className="cat-count">
              {c.count} {c.count === 1 ? "bottle" : "bottles"}
            </span>
          </span>
          <span className="cat-go" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </Link>
      ))}
    </div>
  );
}

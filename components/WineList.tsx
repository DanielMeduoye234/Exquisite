import Link from "next/link";
import { money, sizeLabel, vintageLabel } from "@/lib/format";
import type { Product } from "@/lib/types";

// The printed wine-list row: name, dot leaders, price. Dawn: snippets/wine-list-row.liquid.
export function WineList({ products }: { products: Product[] }) {
  return (
    <ul className="winelist" data-reveal>
      {products.map((p) => (
        <li key={p.handle}>
          <Link href={`/products/${p.handle}`}>
            <span className="wl-line">
              <span className="wl-name">{p.title}</span>
              <span className="wl-leader" aria-hidden="true" />
            </span>
            <span className="wl-price">{p.stock > 0 ? money(p.price) : "Sold out"}</span>
            <span className="wl-sub">
              {[p.vendor, p.region, vintageLabel(p), sizeLabel(p)].filter(Boolean).join(" · ")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

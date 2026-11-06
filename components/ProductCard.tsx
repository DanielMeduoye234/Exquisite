import Image from "next/image";
import Link from "next/link";
import { BottleShot } from "./Brand";
import { QuickAdd } from "./Cart";
import { badgeFor, money, sizeLabel, vintageLabel } from "@/lib/format";
import type { Product } from "@/lib/types";

// Real photo when there is one, otherwise the rendered bottle packshot.
export function ProductImage({ product, size = "card", priority = false }: { product: Product; size?: "card" | "large"; priority?: boolean }) {
  return product.image_url ? (
    <Image
      src={product.image_url}
      alt={product.title}
      fill
      priority={priority}
      sizes={size === "large" ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1200px) 25vw, (min-width:768px) 33vw, 50vw"}
      style={{ objectFit: "contain" }}
    />
  ) : (
    <BottleShot product={product} className={size === "large" ? "shot-large" : undefined} />
  );
}

// Dawn: snippets/card-product.liquid. The whole card is one link (stretched title link);
// the quiet Add button only appears from 1024px and sits above the link.
export function ProductCard({ product }: { product: Product }) {
  const badge = badgeFor(product);
  const meta = [product.region, vintageLabel(product), sizeLabel(product)].filter(Boolean).join(" · ");
  return (
    <article className={`card ${badge?.tone === "out" ? "is-out" : ""}`} data-lift>
      <div className="card-media">
        <ProductImage product={product} />
        {badge && <span className={`badge badge-${badge.tone}`}>{badge.label}</span>}
      </div>
      <p className="card-meta">{meta}</p>
      <h3 className="card-title">
        <Link href={`/products/${product.handle}`}>{product.title}</Link>
      </h3>
      <p className="card-vendor">{product.vendor}</p>
      <div className="card-foot">
        <span className="num card-price">{money(product.price)}</span>
        <QuickAdd product={product} />
      </div>
    </article>
  );
}

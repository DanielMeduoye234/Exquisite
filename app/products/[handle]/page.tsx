import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TasteProfile } from "@/components/Brand";
import { Bottle3D } from "@/components/Bottle3D";
import { PhotoBottle3D } from "@/components/PhotoBottle3D";
import { AddCase, BuyBar } from "@/components/Cart";
import { ProductCard } from "@/components/ProductCard";
import { getProduct, getProducts, getRelated, getRestaurants } from "@/lib/catalog";
import { badgeFor, sizeLabel, typeCollection, vintageLabel } from "@/lib/format";
import { site } from "@/lib/site";

type Props = { params: Promise<{ handle: string }> };

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).handle);
  return p ? { title: `${p.title}, ${p.vendor}`, description: `${p.notes} ${p.pairing}` } : {};
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).handle);
  if (!product) notFound();
  const [related, restaurants] = await Promise.all([getRelated(product, 4), getRestaurants()]);
  const pouredAt = restaurants.filter((r) => r.on_the_list.includes(product.handle));
  const back = typeCollection[product.type];
  const badge = badgeFor(product);

  const facts: [string, string][] = [
    ["Vintage", vintageLabel(product)],
    ["Size", sizeLabel(product) || product.size],
    ["Alcohol", product.abv != null ? `${product.abv}%` : ""],
    ["Producer", product.vendor],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <>
      <article className="wrap pdp">
        <Link className="crumb" href={`/collections/${back.handle}`}>
          ← {back.title}
        </Link>
        <div className="pdp-grid">
          <div className="pdp-media">
            {product.image_url ? <PhotoBottle3D product={product} /> : <Bottle3D product={product} />}
            {badge && <span className={`badge badge-${badge.tone}`}>{badge.label}</span>}
          </div>

          <div className="pdp-info">
            <div className="pdp-title">
              <span className="kicker">
                {product.region} · {product.grape}
              </span>
              <h1>{product.title}</h1>
              <p className="soft">{product.vendor}</p>
            </div>

            <dl className="facts">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>

            <BuyBar product={product} />
            <AddCase product={product} />

            <div className="assure">
              <span>
                <b>Mix any six.</b> {site.minimumExplainer}
              </span>
              <span>
                {site.deliveryNote} Free on {site.freeDeliveryBottles} bottles or more.{" "}
                <Link href="/contact#ordering">How ordering works</Link>
              </span>
            </div>

            <figure className="note pdp-note">
              <blockquote>{product.sommelier_note}</blockquote>
              <figcaption>From the cellar</figcaption>
            </figure>

            <div className="pdp-block">
              <h2>How it tastes</h2>
              <TasteProfile product={product} ends />
            </div>

            <div className="pdp-block">
              <h2>Tasting notes</h2>
              <p>{product.notes}</p>
            </div>
            <div className="pdp-block">
              <h2>Pair it with</h2>
              <p>{product.pairing}</p>
            </div>
            <div className="pdp-block">
              <h2>Drink</h2>
              <p>{product.drink_window}</p>
            </div>

            {pouredAt.length > 0 && (
              <div className="pdp-block">
                <h2>Poured at</h2>
                <p className="poured">
                  {pouredAt.map((r) => (
                    <Link key={r.slug} className="link" href={`/restaurants/${r.slug}`}>
                      {r.name}
                    </Link>
                  ))}
                </p>
              </div>
            )}
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="section" aria-labelledby="related">
          <div className="wrap">
            <div className="sec-head-row" data-reveal>
              <div className="sec-head">
                <span className="kicker">From the same cellar</span>
                <h2 id="related">You might also pour</h2>
              </div>
              <Link className="link arrow" href={`/collections/${back.handle}`}>
                {back.title}
              </Link>
            </div>
            <div className="grid" data-reveal-group>
              {related.map((p) => (
                <ProductCard key={p.handle} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

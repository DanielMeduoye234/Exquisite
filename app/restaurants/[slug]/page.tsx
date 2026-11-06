import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WineList } from "@/components/WineList";
import { getProducts, getRestaurant, getRestaurants } from "@/lib/catalog";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await getRestaurants()).map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getRestaurant((await params).slug);
  return r ? { title: r.name, description: r.intro } : {};
}

export default async function RestaurantPage({ params }: Props) {
  const restaurant = await getRestaurant((await params).slug);
  if (!restaurant) notFound();
  const [products, all] = await Promise.all([getProducts(), getRestaurants()]);
  // Skip handles that no longer exist rather than failing.
  const list = restaurant.on_the_list.map((h) => products.find((p) => p.handle === h)).filter((p) => p !== undefined);
  const query = restaurant.address ?? `${restaurant.name}, ${restaurant.city}, Canada`;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const others = all.filter((r) => r.slug !== restaurant.slug);

  return (
    <>
      <div className="wrap phead">
        <Link className="crumb" href="/restaurants">
          ← Restaurants
        </Link>
        <span className="kicker">{restaurant.kind}</span>
        <h1>{restaurant.name}</h1>
        <p className="lede">{restaurant.intro}</p>
      </div>

      <div className="wrap">
        {restaurant.image && (
          <div className="banner">
            <Image src={restaurant.image} alt={restaurant.image_alt ?? ""} fill priority sizes="(min-width:1280px) 1200px, 100vw" />
          </div>
        )}
      </div>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="list">
        <div className="wrap split" style={{ alignItems: "start" }}>
          <div className="split-copy" data-reveal>
            <span className="kicker">Visit</span>
            <h2 className="h3">{restaurant.name}</h2>
            <dl className="details" style={{ width: "100%" }}>
              <div>
                <dt>Where</dt>
                <dd>{restaurant.address ?? `${restaurant.city}, Canada`}</dd>
              </div>
              {restaurant.phone && (
                <div>
                  <dt>Phone</dt>
                  <dd>
                    <a className="link" href={`tel:${restaurant.phone.replace(/\D/g, "")}`}>
                      {restaurant.phone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <a className="btn" href={maps} target="_blank" rel="noreferrer">
                Get directions
              </a>
              {restaurant.website && (
                <a className="btn btn-ghost" href={restaurant.website} target="_blank" rel="noreferrer">
                  Book a table
                </a>
              )}
            </div>
          </div>
          <div className="split-copy" data-reveal>
            <span className="kicker">On the list</span>
            <h2 id="list">Poured at {restaurant.name}</h2>
            <p className="soft">Liked it at dinner? Every bottle here can be delivered to your door.</p>
            {list.length > 0 ? (
              <div style={{ width: "100%" }}>
                <WineList products={list} />
              </div>
            ) : (
              <p className="soft">The list is being updated. Ask your server for the Exquisite wines.</p>
            )}
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="section section-tint" aria-labelledby="also">
          <div className="wrap">
            <div className="sec-head" data-reveal>
              <span className="kicker">Also pouring our wines</span>
              <h2 id="also">More tables</h2>
            </div>
            <div className="rcards" data-reveal-group>
              {others.map((o) => (
                <article key={o.slug} className="rcard">
                  <Link href={`/restaurants/${o.slug}`} className="rcard-media" tabIndex={-1} aria-hidden="true">
                    {o.image && <Image src={o.image} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" />}
                  </Link>
                  <span className="eyebrow">{o.kind}</span>
                  <h3 className="h2">
                    <Link href={`/restaurants/${o.slug}`} style={{ textDecoration: "none" }}>
                      {o.name}
                    </Link>
                  </h3>
                  <p className="soft">{o.intro}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

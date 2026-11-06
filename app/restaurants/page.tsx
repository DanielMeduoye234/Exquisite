import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { WineList } from "@/components/WineList";
import { getProducts, getRestaurants } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Restaurants",
  description: "Ontario restaurants pouring wines from the Exquisite cellar: 7 Enoteca and Centro on the Square.",
};

export default async function RestaurantsPage() {
  const [restaurants, products] = await Promise.all([getRestaurants(), getProducts()]);
  return (
    <>
      <div className="wrap phead">
        <Link className="crumb" href="/">
          ← Home
        </Link>
        <span className="kicker">At the table</span>
        <h1>Find us at the table</h1>
        <p className="lede">
          Wine was made to be poured with food. These Ontario dining rooms pour our producers beside the dishes they were
          made for.
        </p>
      </div>

      <section className="section" style={{ paddingTop: 0 }} aria-label="Restaurants">
        <div className="wrap rcards">
          {restaurants.map((r) => {
            const list = r.on_the_list.map((h) => products.find((p) => p.handle === h)).filter((p) => p !== undefined);
            return (
              <article key={r.slug} className="rcard" data-reveal>
                <Link href={`/restaurants/${r.slug}`} className="rcard-media" tabIndex={-1} aria-hidden="true">
                  {r.image && <Image src={r.image} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" priority />}
                </Link>
                <span className="eyebrow">
                  {r.kind} · {r.city}
                </span>
                <h2>
                  <Link href={`/restaurants/${r.slug}`} style={{ textDecoration: "none" }}>
                    {r.name}
                  </Link>
                </h2>
                <p className="soft">{r.intro}</p>
                {list.length > 0 && (
                  <>
                    <span className="kicker">On the list</span>
                    <WineList products={list} />
                  </>
                )}
                <Link className="link arrow" href={`/restaurants/${r.slug}`}>
                  Visit {r.name}
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section section-ink" aria-labelledby="programme">
        <div className="wrap split">
          <div className="split-copy" data-reveal>
            <span className="kicker">Coming with Club Vitalità</span>
            <h2 id="programme">The table programme</h2>
            <p className="lede">
              Members will be able to bring a bottle from their shipment to partner restaurants, with the corkage paid by
              us. Visiting winemakers will host dinners in the same rooms.
            </p>
            <Link className="btn" href="/contact?topic=membership">
              Join the waitlist
            </Link>
          </div>
          <div className="split-copy" data-reveal>
            <span className="kicker">For restaurants</span>
            <h2>Pour our producers</h2>
            <p className="lede">Family estates, a buyer who visits, and staff tastings for your floor team.</p>
            <Link className="btn btn-light" href="/contact?topic=trade">
              Ask for the trade list
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

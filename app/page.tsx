import Image from "next/image";
import Link from "next/link";
import { TasteProfile } from "@/components/Brand";
import { Categories, type Category } from "@/components/Categories";
import { HeroSlider, type Slide } from "@/components/HeroSlider";
import { Newsletter } from "@/components/Newsletter";
import { ProductCard } from "@/components/ProductCard";
import { WineList } from "@/components/WineList";
import { collections, getProducts, getRestaurants, matchesRule } from "@/lib/catalog";
import { site } from "@/lib/site";
import type { Product } from "@/lib/types";
import slides from "@/data/slides.json";

const TIERS = [
  {
    name: "Scoperta",
    en: "Discovery. 3 bottles a quarter.",
    price: "$99",
    perks: ["One region in depth each quarter", "A written card for every bottle", "One virtual tasting a year"],
  },
  {
    name: "Cantina",
    en: "Cellar. 6 bottles a quarter.",
    price: "$189",
    perks: ["Your palate profile, one swap per shipment", "48 hours early on allocations", "Every virtual tasting, one in person"],
  },
  {
    name: "Collezione",
    en: "Collection. 6 to 12 bottles, large formats.",
    price: "$399",
    perks: ["First refusal on every allocation", "Library vintages and verticals", "Winemaker dinners and cellar service"],
  },
];

// Sample profiles for the three taste rows (only body, acidity and sweetness are read).
const tasteRow = (body: number, acidity: number, sweetness: number) => ({ body, acidity, sweetness, type: "Red" }) as Product;
const TASTES = [
  { key: "light", name: "Light and crisp", sub: "Citrus, flint, chalk. Petit Chablis, Touraine Sauvignon.", sample: tasteRow(2, 4, 1) },
  { key: "medium", name: "Round and generous", sub: "Ripe fruit, soft edges. Montagne-Saint-Émilion, Margaux, Chablis.", sample: tasteRow(3, 3, 1) },
  { key: "full", name: "Full and bold", sub: "Dark fruit, firm tannin. Pomerol, Napa Cabernet, Petite Sirah.", sample: tasteRow(5, 4, 1) },
];

export default async function Home() {
  const [products, restaurants] = await Promise.all([getProducts(), getRestaurants()]);
  const featured = products.filter((p) => p.featured && p.stock > 0).slice(0, 4);
  const limited = products.filter((p) => p.limited && p.type !== "Spirits").slice(0, 6);
  const story = products.find((p) => p.handle === "chateau-maillet-pomerol") ?? products[0];
  const regions = collections.filter((c) => c.kicker === "Region");
  const regionTiles = regions.filter((c) => c.image).slice(0, 3);
  const count = (c: (typeof collections)[number]) => products.filter((p) => matchesRule(p, c.rule)).length;

  // Each card stands a real wine from its collection on top of a faded photo.
  const pick = (handle: string, image: string, prefer: string, title?: string): Category | null => {
    const c = collections.find((x) => x.handle === handle);
    const items = c ? products.filter((p) => matchesRule(p, c.rule)) : [];
    if (!c || items.length === 0) return null;
    return { title: title ?? c.title, href: `/collections/${c.handle}`, image, count: items.length, bottle: items.find((p) => p.handle === prefer) ?? items[0] };
  };
  const categories = [
    pick("red", "/images/pour-red.jpg", "chateau-villars-fronsac-2018"),
    pick("white", "/images/hero-vineyard.jpg", "chateau-pouyanne-graves-blanc"),
    pick("limited", "/images/cellar-tunnel.jpg", "chateau-de-leognan-2015"),
    pick("spirits", "/images/barrels.jpg", "trie-grappa-riserva", "After dinner"),
  ].filter((c): c is Category => c !== null);

  return (
    <>
      <HeroSlider slides={slides as Slide[]} />

      <div className="wrap">
        <ul className="promises" aria-label="How we deliver">
          <li>
            <b>Mix any six</b>
            Every order starts at six bottles, any combination.
          </li>
          <li>
            <b>Free on {site.freeDeliveryBottles} or more</b>
            Delivered across Ontario.
          </li>
          <li>
            <b>Signed for at the door</b>
            By an adult of legal drinking age.
          </li>
          <li>
            <b>A person answers</b>
            Every email, within one business day.
          </li>
        </ul>
      </div>

      <section className="section section-cats" aria-labelledby="cats">
        <div className="wrap">
          <div className="sec-head" data-reveal>
            <span className="kicker">Shop Wines</span>
            <h2 id="cats">Start with a colour</h2>
          </div>
          <Categories items={categories} />
        </div>
      </section>

      <section className="section" aria-labelledby="pours">
        <div className="wrap">
          <div className="sec-head-row" data-reveal>
            <div className="sec-head">
              <span className="kicker">This week</span>
              <h2 id="pours">This week&apos;s pours</h2>
            </div>
            <Link className="link arrow" href="/collections/all">
              All {products.length} wines
            </Link>
          </div>
          <div className="grid" data-reveal-group>
            {featured.map((p) => (
              <ProductCard key={p.handle} product={p} />
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="regions">
        <div className="wrap">
          <div className="sec-head-row" data-reveal>
            <div className="sec-head">
              <span className="kicker">Region</span>
              <h2 id="regions">From Bordeaux to Napa</h2>
              <p>Each region has its own grapes, soils and food. Start with one you know, then try its neighbour.</p>
            </div>
            <Link className="link arrow" href="/collections">
              Every region
            </Link>
          </div>
          <div className="tiles" data-reveal-group>
            {regionTiles.map((c) => (
              <Link key={c.handle} href={`/collections/${c.handle}`} className="tile">
                <span className="tile-media">
                  <Image src={c.image!} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" />
                </span>
                <span className="tile-name">{c.title}</span>
                <span className="tile-count">
                  {count(c)} {count(c) === 1 ? "bottle" : "bottles"}
                </span>
              </Link>
            ))}
            <Link href="/collections" className="tile">
              <span className="tile-text">
                <span className="kicker">And {regions.length - regionTiles.length} more</span>
                <span className="tile-name">
                  {regions
                    .filter((c) => !regionTiles.includes(c))
                    .map((c) => c.title)
                    .join(", ")}
                </span>
              </span>
              <span className="tile-name arrow">All regions</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="story">
        <div className="wrap split">
          <div className="split-media" data-reveal>
            <Image src="/images/decanter.jpg" alt="Red wine poured from a decanter into two glasses" fill sizes="(min-width:1024px) 45vw, 100vw" />
          </div>
          <div className="split-copy" data-reveal>
            <span className="kicker">The family</span>
            <h2 id="story">
              {story.vendor}, {story.title}
            </h2>
            <p className="lede">
              We buy from families, not catalogues. The Moze-Berthon family has made wine on the Right Bank since 1820;
              their Château Maillet is a hectare and a half of Pomerol.
            </p>
            <figure className="note">
              <blockquote>{story.sommelier_note}</blockquote>
              <figcaption>From the cellar. A signed note comes with every bottle.</figcaption>
            </figure>
            <Link className="btn" href={`/products/${story.handle}`}>
              Read the full note
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="by-taste">
        <div className="wrap split split-rev">
          <div className="split-media" data-reveal>
            <Image src="/images/pour-red.jpg" alt="Red wine swirling into a glass" fill sizes="(min-width:1024px) 45vw, 100vw" />
          </div>
          <div className="split-copy" data-reveal>
            <span className="kicker">Choose by taste</span>
            <h2 id="by-taste">You don&apos;t need to know the grape</h2>
            <p className="lede">Tell us how you like a wine to feel. We&apos;ll show you the bottles that fit.</p>
            <ul className="winelist finder" style={{ width: "100%" }}>
              {TASTES.map((t) => (
                <li key={t.key}>
                  <Link href={`/collections/all?taste=${t.key}`}>
                    <span className="wl-line">
                      <span className="wl-name">{t.name}</span>
                      <span className="wl-leader" aria-hidden="true" />
                    </span>
                    <span className="wl-price arrow">
                      {products.filter((p) => (t.key === "light" ? p.body <= 2 : t.key === "medium" ? p.body === 3 : p.body >= 4)).length}
                    </span>
                    <span className="wl-sub">{t.sub}</span>
                    <TasteProfile product={t.sample} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="section section-ink" aria-labelledby="allocations">
        <div className="wrap split">
          <div className="split-media" data-reveal>
            <Image src="/images/cellar-tunnel.jpg" alt="A long cellar corridor lined with bottles" fill sizes="(min-width:1024px) 45vw, 100vw" />
          </div>
          <div className="split-copy" data-reveal>
            <span className="kicker">Few cases</span>
            <h2 id="allocations">Limited allocations</h2>
            <p className="lede">
              Small estates send us a few cases a year, not a pallet. When these are gone, they&apos;re gone until the
              next release.
            </p>
            <div style={{ width: "100%" }}>
              <WineList products={limited} />
            </div>
            <Link className="btn" href="/collections/limited">
              See the allocations
            </Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="club">
        <div className="wrap">
          <div className="sec-head-row" data-reveal>
            <div className="sec-head">
              <span className="kicker">Club Vitalità</span>
              <h2 id="club">A region in your glass every quarter</h2>
              <p>
                Members don&apos;t pay less per bottle. They get first call on small allocations, a region explained in
                depth, and a buyer who knows what they like.
              </p>
            </div>
            <Link className="btn" href="/contact?topic=membership">
              Join the waitlist
            </Link>
          </div>
          <div className="tiers" data-reveal-group>
            {TIERS.map((t) => (
              <article key={t.name} className="tier">
                <h3 className="tier-name">{t.name}</h3>
                <p className="soft">{t.en}</p>
                <ul>
                  {t.perks.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <p className="tier-price">From about {t.price} a shipment</p>
              </article>
            ))}
          </div>
          <p className="soft small" style={{ marginTop: 16 }}>
            Indicative pricing. Founding members are invited first.
          </p>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="tables">
        <div className="wrap">
          <div className="sec-head-row" data-reveal>
            <div className="sec-head">
              <span className="kicker">At the table</span>
              <h2 id="tables">Taste it at dinner first</h2>
              <p>Our producers are poured at these Ontario dining rooms. Find one you like, then bring the case home.</p>
            </div>
            <Link className="link arrow" href="/restaurants">
              Restaurants
            </Link>
          </div>
          <div className="rcards" data-reveal-group>
            {restaurants.map((r) => (
              <article key={r.slug} className="rcard">
                <Link href={`/restaurants/${r.slug}`} className="rcard-media" tabIndex={-1} aria-hidden="true">
                  {r.image && <Image src={r.image} alt="" fill sizes="(min-width:1024px) 50vw, 100vw" />}
                </Link>
                <span className="eyebrow">{r.kind}</span>
                <h3 className="h2">
                  <Link href={`/restaurants/${r.slug}`}>{r.name}</Link>
                </h3>
                <p className="soft">{r.intro}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="how">
        <div className="wrap">
          <div className="sec-head" data-reveal>
            <span className="kicker">How ordering works</span>
            <h2 id="how">Six bottles, mixed any way you like</h2>
            <p>{site.minimumExplainer}</p>
          </div>
          <ol className="steps" data-reveal-group>
            <li>
              <h3>Choose six or more</h3>
              <p>Mix reds, whites and sparkling, or take a case of one wine you love.</p>
            </li>
            <li>
              <h3>We place your order</h3>
              <p>We confirm availability and arrange the private order with the producer.</p>
            </li>
            <li>
              <h3>Delivered to your door</h3>
              <p>
                {site.deliveryNote} Free on {site.freeDeliveryBottles} bottles or more.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="letter">
        <div className="wrap signup-band">
          <div className="split-media" data-reveal>
            <Image src="/images/barrels.jpg" alt="Oak barrels stacked in a dim cellar" fill sizes="(min-width:1024px) 45vw, 100vw" />
          </div>
          <div className="split-copy" data-reveal>
            <span className="kicker">The cellar letter</span>
            <h2 id="letter">Hear about allocations first</h2>
            <ul className="perks">
              <li>New arrivals, before they go on the site</li>
              <li>Allocation alerts on wines we get a few cases of</li>
              <li>Invitations to tastings in Vaughan</li>
            </ul>
            <Newsletter />
            <p className="soft small">Unsubscribe in one click.</p>
          </div>
        </div>
      </section>
    </>
  );
}

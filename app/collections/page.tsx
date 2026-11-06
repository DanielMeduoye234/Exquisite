import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { collections, getProducts, matchesRule } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Collections",
  description: "Shop by colour, by region, or by limited allocation.",
};

export default async function CollectionsIndex() {
  const products = await getProducts();
  const count = (c: (typeof collections)[number]) => products.filter((p) => matchesRule(p, c.rule)).length;
  const styles = collections.filter((c) => c.kicker !== "Region" && c.handle !== "all");
  const regions = collections.filter((c) => c.kicker === "Region");

  return (
    <>
      <div className="wrap phead">
        <Link className="crumb" href="/">
          ← Home
        </Link>
        <span className="kicker">The cellar</span>
        <h1>Collections</h1>
        <p className="lede">Start with a colour, or travel one region at a time.</p>
      </div>

      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="regione">
        <div className="wrap">
          <div className="sec-head" data-reveal>
            <span className="kicker">Region</span>
            <h2 id="regione">By region</h2>
          </div>
          <div className="tiles" data-reveal-group>
            {regions.map((c) => (
              <Link key={c.handle} href={`/collections/${c.handle}`} className="tile">
                {c.image ? (
                  <span className="tile-media">
                    <Image src={c.image} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" />
                  </span>
                ) : (
                  <span className="tile-text">
                    <span className="kicker">{c.description}</span>
                  </span>
                )}
                <span className="tile-name">{c.title}</span>
                <span className="tile-count">
                  {count(c)} {count(c) === 1 ? "wine" : "wines"}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-tint" aria-labelledby="style">
        <div className="wrap">
          <div className="sec-head" data-reveal>
            <span className="kicker">By colour and style</span>
            <h2 id="style">By colour</h2>
          </div>
          <ul className="winelist" data-reveal>
            {styles.map((c) => (
              <li key={c.handle}>
                <Link href={`/collections/${c.handle}`}>
                  <span className="wl-line">
                    <span className="wl-name">{c.title}</span>
                    <span className="wl-leader" aria-hidden="true" />
                  </span>
                  <span className="wl-price">
                    {count(c)} {count(c) === 1 ? "wine" : "wines"}
                  </span>
                  <span className="wl-sub">{c.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

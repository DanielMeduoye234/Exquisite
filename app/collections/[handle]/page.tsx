import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CollectionBrowser, type Filters } from "@/components/CollectionBrowser";
import { collections, getCollection, getCollectionProducts } from "@/lib/catalog";

type Props = {
  params: Promise<{ handle: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Collections are a fixed list, so any other handle is a real 404 (sent before the page starts streaming).
export const dynamicParams = false;

export function generateStaticParams() {
  return collections.map((c) => ({ handle: c.handle }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = getCollection((await params).handle);
  return c ? { title: c.title, description: c.description } : {};
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function CollectionPage({ params, searchParams }: Props) {
  const [{ handle }, sp] = await Promise.all([params, searchParams]);
  const collection = getCollection(handle);
  if (!collection) notFound();
  const products = await getCollectionProducts(collection);
  const initial: Filters = {
    taste: one(sp.taste),
    type: one(sp.type),
    region: one(sp.region),
    producer: one(sp.producer),
    price: one(sp.price),
    sort: one(sp.sort),
  };

  return (
    <>
      <div className="wrap phead">
        <Link className="crumb" href="/collections">
          ← Collections
        </Link>
        <span className="kicker">{collection.kicker}</span>
        <h1>{collection.title}</h1>
        <p className="lede">{collection.description}</p>
      </div>

      <div className="wrap">
        {collection.image && (
          <div className="banner">
            <Image src={collection.image} alt="" fill priority sizes="(min-width:1280px) 1200px, 100vw" />
          </div>
        )}
        {products.length > 0 ? (
          // Keyed on the query so menu links to the same collection reset the filters.
          <CollectionBrowser key={JSON.stringify(initial)} products={products} initial={initial} />
        ) : (
          <div className="empty">
            <p className="h3">Nothing here yet.</p>
            <p className="soft">New wines from this collection are on their way.</p>
            <Link className="btn btn-ghost" href="/collections/all">
              See all wines
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

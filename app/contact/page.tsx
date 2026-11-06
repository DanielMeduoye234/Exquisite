import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Questions about an order, the membership, trade or private tastings. We reply within one business day.",
};

const FAQ = [
  { q: "Why is there a six-bottle minimum?", a: site.minimumExplainer },
  {
    q: "How long does delivery take?",
    a: `${site.deliveryNote} Delivery is free on ${site.freeDeliveryBottles} bottles or more. We email you a tracking link when your order leaves us.`,
  },
  {
    q: "Who can accept the delivery?",
    a: "An adult of legal drinking age must sign for the order and may be asked for photo ID. We can't leave wine at the door.",
  },
  {
    q: "A wine I want is sold out. Can you find it?",
    a: "Often, yes. Many of our producers release small amounts through the year. Send us the wine and vintage and we'll ask the producer directly.",
  },
  {
    q: "Do you work with restaurants?",
    a: "Yes. Choose Restaurant and trade in the form and we'll send the trade list and arrange a tasting.",
  },
];

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address.join(", "))}`;
  return (
    <>
      <div className="wrap phead">
        <Link className="crumb" href="/">
          ← Home
        </Link>
        <span className="kicker">Contact</span>
        <h1>Talk to the cellar</h1>
        <p className="lede">
          A question about an order, a bottle you can&apos;t find, or a dinner you&apos;re planning. A person reads every
          note.
        </p>
      </div>

      <div className="wrap contact-grid">
        <div style={{ display: "grid", gap: 20, alignContent: "start" }} data-reveal>
          <dl className="details">
            <div>
              <dt>Visit</dt>
              <dd>
                {site.address.map((l) => (
                  <span key={l} style={{ display: "block" }}>
                    {l}
                  </span>
                ))}
                <a className="link" href={maps} target="_blank" rel="noreferrer">
                  Get directions
                </a>
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a className="link" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </dd>
            </div>
            {site.phone && (
              <div>
                <dt>Phone</dt>
                <dd>
                  <a className="link" href={`tel:${site.phone.replace(/\D/g, "")}`}>
                    {site.phone}
                  </a>
                </dd>
              </div>
            )}
            <div>
              <dt>Hours</dt>
              <dd>{site.hours}</dd>
            </div>
          </dl>
        </div>
        <div data-reveal>
          <ContactForm topic={topic} />
        </div>
      </div>

      <section className="section section-tint" id="ordering" aria-labelledby="faq">
        <div className="wrap">
          <div className="sec-head" data-reveal>
            <span className="kicker">How ordering works</span>
            <h2 id="faq">Good questions</h2>
          </div>
          <div className="faq" data-reveal>
            {FAQ.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

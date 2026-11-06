import Link from "next/link";
import { Wordmark } from "./Brand";
import { CartButton } from "./Cart";
import { HeaderScroll } from "./HeaderScroll";
import { MegaNav } from "./MegaNav";
import { MobileNav } from "./MobileNav";
import { getNav } from "@/lib/menus";
import { site } from "@/lib/site";

// Dawn: sections/announcement-bar.liquid.
export function AnnouncementBar() {
  return (
    <div className="announce">
      <p className="wrap">
        <span>Mix any six bottles</span>
        <span className="announce-dot" aria-hidden="true" />
        <span>Free Ontario delivery on {site.freeDeliveryBottles} or more</span>
        <Link href="/contact#ordering" className="announce-link">
          How ordering works
        </Link>
      </p>
    </div>
  );
}

// Dawn: sections/header.liquid. 56px on phones: menu left, wordmark centre, cart right.
export async function Header() {
  const items = await getNav();
  return (
    <header className="header" data-header>
      <HeaderScroll />
      <div className="header-in wrap">
        <MobileNav items={items} />
        <Link href="/" className="header-logo" aria-label={`${site.name}, home`}>
          <Wordmark layout="horizontal" />
        </Link>
        <MegaNav items={items} />
        <CartButton />
      </div>
    </header>
  );
}

// Dawn: sections/footer.liquid.
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-in wrap">
        <div className="footer-brand">
          <Wordmark />
          <p className="footer-slogan">{site.slogan}</p>
        </div>
        <div className="footer-cols">
          <div>
            <h2>Shop</h2>
            <Link href="/collections/red">Red wines</Link>
            <Link href="/collections/white">White wines</Link>
            <Link href="/collections/sparkling">Sparkling and rosé</Link>
            <Link href="/collections/spirits">Grappa and amaro</Link>
            <Link href="/collections/limited">Limited allocations</Link>
          </div>
          <div>
            <h2>Visit</h2>
            <Link href="/restaurants">Restaurants</Link>
            <Link href="/contact">Contact us</Link>
            <Link href="/contact#ordering">How ordering works</Link>
            <Link href="/contact?topic=membership">Club Vitalità waitlist</Link>
          </div>
          <div>
            <h2>Find us</h2>
            <address>
              {site.address.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </address>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </div>
        </div>
      </div>
      <p className="footer-legal wrap">
        © {new Date().getFullYear()} {site.legalName} Sold only to adults of legal drinking age in their province. Please
        enjoy responsibly.
      </p>
    </footer>
  );
}

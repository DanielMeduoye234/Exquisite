import Link from "next/link";

export default function NotFound() {
  return (
    <section className="wrap lost">
      <span className="kicker">Not on the list</span>
      <h1>We can&apos;t find that page.</h1>
      <p className="soft">The bottle may have moved to another shelf.</p>
      <Link className="btn btn-ghost" href="/collections/all">
        Back to the wines
      </Link>
    </section>
  );
}

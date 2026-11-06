import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import { AgeGate, headScript } from "@/components/AgeGate";
import { ShotDefs } from "@/components/Brand";
import { CartProvider } from "@/components/Cart";
import { AnnouncementBar, Footer, Header } from "@/components/Chrome";
import { RevealObserver } from "@/components/Reveal";
import { TouchLift } from "@/components/TouchLift";
import { site } from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-instrument", display: "swap" });

// Rebuild cached pages at most every 5 minutes, so price and stock edits in Supabase show up without a redeploy.
export const revalidate = 300;

export const metadata: Metadata = {
  title: { default: `${site.name} | by Vitalita`, template: `%s | ${site.name}` },
  description: "The private cellar for Ontario. Family-estate wines from Bordeaux, Burgundy, the Loire, California and Portugal, and Italian grappa and amaro, delivered across Ontario.",
};

export const viewport: Viewport = {
  themeColor: "#F5F0E6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" className={`${display.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      <body>
        <ShotDefs />
        <CartProvider>
          <div id="shell">
            <a className="skip" href="#main">
              Skip to content
            </a>
            <AnnouncementBar />
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </div>
        </CartProvider>
        <AgeGate />
        <RevealObserver />
        <TouchLift />
      </body>
    </html>
  );
}

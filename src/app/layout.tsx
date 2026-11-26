import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { growencyUrl } from "@/lib/data/portfolio";
import "./portfolio.css";

const rethinkSans = localFont({
  src: "./fonts/rethink-sans.woff2",
  weight: "400 800",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Vidit Khedekar — GTM & software", template: "%s — Vidit Khedekar" },
  description: "I run Growency and build software. Selected work in cold outreach, Meta ads and apps.",
  authors: [{ name: "Vidit Khedekar" }],
};

export const viewport: Viewport = {
  themeColor: "#fcfaf5",
  colorScheme: "light",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={rethinkSans.className}>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <header className="site-header site-width">
          <Link className="wordmark" href="/">Vidit Khedekar<span aria-hidden="true">.</span></Link>
          <nav aria-label="Main navigation">
            <Link href="/book">Contact</Link>
            <a href={growencyUrl}>Growency <ArrowUpRight aria-hidden="true" size={15} /></a>
          </nav>
        </header>
        <main id="main" className="site-width">{children}</main>
        <footer className="site-footer site-width">
          <span>Vidit Khedekar</span>
          <a href={growencyUrl}>Growency <ArrowUpRight aria-hidden="true" size={15} /></a>
        </footer>
      </body>
    </html>
  );
}

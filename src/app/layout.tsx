import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Silkscreen, VT323 } from "next/font/google";
import "./globals.css";
import { VKOSShell } from "@/components/VKOSShell";
import { system } from "@/lib/data/system";
import { MODE_SCRIPT } from "@/lib/mode-gate";

/*
 * Three faces, split by what the interface is doing with them.
 *
 * Chicago and the Mac Terminal defaults are Apple's and cannot be served from
 * a website, so these stand in for them: a bitmap face for system chrome, a
 * phosphor terminal face for machine output, and a readable mono underneath
 * for anything long enough to actually be read.
 */

/** System chrome: labels, nav, readouts. Drawn on an 8px grid. */
const pixel = Silkscreen({
  variable: "--font-pixel",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});

/** Machine output: headings, the terminal, anything phosphor-lit. */
const term = VT323({
  variable: "--font-term",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

/** Body copy, where legibility beats period accuracy. */
const read = IBM_Plex_Mono({
  variable: "--font-read",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${system.code} — ${system.operator}`,
    template: `%s — ${system.code}`,
  },
  description:
    "VKOS/01 — the personal operating system of Vidit Khedekar. Projects, academic record, credentials and contact.",
  applicationName: system.code,
  authors: [{ name: system.operator }],
  openGraph: {
    title: `${system.code} — ${system.operator}`,
    description: system.fullName,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#08090a",
  colorScheme: "dark",
};

/**
 * Runs before first paint, and does the two things that cannot wait for React.
 *
 * It hides the interface if this session hasn't booted, which must agree with
 * src/lib/boot.ts: reduced motion skips the sequence, so the gate must not
 * engage there or the page would stay hidden. And it resolves world versus
 * low-RAM, which must happen before anything can start fetching the film.
 *
 * One script rather than two, because React warns about every script tag
 * rendered inside a component and one warning is enough.
 */
const HEAD_GATE = [
  "try{",
  "var c=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;",
  "if(!c&&sessionStorage.getItem('vkos.booted')!=='1'){",
  "document.documentElement.setAttribute('data-boot','pending')}",
  "}catch(e){}",
  MODE_SCRIPT,
].join("");

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${pixel.variable} ${term.variable} ${read.variable}`}
      /* The head gate sets data-boot and data-mode before React hydrates. */
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: HEAD_GATE }} />
      </head>
      <body className="antialiased">
        <a href="#main" className="vk-skip">
          SKIP TO CONTENT
        </a>
        <VKOSShell>{children}</VKOSShell>
      </body>
    </html>
  );
}

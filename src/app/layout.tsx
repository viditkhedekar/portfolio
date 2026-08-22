import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { VKOSShell } from "@/components/VKOSShell";
import { SystemFooter } from "@/components/SystemFooter";
import { system } from "@/lib/data/system";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${system.code} — ${system.operator}`,
    template: `%s — ${system.code}`,
  },
  description:
    "VKOS/01 — the personal operating system of Vidit Khedekar. Projects, research, finance and academic modules.",
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
 * Runs before first paint: hides the interface if this session hasn't booted.
 * Must agree with src/lib/boot.ts — reduced motion skips the sequence, so the
 * gate must not engage there or the page would stay hidden.
 */
const BOOT_GATE = [
  "try{",
  "var c=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;",
  "if(!c&&sessionStorage.getItem('vkos.booted')!=='1'){",
  "document.documentElement.setAttribute('data-boot','pending')}",
  "}catch(e){}",
].join("");

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${mono.variable}`}
      /* The boot-gate script sets data-boot before React hydrates. */
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_GATE }} />
      </head>
      <body className="antialiased">
        <a href="#main" className="vk-skip">
          SKIP TO CONTENT
        </a>
        <VKOSShell>
          {children}
          <SystemFooter />
        </VKOSShell>
      </body>
    </html>
  );
}

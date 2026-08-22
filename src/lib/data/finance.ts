import type { FinanceTopic } from "@/lib/types";

/**
 * VKOS/01 — FINANCIAL RESEARCH.
 *
 * NO LIVE MARKET DATA. The chart series below is synthetic, deterministic and
 * labelled as such in the interface. Do not present it as real prices.
 */

export const financeIntro =
  "[ ONE SHORT PARAGRAPH ON WHAT THE INTEREST IN MARKETS ACTUALLY IS, AND WHAT IS BEING STUDIED. ]";

export const topics: FinanceTopic[] = [
  {
    id: "markets",
    title: "MARKETS",
    items: ["[ TOPIC ]", "[ TOPIC ]", "[ TOPIC ]", "[ TOPIC ]"],
  },
  {
    id: "options",
    title: "OPTIONS",
    items: ["[ TOPIC ]", "[ TOPIC ]", "[ TOPIC ]"],
  },
  {
    id: "quant",
    title: "QUANTITATIVE FINANCE",
    items: ["[ TOPIC ]", "[ TOPIC ]", "[ TOPIC ]", "[ TOPIC ]"],
  },
  {
    id: "systems",
    title: "TRADING SYSTEMS",
    items: ["[ TOPIC ]", "[ TOPIC ]", "[ TOPIC ]"],
  },
  {
    id: "economics",
    title: "ECONOMICS",
    items: ["[ TOPIC ]", "[ TOPIC ]", "[ TOPIC ]"],
  },
];

/** Notes, write-ups, experience. */
export const notes: { id: string; title: string; kind: string; date: string; body: string }[] = [
  {
    id: "FN-001",
    title: "[ NOTE TITLE ]",
    kind: "RESEARCH NOTE",
    date: "[ DATE ]",
    body: "[ WHAT THIS NOTE COVERS. ]",
  },
  {
    id: "FN-002",
    title: "[ NOTE TITLE ]",
    kind: "WORK EXPERIENCE",
    date: "[ DATE ]",
    body: "[ WHAT THIS COVERED. ]",
  },
  {
    id: "FN-003",
    title: "[ NOTE TITLE ]",
    kind: "READING",
    date: "[ DATE ]",
    body: "[ WHAT THIS COVERED. ]",
  },
];

/**
 * Synthetic series for the terminal visualisation.
 * Deterministic pseudo-random walk — same output every render, no live feed.
 */
export function syntheticSeries(seed: number, length: number, drift = 0.15): number[] {
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  const out: number[] = [];
  let v = 100;
  for (let i = 0; i < length; i += 1) {
    v += (rand() - 0.5) * 4 + drift;
    out.push(v);
  }
  return out;
}

export const demoInstruments = [
  { symbol: "SYN.A", label: "[ SERIES A ]", seed: 7321, drift: 0.22 },
  { symbol: "SYN.B", label: "[ SERIES B ]", seed: 19483, drift: -0.08 },
  { symbol: "SYN.C", label: "[ SERIES C ]", seed: 55127, drift: 0.05 },
];

/** Compact bitmap marks for the file and module lists. Each item gets a stable
 * two-character face plus a small signature derived from its own key. */
export type MarkKind =
  | "app"
  | "project"
  | "archive"
  | "subject"
  | "credential"
  | "channel"
  | "achievement"
  | "interest"
  | "record"
  | "state";

type Rect = { x: number; y: number; width: number; height: number };

const FONT: Record<string, number[]> = {
  A: [2, 5, 7, 5, 5], B: [6, 5, 6, 5, 6], C: [3, 4, 4, 4, 3],
  D: [6, 5, 5, 5, 6], E: [7, 4, 6, 4, 7], F: [7, 4, 6, 4, 4],
  G: [3, 4, 5, 5, 3], H: [5, 5, 7, 5, 5], I: [7, 2, 2, 2, 7],
  J: [1, 1, 1, 5, 2], K: [5, 5, 6, 5, 5], L: [4, 4, 4, 4, 7],
  M: [5, 7, 7, 5, 5], N: [5, 7, 7, 7, 5], O: [2, 5, 5, 5, 2],
  P: [6, 5, 6, 4, 4], Q: [2, 5, 5, 7, 3], R: [6, 5, 6, 5, 5],
  S: [3, 4, 2, 1, 6], T: [7, 2, 2, 2, 2], U: [5, 5, 5, 5, 7],
  V: [5, 5, 5, 5, 2], W: [5, 5, 7, 7, 5], X: [5, 5, 2, 5, 5],
  Y: [5, 5, 2, 2, 2], Z: [7, 1, 2, 4, 7],
  0: [7, 5, 5, 5, 7], 1: [2, 6, 2, 2, 7], 2: [6, 1, 7, 4, 7],
  3: [6, 1, 3, 1, 6], 4: [5, 5, 7, 1, 1], 5: [7, 4, 6, 1, 6],
  6: [3, 4, 7, 5, 7], 7: [7, 1, 2, 2, 2], 8: [7, 5, 7, 5, 7],
  9: [7, 5, 7, 1, 6],
};

const CODES: Record<string, string> = {
  projects: "PR", school: "SC", certifications: "CE", about: "AB",
  contact: "CO", archive: "AR", system: "SY", terminal: "TR",
  "PX-001": "GK", "PX-002": "PQ", "PX-003": "TX", "PX-004": "BO",
  "PX-005": "KY", "PX-010": "GW",
  email: "EM", linkedin: "IN", github: "GH",
  growency: "GW", "kairos-health": "KH", "posting-machine": "PM", corsair: "CS",
};

const COLORS: Record<MarkKind, string> = {
  app: "#aee83c",
  project: "#aee83c",
  archive: "#848b92",
  subject: "#6aa9f0",
  credential: "#e8c53c",
  channel: "#71d5c0",
  achievement: "#b79cf5",
  interest: "#e9eaec",
  record: "#9aa0a6",
  state: "#aee83c",
};

const PROJECT_COLORS: Record<string, string> = {
  "PX-001": "#aee83c",
  "PX-002": "#71d5c0",
  "PX-003": "#6aa9f0",
  "PX-004": "#e8c53c",
  "PX-005": "#b79cf5",
  "PX-010": "#e9966b",
};

function codeFor(key: string, label: string): string {
  if (CODES[key]) return CODES[key];
  if (/^CERT-\d+$/.test(key)) return key.slice(-2);
  if (/^PX-\d+$/.test(key)) return key.slice(-2);
  const words = label.toUpperCase().match(/[A-Z0-9]+/g) ?? [];
  if (words.length > 1) return `${words[0]?.[0] ?? "X"}${words[1]?.[0] ?? "X"}`;
  return (words[0] ?? "??").slice(0, 2).padEnd(2, "X");
}

function hash(key: string): number {
  let value = 2166136261;
  for (const char of key) {
    value ^= char.charCodeAt(0);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export function markArt(key: string, label: string, kind: MarkKind) {
  const code = codeFor(key, label);
  const color = PROJECT_COLORS[key] ?? COLORS[kind];
  const seed = hash(`${kind}:${key}`);
  const rects: Rect[] = [];

  for (let letter = 0; letter < 2; letter++) {
    const rows = FONT[code[letter]] ?? FONT.X;
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        if (rows[row] & (1 << (2 - col))) {
          rects.push({ x: 10 + letter * 16 + col * 4, y: 12 + row * 4, width: 3, height: 3 });
        }
      }
    }
  }

  // The four-cell footer gives otherwise identical initials a distinct signature.
  for (let bit = 0; bit < 4; bit++) {
    if ((seed >>> bit) & 1) rects.push({ x: 29 + bit * 4, y: 39, width: 3, height: 2 });
  }

  return { color, rects };
}

export function renderMarkSvg(key: string, label: string, kind: MarkKind): string {
  const { color, rects } = markArt(key, label, kind);
  const pixels = rects
    .map(({ x, y, width, height }) => `<rect x="${x}" y="${y}" width="${width}" height="${height}"/>`)
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" shape-rendering="crispEdges"><rect width="48" height="48" rx="4" fill="#08090a"/><rect x=".5" y=".5" width="47" height="47" rx="3.5" fill="none" stroke="#30372b"/><g fill="${color}"><rect x="6" y="6" width="8" height="2"/>${pixels}</g></svg>`;
}

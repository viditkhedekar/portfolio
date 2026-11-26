import type { Channel } from "@/lib/types";

/**
 * VKOS/01 — IDENTITY + COMMUNICATIONS.
 *
 * The About module is the one place on this site with a human voice.
 */

export const identity = {
  name: "VIDIT KHEDEKAR",
  role: "STUDENT / BUILDER",
  age: 15,
  based: "LONDON, UNITED KINGDOM",
  interests: ["PURE MATHEMATICS", "ECONOMICS", "FINANCE", "AI / ML"],
  /** Rendered as the lead paragraph, larger than the rest. */
  statement:
    "Highly driven student who will do anything to get the job done right. Keen interest in mathematics and finance with a high level of analytical thinking and problem solving ability.",
  blocks: [
    { label: "WHAT I BUILD", body: "Anything a client wishes me to." },
    {
      label: "WHAT I'M INTERESTED IN",
      body: "Pure mathematics, economics, finance, AI and machine learning.",
    },
    {
      label: "WHAT I'M LEARNING",
      body: "Niches in financial markets, such as the maths behind derivative trading. The nature of AI and machine learning.",
    },
  ],
  /** Short factual rows for the identity file table. */
  records: [
    { key: "NAME", value: "VIDIT KHEDEKAR" },
    { key: "AGE", value: "15" },
    { key: "ROLE", value: "STUDENT / BUILDER" },
    { key: "LEVEL", value: "GCSE" },
    { key: "LOCATION", value: "LONDON, UNITED KINGDOM" },
    { key: "STATUS", value: "ACTIVE" },
  ],
};

/**
 * Contact channels.
 * Any channel left with an empty href renders as UNCONFIGURED rather than as
 * a broken link.
 */
export const channels: Channel[] = [
  {
    id: "email",
    label: "EMAIL",
    handle: "vidit.khedekar.work@gmail.com",
    href: "mailto:vidit.khedekar.work@gmail.com",
    primary: true,
  },
  {
    id: "linkedin",
    label: "LINKEDIN",
    handle: "in/vidit-khedekar",
    href: "https://www.linkedin.com/in/vidit-khedekar/",
  },
  {
    id: "github",
    label: "GITHUB",
    handle: "viditkhedekar",
    href: "https://github.com/viditkhedekar/",
  },
  {
    id: "x",
    label: "X",
    handle: "@vidkhe",
    href: "https://x.com/vidkhe",
  },
];

/** Convenience accessor — the GitHub link is surfaced outside the contact module. */
export const githubUrl =
  channels.find((c) => c.id === "github")?.href ?? "";

export const contactNote =
  "Open to project work, collaboration and questions. Email is the fastest route.";

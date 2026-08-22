import type { Channel } from "@/lib/types";

/**
 * VKOS/01 — IDENTITY + COMMUNICATIONS.
 *
 * The About module is the one place on this site with a human voice.
 * The statement blocks below are deliberately empty — write them yourself.
 */

export const identity = {
  name: "VIDIT KHEDEKAR",
  role: "STUDENT / BUILDER",
  age: 15,
  based: "[ LOCATION ]",
  interests: ["MATHEMATICS", "SOFTWARE", "FINANCE", "AI"],
  /** Rendered as the lead paragraph, larger than the rest. */
  statement: "[ WRITE THE OPENING LINE HERE. ONE OR TWO SENTENCES ON WHO YOU ARE. ]",
  blocks: [
    { label: "WHAT I BUILD", body: "[ WRITE THIS. ]" },
    { label: "WHAT I'M INTERESTED IN", body: "[ WRITE THIS. ]" },
    { label: "WHAT I'M LEARNING", body: "[ WRITE THIS. ]" },
    { label: "WHAT I WANT TO EXPLORE", body: "[ WRITE THIS. ]" },
  ],
  /** Short factual rows for the identity file table. */
  records: [
    { key: "NAME", value: "VIDIT KHEDEKAR" },
    { key: "AGE", value: "15" },
    { key: "ROLE", value: "STUDENT / BUILDER" },
    { key: "LEVEL", value: "GCSE" },
    { key: "LOCATION", value: "[ LOCATION ]" },
    { key: "STATUS", value: "ACTIVE" },
  ],
};

/**
 * Contact channels.
 * NOTE: these publish contact details for a 15-year-old. Fill in only what
 * should genuinely be public. Any channel left with an empty href renders as
 * UNCONFIGURED rather than as a broken link.
 */
export const channels: Channel[] = [
  { id: "email", label: "EMAIL", handle: "[ EMAIL ADDRESS ]", href: "", primary: true },
  { id: "linkedin", label: "LINKEDIN", handle: "[ PROFILE ]", href: "" },
  { id: "github", label: "GITHUB", handle: "[ USERNAME ]", href: "" },
];

export const contactNote =
  "[ OPTIONAL: ONE LINE ON WHAT YOU'D LIKE TO BE CONTACTED ABOUT. ]";

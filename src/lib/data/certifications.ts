import type { Certification, CertificationGroup } from "@/lib/types";

/**
 * VKOS/01 — CREDENTIAL DATABASE.
 *
 * Records are grouped by provider. Drop evidence files into
 * /public/certifications/ and point `evidence` at them.
 */

export const certificationGroups: CertificationGroup[] = [
  {
    id: "investin",
    provider: "INVESTIN",
    items: [
      {
        id: "CERT-001",
        name: "Young Investment Banker Work Experience",
        issuer: "InvestIn",
      },
    ],
  },
  {
    id: "coursera",
    provider: "COURSERA",
    items: [
      {
        id: "CERT-002",
        name: "Crash Course on Python",
        issuer: "Google",
        summary: "Delivered by Google on Coursera.",
      },
    ],
  },
  {
    id: "bcg",
    provider: "BCG",
    items: [
      {
        id: "CERT-003",
        name: "Introduction to Strategy Consulting",
        issuer: "BCG",
        summary: "Job simulation.",
      },
    ],
  },
  {
    id: "lloyds",
    provider: "LLOYDS BANKING GROUP",
    items: [
      {
        id: "CERT-004",
        name: "Legal Work Experience",
        issuer: "Lloyds Banking Group",
        summary: "Two-day programme.",
      },
    ],
  },
  {
    id: "amplifyme",
    provider: "AMPLIFYME",
    note: "Finance simulations run with investment banks.",
    items: [
      {
        id: "CERT-005",
        name: "Finance Accelerator",
        issuer: "AmplifyME",
        summary: "Run with Morgan Stanley and UBS.",
      },
      {
        id: "CERT-006",
        name: "M&A Finance Accelerator",
        issuer: "AmplifyME",
        summary: "Run with UBS.",
      },
    ],
  },
  {
    id: "springpod",
    provider: "SPRINGPOD",
    note: "Virtual work experience programmes.",
    items: [
      {
        id: "CERT-007",
        name: "Legal Careers with TLT",
        issuer: "Springpod",
        summary: "Virtual work experience.",
      },
      {
        id: "CERT-008",
        name: "Investment Banking",
        issuer: "Springpod",
        summary: "Virtual work experience.",
      },
      {
        id: "CERT-009",
        name: "Technology",
        issuer: "Springpod",
        summary: "Virtual work experience.",
      },
    ],
  },
  {
    id: "etonx",
    provider: "ETONX",
    note: "Online courses run by Eton College.",
    items: [
      { id: "CERT-010", name: "Public Speaking", issuer: "EtonX" },
      { id: "CERT-011", name: "Critical Thinking", issuer: "EtonX" },
      { id: "CERT-012", name: "Study Skills", issuer: "EtonX" },
    ],
  },
];

/** Flat view — used for counts and lookups. */
export const certifications: Certification[] = certificationGroups.flatMap(
  (g) => g.items,
);

export function getCertification(id: string): Certification | undefined {
  return certifications.find((c) => c.id.toLowerCase() === id.toLowerCase());
}

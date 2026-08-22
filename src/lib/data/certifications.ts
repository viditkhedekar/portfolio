import type { Certification } from "@/lib/types";

/**
 * VKOS/01 — CREDENTIAL DATABASE.
 *
 * Placeholder records. Add real credentials only.
 * Drop evidence files into /public/certifications/ and point `evidence` at them.
 */

export const certifications: Certification[] = [
  {
    id: "CERT-001",
    name: "[ CREDENTIAL NAME ]",
    issuer: "[ ISSUING BODY ]",
    issued: "2026",
    credentialId: "[ ID ]",
    summary: "[ WHAT THIS CREDENTIAL COVERS. ]",
    evidence: "",
    evidenceKind: "pdf",
    verifyUrl: "",
  },
  {
    id: "CERT-002",
    name: "[ CREDENTIAL NAME ]",
    issuer: "[ ISSUING BODY ]",
    issued: "2026",
    credentialId: "[ ID ]",
    summary: "[ WHAT THIS CREDENTIAL COVERS. ]",
    evidence: "",
    evidenceKind: "pdf",
  },
  {
    id: "CERT-003",
    name: "[ CREDENTIAL NAME ]",
    issuer: "[ ISSUING BODY ]",
    issued: "2025",
    credentialId: "[ ID ]",
    summary: "[ WHAT THIS CREDENTIAL COVERS. ]",
    evidence: "",
    evidenceKind: "image",
  },
  {
    id: "CERT-004",
    name: "[ CREDENTIAL NAME ]",
    issuer: "[ ISSUING BODY ]",
    issued: "2025",
    credentialId: "[ ID ]",
    summary: "[ WHAT THIS CREDENTIAL COVERS. ]",
    evidence: "",
  },
];

export function getCertification(id: string): Certification | undefined {
  return certifications.find((c) => c.id.toLowerCase() === id.toLowerCase());
}

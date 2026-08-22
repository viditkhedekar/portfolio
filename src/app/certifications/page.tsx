import type { Metadata } from "next";
import { CertificationModule } from "@/components/modules/CertificationModule";

export const metadata: Metadata = {
  title: "Certifications",
  description: "CREDENTIAL DATABASE — certifications and supporting documents.",
};

export default function CertificationsPage() {
  return <CertificationModule />;
}

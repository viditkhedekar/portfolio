import type { Metadata } from "next";
import { ContactModule } from "@/components/modules/ContactModule";

export const metadata: Metadata = {
  title: "Contact",
  description: "COMMUNICATIONS SYSTEM — available channels.",
};

export default function ContactPage() {
  return <ContactModule />;
}

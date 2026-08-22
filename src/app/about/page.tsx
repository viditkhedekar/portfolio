import type { Metadata } from "next";
import { AboutModule } from "@/components/modules/AboutModule";

export const metadata: Metadata = {
  title: "About",
  description: "IDENTITY FILE — who Vidit Khedekar is and what he's building.",
};

export default function AboutPage() {
  return <AboutModule />;
}

import type { Metadata } from "next";
import { SchoolModule } from "@/components/modules/SchoolModule";

export const metadata: Metadata = {
  title: "School",
  description: "ACADEMIC SYSTEM — subjects, record and independent research.",
};

export default function SchoolPage() {
  return <SchoolModule />;
}

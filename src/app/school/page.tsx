import type { Metadata } from "next";
import { SchoolModule } from "@/components/modules/SchoolModule";

export const metadata: Metadata = {
  title: "School",
  description: "ACADEMIC SYSTEM — subjects, qualifications, awards and achievements.",
};

export default function SchoolPage() {
  return <SchoolModule />;
}

import type { Metadata } from "next";
import { FinanceModule } from "@/components/modules/FinanceModule";

export const metadata: Metadata = {
  title: "Finance",
  description:
    "FINANCIAL RESEARCH — markets, options, quantitative finance and trading systems.",
};

export default function FinancePage() {
  return <FinanceModule />;
}

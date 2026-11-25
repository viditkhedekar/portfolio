import { GtmOpening } from "@/components/GtmOpening";
import { ClientList } from "@/components/PortfolioMedia";
import { portfolioWorkPanels } from "@/components/PortfolioWorkPanels";
import "./gtm-opening.css";

export default function Home() {
  return <GtmOpening panels={portfolioWorkPanels()} clients={<ClientList />} />;
}

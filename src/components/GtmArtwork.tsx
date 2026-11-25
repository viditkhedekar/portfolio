"use client";

import Image from "next/image";
import { topicArtwork, type PortfolioTopic } from "@/lib/data/portfolio";

const sizes = "(max-width: 1600px) 32vw, 512px";

export function GtmArtwork({ id }: { id: PortfolioTopic }) {
  const { felt, glass } = topicArtwork(id);

  return (
    <span className="gtm-material">
      <span className="gtm-artwork">
        <span className="gtm-felt">
          <Image
            src={felt}
            alt=""
            fill
            sizes={sizes}
            loading="eager"
            onLoad={(event) => {
              event.currentTarget.closest("[data-gtm-topic]")?.setAttribute("data-art-ready", "true");
            }}
          />
        </span>
        <span className="gtm-glass">
          <Image
            src={glass}
            alt=""
            fill
            sizes={sizes}
            loading="eager"
            fetchPriority="low"
            onLoad={(event) => {
              event.currentTarget.closest("[data-gtm-topic]")?.setAttribute("data-glass-ready", "true");
            }}
          />
        </span>
      </span>
    </span>
  );
}

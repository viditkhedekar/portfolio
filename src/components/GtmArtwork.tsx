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
          {id === "outreach" && (
            <>
              <span className="gtm-envelope-pocket" />
              <span className="gtm-envelope-letter" />
              <span className="gtm-envelope-flap"><Image src={felt} alt="" fill sizes={sizes} /></span>
            </>
          )}
          {id === "meta" && (
            <span className="gtm-camera-lens"><Image src={felt} alt="" fill sizes={sizes} /></span>
          )}
          {id === "apps" && (
            <>
              <span className="gtm-app-tile gtm-app-tile-main"><Image src={felt} alt="" fill sizes={sizes} /></span>
              <span className="gtm-app-tile gtm-app-tile-small"><Image src={felt} alt="" fill sizes={sizes} /></span>
            </>
          )}
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

"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { gtmOutlines } from "@/lib/data/gtm-outlines";
import { topicArtwork, type PortfolioTopic } from "@/lib/data/portfolio";

const sizes = "(max-width: 1600px) 32vw, 512px";

export function GtmArtwork({ id }: { id: PortfolioTopic | "home" }) {
  const felt = id === "home" ? "/carousel/home.webp" : topicArtwork(id).felt;
  const { silhouette, details } = gtmOutlines[id];

  return (
    <span className="gtm-material">
      <span className="gtm-artwork">
        <Image
          src={felt}
          className="gtm-felt"
          alt=""
          fill
          sizes={id === "home" ? "(max-width: 800px) 13vw, 115px" : sizes}
          loading="eager"
          onLoad={(event) => {
            event.currentTarget.closest(".gtm-home, [data-gtm-topic]")?.setAttribute("data-art-ready", "true");
          }}
        />
        <svg className="gtm-outline" viewBox="0 0 960 960" fill="none" stroke="currentColor" strokeWidth="13" strokeLinecap="round" strokeLinejoin="round" focusable="false">
          <path d={silhouette} pathLength="1" />
          {details.map((detail, index) => (
            <path className="gtm-outline-detail" key={detail} d={detail} pathLength="1" style={{ "--gtm-detail-delay": `${160 + index * 34}ms` } as CSSProperties} />
          ))}
        </svg>
      </span>
    </span>
  );
}

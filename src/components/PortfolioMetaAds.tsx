"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useId, useRef, useState, type CSSProperties } from "react";
import { MetaReel } from "@/components/MetaReel";
import { MetaServices } from "@/components/MetaServices";
import { growencySpecAds } from "@/lib/data/growency-spec-ads";
import "@/app/portfolio-showcase.css";
import "@/app/meta-portfolio.css";

export function PortfolioMetaAds() {
  const track = useRef<HTMLUListElement>(null);
  const trackId = useId();
  const servicesId = useId();
  const [position, setPosition] = useState({ start: true, end: false });

  function move(direction: -1 | 1) {
    const list = track.current;
    const first = list?.firstElementChild as HTMLLIElement | null;
    if (!list || !first) return;
    const slides = Array.from(list.querySelectorAll("li"));
    const offsets = slides.map((slide) => slide.offsetLeft - first.offsetLeft);
    const left = direction === 1
      ? offsets.find((offset) => offset > list.scrollLeft + 3)
      : offsets.findLast((offset) => offset < list.scrollLeft - 3);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({ left: left ?? 0, behavior: reducedMotion ? "instant" : "smooth" });
  }

  return (
    <div className="showcase meta-showcase">
      <header className="showcase-heading">
        <h2>Meta Ads</h2>
        <p>I build and test Facebook and Instagram campaigns at Growency.</p>
      </header>

      <section className="showcase-carousel" aria-label="Sample ads">
        <div className="showcase-carousel-header">
          <h3>Sample ads</h3>
          <div className="showcase-controls">
            <button type="button" aria-label="Previous ad" aria-controls={trackId} disabled={position.start} onClick={() => move(-1)}><ArrowLeft size={19} aria-hidden="true" /></button>
            <button type="button" aria-label="Next ad" aria-controls={trackId} disabled={position.end} onClick={() => move(1)}><ArrowRight size={19} aria-hidden="true" /></button>
          </div>
        </div>
        <ul
          className="showcase-track"
          id={trackId}
          ref={track}
          tabIndex={0}
          aria-label="Growency’s 13 sample ads"
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
            event.preventDefault();
            move(event.key === "ArrowLeft" ? -1 : 1);
          }}
          onScroll={(event) => {
            const { scrollLeft, scrollWidth, clientWidth } = event.currentTarget;
            const start = scrollLeft < 3;
            const end = scrollLeft >= scrollWidth - clientWidth - 3;
            setPosition((last) => last.start === start && last.end === end ? last : { start, end });
          }}
        >
          {growencySpecAds.map(({ id, src, width, height, alt, title, note }, index) => (
            <li key={id} style={{ "--ad-order": Math.min(index, 3) } as CSSProperties}>
              <figure>
                <Image src={src} width={width} height={height} sizes="(max-width: 650px) 72vw, 350px" alt={alt} loading={index < 2 ? "eager" : "lazy"} />
                <figcaption>
                  <strong>{title}</strong>
                  <small>{note}</small>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </section>

      <MetaReel servicesId={servicesId} />
      <MetaServices id={servicesId} />
    </div>
  );
}

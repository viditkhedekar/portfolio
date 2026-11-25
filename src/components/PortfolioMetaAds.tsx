"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useId, useRef, useState } from "react";
import { growencyAds } from "@/lib/data/portfolio";
import "@/app/portfolio-showcase.css";

export function PortfolioMetaAds() {
  const track = useRef<HTMLUListElement>(null);
  const trackId = useId();
  const [slide, setSlide] = useState(0);

  function goTo(index: number) {
    const list = track.current;
    if (!list) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    list.scrollTo({
      left: index === 0 ? 0 : list.scrollWidth - list.clientWidth,
      behavior: reducedMotion ? "instant" : "smooth",
    });
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
            <button type="button" aria-label="Previous ad" aria-controls={trackId} disabled={slide === 0} onClick={() => goTo(0)}><ArrowLeft size={19} aria-hidden="true" /></button>
            <button type="button" aria-label="Next ad" aria-controls={trackId} disabled={slide === 1} onClick={() => goTo(1)}><ArrowRight size={19} aria-hidden="true" /></button>
          </div>
        </div>
        <ul
          className="showcase-track"
          id={trackId}
          ref={track}
          tabIndex={0}
          aria-label="Two Moonshot Luna ad concepts"
          onScroll={(event) => {
            const { scrollLeft, scrollWidth, clientWidth } = event.currentTarget;
            setSlide(scrollLeft > (scrollWidth - clientWidth) / 2 ? 1 : 0);
          }}
        >
          {growencyAds.map(({ src, alt, label }) => (
            <li key={src}>
              <figure>
                <Image src={src} width={880} height={1100} sizes="(max-width: 650px) 78vw, (max-width: 1050px) 56vw, 540px" alt={alt} />
                <figcaption>{label}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="showcase-caption">Moonshot Luna · Growency spec work</p>
      </section>
      <section className="showcase-reel" aria-label="Creative reel">
        <h3>Creative reel</h3>
        <video
          aria-label="Growency spec ad reel"
          controls
          playsInline
          preload="none"
          width={1600}
          height={900}
          poster="/projects/growency/spec-reel.jpg"
        >
          <source src="/projects/growency/spec-reel.mp4" type="video/mp4" />
          <a href="/projects/growency/spec-reel.mp4">Watch the creative reel</a>
        </video>
      </section>
    </div>
  );
}

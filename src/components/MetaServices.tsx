"use client";

import Image from "next/image";
import { ArrowRight, ArrowUpRight, ChartNoAxesCombined, Crosshair, Gauge, Layers3 } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { growencySpecAds } from "@/lib/data/growency-spec-ads";
import { growencyClients, growencyUrl } from "@/lib/data/portfolio";

const creatives = growencySpecAds.filter(({ id }) => id.startsWith("moonshot-"));
const costs = ["£14.20", "£8.10", "£11.30"];
const book = new URL("book", growencyUrl).href;

function CreativeCard() {
  const [selected, setSelected] = useState(0);
  const selectedAd = creatives[selected];

  function next() {
    setSelected((index) => (index + 1) % creatives.length);
  }

  function preview(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "mouse" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) next();
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setSelected((index) => (index + (event.key === "ArrowRight" ? 1 : creatives.length - 1)) % creatives.length);
  }

  return (
    <article className="meta-tile">
      <Layers3 size={22} strokeWidth={1.6} aria-hidden="true" />
      <h4>Creative development</h4>
      <p>We make different hooks, formats and concepts to give each test a clear question.</p>
      <div className="meta-creative-deck" onPointerEnter={preview} aria-label="Moonshot Luna jewellery spec ads">
        {creatives.map((ad, index) => (
          <Image
            key={ad.id}
            className="meta-creative-art"
            data-slot={(index - selected + creatives.length) % creatives.length}
            src={ad.src}
            alt={ad.alt}
            aria-hidden={index !== selected}
            width={ad.width}
            height={ad.height}
            sizes="164px"
          />
        ))}
      </div>
      <div className="meta-creative-controls">
        <a href={selectedAd.src} target="_blank" rel="noreferrer">View ad <ArrowUpRight size={14} aria-hidden="true" /></a>
        <button type="button" onClick={next} onKeyDown={navigate}>Next ad <ArrowRight size={14} aria-hidden="true" /></button>
      </div>
      <span className="visually-hidden" role="status">{selectedAd.title}</span>
    </article>
  );
}

export function MetaServices({ id }: { id: string }) {
  const bento = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const grid = bento.current;
    if (!grid || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("meta-tile-enter");
        observer.unobserve(entry.target);
      }
    }, { threshold: .1 });
    for (const tile of grid.children) observer.observe(tile);
    return () => observer.disconnect();
  }, []);

  return (
    <section id={id} className="meta-services">
      <header className="meta-services-heading">
        <h3>We manage your Facebook and Instagram ad campaigns.</h3>
        <p>We create the ads, manage the campaigns and use the results to decide what to push.</p>
      </header>
      <div ref={bento} className="meta-bento">
        <article className="meta-tile">
          <Crosshair size={22} strokeWidth={1.6} aria-hidden="true" />
          <h4>Campaign strategy</h4>
          <p>We turn your goal into a plan for who to reach, what to say and what a result is worth.</p>
          <div className="meta-mini">
            <h5>Example launch brief</h5>
            <dl>
              <div><dt>Audience</dt><dd>Busy iPhone users</dd></div>
              <div><dt>Goal</dt><dd>Build a qualified waitlist</dd></div>
              <div><dt>Measure</dt><dd>Cost per sign-up</dd></div>
            </dl>
          </div>
        </article>

        <CreativeCard />

        <article className="meta-tile">
          <ChartNoAxesCombined size={22} strokeWidth={1.6} aria-hidden="true" />
          <h4>Testing &amp; measurement</h4>
          <p>Compare the cost per result across creatives and use it to plan the next test.</p>
          <div className="meta-mini">
            <h5>Example cost per purchase</h5>
            <ul className="meta-results">
              {creatives.map((ad, index) => (
                <li key={ad.id}>
                  <Image src={ad.src} alt="" width={32} height={40} sizes="32px" />
                  <span>Ad {String.fromCharCode(65 + index)}</span>
                  <strong>{costs[index]}</strong>
                </li>
              ))}
            </ul>
          </div>
        </article>

        <article className="meta-tile">
          <Gauge size={22} strokeWidth={1.6} aria-hidden="true" />
          <h4>Budget allocation</h4>
          <p>Give proven ads more budget and keep a portion for new ideas.</p>
          <div className="meta-mini">
            <h5>Example £240 budget</h5>
            <div className="meta-budget-bar" aria-hidden="true"><span /><span /></div>
            <dl>
              <div><dt>Scale</dt><dd>£180</dd></div>
              <div><dt>Test</dt><dd>£60</dd></div>
            </dl>
          </div>
        </article>

        <figure className="meta-tile meta-quote">
          <blockquote>“We cut what doesn’t work and pump more into what the data says is working.”</blockquote>
          <figcaption>Vidit Khedekar, COO of Growency</figcaption>
        </figure>

        <section className="meta-tile meta-clients">
          <h4>Worked with</h4>
          <ul>
            {growencyClients.map(({ name, detail, href, logo }) => (
              <li key={name}>
                <a href={href}>
                  <Image src={`/projects/growency/logos/${logo.file}.webp`} width={logo.width} height={logo.height} alt={logo.wordmark ? name : ""} />
                  {!logo.wordmark && <span>{name}</span>}
                </a>
                {detail && <small>{detail}</small>}
              </li>
            ))}
          </ul>
        </section>

        <section className="meta-tile meta-pricing">
          <h4>Pricing</h4>
          <p className="meta-monthly">From <strong>£999</strong> per month</p>
          <p>We’ll agree on the campaign scope, test budget and success criteria before launch.</p>
          <a className="work-link" href={book}>Talk through your budget <ArrowUpRight size={16} aria-hidden="true" /></a>
        </section>

        <section className="meta-tile meta-faq">
          <h4>FAQs</h4>
          <details name={`${id}-faq`}>
            <summary>What do you test?</summary>
            <p>We start with what we most need to learn, such as which hook gets attention or which offer converts.</p>
          </details>
          <details name={`${id}-faq`}>
            <summary>When do you scale an ad?</summary>
            <p>When it delivers enough conversions within our cost target and holds that cost as spending increases.</p>
          </details>
          <details name={`${id}-faq`}>
            <summary>How do we get started?</summary>
            <p>Tell us what you sell, who buys it and what the campaign needs to achieve. We’ll use any results you already have to plan the first tests.</p>
          </details>
        </section>
      </div>
    </section>
  );
}

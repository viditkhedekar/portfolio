"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ChartNoAxesCombined, Crosshair, Gauge, Layers3, Pause, Play } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { growencySpecAds } from "@/lib/data/growency-spec-ads";

const creatives = growencySpecAds.filter(({ id }) => id.startsWith("moonshot-"));
const costs = ["£14.20", "£8.10", "£11.30"];
const monthlyPrice = 999;
const quote = "“We cut what doesn’t work and pump more into what the data says is working.”";

function CreativeCard() {
  const card = useRef<HTMLElement>(null);
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = card.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let timer: number | undefined;

    function sync() {
      window.clearInterval(timer);
      if (!visible || document.hidden || motion.matches || paused) return;
      timer = window.setInterval(() => setSelected((index) => (index + 1) % creatives.length), 3500);
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.intersectionRatio >= .25;
      sync();
    }, { threshold: .25 });
    observer.observe(element);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      window.clearInterval(timer);
      observer.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, [paused]);

  return (
    <article ref={card} className="meta-tile meta-creative">
      <Layers3 size={22} strokeWidth={1.6} aria-hidden="true" />
      <h4>Creative development</h4>
      <p>We make different hooks, formats and concepts to give each test a clear question.</p>
      <div className="meta-creative-deck" aria-label="Moonshot Luna jewellery spec ads">
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
            sizes="180px"
          />
        ))}
      </div>
      <div className="meta-creative-caption">
        <small>{creatives[0].note}</small>
        <button type="button" className="meta-creative-pause" aria-label={paused ? "Resume creative rotation" : "Pause creative rotation"} onClick={() => setPaused(!paused)}>
          {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}
        </button>
      </div>
    </article>
  );
}

export function MetaServices() {
  const faqGroup = useId();
  const bento = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const grid = bento.current;
    if (!grid || !("IntersectionObserver" in window)) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return;

    const tiles = Array.from(grid.querySelectorAll<HTMLElement>(".meta-tile"));
    const price = grid.querySelector<HTMLElement>("[data-meta-price]");
    const quoteLine = grid.querySelector<HTMLElement>("[data-meta-quote]");
    const timers: number[] = [];
    const animations = new Map<HTMLElement, number>();
    const order = new Map(tiles.map((tile, index) => [tile, index]));

    function animateText(element: HTMLElement, duration: number, delay: number, render: (progress: number) => string) {
      timers.push(window.setTimeout(() => {
        let start: number | undefined;
        function draw(now: number) {
          start ??= now;
          const progress = Math.min((now - start) / duration, 1);
          element.textContent = render(progress);
          if (progress < 1) animations.set(element, window.requestAnimationFrame(draw));
          else animations.delete(element);
        }
        animations.set(element, window.requestAnimationFrame(draw));
      }, delay));
    }

    const observer = new IntersectionObserver((entries) => {
      const entering = entries.filter(({ isIntersecting }) => isIntersecting)
        .map(({ target }) => target as HTMLElement)
        .sort((a, b) => (order.get(a) ?? 0) - (order.get(b) ?? 0));
      entering.forEach((tile, index) => {
        const delay = Math.min(index, 3) * 145;
        tile.style.setProperty("--reveal-delay", delay + "ms");
        tile.dataset.entered = "";
        observer.unobserve(tile);
        if (tile.contains(price) && price) animateText(price, 1700, delay + 240, (t) => "£" + Math.round(monthlyPrice * (1 - (1 - t) ** 2)));
        if (tile.contains(quoteLine) && quoteLine) animateText(quoteLine, 1850, delay + 230, (t) => quote.slice(0, Math.round(quote.length * t)));
      });
    }, { threshold: .18, rootMargin: "0px 0px -5%" });

    function stop() {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      animations.forEach((frame) => window.cancelAnimationFrame(frame));
      delete grid!.dataset.motion;
      if (price) price.textContent = "£" + monthlyPrice;
      if (quoteLine) quoteLine.textContent = quote;
    }
    grid.dataset.motion = "";
    if (price) price.textContent = "£0";
    if (quoteLine) quoteLine.textContent = "";
    tiles.forEach((tile) => observer.observe(tile));
    motion.addEventListener("change", stop);
    return () => {
      motion.removeEventListener("change", stop);
      stop();
      tiles.forEach((tile) => {
        delete tile.dataset.entered;
        tile.style.removeProperty("--reveal-delay");
      });
    };
  }, []);

  return (
    <section className="meta-services">
      <header className="meta-services-heading">
        <h3>We manage your Facebook and Instagram ad campaigns.</h3>
        <p>We create the ads, manage the campaigns and use the results to decide what to push.</p>
      </header>
      <div ref={bento} className="meta-bento">
        <article className="meta-tile meta-strategy">
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

        <article className="meta-tile meta-testing">
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

        <article className="meta-tile meta-budget">
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
          <blockquote>
            <span className="visually-hidden">{quote}</span>
            <span className="meta-quote-measure" aria-hidden="true">{quote}</span>
            <span className="meta-quote-text" aria-hidden="true" data-meta-quote>{quote}</span>
          </blockquote>
          <figcaption>Vidit Khedekar, COO of Growency</figcaption>
        </figure>

        <section className="meta-tile meta-pricing">
          <h4>Pricing</h4>
          <p className="meta-monthly">From <strong><span aria-hidden="true" data-meta-price>£{monthlyPrice}</span><span className="visually-hidden">£{monthlyPrice}</span></strong> per month</p>
          <p>We’ll agree on the campaign scope, test budget and success criteria before launch.</p>
          <Link className="work-link" href="/book">Talk through your budget <ArrowUpRight size={16} aria-hidden="true" /></Link>
        </section>

        <section className="meta-tile meta-faq">
          <h4>FAQs</h4>
          <details name={faqGroup}>
            <summary>What do you test?</summary>
            <p>We start with what we most need to learn, such as which hook gets attention or which offer converts.</p>
          </details>
          <details name={faqGroup}>
            <summary>When do you scale an ad?</summary>
            <p>When it delivers enough conversions within our cost target and holds that cost as spending increases.</p>
          </details>
          <details name={faqGroup}>
            <summary>How do we get started?</summary>
            <p>Tell us what you sell, who buys it and what the campaign needs to achieve. We’ll use any results you already have to plan the first tests.</p>
          </details>
        </section>
      </div>
    </section>
  );
}

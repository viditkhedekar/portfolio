"use client";

import { useEffect, useRef, type ReactNode } from "react";

const pounds = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

export function OutreachMotion({ children, monthlyPrice }: { children: ReactNode; monthlyPrice: number }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = root.current;
    if (!section || !("IntersectionObserver" in window)) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const price = section.querySelector<HTMLElement>("[data-outreach-price]");
    let priceFrame = 0;
    let priceDelay = 0;
    let priceFinished = false;

    function stopPrice() {
      window.clearTimeout(priceDelay);
      window.cancelAnimationFrame(priceFrame);
      priceDelay = 0;
      priceFrame = 0;
    }

    function finishPrice() {
      priceFinished = true;
      stopPrice();
      priceObserver.disconnect();
      if (price) price.textContent = pounds.format(monthlyPrice);
    }

    function countPrice() {
      priceDelay = 0;
      if (!price || priceFinished || motion.matches) return;
      const display = price;
      let start: number | undefined;

      function tick(now: number) {
        start ??= now;
        const t = Math.min((now - start) / 2250, 1);
        display.textContent = pounds.format(Math.round(monthlyPrice * (1 - (1 - t) ** 2)));
        if (t < 1) priceFrame = window.requestAnimationFrame(tick);
        else finishPrice();
      }

      priceFrame = window.requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.revealed = "true";
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: .04 });

    section.querySelectorAll("[data-outreach-reveal]").forEach((element) => observer.observe(element));
    const priceObserver = new IntersectionObserver(([entry]) => {
      if (!price || priceFinished || motion.matches) return;
      if (entry.intersectionRatio >= .85) {
        priceDelay = window.setTimeout(countPrice, 420);
      } else {
        stopPrice();
        price.textContent = pounds.format(0);
      }
    }, { threshold: .85 });
    if (price && !motion.matches) {
      price.textContent = pounds.format(0);
      priceObserver.observe(price);
    }
    section.dataset.enhanced = "true";
    motion.addEventListener("change", finishPrice);
    return () => {
      observer.disconnect();
      motion.removeEventListener("change", finishPrice);
      finishPrice();
    };
  }, [monthlyPrice]);

  return <div ref={root} className="outreach-content">{children}</div>;
}

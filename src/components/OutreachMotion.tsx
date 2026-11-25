"use client";

import { useEffect, useRef, type ReactNode } from "react";

const pounds = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 });

export function OutreachMotion({ children, monthlyPrice }: { children: ReactNode; monthlyPrice: number }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = root.current;
    if (!section || !("IntersectionObserver" in window)) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktop = window.matchMedia("(min-width: 1040px)");
    const steps = [...section.querySelectorAll<HTMLElement>("[data-outreach-step]")];
    const scenes = [...section.querySelectorAll<HTMLElement>("[data-outreach-scene]")];
    const price = section.querySelector<HTMLElement>("[data-outreach-price]");
    let activeStep = 0;
    let scrollFrame = 0;
    let priceFrame = 0;

    function updateStep() {
      scrollFrame = 0;
      if (!desktop.matches) return;
      const readingLine = window.innerHeight * .53;
      const next = steps.findLastIndex((step) => step.getBoundingClientRect().top <= readingLine);
      const index = Math.max(0, next);
      if (index === activeStep) return;

      steps[activeStep].dataset.current = "false";
      scenes[activeStep].dataset.current = "false";
      steps[index].dataset.current = "true";
      scenes[index].dataset.current = "true";
      activeStep = index;
    }

    function queueStep() {
      if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateStep);
    }

    function finishPrice() {
      window.cancelAnimationFrame(priceFrame);
      if (price) price.textContent = pounds.format(monthlyPrice);
    }

    function countPrice() {
      if (!price || motion.matches) return;
      const display = price;
      let start: number | undefined;

      function tick(now: number) {
        start ??= now;
        const t = Math.min((now - start) / 1550, 1);
        display.textContent = pounds.format(Math.round(monthlyPrice * (1 - (1 - t) ** 2)));
        if (t < 1) priceFrame = window.requestAnimationFrame(tick);
      }

      priceFrame = window.requestAnimationFrame(tick);
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (entry.target === price) countPrice();
        else (entry.target as HTMLElement).dataset.revealed = "true";
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px -8% 0px", threshold: .04 });

    section.querySelectorAll("[data-outreach-reveal]").forEach((element) => observer.observe(element));
    if (price) observer.observe(price);
    section.dataset.enhanced = "true";
    window.addEventListener("scroll", queueStep, { passive: true });
    window.addEventListener("resize", queueStep, { passive: true });
    motion.addEventListener("change", finishPrice);
    queueStep();
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", queueStep);
      window.removeEventListener("resize", queueStep);
      motion.removeEventListener("change", finishPrice);
      window.cancelAnimationFrame(scrollFrame);
      finishPrice();
    };
  }, [monthlyPrice]);

  return <div ref={root} className="outreach-content">{children}</div>;
}

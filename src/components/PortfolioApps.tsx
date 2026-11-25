"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { appShowcase, portfolioPath } from "@/lib/data/portfolio";
import "@/app/portfolio-showcase.css";

const dwell = 820;

export function PortfolioApps() {
  const baseId = useId();
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState<number | null>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (preview === null || reducedMotion) return;
    const timer = window.setTimeout(() => {
      if (!panel.current?.contains(document.activeElement)) setActive(preview);
      setPreview(null);
    }, dwell + 25);
    return () => window.clearTimeout(timer);
  }, [preview, reducedMotion]);

  function select(index: number) {
    setPreview(null);
    setActive(index);
  }

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = appShowcase.length - 1;
    let next: number;
    switch (event.key) {
      case "ArrowLeft": next = index === 0 ? last : index - 1; break;
      case "ArrowRight": next = index === last ? 0 : index + 1; break;
      case "Home": next = 0; break;
      case "End": next = last; break;
      default: return;
    }
    event.preventDefault();
    select(next);
    buttons.current[next]?.focus();
  }

  const { project } = appShowcase[active];
  const screenshot = project.media?.[1];

  return (
    <div className="showcase apps-showcase">
      <h2 className="visually-hidden">Apps I’ve built</h2>
      <div
        className="app-tab-bar"
        role="tablist"
        aria-label="Apps I’ve built"
        style={{ "--app-dwell": `${dwell}ms` } as CSSProperties}
        onPointerLeave={() => setPreview(null)}
      >
        {appShowcase.map(({ project: item, icon, label }, index) => (
          <button
            key={item.id}
            type="button"
            className="app-tab"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={index === active}
            aria-controls={`${baseId}-detail`}
            tabIndex={index === active ? 0 : -1}
            data-preview={preview === index || undefined}
            ref={(node) => { buttons.current[index] = node; }}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse" && index !== active && !reducedMotion && !panel.current?.contains(document.activeElement)) setPreview(index);
            }}
            onPointerLeave={() => setPreview((current) => current === index ? null : current)}
            onClick={() => select(index)}
            onKeyDown={(event) => navigate(event, index)}
          >
            <span className="app-tab-art"><Image src={icon} alt="" width={320} height={320} sizes="(max-width: 650px) 17vw, 116px" /></span>
            <span className="app-tab-label">{label}</span>
          </button>
        ))}
      </div>

      <div ref={panel} role="tabpanel" id={`${baseId}-detail`} aria-labelledby={`${baseId}-tab-${active}`} onFocusCapture={() => setPreview(null)}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.article
            className="app-bento"
            key={project.id}
            initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: reducedMotion ? 0 : .13 } }}
            transition={{ duration: reducedMotion ? 0 : .42, ease: [.22, 1, .36, 1] }}
          >
            <div className="app-bento-intro">
              <h3>{project.name}</h3>
              <p>{project.summary}</p>
              <Link className="work-link" href={portfolioPath(project)}>Open project <ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
            {screenshot && (
              <figure className="app-bento-image">
                <Image src={screenshot.src} alt={screenshot.alt} fill sizes="(max-width: 780px) 90vw, 47vw" />
              </figure>
            )}
            <div className="app-bento-detail">
              <h4>What I built</h4>
              <p>{project.implementation}</p>
            </div>
            <div className="app-bento-detail">
              <h4>What it does</h4>
              <p>{project.currentState ?? project.result}</p>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </div>
  );
}

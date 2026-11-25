"use client";

import Link from "next/link";
import { AnimatePresence, LayoutGroup, motion, useIsPresent, useReducedMotion, type Transition } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent, type PointerEventHandler, type ReactNode } from "react";
import { GtmArtwork } from "@/components/GtmArtwork";
import { ViditPortrait } from "@/components/ViditPortrait";
import { gtmMorph } from "@/lib/data/gtm-morph";
import type { PortfolioPanels, PortfolioTopic } from "@/lib/data/portfolio";

const topics = [
  { id: "outreach", label: "Outreach", href: "/projects/growency#outreach" },
  { id: "meta", label: "Ads", href: "/projects/growency#meta-ads" },
  { id: "apps", label: "Apps", href: "/projects#apps" },
] as const;

type GalleryTab = PortfolioTopic | "about";
type DockSlot = "top" | "active" | "lower" | "bottom";
const dockTabs: GalleryTab[] = ["about", "outreach", "meta", "apps"];
const satelliteSlots = ["top", "lower", "bottom"] as const;
const hoverDuration = 1200;
const dockHoverQuery = "(min-width: 801px) and (hover: hover) and (pointer: fine)";

const readingTime = 0.68;
const stagger = 0.14;
const traceDuration = 0.82;
const morphDuration = 2.12;
const detailOffset = 1.54;
const detailDuration = 0.76;
const outlineHold = 0.36;
const materialStart = readingTime + stagger * (topics.length - 1)
  + traceDuration + Math.max(morphDuration, detailOffset + detailDuration) + outlineHold;
const contourEasing = ".4 0 .24 1";
const layoutTransition: Transition = { layout: { type: "tween", duration: 0.94, ease: [0.35, 0.02, 0.18, 1] } };

function AboutPortraitLink({ slot, preview, animate, onPointerMove, onPointerLeave }: {
  slot?: DockSlot;
  preview?: boolean;
  animate: boolean;
  onPointerMove?: PointerEventHandler<HTMLAnchorElement>;
  onPointerLeave?: PointerEventHandler<HTMLAnchorElement>;
}) {
  const isPresent = useIsPresent();
  const inRail = !!slot;

  return (
    <Link
      href="/about"
      className={inRail ? "gtm-about-link gtm-about-rail" : "gtm-about-link gtm-about-inline"}
      aria-label="About Vidit Khedekar"
      aria-hidden={!isPresent || undefined}
      tabIndex={isPresent ? undefined : -1}
      title="About me"
      data-dock-slot={slot}
      data-preview={preview || undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <motion.span className={inRail ? "gtm-portrait gtm-figure" : "gtm-portrait"} layoutId={animate ? "gtm-portrait" : undefined} transition={layoutTransition}>
        <span className={inRail ? "gtm-zoom" : undefined}>
          <ViditPortrait decorative sizes={inRail ? "(max-width: 800px) 18vw, 210px" : "(max-width: 650px) 16vw, 150px"} />
        </span>
      </motion.span>
    </Link>
  );
}

export function GtmOpening({ panels, outreach, about }: {
  panels: Pick<PortfolioPanels, "meta" | "apps">;
  outreach: ReactNode;
  about: ReactNode;
}) {
  const opening = useRef<HTMLElement>(null);
  const gallery = useRef<HTMLDivElement>(null);
  const links = useRef<Partial<Record<PortfolioTopic, HTMLAnchorElement>>>({});
  const [selected, setSelected] = useState<GalleryTab | null>(null);
  const [preview, setPreview] = useState<GalleryTab | null>(null);
  const reducedMotion = useReducedMotion();
  const inactiveTabs = dockTabs.filter((id) => id !== selected);
  const activeTopic = selected && selected !== "about" ? selected : null;

  useEffect(() => {
    const section = opening.current;
    if (!section) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const timelines = [...section.querySelectorAll<SVGAnimateElement>("animate[data-start]")];
    let materialTimer: number | undefined;

    function showFelt() {
      if (section) section.dataset.material = "felt";
    }

    if (reduceMotion.matches || typeof timelines[0]?.beginElementAt !== "function") {
      showFelt();
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      timelines.forEach((animation) => {
        animation.beginElementAt(Number(animation.dataset.start));
      });
      materialTimer = window.setTimeout(showFelt, Math.round(materialStart * 1000));
    });

    const respectMotionPreference = () => {
      if (reduceMotion.matches) {
        window.cancelAnimationFrame(frame);
        window.clearTimeout(materialTimer);
        showFelt();
      }
    };

    reduceMotion.addEventListener("change", respectMotionPreference);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(materialTimer);
      reduceMotion.removeEventListener("change", respectMotionPreference);
    };
  }, []);

  useEffect(() => {
    if (!preview || reducedMotion) return;
    const timer = window.setTimeout(() => {
      if (window.matchMedia(dockHoverQuery).matches && !gallery.current?.contains(document.activeElement)) {
        setSelected(preview);
        if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setPreview(null);
    }, hoverDuration + 35);
    return () => window.clearTimeout(timer);
  }, [preview, reducedMotion]);

  function dockSlot(id: GalleryTab): DockSlot | undefined {
    if (!selected) return undefined;
    return selected === id ? "active" : satelliteSlots[inactiveTabs.indexOf(id)];
  }

  function dockHover(id: GalleryTab): PointerEventHandler<HTMLAnchorElement> {
    return (event) => {
      if (!selected || id === selected || id === preview || reducedMotion || event.pointerType !== "mouse") return;
      if (window.matchMedia(dockHoverQuery).matches && !gallery.current?.contains(document.activeElement)) setPreview(id);
    };
  }

  function clearDockHover(id: GalleryTab) {
    setPreview((current) => current === id ? null : current);
  }

  function choose(event: MouseEvent<HTMLAnchorElement>, id: PortfolioTopic) {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    event.preventDefault();
    if (opening.current) opening.current.dataset.material = "felt";
    setPreview(null);
    setSelected(id);
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
  }

  function close() {
    links.current[activeTopic ?? "outreach"]?.focus({ preventScroll: true });
    setPreview(null);
    setSelected(null);
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: reducedMotion ? "instant" : "smooth" });
  }

  return (
    <section
      ref={opening}
      className="gtm-opening"
      aria-labelledby="gtm-title"
      data-gallery={!!selected}
      onKeyDown={(event) => {
        if (event.key === "Escape" && selected) {
          event.preventDefault();
          close();
        }
      }}
    >
      <h1 className="visually-hidden" id="gtm-title">I’m your GTM guy.</h1>
      <LayoutGroup>
        <AnimatePresence initial={false} mode="popLayout">
          {!selected && (
            <motion.div
              className="gtm-opening-line gtm-opening-intro-line"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.24 }}
            >
              <span aria-hidden="true">I’m</span>
              <AboutPortraitLink animate={!reducedMotion} />
              <span aria-hidden="true">your</span>
            </motion.div>
          )}
        </AnimatePresence>
        <nav
          className="gtm-topics"
          aria-label={selected ? "Portfolio sections" : "Selected work"}
          style={{ "--gtm-hover-duration": `${hoverDuration}ms` } as CSSProperties}
        >
          {selected && (
            <>
              <button type="button" className="gtm-home" aria-label="Home" title="Home" onClick={close}>
                <span className="gtm-home-figure" aria-hidden="true"><GtmArtwork id="home" /></span>
              </button>
              <AboutPortraitLink
                slot={dockSlot("about")}
                preview={preview === "about"}
                animate={!reducedMotion}
                onPointerMove={dockHover("about")}
                onPointerLeave={() => clearDockHover("about")}
              />
            </>
          )}
          {topics.map(({ id, label, href }, index) => {
            const shape = gtmMorph[id];
            const start = readingTime + index * stagger;
            const morphStart = start + traceDuration;
            const style = { "--material-delay": (index * 95) + "ms" } as CSSProperties;

            return (
              <Link
                className="gtm-topic"
                key={id}
                href={href}
                data-gtm-topic={id}
                data-dock-slot={dockSlot(id)}
                data-preview={preview === id || undefined}
                aria-expanded={selected === id}
                aria-controls="gtm-work-content"
                style={style}
                ref={(node) => { if (node) links.current[id] = node; }}
                onClick={(event) => choose(event, id)}
                onPointerMove={dockHover(id)}
                onPointerLeave={() => clearDockHover(id)}
              >
                <motion.span className="gtm-figure" aria-hidden="true" layout={!reducedMotion} transition={layoutTransition}>
                  <svg className="gtm-vector" viewBox="0 0 260 218" focusable="false">
                    <path className="gtm-letter" d={shape.solid} fill="currentColor">
                      <animate
                        attributeName="opacity"
                        from="1"
                        to="0"
                        begin="indefinite"
                        data-start={start}
                        dur={traceDuration + "s"}
                        keyTimes="0;1"
                        keySplines={contourEasing}
                        calcMode="spline"
                        fill="freeze"
                      />
                    </path>
                    <path
                      className="gtm-contour"
                      d={shape.from}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      pathLength="1"
                      strokeDasharray="0 1"
                      opacity="0"
                    >
                      <animate attributeName="opacity" from="0" to="1" begin="indefinite" data-start={start} dur=".23s" fill="freeze" />
                      <animate
                        attributeName="stroke-dasharray"
                        from="0 1"
                        to="1 0"
                        begin="indefinite"
                        data-start={start}
                        dur={traceDuration + "s"}
                        calcMode="spline"
                        keyTimes="0;1"
                        keySplines=".32 0 .36 1"
                        fill="freeze"
                      />
                      <animate
                        attributeName="d"
                        from={shape.from}
                        to={shape.to}
                        begin="indefinite"
                        data-start={morphStart}
                        dur={morphDuration + "s"}
                        calcMode="spline"
                        keyTimes="0;1"
                        keySplines={contourEasing}
                        fill="freeze"
                      />
                      <animate
                        attributeName="stroke-dasharray"
                        values="1 0;.61 .39;.68 .32;1 0"
                        begin="indefinite"
                        data-start={morphStart}
                        dur={morphDuration + "s"}
                        calcMode="spline"
                        keyTimes="0;.33;.65;1"
                        keySplines=".35 0 .45 1;.32 0 .68 1;.34 0 .25 1"
                        fill="freeze"
                      />
                      <animate
                        attributeName="stroke-dashoffset"
                        from="0"
                        to="-1"
                        begin="indefinite"
                        data-start={morphStart}
                        dur={morphDuration + "s"}
                        calcMode="spline"
                        keyTimes="0;1"
                        keySplines={contourEasing}
                        fill="freeze"
                      />
                    </path>
                    <g fill="none" stroke="currentColor" strokeWidth="4.6" strokeLinecap="round" strokeLinejoin="round" opacity="0">
                      <animate attributeName="opacity" from="0" to="1" begin="indefinite" data-start={morphStart + detailOffset} dur=".23s" fill="freeze" />
                      {shape.details.map((detail) => (
                        <path key={detail} d={detail} pathLength="1" strokeDasharray="1 1.02" strokeDashoffset="1.01">
                          <animate
                            attributeName="stroke-dashoffset"
                            from="1.01"
                            to="0"
                            begin="indefinite"
                            data-start={morphStart + detailOffset}
                            dur={detailDuration + "s"}
                            calcMode="spline"
                            keyTimes="0;1"
                            keySplines=".32 0 .26 1"
                            fill="freeze"
                          />
                        </path>
                      ))}
                    </g>
                  </svg>
                  <span className="gtm-zoom">
                    <GtmArtwork id={id} />
                  </span>
                </motion.span>
                <span className="gtm-topic-label">{label}</span>
                <span className="gtm-topic-invitation" aria-hidden="true">Click for more <ArrowRight size={15} /></span>
              </Link>
            );
          })}
        </nav>
      </LayoutGroup>
      <AnimatePresence initial={false} mode="popLayout">
        {!selected && (
          <motion.p
            className="gtm-opening-line gtm-opening-signoff"
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.24 }}
          >guy.</motion.p>
        )}
      </AnimatePresence>
      <div ref={gallery} className="gtm-gallery" id="gtm-work-content" hidden={!selected} onFocusCapture={() => setPreview(null)}>
        <AnimatePresence mode="wait">
          {selected && (
            <motion.section
              key={selected}
              className="gtm-gallery-panel"
              aria-label={selected === "about" ? "About me" : topics.find(({ id }) => id === selected)?.label}
              initial={reducedMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reducedMotion ? 0 : -6, transition: { duration: reducedMotion ? 0 : 0.16 } }}
              transition={{ duration: reducedMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {activeTopic === "outreach" ? outreach : activeTopic ? (
                <>
                  {panels[activeTopic].copy}
                  <div className="gtm-gallery-media">{panels[activeTopic].media}</div>
                </>
              ) : about}
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

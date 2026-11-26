"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Pause, Play, X } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { growencySpecAds as ads } from "@/lib/data/growency-spec-ads";
import type { AdBounds, GrowencyAdOrbit } from "@/lib/growency/ad-orbit";

const posters = ads.map(({ src }) => src);
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function previewTransform(source: () => AdBounds, image: HTMLImageElement) {
  const original = source();
  const destination = image.getBoundingClientRect();
  const x = original.left + original.width / 2 - destination.x - destination.width / 2;
  const y = original.top + original.height / 2 - destination.y - destination.height / 2;
  return `translate(${x}px, ${y}px) rotate(${original.rotation}deg) scale(${original.width / destination.width}, ${original.height / destination.height})`;
}

function AdPreview({ ad, source, close }: { ad: typeof ads[number]; source: () => AdBounds; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const animation = useRef<Animation | null>(null);
  const closing = useRef(false);
  const title = useId();

  useLayoutEffect(() => {
    const element = dialog.current;
    const art = image.current;
    if (!element || !art) return;
    if (!element.open) element.showModal();
    closeButton.current?.focus({ preventScroll: true });
    if (!reducedMotion()) {
      animation.current = art.animate([
        { transform: previewTransform(source, art) },
        { transform: "none" },
      ], { duration: 580, easing: "cubic-bezier(.25,.76,.27,1)" });
    }
    return () => animation.current?.cancel();
  }, [source]);

  function dismiss() {
    if (closing.current) return;
    closing.current = true;
    const art = image.current;
    const currentPose = art ? getComputedStyle(art).transform : "none";
    animation.current?.cancel();
    function finish() {
      dialog.current?.close();
      close();
    }
    if (reducedMotion() || !art) {
      finish();
      return;
    }
    dialog.current?.setAttribute("data-closing", "");
    animation.current = art.animate([
      { transform: currentPose },
      { transform: previewTransform(source, art) },
    ], { duration: 420, easing: "cubic-bezier(.39,0,.27,1)", fill: "forwards" });
    void animation.current.finished.then(finish, () => {});
  }

  return (
    <dialog
      ref={dialog}
      className="meta-ad-dialog"
      aria-labelledby={title}
      onKeyDown={(event) => {
        if (event.key === "Escape") event.stopPropagation();
      }}
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <figure className="meta-ad-dialog-figure">
        <Image ref={image} src={ad.src} alt={ad.alt} width={ad.width} height={ad.height} sizes="(max-width: 600px) 90vw, 560px" loading="eager" />
        <figcaption><strong id={title}>{ad.title}</strong><small>{ad.note}</small></figcaption>
        <button ref={closeButton} type="button" className="meta-ad-dialog-close" aria-label="Close ad preview" onClick={dismiss}>
          <X size={20} aria-hidden="true" />
        </button>
      </figure>
    </dialog>
  );
}

export function MetaAdCarousel() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const fallback = useRef<HTMLUListElement>(null);
  const orbit = useRef<GrowencyAdOrbit | null>(null);
  const [enhanced, setEnhanced] = useState(false);
  const [paused, setPaused] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const [preview, setPreview] = useState<{ index: number; source: () => AdBounds } | null>(null);
  const headingId = useId();
  const stageId = useId();
  const hintId = useId();

  useEffect(() => {
    const element = stage.current;
    const surface = canvas.current;
    if (!element || !surface || !("IntersectionObserver" in window) || !("ResizeObserver" in window)) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let active = true;
    let attempt = 0;
    let loading = false;
    let near = false;

    function showFallback() {
      orbit.current?.destroy();
      orbit.current = null;
      setEnhanced(false);
      setPaused(false);
    }

    async function load() {
      if (!active || !near || motion.matches || !surface || orbit.current || loading) return;
      const current = ++attempt;
      loading = true;
      try {
        // Growency enables the orbit only if the device supports WebGL 2.
        const context = surface.getContext("webgl2", { antialias: true, alpha: true });
        if (!context) return;
        const { GrowencyAdOrbit } = await import("@/lib/growency/ad-orbit");
        if (!active || current !== attempt || motion.matches) return;
        orbit.current = new GrowencyAdOrbit({
          canvas: surface,
          context,
          posters,
          onReady: () => setEnhanced(true),
          onFallback: showFallback,
          onSelect: (index) => setAnnouncement(ads[index].title),
          onOpen: ({ index, bounds }) => setPreview({ index, source: bounds }),
        });
      } catch {
        if (active && current === attempt) showFallback();
      } finally {
        loading = false;
        if (active && current !== attempt && !motion.matches) void load();
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      void load();
    }, { rootMargin: "100px 0px" });
    observer.observe(element);

    function adapt() {
      if (motion.matches) {
        attempt++;
        showFallback();
      } else void load();
    }
    motion.addEventListener("change", adapt);

    return () => {
      active = false;
      observer.disconnect();
      motion.removeEventListener("change", adapt);
      orbit.current?.destroy();
      orbit.current = null;
    };
  }, []);

  function rotate(direction: -1 | 1) {
    if (enhanced && orbit.current) {
      orbit.current.rotate(direction);
      return;
    }
    const track = fallback.current;
    const item = track?.firstElementChild as HTMLElement | null;
    if (!track || !item) return;
    track.scrollBy({ left: (item.offsetWidth + 12) * direction, behavior: reducedMotion() ? "instant" : "smooth" });
  }

  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      rotate(event.key === "ArrowRight" ? 1 : -1);
    } else if ((event.key === "Enter" || event.key === " ") && enhanced && event.target === event.currentTarget) {
      event.preventDefault();
      orbit.current?.open();
    }
  }

  function toggleMotion() {
    orbit.current?.setPaused(!paused);
    setPaused(!paused);
  }

  function dismiss() {
    orbit.current?.close();
    setPreview(null);
    stage.current?.focus({ preventScroll: true });
  }

  return (
    <section className="meta-ad-carousel" aria-labelledby={headingId} aria-roledescription="carousel">
      <div className="meta-ad-carousel-header">
        <h3 id={headingId}>Sample ads</h3>
        <div className="meta-ad-controls">
          {enhanced && (
            <button type="button" aria-label={paused ? "Resume ad rotation" : "Pause ad rotation"} onClick={toggleMotion}>
              {paused ? <Play size={17} aria-hidden="true" /> : <Pause size={17} aria-hidden="true" />}
            </button>
          )}
          <button type="button" aria-label="Previous sample ad" aria-controls={stageId} onClick={() => rotate(-1)}>
            <ArrowLeft size={19} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Next sample ad" aria-controls={stageId} onClick={() => rotate(1)}>
            <ArrowRight size={19} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        id={stageId}
        ref={stage}
        className="meta-ad-stage"
        data-renderer={enhanced ? "webgl" : "static"}
        role="group"
        aria-label="Growency sample ads"
        aria-describedby={hintId}
        tabIndex={0}
        onKeyDown={navigate}
      >
        <canvas className="meta-ad-canvas" aria-hidden="true" ref={canvas} />
        <ul ref={fallback} className="meta-ad-fallback" inert={enhanced}>
          {ads.map((ad, index) => (
            <li key={ad.id}>
              <a
                className="meta-ad-card"
                href={ad.src}
                aria-label={ad.title + " · " + ad.note}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                  event.preventDefault();
                  const link = event.currentTarget;
                  setPreview({ index, source: () => {
                    const { left, top, width, height } = link.getBoundingClientRect();
                    return { left, top, width, height, rotation: 0 };
                  } });
                }}
              >
                <Image src={ad.src} alt={ad.alt} width={ad.width} height={ad.height} sizes="(max-width: 650px) 54vw, 265px" loading={index < 3 ? "eager" : "lazy"} />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="meta-ad-carousel-caption">
        <p>Growency spec work. The brands shown did not commission these ads.</p>
        <p id={hintId}>{enhanced ? "Drag to rotate · Select an ad to preview" : "Swipe to browse · Select an ad to preview"}</p>
      </div>
      <span className="visually-hidden" role="status">{announcement}</span>
      {preview && <AdPreview ad={ads[preview.index]} source={preview.source} close={dismiss} />}
    </section>
  );
}

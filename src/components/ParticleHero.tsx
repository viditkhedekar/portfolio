"use client";

import * as React from "react";
import { useMediaQuery } from "@/lib/hooks";

/**
 * The desktop hero: a cloud of particles that settles into VK, breathes, and
 * occasionally reforms as other marks before returning.
 *
 * Targets are sampled from glyphs rasterised to an offscreen canvas, so the
 * shapes always match the real typeface rather than hand-plotted coordinates.
 */

/** VK is the resting state; the others are brief visits. */
const SEQUENCE = [
  { text: "VK", hold: 9000 },
  { text: "01", hold: 2500 },
  { text: "VKOS", hold: 2500 },
] as const;

const POOL = 4200;
const SAMPLE_GAP = 3;

/* Motion */
const SPRING = 0.055;
const DAMPING = 0.86;
const DRIFT_MIN = 1.1;
const DRIFT_MAX = 2.8;

/* Pointer */
const REPEL_RADIUS = 96;
const REPEL_FORCE = 26;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Where this particle belongs in the current form. */
  tx: number;
  ty: number;
  /** Per-particle drift, so the cloud never sits perfectly still. */
  phase: number;
  driftSpeed: number;
  driftAmp: number;
  alpha: number;
  size: number;
}

/** The font family Next resolved for the mono face, usable in ctx.font. */
function monoFamily(): string {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue("--font-mono-jb")
    .trim();
  return value ? `${value}, ui-monospace, monospace` : "ui-monospace, monospace";
}

/** Rasterise text and return the points its glyphs cover, in CSS pixels. */
function samplePoints(text: string, w: number, h: number): Array<[number, number]> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(w));
  canvas.height = Math.max(1, Math.floor(h));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  const family = monoFamily();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  /* Grow to the box, then pull back until the widest glyph run fits. */
  let size = h * 0.86;
  ctx.font = `500 ${size}px ${family}`;
  const measured = ctx.measureText(text).width;
  const maxWidth = w * 0.88;
  if (measured > maxWidth) size *= maxWidth / measured;

  ctx.font = `500 ${size}px ${family}`;
  ctx.fillStyle = "#fff";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const points: Array<[number, number]> = [];
  for (let y = 0; y < canvas.height; y += SAMPLE_GAP) {
    for (let x = 0; x < canvas.width; x += SAMPLE_GAP) {
      /* Alpha channel of the rasterised glyph. */
      if (data[(y * canvas.width + x) * 4 + 3] > 128) points.push([x, y]);
    }
  }
  return points;
}

/** Fisher-Yates, so repeated forms do not reuse the same particle order. */
function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function ParticleHero({ className }: { className?: string }) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let formIndex = 0;
    let holdUntil = 0;
    let raf = 0;
    let disposed = false;

    const accent =
      getComputedStyle(document.documentElement).getPropertyValue("--vk-accent").trim() ||
      "#aee83c";

    const pointer = { x: -9999, y: -9999, active: false };

    /** Point the pool at a form, scattering which particle takes which spot. */
    const assign = (text: string) => {
      const points = shuffle(samplePoints(text, width, height));
      if (points.length === 0) return;
      particles.forEach((p, i) => {
        const [tx, ty] = points[i % points.length];
        /* Jitter keeps stacked particles from landing on the same pixel. */
        p.tx = tx + (Math.random() - 0.5) * 2.2;
        p.ty = ty + (Math.random() - 0.5) * 2.2;
      });
    };

    const build = () => {
      const rect = host.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (width < 2 || height < 2) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (particles.length === 0) {
        particles = Array.from({ length: POOL }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: 0,
          vy: 0,
          tx: width / 2,
          ty: height / 2,
          phase: Math.random() * Math.PI * 2,
          driftSpeed: 0.35 + Math.random() * 0.55,
          driftAmp: DRIFT_MIN + Math.random() * (DRIFT_MAX - DRIFT_MIN),
          /* Varied alpha gives the cloud depth without varying hue. */
          alpha: 0.25 + Math.random() * 0.75,
          size: 1 + Math.random() * 0.9,
        }));
      }

      assign(SEQUENCE[formIndex].text);
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = accent;

      const seconds = t / 1000;
      for (const p of particles) {
        /* Rest position wanders slightly, so the mark keeps reconstructing. */
        const wobble = Math.sin(seconds * p.driftSpeed + p.phase);
        const gx = p.tx + wobble * p.driftAmp;
        const gy = p.ty + Math.cos(seconds * p.driftSpeed + p.phase) * p.driftAmp;

        p.vx = (p.vx + (gx - p.x) * SPRING) * DAMPING;
        p.vy = (p.vy + (gy - p.y) * SPRING) * DAMPING;

        if (pointer.active) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < REPEL_RADIUS && dist > 0.01) {
            const push = (1 - dist / REPEL_RADIUS) * (REPEL_FORCE / dist);
            p.vx += dx * push;
            p.vy += dy * push;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;
    };

    const frame = (t: number) => {
      if (disposed) return;
      if (holdUntil === 0) holdUntil = t + SEQUENCE[formIndex].hold;
      if (t >= holdUntil) {
        formIndex = (formIndex + 1) % SEQUENCE.length;
        holdUntil = t + SEQUENCE[formIndex].hold;
        assign(SEQUENCE[formIndex].text);
      }
      draw(t);
      raf = requestAnimationFrame(frame);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active =
        pointer.x > -REPEL_RADIUS &&
        pointer.y > -REPEL_RADIUS &&
        pointer.x < rect.width + REPEL_RADIUS &&
        pointer.y < rect.height + REPEL_RADIUS;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };

    /** Glyph metrics differ before the webfont lands, so sample after it does. */
    const start = () => {
      if (disposed) return;
      build();

      if (reduced) {
        /* Settle straight onto the mark and paint one static frame. */
        for (const p of particles) {
          p.x = p.tx;
          p.y = p.ty;
        }
        draw(0);
        return;
      }

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("pointerleave", onPointerLeave);
      raf = requestAnimationFrame(frame);
    };

    void document.fonts.ready.then(start);

    const onResize = () => {
      if (disposed) return;
      particles = [];
      build();
      if (reduced) {
        for (const p of particles) {
          p.x = p.tx;
          p.y = p.ty;
        }
        draw(0);
      }
    };
    const observer = new ResizeObserver(onResize);
    observer.observe(host);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reduced]);

  return (
    <h1 className={className}>
      {/* The mark is drawn, so the name still has to exist as text. */}
      <span className="sr-only">VKOS/01</span>
      <div
        ref={hostRef}
        aria-hidden
        className="h-[clamp(170px,24vw,320px)] w-full"
      >
        <canvas ref={canvasRef} className="block" />
      </div>
    </h1>
  );
}

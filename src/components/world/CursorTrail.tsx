"use client";

import * as React from "react";
import { useMediaQuery } from "@/lib/hooks";

/**
 * A trail of embers behind the pointer.
 *
 * Two things are drawn. A tapered ribbon through the last handful of pointer
 * samples, which is what actually reads as "the cursor is leaving a mark",
 * and a scatter of particles thrown off it that drift and cool. The ribbon
 * alone looks like a drawing tool; the particles alone look like dust. It
 * needs both.
 *
 * Everything is additive, on a transparent canvas that is fully cleared each
 * frame. The tempting alternative, painting a translucent black rectangle
 * over the previous frame to smear it, cannot work here: the canvas has to
 * stay transparent so the world shows through, and repeated alpha fills never
 * quite reach zero, so the screen slowly silts up with grey.
 */

/** Ceiling on live particles. Past this the trail stops reading as a trail. */
const MAX = 140;

/** How many pointer samples the ribbon is drawn through. */
const RIBBON = 14;

/** Particles emitted per pixel of pointer travel. */
const EMIT_RATE = 0.09;

interface Ember {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** 1 at birth, 0 at death. */
  life: number;
  decay: number;
  size: number;
  /** 0 accent, 1 white. A few hot ones stop it reading as flat green. */
  hot: number;
}

/** One soft dot, drawn once and stamped, which is far cheaper than shadowBlur. */
function sprite(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 64;
  const ctx = c.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.25, "rgba(255,255,255,0.5)");
    g.addColorStop(0.6, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
  }
  return c;
}

export function CursorTrail() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fine = useMediaQuery("(hover: hover) and (pointer: fine)");
  const calm = useMediaQuery("(prefers-reduced-motion: reduce)");
  const enabled = fine && !calm;

  React.useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dot = sprite();
    const embers: Ember[] = [];
    /* Recent pointer positions, newest last. */
    const path: Array<{ x: number; y: number }> = [];

    let px = -999;
    let py = -999;
    let last = { x: -999, y: -999 };
    let inside = false;
    /* Set by the panels when the pointer is over one, so the trail can react
       to the thing under it rather than being the same everywhere. */
    let heat = 0;
    let dpr = 1;
    let raf = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      inside = true;

      /* Over a panel the trail runs hotter and whiter. The attribute is set
         by the panel layer, so this stays a one-way read. */
      const over = (e.target as Element | null)?.closest?.("[data-panel]");
      heat = over ? 1 : 0;
    };

    const onLeave = () => {
      inside = false;
    };

    const emit = (x: number, y: number, count: number) => {
      for (let i = 0; i < count && embers.length < MAX; i++) {
        const a = Math.random() * Math.PI * 2;
        const speed = 0.25 + Math.random() * 0.9;
        embers.push({
          x: x + (Math.random() - 0.5) * 6,
          y: y + (Math.random() - 0.5) * 6,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 0.25,
          life: 1,
          /* Uneven lifetimes, or the trail dies all at once in a band. */
          decay: 0.012 + Math.random() * 0.022,
          size: 3 + Math.random() * 7 + heat * 4,
          hot: Math.random() < 0.18 + heat * 0.3 ? 1 : 0,
        });
      }
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      if (inside && last.x > -900) {
        const dx = px - last.x;
        const dy = py - last.y;
        const travelled = Math.hypot(dx, dy);
        if (travelled > 0.5) {
          path.push({ x: px, y: py });
          if (path.length > RIBBON) path.shift();
          emit(px, py, Math.min(4, Math.ceil(travelled * EMIT_RATE)));
        }
      }
      last = { x: px, y: py };

      /* The ribbon. Drawn as a run of tapering segments rather than one
         stroked path, because a single path cannot change width along its
         length and a trail that does not taper reads as a worm. */
      if (path.length > 2) {
        ctx.globalCompositeOperation = "lighter";
        for (let i = 1; i < path.length; i++) {
          const t = i / (path.length - 1);
          const a = path[i - 1];
          const b = path[i];
          ctx.strokeStyle = heat
            ? `rgba(233,247,208,${0.05 + t * 0.3})`
            : `rgba(174,232,60,${0.03 + t * 0.22})`;
          ctx.lineWidth = 0.5 + t * (3.2 + heat * 2.4);
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }

      /* Embers. */
      ctx.globalCompositeOperation = "lighter";
      for (let i = embers.length - 1; i >= 0; i--) {
        const p = embers[i];
        p.x += p.vx;
        p.y += p.vy;
        /* They rise and slow, the way an ember off a fire does. */
        p.vy -= 0.006;
        p.vx *= 0.975;
        p.vy *= 0.975;
        p.life -= p.decay;

        if (p.life <= 0) {
          embers.splice(i, 1);
          continue;
        }

        const size = p.size * (0.35 + p.life * 0.65);
        ctx.globalAlpha = p.life * p.life * 0.75;
        /* Tint by stamping the white sprite through a colour. Cheaper than a
           second sprite per colour and it keeps the additive falloff. */
        ctx.drawImage(dot, p.x - size / 2, p.y - size / 2, size, size);
        if (!p.hot) {
          ctx.globalCompositeOperation = "source-atop";
          ctx.globalAlpha = p.life * 0.5;
          ctx.fillStyle = "rgba(174,232,60,1)";
          ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
          ctx.globalCompositeOperation = "lighter";
        }
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      /* The pointer itself, so the trail has something to come from. */
      if (inside) {
        ctx.globalCompositeOperation = "lighter";
        const core = 8 + heat * 10;
        ctx.globalAlpha = 0.5 + heat * 0.35;
        ctx.drawImage(dot, px - core / 2, py - core / 2, core, core);
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = "source-over";
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return <canvas ref={canvasRef} className="vk-trail" aria-hidden="true" />;
}

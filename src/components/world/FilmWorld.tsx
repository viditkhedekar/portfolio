"use client";

import * as React from "react";
import {
  FILM,
  blendAt,
  filmProgress,
  onFilmProgress,
  startFilm,
  type Blend,
} from "@/lib/film";
import { useScrollDriver, scrollState } from "@/lib/scroll";

/**
 * The world behind the landing page.
 *
 * A canvas, a rendered flight, and the scroll position deciding which frame
 * of it you are looking at. There is no 3D engine on this page at runtime and
 * there does not need to be: the camera move was decided when the film was
 * rendered, and scroll is only choosing a point along it.
 *
 * The one thing this has to get right is that it never blocks the page. The
 * canvas paints whatever frame has arrived, the loader fills in the gaps
 * behind it, and the HTML over the top is complete and readable from the
 * first paint whether any of it has arrived or not.
 */
export function FilmWorld() {
  useScrollDriver();

  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    /* Belt and braces. The shell already declines to mount this in low-RAM
       mode, but a single commit before the store settles would be enough to
       start fetching several megabytes, and the whole point of that mode is
       that it never happens. */
    if (document.documentElement.getAttribute("data-mode") === "lite") return;

    startFilm();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let raf = 0;
    let width = 0;
    let height = 0;
    let painted = -1;
    let dirty = true;

    /* A repaint is also needed when a frame lands, not only when the scroll
       moves: someone who stops scrolling while the film is still arriving
       should see it sharpen rather than sit on a stale frame. */
    const unsubscribe = onFilmProgress(() => {
      dirty = true;
    });

    const measure = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dirty = true;
    };

    const blend: Blend = { from: null, to: null, mix: 0 };

    const draw = () => {
      blendAt(scrollState.eased, blend);
      if (!blend.from) return;

      /* Cover fit. The film is 16:9 and a browser window is whatever it is,
         so something has to be cropped; letterboxing a world would break the
         one thing the page is trying to do. */
      const scale = Math.max(width / FILM.width, height / FILM.height);
      const w = FILM.width * scale;
      const h = FILM.height * scale;
      const x = (width - w) / 2;
      const y = (height - h) / 2;

      ctx.globalAlpha = 1;
      ctx.drawImage(blend.from, x, y, w, h);

      /* The frame ahead, faded in by however far between the two the scroll
         has landed. This is the difference between travelling and stepping. */
      if (blend.to && blend.to !== blend.from && blend.mix > 0.01) {
        ctx.globalAlpha = blend.mix;
        ctx.drawImage(blend.to, x, y, w, h);
        ctx.globalAlpha = 1;
      }
    };

    const tick = () => {
      /* Sub-frame position, so a repaint happens for movement between two
         frames as well as across them. Quantised to keep a still page still. */
      const position = Math.round(scrollState.eased * (FILM.count - 1) * 24);
      if (dirty || position !== painted) {
        draw();
        painted = position;
        dirty = false;
      }
      raf = requestAnimationFrame(tick);
    };

    measure();
    window.addEventListener("resize", measure);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      unsubscribe();
    };
  }, []);

  return (
    <div className="vk-world" aria-hidden="true">
      <canvas ref={canvasRef} className="vk-film" />
      {/* Grading. The film is a photograph of a real room, which means it has
          bright areas exactly where the HUD has to be readable. This is the
          same trick the corner readouts would otherwise need a box for. */}
      <div className="vk-film-grade" />
      <FilmProgress />
    </div>
  );
}

/**
 * A hairline across the top showing how much of the film has arrived.
 *
 * It is the only loading indicator on the page, it is two pixels tall, and it
 * removes itself. A world that is still downloading should say so quietly
 * rather than putting a spinner over the thing it is loading.
 */
function FilmProgress() {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const update = () => setProgress(filmProgress());
    const stop = onFilmProgress(update);
    return stop;
  }, []);

  if (progress >= 1) return null;

  return (
    <div className="vk-film-load" style={{ transform: `scaleX(${progress})` }} />
  );
}

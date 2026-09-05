"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { HeadCloud } from "@/components/HeadCloud";
import { useMediaQuery } from "@/lib/hooks";

/**
 * The operator's head, sticky for the whole site.
 *
 * On the landing page it opens dead centre and at full size, and the first
 * screen of scrolling walks it up into the top-left corner, where it stays as
 * a small marker for the rest of the journey and on every other page. It
 * never stops following the cursor.
 *
 * It is one canvas that lives in the shell and is never unmounted, which is
 * the whole point: a head that remounted per route would restart its scan and
 * snap back to centre every time someone opened a module.
 *
 * The box is sized in CSS and moved with a transform. Resizing a canvas means
 * reallocating it and re-measuring the cloud; scaling one is free.
 */

/** The parked marker's size on screen, matched to the header identity slot. */
const PARK = 46;

/** How much of the first screen the head takes to travel into the corner. */
const TRAVEL = 0.55;

/** How high the resting head sits: a little above centre reads better than on it. */
const CENTRE_BIAS = 0.86;

/** Catch-up rate when the target jumps, as it does on navigation. */
const CHASE = 0.14;

/** Page gutters, matched to the Container and header padding. */
function gutter(vw: number): number {
  const pad = vw >= 1024 ? 48 : vw >= 640 ? 32 : 20;
  return (vw - Math.min(vw, 1440)) / 2 + pad;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function OperatorHead() {
  const pathname = usePathname();
  const landing = pathname === "/";
  const hostRef = React.useRef<HTMLDivElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  /* Read inside the frame loop rather than closed over, so a route change
     does not have to tear down and rebuild the loop. */
  const landingRef = React.useRef(landing);
  React.useEffect(() => {
    landingRef.current = landing;
  }, [landing]);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let raf = 0;
    let current = -1;
    let publishedX = -1;

    const frame = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const box = host.offsetWidth || 1;

      /* Parked as soon as the first screen has been scrolled past, and
         immediately on any page that is not the landing page. */
      const target = landingRef.current
        ? smoothstep(Math.min(1, Math.max(0, window.scrollY / (vh * TRAVEL))))
        : 1;

      if (current < 0 || reduced) current = target;
      else current += (target - current) * CHASE;

      const x0 = gutter(vw);
      const restX = (vw - box) / 2;
      const restY = ((vh - box) / 2) * CENTRE_BIAS;
      const parkY = (62 - PARK) / 2;

      const k = current;
      const scale = 1 + (PARK / box - 1) * k;
      const x = restX + (x0 - restX) * k;
      const y = restY + (parkY - restY) * k;

      host.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
      /* Dim as it shrinks: at marker size the full-strength cloud reads as a
         bright smudge rather than a head. */
      host.style.opacity = String(1 - 0.28 * k);

      /* Published so the HUD and the header can lay out around the marker
         without either of them having to know this arithmetic. */
      if (x0 !== publishedX) {
        publishedX = x0;
        document.documentElement.style.setProperty("--vk-head-x", `${x0}px`);
        document.documentElement.style.setProperty("--vk-head-w", `${PARK}px`);
      }

      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  return (
    <div ref={hostRef} className="vk-head" aria-hidden="true">
      <HeadCloud chrome={false} className="h-full w-full" />
    </div>
  );
}

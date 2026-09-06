"use client";

import * as React from "react";
import {
  coverFit,
  getManifest,
  loadManifest,
  placeSurface,
  quadTransform,
  sampleCamera,
  type Camera,
  type Fit,
  type Manifest,
  type Placement,
  type Surface,
  SURFACE_SCALE,
} from "@/lib/surfaces";
import { scrollState, useScrollDriver } from "@/lib/scroll";
import { surfaceContent } from "@/components/world/surfaceContent";

/**
 * The words on the walls.
 *
 * Every console, board and nameplate in the building is a real HTML element
 * here, transformed onto the rectangle the renderer photographed. The
 * placement runs in the same animation frame as the film, off the same scroll
 * value, so the text tracks the camera exactly rather than lagging behind the
 * picture by a frame.
 *
 * The elements are laid out at a hundred pixels per metre and then mapped, so
 * a panel four metres wide is authored as a four hundred pixel box. Type
 * sizes are chosen in that space and perspective does the rest, which is why
 * a console reads as a console when you are next to it and as a distant glow
 * when you are not.
 */

export function WorldSurfaces({
  onOpen,
}: {
  onOpen: (surface: Surface) => void;
}) {
  useScrollDriver();

  const [manifest, setManifest] = React.useState<Manifest | null>(getManifest());
  const hostRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let live = true;
    loadManifest().then((m) => {
      if (live && m) setManifest(m);
    });
    return () => {
      live = false;
    };
  }, []);

  React.useEffect(() => {
    const host = hostRef.current;
    if (!host || !manifest) return;

    const nodes = new Map<string, HTMLElement>();
    for (const surface of manifest.surfaces) {
      const el = host.querySelector<HTMLElement>(`[data-surface="${surface.id}"]`);
      if (el) nodes.set(surface.id, el);
    }

    const cam: Camera = { x: 0, y: 0, z: 0, qx: 0, qy: 0, qz: 0, qw: 1 };
    const fit: Fit = { scale: 1, offsetX: 0, offsetY: 0, viewportW: 0, viewportH: 0 };
    const place: Placement = { corners: new Array(8).fill(0), facing: 0, size: 0 };

    let raf = 0;

    const tick = () => {
      coverFit(manifest, window.innerWidth, window.innerHeight, fit);
      sampleCamera(manifest, scrollState.eased, cam);

      for (const surface of manifest.surfaces) {
        const el = nodes.get(surface.id);
        if (!el) continue;

        const visible = placeSurface(manifest, cam, surface, fit, place);
        if (!visible) {
          if (el.style.visibility !== "hidden") {
            el.style.visibility = "hidden";
            el.setAttribute("aria-hidden", "true");
            el.style.pointerEvents = "none";
          }
          continue;
        }

        const transform = quadTransform(
          surface.w * 2 * SURFACE_SCALE,
          surface.h * 2 * SURFACE_SCALE,
          place.corners,
        );
        if (!transform) continue;

        el.style.transform = transform;

        /* Fade in as it grows. A panel two hundred metres away is a handful
           of pixels of unreadable type, and drawing it costs the same as
           drawing the one in front of you. */
        const near = Math.min(1, Math.max(0, (place.size - 40) / 120));
        const square = Math.min(1, Math.max(0, (place.facing - 0.08) / 0.22));
        const opacity = near * square;

        if (opacity <= 0.01) {
          el.style.visibility = "hidden";
          el.setAttribute("aria-hidden", "true");
          el.style.pointerEvents = "none";
          continue;
        }

        el.style.visibility = "visible";
        el.style.opacity = String(opacity);
        el.removeAttribute("aria-hidden");
        el.style.pointerEvents = opacity > 0.6 ? "auto" : "none";
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [manifest]);

  return (
    <div ref={hostRef} className="vk-surfaces">
      {(manifest?.surfaces ?? []).map((surface) => (
        <div
          key={surface.id}
          data-surface={surface.id}
          data-kind={surface.kind}
          className="vk-surface"
          style={{
            width: surface.w * 2 * SURFACE_SCALE,
            height: surface.h * 2 * SURFACE_SCALE,
            visibility: "hidden",
          }}
        >
          {surfaceContent(surface, () => onOpen(surface))}
        </div>
      ))}
    </div>
  );
}

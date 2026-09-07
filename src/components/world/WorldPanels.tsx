"use client";

import * as React from "react";
import { panels, placePanel, type Panel, type PanelPlacement } from "@/lib/panels";
import { SURFACE_SCALE, coverFit, getManifest, loadManifest, sampleCamera, type Camera, type Fit, type Manifest } from "@/lib/surfaces";
import { scrollState, useScrollDriver } from "@/lib/scroll";
import { panelContent } from "@/components/world/panelContent";

/**
 * The panels, placed every frame.
 *
 * Each one is planted on the path, faces you square-on, and swings aside as
 * you reach it. Because they face the camera there is no projective
 * transform: a translate and a scale is the whole placement, which is why
 * the type stays exactly as crisp at twenty metres as at two.
 *
 * The loop runs off the same eased scroll value as the film, so a panel and
 * the frame behind it never disagree by a frame.
 */
export function WorldPanels({ onOpen }: { onOpen: (panel: Panel) => void }) {
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
    for (const panel of panels) {
      const el = host.querySelector<HTMLElement>(`[data-panel="${panel.id}"]`);
      if (el) nodes.set(panel.id, el);
    }

    const cam: Camera = { x: 0, y: 0, z: 0, qx: 0, qy: 0, qz: 0, qw: 1 };
    const fit: Fit = { scale: 1, offsetX: 0, offsetY: 0, viewportW: 0, viewportH: 0 };
    const out: PanelPlacement = { x: 0, y: 0, scale: 1, opacity: 0, depth: 0 };

    let raf = 0;

    const tick = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      coverFit(manifest, vw, vh, fit);

      /* The film's drawn height, and its centre, which is where the camera
         axis lands. Everything is measured from there so the panels sit in
         the picture rather than in the window. */
      const drawnHeight = manifest.height * fit.scale;
      const centreX = vw / 2;
      const centreY = vh / 2;

      sampleCamera(manifest, scrollState.eased, cam);

      for (const panel of panels) {
        const el = nodes.get(panel.id);
        if (!el) continue;

        if (!placePanel(manifest, cam, panel, drawnHeight, centreX, centreY, out)) {
          if (el.style.visibility !== "hidden") {
            el.style.visibility = "hidden";
            el.setAttribute("aria-hidden", "true");
            el.style.pointerEvents = "none";
          }
          continue;
        }

        el.style.visibility = "visible";
        el.style.left = `${out.x.toFixed(1)}px`;
        el.style.top = `${out.y.toFixed(1)}px`;
        el.style.transform = `translate(-50%, -50%) scale(${out.scale.toFixed(4)})`;
        el.style.opacity = out.opacity.toFixed(3);
        /* Nearer panels sit over further ones, which is what stops a run of
           credential plates overlapping in the wrong order. */
        el.style.zIndex = String(Math.max(0, Math.round(2000 - out.depth * 20)));
        el.style.pointerEvents = out.opacity > 0.55 ? "auto" : "none";
        el.removeAttribute("aria-hidden");
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [manifest]);

  /*
   * Where the pointer is within a panel, as a pair of 0..1 numbers on the
   * element itself. The CSS reads them to tilt the face towards the cursor
   * and to put a specular sheen under it.
   *
   * These are custom properties rather than a transform written from here,
   * because the frame loop above owns `transform` on this element. The tilt
   * belongs to the face inside it, and the two must not fight over the same
   * declaration.
   */
  const track = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const box = el.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return;
    el.style.setProperty("--px", ((e.clientX - box.left) / box.width).toFixed(3));
    el.style.setProperty("--py", ((e.clientY - box.top) / box.height).toFixed(3));
  }, []);

  const release = React.useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.setProperty("--px", "0.5");
    el.style.setProperty("--py", "0.5");
  }, []);

  return (
    <div ref={hostRef} className="vk-panels">
      {panels.map((panel) => (
        <div
          key={panel.id}
          data-panel={panel.id}
          data-kind={panel.kind}
          className="vk-panel"
          onPointerMove={track}
          onPointerLeave={release}
          style={{
            width: panel.width * SURFACE_SCALE,
            visibility: "hidden",
          }}
        >
          {panelContent(panel, () => onOpen(panel))}
        </div>
      ))}
    </div>
  );
}

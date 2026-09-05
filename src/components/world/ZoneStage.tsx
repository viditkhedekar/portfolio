"use client";

import * as React from "react";
import { useMounted } from "@/lib/hooks";
import { useScrollDriver, useZone } from "@/lib/scroll";

/**
 * Holds one zone's panel in the frame for the whole of that zone.
 *
 * The obvious way to do this is `position: sticky`, and it does not work
 * here. A sticky panel is only pinned for the part of its block that exceeds
 * the viewport, so at these zone lengths it comes unstuck a fifth of the way
 * in and spends the rest of the environment sliding up into the HUD. The
 * panels are therefore staged: taken out of the flow, stacked on one fixed
 * layer, and cross-faded as the camera crosses a border.
 *
 * The stage only engages once this has mounted. Without JavaScript the
 * attribute is never written, the CSS leaves every panel in the document
 * flow, and the page reads top to bottom as an ordinary long page. That is
 * the fallback the whole landing page is meant to have.
 */
export function ZoneStage({ children }: { children: React.ReactNode }) {
  useScrollDriver();
  const zone = useZone();
  const mounted = useMounted();

  return (
    <div className="vk-world-content" data-zone={mounted ? zone.id : undefined}>
      {children}
    </div>
  );
}

"use client";

import * as React from "react";
import { useClock, useMediaQuery } from "@/lib/hooks";
import { useScrollDriver, useZone } from "@/lib/scroll";
import { formatDot, system } from "@/lib/data/system";
import { nextZone, zones, type Zone } from "@/lib/world";
import { StatusDot } from "@/components/ui";

/**
 * The operating-system layer sitting over the world.
 *
 * Four readouts in four corners and a rail down the right-hand side. It is
 * the one part of the landing page that never changes character as the world
 * does, which is what holds five very different environments together as one
 * product.
 *
 * Everything here is HTML. Nothing in the 3D scene carries information that
 * has to be read.
 */

/** The lines printed when the camera crosses into a new environment. */
function transitionLog(zone: Zone): string[] {
  return [
    "> NAVIGATING...",
    `> LOADING ${zone.id.toUpperCase()} MODULE`,
    "> ENVIRONMENT INITIALISED",
    "> MODULE READY",
  ];
}

const LINE_MS = 260;
const HOLD_MS = 1100;

/** Mounted under a key of the zone id, so arriving somewhere new restarts it
    rather than the effect having to reset the count itself. */
function NavigationLog({ zone }: { zone: Zone }) {
  const [shown, setShown] = React.useState(0);

  React.useEffect(() => {
    const lines = transitionLog(zone);
    const timers = lines.map((_, i) =>
      window.setTimeout(() => setShown(i + 1), i * LINE_MS),
    );
    timers.push(
      window.setTimeout(() => setShown(0), lines.length * LINE_MS + HOLD_MS),
    );
    return () => timers.forEach(window.clearTimeout);
  }, [zone]);

  if (shown === 0) return null;

  return (
    <div className="vk-hud-log" role="status" aria-live="polite">
      {transitionLog(zone)
        .slice(0, shown)
        .map((line) => (
          <div key={line}>{line}</div>
        ))}
    </div>
  );
}

/** Scrolls the document to the point on the path a zone begins. */
function useJump() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");

  return React.useCallback(
    (zone: Zone) => {
      const travel = document.documentElement.scrollHeight - window.innerHeight;
      /* A hair past the border, so the arrival lands inside the zone rather
         than exactly on the line between two of them. */
      const at = zone.range[0] + (zone.range[1] - zone.range[0]) * 0.12;
      window.scrollTo({
        top: travel * at,
        behavior: reduced ? "auto" : "smooth",
      });
    },
    [reduced],
  );
}

export function WorldHUD() {
  useScrollDriver();
  const zone = useZone();
  const now = useClock();
  const jump = useJump();
  const next = nextZone(zone);

  const time = now
    ? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
        now.getSeconds(),
      ).padStart(2, "0")}`
    : " ";

  return (
    <div className="vk-hud">
      {/* Top left sits beside the head, which parks in that corner. */}
      <div className="vk-hud-corner vk-hud-tl">
        <div className="vk-hud-strong">{system.code}</div>
        <div className="vk-hud-dim">BUILD {formatDot(system.lastUpdate)}</div>
      </div>

      <div className="vk-hud-corner vk-hud-tr">
        <div className="flex items-center justify-end gap-2">
          <StatusDot status="ONLINE" pulse />
          <span className="vk-hud-strong">SYS ONLINE</span>
        </div>
        <div className="vk-hud-dim" suppressHydrationWarning>
          {time}
        </div>
      </div>

      <div className="vk-hud-corner vk-hud-bl">
        <div className="vk-hud-dim">LOCATION</div>
        <div className="vk-hud-strong">{zone.location}</div>
        <NavigationLog key={zone.id} zone={zone} />
      </div>

      <div className="vk-hud-corner vk-hud-br">
        {next ? (
          <>
            <div className="vk-hud-dim">NEXT</div>
            <div className="vk-hud-strong">{next.location}</div>
          </>
        ) : (
          <>
            <div className="vk-hud-dim">PATH</div>
            <div className="vk-hud-strong">COMPLETE</div>
          </>
        )}
      </div>

      {/* The rail: where you are on the path, and a way off it. */}
      <nav className="vk-hud-rail" aria-label="Destinations">
        <ul>
          {zones.map((z) => {
            const here = z.id === zone.id;
            return (
              <li key={z.id}>
                <button
                  type="button"
                  onClick={() => jump(z)}
                  aria-current={here ? "true" : undefined}
                  data-here={here ? "1" : undefined}
                  data-cursor="TRAVEL"
                  data-cursor-sub={z.location}
                >
                  <span className="vk-hud-rail-tick" aria-hidden="true" />
                  <span className="vk-hud-rail-name">
                    {z.index ? `${z.index} ${z.location}` : z.location}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

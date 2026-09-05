"use client";

import dynamic from "next/dynamic";

/**
 * Loads the world in the browser only.
 *
 * Three needs a real canvas and a real device-pixel ratio, neither of which
 * exists during a server render, and the world is decoration: the page it
 * sits behind is complete HTML on its own and must not wait for a WebGL
 * bundle to become readable.
 */
const World = dynamic(() => import("@/components/world/World").then((m) => m.World), {
  ssr: false,
});

export function WorldMount() {
  return <World />;
}

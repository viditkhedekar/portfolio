"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { useMediaQuery } from "@/lib/hooks";
import { useScrollDriver } from "@/lib/scroll";
import { Rig } from "@/components/world/Rig";
import { Terrain } from "@/components/world/Terrain";
import { Facility } from "@/components/world/Facility";
import { Observatory } from "@/components/world/Observatory";
import { Vault } from "@/components/world/Vault";
import { Chamber } from "@/components/world/Chamber";
import { Comms } from "@/components/world/Comms";

/**
 * The world, mounted behind the landing page.
 *
 * Every environment is in the scene at once. There is no loading between
 * them and no swapping: the whole journey is one space several hundred metres
 * long, and the fog is what decides how much of it you can see from where you
 * are standing. That is the entire trick, and it is why the site never has to
 * cut between five unrelated scenes.
 *
 * The geometry is all lines and points, which costs a few thousand vertices
 * in total. The expensive part of a canvas like this is pixels, so quality is
 * spent on resolution and antialiasing rather than on detail, and both are
 * traded away on small or coarse-pointer devices.
 */

export function World() {
  useScrollDriver();

  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarse = useMediaQuery("(pointer: coarse)");
  const narrow = useMediaQuery("(max-width: 900px)");
  const tier: "high" | "low" = coarse || narrow ? "low" : "high";

  /* A canvas painting sixty frames a second behind a hidden tab is pure heat.
     Framing is suspended whenever the page is not on screen. */
  const [running, setRunning] = React.useState(true);
  React.useEffect(() => {
    const onVisibility = () => setRunning(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVisibility);
    onVisibility();
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div className="vk-world" aria-hidden="true">
      <Canvas
        frameloop={running ? "always" : "never"}
        dpr={tier === "high" ? [1, 1.75] : 1}
        gl={{
          antialias: tier === "high",
          powerPreference: "high-performance",
          alpha: false,
        }}
        camera={{ fov: 58, near: 0.1, far: 400, position: [0, 1.3, 16] }}
      >
        <Rig reduced={reduced} />
        <Terrain tier={tier} />
        <Facility />
        <Observatory tier={tier} />
        <Vault />
        <Chamber tier={tier} />
        <Comms tier={tier} />
      </Canvas>
    </div>
  );
}

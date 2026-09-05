"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { rectFrame, ring, segments } from "@/components/world/geometry";
import { WORLD_COLOR } from "@/lib/world";
import { air, worldTime } from "@/components/world/Rig";
import { channels } from "@/lib/data/identity";

/**
 * 05 — COMMUNICATIONS ARRAY.
 *
 * The last thing on the path, and the only structure in the world that points
 * away from it. A dish on a mast, tipped up and out, with a pulse leaving it
 * on a slow cycle. One marker stands at the foot of the mast for each channel
 * that is actually open.
 *
 * The camera's final move is upward, following the transmission rather than
 * arriving anywhere, which is the note the journey should end on.
 */

const DISH_Z = -284;
const DISH_Y = 4.2;
const DISH_R = 8.5;
/** How deep the dish is: y rises with the square of the radius. */
const CURVE = 0.075;
const TILT = -1.05;

/** Pulses in flight, and how long each takes to leave. */
const PULSES = 3;
const PULSE_PERIOD = 3.4;

export function Comms({ tier }: { tier: "high" | "low" }) {
  const divisions = tier === "high" ? 96 : 48;

  /* The dish, as a set of rings sitting on a paraboloid. */
  const shells = React.useMemo(() => {
    const radii = [2, 3.6, 5.2, 6.9, DISH_R];
    return radii.map((r) => ({ r, y: r * r * CURVE, geo: ring(r, divisions) }));
  }, [divisions]);

  /* Spokes, drawn along the same curve so they sit on the surface. */
  const spokes = React.useMemo(() => {
    const pts: number[] = [];
    const arms = 16;
    const steps = 6;
    for (let a = 0; a < arms; a++) {
      const ang = (a / arms) * Math.PI * 2;
      for (let s = 0; s < steps; s++) {
        const r0 = (s / steps) * DISH_R;
        const r1 = ((s + 1) / steps) * DISH_R;
        pts.push(
          Math.cos(ang) * r0, r0 * r0 * CURVE, Math.sin(ang) * r0,
          Math.cos(ang) * r1, r1 * r1 * CURVE, Math.sin(ang) * r1,
        );
      }
    }
    return segments(pts);
  }, []);

  /* Mast and its guys, holding the dish over the end of the path. */
  const mast = React.useMemo(() => {
    const pts: number[] = [0, 0, 0, 0, DISH_Y, 0];
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      pts.push(0, DISH_Y * 0.8, 0, Math.cos(a) * 3.4, 0, Math.sin(a) * 3.4);
    }
    return segments(pts);
  }, []);

  const pulse = React.useMemo(() => ring(1.4, divisions), [divisions]);
  const marker = React.useMemo(() => rectFrame(0.6, 0.6), []);
  const pad = React.useMemo(() => ring(5.5, divisions), [divisions]);

  React.useEffect(
    () => () => {
      shells.forEach((s) => s.geo.dispose());
      spokes.dispose();
      mast.dispose();
      pulse.dispose();
      marker.dispose();
      pad.dispose();
    },
    [shells, spokes, mast, pulse, marker, pad],
  );

  const pulses = React.useRef<THREE.Group>(null);
  const dishMat = React.useRef<THREE.LineBasicMaterial>(null);

  useFrame((state) => {
    const t = worldTime(state);

    /* Pulses climb out along the dish axis and fade as they go. Staggered so
       one is always leaving and the array never looks idle. */
    const group = pulses.current;
    if (group) {
      group.children.forEach((child, i) => {
        const phase = ((t + (i * PULSE_PERIOD) / PULSES) % PULSE_PERIOD) / PULSE_PERIOD;
        child.position.y = 1 + phase * 26;
        child.scale.setScalar(0.4 + phase * 3.4);
        const mat = (child as THREE.LineSegments).material as THREE.LineBasicMaterial;
        mat.opacity = (1 - phase) * 0.42 * air.key;
      });
    }

    if (dishMat.current) dishMat.current.opacity = 0.42 * air.key;
  });

  return (
    <group position={[0, 0, DISH_Z]}>
      <lineSegments geometry={mast}>
        <lineBasicMaterial color={WORLD_COLOR.structure} transparent opacity={0.5} fog />
      </lineSegments>

      <lineSegments geometry={pad} position={[0, 0.02, 0]}>
        <lineBasicMaterial color={WORLD_COLOR.accent} transparent opacity={0.14} fog />
      </lineSegments>

      {/* Channels, one marker each, standing around the foot of the mast. */}
      {channels.map((c, i) => {
        const a = (i / channels.length) * Math.PI * 2 + Math.PI / 4;
        return (
          <lineSegments
            key={c.id}
            geometry={marker}
            position={[Math.cos(a) * 4.4, 0.9, Math.sin(a) * 4.4]}
            rotation={[0, -a + Math.PI / 2, 0]}
          >
            <lineBasicMaterial
              color={c.href ? WORLD_COLOR.accent : WORLD_COLOR.structure}
              transparent
              opacity={c.href ? 0.6 : 0.28}
              fog
            />
          </lineSegments>
        );
      })}

      <group position={[0, DISH_Y, 0]} rotation={[TILT, 0, 0]}>
        {shells.map((s, i) => (
          <lineSegments key={s.r} geometry={s.geo} position={[0, s.y, 0]}>
            <lineBasicMaterial
              ref={i === shells.length - 1 ? dishMat : undefined}
              color={i === shells.length - 1 ? WORLD_COLOR.edge : WORLD_COLOR.structure}
              transparent
              opacity={i === shells.length - 1 ? 0.42 : 0.3}
              fog
            />
          </lineSegments>
        ))}

        <lineSegments geometry={spokes}>
          <lineBasicMaterial color={WORLD_COLOR.structure} transparent opacity={0.22} fog />
        </lineSegments>

        <group ref={pulses}>
          {Array.from({ length: PULSES }, (_, i) => (
            <lineSegments key={i} geometry={pulse}>
              <lineBasicMaterial
                color={WORLD_COLOR.accent}
                transparent
                opacity={0}
                depthWrite={false}
                fog
              />
            </lineSegments>
          ))}
        </group>
      </group>
    </group>
  );
}

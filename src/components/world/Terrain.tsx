"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { cloud, grid, rng } from "@/components/world/geometry";
import { WORLD_COLOR } from "@/lib/world";
import { air } from "@/components/world/Rig";

/**
 * The floor and the air between the environments.
 *
 * One grid runs the entire length of the journey rather than one per
 * environment, which is what stops the world reading as five separate rooms
 * with cuts between them. Fog does the hiding; the grid is simply always
 * there, and the camera is never anywhere the ground has run out.
 */

/** The whole path, with room at both ends. */
const Z_START = 40;
const Z_END = -310;
const HALF_WIDTH = 40;

export function Terrain({ tier }: { tier: "high" | "low" }) {
  const floor = React.useMemo(
    () => grid(-HALF_WIDTH, HALF_WIDTH, Z_END, Z_START, 4, 0),
    [],
  );

  /* A second, finer grid only under the walked line. Two densities read as
     detail up close and calm further out, which one grid cannot do. */
  const inner = React.useMemo(() => grid(-7, 7, Z_END, Z_START, 1, 0.002), []);

  const dust = React.useMemo(() => {
    const count = tier === "high" ? 2800 : 900;
    const rand = rng(0x5eed);
    const pts: number[] = [];
    for (let i = 0; i < count; i++) {
      pts.push(
        (rand() - 0.5) * 46,
        rand() * 11 - 0.4,
        Z_END + rand() * (Z_START - Z_END),
      );
    }
    return cloud(pts);
  }, [tier]);

  React.useEffect(
    () => () => {
      floor.dispose();
      inner.dispose();
      dust.dispose();
    },
    [floor, inner, dust],
  );

  const dustRef = React.useRef<THREE.Points>(null);
  const floorMat = React.useRef<THREE.LineBasicMaterial>(null);
  const innerMat = React.useRef<THREE.LineBasicMaterial>(null);

  useFrame((state) => {
    /* The dust hangs rather than falls. A slow bob and an almost imperceptible
       turn is enough for the air to feel occupied. */
    const p = dustRef.current;
    if (p) {
      const t = state.clock.elapsedTime;
      p.position.y = Math.sin(t * 0.11) * 0.5;
      p.rotation.y = t * 0.004;
    }
    if (floorMat.current) floorMat.current.opacity = 0.3 * air.key;
    if (innerMat.current) innerMat.current.opacity = 0.16 * air.key;
  });

  return (
    <group>
      <lineSegments geometry={floor}>
        <lineBasicMaterial
          ref={floorMat}
          color={WORLD_COLOR.structure}
          transparent
          opacity={0.3}
          fog
        />
      </lineSegments>

      <lineSegments geometry={inner}>
        <lineBasicMaterial
          ref={innerMat}
          color={WORLD_COLOR.structure}
          transparent
          opacity={0.16}
          fog
        />
      </lineSegments>

      <points ref={dustRef} geometry={dust}>
        <pointsMaterial
          color={WORLD_COLOR.dust}
          size={0.035}
          sizeAttenuation
          transparent
          opacity={0.5}
          depthWrite={false}
          fog
        />
      </points>
    </group>
  );
}

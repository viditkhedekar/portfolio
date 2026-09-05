"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { boxFrame, cloud, ring, rng, segments } from "@/components/world/geometry";
import { WORLD_COLOR } from "@/lib/world";
import { air } from "@/components/world/Rig";
import { identity } from "@/lib/data/identity";

/**
 * 04 — IDENTITY CHAMBER.
 *
 * After the facility and the vault, everything stops. One object standing off
 * the walked line, a ring of posts too far out to read as a wall, and a
 * column of light. The fog is at its heaviest here, so most of the chamber is
 * implied rather than shown.
 *
 * The restraint is the content. This is the section about the person, and it
 * gets the quietest room in the world.
 */

const CENTRE_Z = -226;
const MONOLITH_X = -3.2;

export function Chamber({ tier }: { tier: "high" | "low" }) {
  const monolith = React.useMemo(() => boxFrame(1.1, 3.4, 0.6), []);
  const halo = React.useMemo(() => ring(3.1, 72), []);
  const perimeter = React.useMemo(() => ring(15, 96), []);

  /* Posts standing at the edge of the visible: enough to say the room has a
     boundary, not enough to show where it is. */
  const posts = React.useMemo(() => {
    const pts: number[] = [];
    const n = 24;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = Math.cos(a) * 15;
      const z = Math.sin(a) * 15;
      pts.push(x, 0, z, x, 6.5, z);
    }
    return segments(pts);
  }, []);

  /* The column above the monolith, drawn as a taper rather than a beam. */
  const column = React.useMemo(() => {
    const pts: number[] = [];
    const n = 14;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      pts.push(
        Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55,
        Math.cos(a) * 1.9, 8, Math.sin(a) * 1.9,
      );
    }
    return segments(pts);
  }, []);

  /* One drifting mote per line of the identity record. The count is borrowed
     from the data so the chamber cannot get out of step with the file.
     Built around the origin: the group it hangs in supplies the offset. */
  const motes = React.useMemo(() => {
    const per = tier === "high" ? 40 : 14;
    const rand = rng(0x1de7);
    const pts: number[] = [];
    for (let i = 0; i < identity.records.length * per; i++) {
      const a = rand() * Math.PI * 2;
      const r = 0.4 + rand() * 5.5;
      pts.push(Math.cos(a) * r, rand() * 6, Math.sin(a) * r);
    }
    return cloud(pts);
  }, [tier]);

  React.useEffect(
    () => () => {
      monolith.dispose();
      halo.dispose();
      perimeter.dispose();
      posts.dispose();
      column.dispose();
      motes.dispose();
    },
    [monolith, halo, perimeter, posts, column, motes],
  );

  const moteRef = React.useRef<THREE.Points>(null);
  const columnMat = React.useRef<THREE.LineBasicMaterial>(null);
  const haloMat = React.useRef<THREE.LineBasicMaterial>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    /* The motes rise and wrap. Slow enough that the room still reads as still. */
    const p = moteRef.current;
    if (p) {
      p.position.y = ((t * 0.16) % 6) - 3;
      p.rotation.y = t * 0.02;
    }

    if (columnMat.current) columnMat.current.opacity = (0.1 + 0.04 * Math.sin(t * 0.5)) * air.key;
    if (haloMat.current) haloMat.current.opacity = (0.3 + 0.08 * Math.sin(t * 0.4)) * air.key;
  });

  return (
    <group position={[0, 0, CENTRE_Z]}>
      <group position={[MONOLITH_X, 0, 0]}>
        <lineSegments geometry={monolith} position={[0, 1.75, 0]}>
          <lineBasicMaterial color={WORLD_COLOR.edge} transparent opacity={0.6} fog />
        </lineSegments>

        <lineSegments geometry={halo} position={[0, 0.02, 0]}>
          <lineBasicMaterial
            ref={haloMat}
            color={WORLD_COLOR.accent}
            transparent
            opacity={0.3}
            fog
          />
        </lineSegments>

        <lineSegments geometry={column} position={[0, 0.05, 0]}>
          <lineBasicMaterial
            ref={columnMat}
            color={WORLD_COLOR.accent}
            transparent
            opacity={0.1}
            depthWrite={false}
            fog
          />
        </lineSegments>

        <points ref={moteRef} geometry={motes}>
          <pointsMaterial
            color={WORLD_COLOR.dust}
            size={0.03}
            sizeAttenuation
            transparent
            opacity={0.6}
            depthWrite={false}
            fog
          />
        </points>
      </group>

      <lineSegments geometry={posts}>
        <lineBasicMaterial color={WORLD_COLOR.structure} transparent opacity={0.22} fog />
      </lineSegments>

      <lineSegments geometry={perimeter} position={[0, 0.01, 0]}>
        <lineBasicMaterial color={WORLD_COLOR.structure} transparent opacity={0.2} fog />
      </lineSegments>
    </group>
  );
}

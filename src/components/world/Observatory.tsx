"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { cloud, rectFrame, ring, rng, segments } from "@/components/world/geometry";
import { WORLD_COLOR } from "@/lib/world";
import { air, worldTime } from "@/components/world/Rig";
import { subjects } from "@/lib/data/school";

/**
 * 02 — ACADEMIC OBSERVATORY.
 *
 * The ceiling comes off. Three rings hang in the dark on different tilts,
 * turning at different rates, with one marker on the inner ring for each
 * subject currently being taken. The camera climbs and flies straight through
 * the middle of it.
 *
 * The count is read from the academic data rather than typed here, so the
 * observatory can never end up showing a different number of subjects from
 * the page it leads to.
 */

const CENTRE: [number, number, number] = [0, 6, -110];

const RADII = [10.5, 14.5, 18.5];
/** Tilt and rate per ring. Uneven on purpose: matched rates read as a machine. */
const TILTS: Array<[number, number]> = [
  [0.34, 0.055],
  [-0.62, -0.033],
  [1.15, 0.019],
];

export function Observatory({ tier }: { tier: "high" | "low" }) {
  const rings = React.useMemo(() => RADII.map((r) => ring(r, tier === "high" ? 128 : 64)), [tier]);

  /* One marker per subject, spaced evenly around the inner ring. */
  const marker = React.useMemo(() => rectFrame(0.5, 0.5), []);
  const seats = React.useMemo(() => {
    const n = subjects.length;
    return Array.from({ length: n }, (_, i) => {
      const a = (i / n) * Math.PI * 2;
      return { a, x: Math.cos(a) * RADII[0], z: Math.sin(a) * RADII[0] };
    });
  }, []);

  /* A sky, thinning towards the horizon so the eye is pulled upward. */
  const stars = React.useMemo(() => {
    const count = tier === "high" ? 900 : 320;
    const rand = rng(0x0b5e);
    const pts: number[] = [];
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const r = 14 + rand() * 34;
      const h = 3 + Math.pow(rand(), 0.6) * 26;
      pts.push(Math.cos(a) * r, h, CENTRE[2] + Math.sin(a) * r);
    }
    return cloud(pts);
  }, [tier]);

  /* The axis the whole thing is built around, drawn down to the floor. */
  const axis = React.useMemo(
    () => segments([0, -CENTRE[1], 0, 0, 22 - CENTRE[1], 0]),
    [],
  );
  const base = React.useMemo(() => ring(6.5, 96), []);

  React.useEffect(
    () => () => {
      rings.forEach((g) => g.dispose());
      marker.dispose();
      stars.dispose();
      axis.dispose();
      base.dispose();
    },
    [rings, marker, stars, axis, base],
  );

  const ringRefs = React.useRef<Array<THREE.LineSegments | null>>([]);
  const markerGroup = React.useRef<THREE.Group>(null);
  const ringMat = React.useRef<THREE.LineBasicMaterial>(null);

  useFrame((state) => {
    const t = worldTime(state);

    ringRefs.current.forEach((r, i) => {
      if (r) r.rotation.y = t * TILTS[i][1];
    });

    /* Markers ride the inner ring and stay square to the camera, so a subject
       never presents itself edge-on and vanishes. Their breath is set here
       too: they are reached through the group's ref, which keeps the whole
       per-frame mutation on objects three owns rather than on render values. */
    const group = markerGroup.current;
    if (group) {
      group.rotation.y = t * TILTS[0][1];
      group.children.forEach((child, i) => {
        child.lookAt(state.camera.position);
        const mat = (child as THREE.LineSegments).material as THREE.LineBasicMaterial;
        mat.opacity = (0.45 + 0.25 * Math.sin(t * 0.6 + i * 0.7)) * air.key;
      });
    }

    if (ringMat.current) ringMat.current.opacity = 0.4 * air.key;
  });

  return (
    <group>
      {/* Rings */}
      <group position={CENTRE}>
        {rings.map((geo, i) => (
          <lineSegments
            key={RADII[i]}
            ref={(el) => {
              ringRefs.current[i] = el;
            }}
            geometry={geo}
            rotation={[TILTS[i][0], 0, TILTS[i][0] * 0.4]}
          >
            {i === 0 ? (
              <lineBasicMaterial
                ref={ringMat}
                color={WORLD_COLOR.edge}
                transparent
                opacity={0.4}
                fog
              />
            ) : (
              <lineBasicMaterial
                color={WORLD_COLOR.structure}
                transparent
                opacity={i === 1 ? 0.34 : 0.24}
                fog
              />
            )}
          </lineSegments>
        ))}

        {/* Subjects */}
        <group ref={markerGroup} rotation={[TILTS[0][0], 0, TILTS[0][0] * 0.4]}>
          {seats.map((s) => (
            <lineSegments key={s.a} geometry={marker} position={[s.x, 0, s.z]}>
              <lineBasicMaterial
                color={WORLD_COLOR.accent}
                transparent
                opacity={0.5}
                fog
              />
            </lineSegments>
          ))}
        </group>

        <lineSegments geometry={axis}>
          <lineBasicMaterial color={WORLD_COLOR.structure} transparent opacity={0.3} fog />
        </lineSegments>
      </group>

      <lineSegments geometry={base} position={[0, 0.01, CENTRE[2]]}>
        <lineBasicMaterial color={WORLD_COLOR.accent} transparent opacity={0.16} fog />
      </lineSegments>

      <points geometry={stars}>
        <pointsMaterial
          color={0x9aa6b2}
          size={0.09}
          sizeAttenuation
          transparent
          opacity={0.75}
          depthWrite={false}
          fog
        />
      </points>
    </group>
  );
}

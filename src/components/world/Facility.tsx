"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { boxFrame, readout, rectFrame, segments, type Readout } from "@/components/world/geometry";
import { WORLD_COLOR } from "@/lib/world";
import { air, worldTime } from "@/components/world/Rig";

/**
 * 01 — PROJECT FACILITY.
 *
 * A long dark hall with five instrument stations set along it, alternating
 * side to side so the camera has to weave. Each station is a real project:
 * the face shows the shape of the thing it does rather than a screenshot,
 * because at the speed the camera passes, a shape reads and a screenshot does
 * not.
 *
 * Nothing here is clickable. The stations are scenery; the panel beside them
 * in HTML is the way in.
 */

/** Where the hall begins and ends on the path. */
const MOUTH_Z = -18;
const END_Z = -78;

/** The five stations, in the order the project index lists them. */
const STATIONS: Array<{ id: string; kind: Readout; z: number; side: 1 | -1 }> = [
  { id: "PX-001", kind: "network", z: -26, side: -1 },
  { id: "PX-002", kind: "motion", z: -36, side: 1 },
  { id: "PX-003", kind: "pitch", z: -46, side: -1 },
  { id: "PX-004", kind: "market", z: -56, side: 1 },
  { id: "PX-005", kind: "model", z: -66, side: 1 },
];

const PANEL_W = 3.4;
const PANEL_H = 2.1;
const STATION_X = 5.6;

/** How close the camera has to be for a station to come up to full. */
const ATTENTION = 15;

/* ------------------------------------------------------------------ shell */

/** The tunnel: ribs across the hall, and rails running its length. */
function Shell() {
  const ribs = React.useMemo(() => {
    const pts: number[] = [];
    const w = 15;
    const h = 8.4;
    for (let z = MOUTH_Z; z >= END_Z; z -= 3) {
      /* Ribs are open at the floor, so the grid stays the ground plane. */
      pts.push(
        -w / 2, 0, z, -w / 2, h, z,
        -w / 2, h, z, w / 2, h, z,
        w / 2, h, z, w / 2, 0, z,
      );
    }
    /* Rails along the top corners and at shoulder height. */
    for (const x of [-w / 2, w / 2]) {
      for (const ry of [h, 2.6]) {
        pts.push(x, ry, MOUTH_Z, x, ry, END_Z);
      }
    }
    return segments(pts);
  }, []);

  /* The mouth of the facility, marked once and brightly, so entering it is an
     event rather than more of the same corridor. */
  const mouth = React.useMemo(() => rectFrame(15.6, 9), []);

  React.useEffect(
    () => () => {
      ribs.dispose();
      mouth.dispose();
    },
    [ribs, mouth],
  );

  const ribMat = React.useRef<THREE.LineBasicMaterial>(null);

  useFrame(() => {
    if (ribMat.current) ribMat.current.opacity = 0.42 * air.key;
  });

  return (
    <group>
      <lineSegments geometry={ribs}>
        <lineBasicMaterial
          ref={ribMat}
          color={WORLD_COLOR.structure}
          transparent
          opacity={0.42}
          fog
        />
      </lineSegments>

      <lineSegments geometry={mouth} position={[0, 4.5, MOUTH_Z]}>
        <lineBasicMaterial color={WORLD_COLOR.accent} transparent opacity={0.22} fog />
      </lineSegments>
    </group>
  );
}

/* ---------------------------------------------------------------- station */

function Station({ kind, z, side }: { kind: Readout; z: number; side: 1 | -1 }) {
  const face = React.useMemo(
    () => readout(kind, PANEL_W * 0.82, PANEL_H * 0.72, z * 977),
    [kind, z],
  );
  const frame = React.useMemo(() => rectFrame(PANEL_W, PANEL_H), []);
  const plinth = React.useMemo(() => boxFrame(1.5, 1.5, 1.2), []);
  const stem = React.useMemo(
    () => segments([0, -PANEL_H / 2, 0, 0, -PANEL_H / 2 - 0.75, 0]),
    [],
  );
  const scan = React.useMemo(
    () => segments([-PANEL_W * 0.41, 0, 0, PANEL_W * 0.41, 0, 0]),
    [],
  );

  React.useEffect(
    () => () => {
      face.dispose();
      frame.dispose();
      plinth.dispose();
      stem.dispose();
      scan.dispose();
    },
    [face, frame, plinth, stem, scan],
  );

  const faceMat = React.useRef<THREE.LineBasicMaterial>(null);
  const frameMat = React.useRef<THREE.LineBasicMaterial>(null);
  const scanRef = React.useRef<THREE.LineSegments>(null);
  const scanMat = React.useRef<THREE.LineBasicMaterial>(null);

  useFrame((state) => {
    /* Attention is distance, not scroll position: it stays correct however the
       camera path is later retimed. */
    const d = Math.abs(state.camera.position.z - z);
    const near = Math.max(0, 1 - d / ATTENTION);
    const lit = near * near;

    if (faceMat.current) faceMat.current.opacity = (0.2 + 0.72 * lit) * air.key;
    if (frameMat.current) frameMat.current.opacity = (0.25 + 0.5 * lit) * air.key;

    /* One line sweeping the panel. The station is reading something. */
    const t = worldTime(state);
    if (scanRef.current) {
      const cycle = (t * 0.42 + z * 0.13) % 1;
      scanRef.current.position.y = (cycle - 0.5) * PANEL_H * 0.86;
    }
    if (scanMat.current) scanMat.current.opacity = 0.5 * lit;
  });

  return (
    <group position={[STATION_X * side, 2.35, z]} rotation={[0, -side * 0.44, 0]}>
      <lineSegments geometry={frame}>
        <lineBasicMaterial ref={frameMat} color={WORLD_COLOR.edge} transparent opacity={0.3} fog />
      </lineSegments>

      <lineSegments geometry={face}>
        <lineBasicMaterial ref={faceMat} color={WORLD_COLOR.accent} transparent opacity={0.2} fog />
      </lineSegments>

      <lineSegments ref={scanRef} geometry={scan}>
        <lineBasicMaterial ref={scanMat} color={WORLD_COLOR.accent} transparent opacity={0} fog />
      </lineSegments>

      <lineSegments geometry={stem}>
        <lineBasicMaterial color={WORLD_COLOR.structure} transparent opacity={0.5} fog />
      </lineSegments>

      <lineSegments geometry={plinth} position={[0, -PANEL_H / 2 - 1.5, 0]}>
        <lineBasicMaterial color={WORLD_COLOR.structure} transparent opacity={0.55} fog />
      </lineSegments>
    </group>
  );
}

export function Facility() {
  return (
    <group>
      <Shell />
      {STATIONS.map((s) => (
        <Station key={s.id} kind={s.kind} z={s.z} side={s.side} />
      ))}
    </group>
  );
}

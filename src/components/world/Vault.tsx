"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { segments } from "@/components/world/geometry";
import { WORLD_COLOR } from "@/lib/world";
import { air } from "@/components/world/Rig";
import { certifications } from "@/lib/data/certifications";

/**
 * 03 — CREDENTIAL VAULT.
 *
 * A narrow corridor between two walls of record slots. Most slots are empty
 * and drawn in the structure grey; the filled ones are lit, and there are
 * exactly as many lit slots as there are certifications on record. Nothing
 * here is decorative padding, which is the point: the wall is a true picture
 * of how much is in the database.
 */

const Z_START = -144;
const Z_END = -196;
const WALL_X = 6;
const ROWS = 6;
const ROW_H = 0.72;
const SLOT_W = 1.75;
const GAP = 0.22;
const FLOOR_Y = 0.5;

/** Slot rectangles for one wall, in the YZ plane at x = 0. */
function wallSlots(filled: boolean, count: number): THREE.BufferGeometry {
  const pts: number[] = [];
  const columns = Math.floor((Z_START - Z_END) / (SLOT_W + GAP));

  /* Filled slots are spread evenly down the corridor rather than clustered,
     so the walk past them is paced. */
  const stride = count > 0 ? (columns * ROWS) / count : 0;
  let taken = 0;

  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < ROWS; r++) {
      const index = c * ROWS + r;
      const isFilled = stride > 0 && taken < count && index >= Math.round(taken * stride);
      if (isFilled) taken++;
      if (isFilled !== filled) continue;

      const z0 = Z_START - c * (SLOT_W + GAP);
      const z1 = z0 - SLOT_W;
      const y0 = FLOOR_Y + r * (ROW_H + 0.14);
      const y1 = y0 + ROW_H;

      pts.push(
        0, y0, z0, 0, y0, z1,
        0, y0, z1, 0, y1, z1,
        0, y1, z1, 0, y1, z0,
        0, y1, z0, 0, y0, z0,
      );

      /* A filled record gets a pull handle, which is what tells the eye at a
         glance which slots hold something. */
      if (filled) {
        const mid = (y0 + y1) / 2;
        pts.push(0, mid, z0 - SLOT_W * 0.3, 0, mid, z1 + SLOT_W * 0.3);
      }
    }
  }

  return segments(pts);
}

export function Vault() {
  const empty = React.useMemo(() => wallSlots(false, certifications.length), []);
  const filled = React.useMemo(() => wallSlots(true, certifications.length), []);

  /* The room the walls stand in: a low ceiling and its supports. */
  const shell = React.useMemo(() => {
    const pts: number[] = [];
    const h = 5.4;
    for (let z = Z_START; z >= Z_END; z -= 4) {
      pts.push(-WALL_X, h, z, WALL_X, h, z);
    }
    for (const x of [-WALL_X, WALL_X]) {
      pts.push(x, h, Z_START, x, h, Z_END);
      pts.push(x, 0, Z_START, x, 0, Z_END);
    }
    return segments(pts);
  }, []);

  /* One bar sweeping the length of the corridor, the vault reading itself. */
  const sweep = React.useMemo(
    () =>
      segments([
        -WALL_X, 0.02, 0, -WALL_X, 5.4, 0,
        -WALL_X, 5.4, 0, WALL_X, 5.4, 0,
        WALL_X, 5.4, 0, WALL_X, 0.02, 0,
      ]),
    [],
  );

  React.useEffect(
    () => () => {
      empty.dispose();
      filled.dispose();
      shell.dispose();
      sweep.dispose();
    },
    [empty, filled, shell, sweep],
  );

  const walls = React.useRef<THREE.Group>(null);
  const sweepRef = React.useRef<THREE.LineSegments>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    /* Both walls are driven from the one group ref. Reffing a material inside
       a map only ever captures the last element, and here that would leave one
       wall pulsing and the other frozen. */
    const group = walls.current;
    if (group) {
      const dim = 0.26 * air.key;
      const lit = (0.55 + 0.12 * Math.sin(t * 0.9)) * air.key;
      for (const side of group.children) {
        for (let i = 0; i < side.children.length; i++) {
          const mat = (side.children[i] as THREE.LineSegments)
            .material as THREE.LineBasicMaterial;
          mat.opacity = i === 0 ? dim : lit;
        }
      }
    }

    if (sweepRef.current) {
      const cycle = (t * 0.09) % 1;
      sweepRef.current.position.z = Z_START + cycle * (Z_END - Z_START);
    }
  });

  return (
    <group>
      <lineSegments geometry={shell}>
        <lineBasicMaterial color={WORLD_COLOR.structure} transparent opacity={0.36} fog />
      </lineSegments>

      <group ref={walls}>
        {[-1, 1].map((side) => (
          <group key={side} position={[WALL_X * side, 0, 0]}>
            {/* Order matters: the loop above reads index 0 as the empty slots
                and everything after it as filled. */}
            <lineSegments geometry={empty}>
              <lineBasicMaterial
                color={WORLD_COLOR.structure}
                transparent
                opacity={0.26}
                fog
              />
            </lineSegments>
            <lineSegments geometry={filled}>
              <lineBasicMaterial
                color={WORLD_COLOR.accent}
                transparent
                opacity={0.55}
                fog
              />
            </lineSegments>
          </group>
        ))}
      </group>

      <lineSegments ref={sweepRef} geometry={sweep}>
        <lineBasicMaterial color={WORLD_COLOR.edge} transparent opacity={0.4} fog />
      </lineSegments>
    </group>
  );
}

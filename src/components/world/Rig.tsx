"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { scrollState } from "@/lib/scroll";
import { emptyAir, sampleAir, samplePath } from "@/lib/world";

/**
 * The camera and the air.
 *
 * This is the only component that moves the camera. Scroll picks a point on
 * the path, the path gives a position and a look target, and the fog is
 * cross-faded between environments so arriving somewhere new is felt before
 * it is seen.
 *
 * Nothing here allocates per frame. At sixty frames a second a new Vector3 is
 * a new Vector3 sixty times a second, and the garbage collector eventually
 * charges for it in exactly the place a scroll animation cannot afford it.
 *
 * The fog and the background are declared rather than assigned onto the
 * scene, so every per-frame write in here goes through a ref to an object
 * three owns.
 */

/**
 * The current atmosphere, published for the environments.
 *
 * Line materials ignore lights, so "how lit is this place" cannot be a lamp;
 * it is a brightness the scenes apply to their own materials. Rig writes,
 * everything else reads.
 */
export const air = emptyAir();

/** How far the pointer can lean the camera, in metres. */
const PARALLAX_X = 0.55;
const PARALLAX_Y = 0.3;
const PARALLAX_CHASE = 0.045;

/** Roll into the direction of travel, in radians per unit of scroll velocity. */
const ROLL = 2.6;

export function Rig({ reduced }: { reduced: boolean }) {
  const pos = React.useRef<[number, number, number]>([0, 0, 0]);
  const look = React.useRef<[number, number, number]>([0, 0, 0]);
  const target = React.useRef(new THREE.Vector3());
  const lean = React.useRef({ x: 0, y: 0 });
  const fog = React.useRef<THREE.FogExp2>(null);
  const background = React.useRef<THREE.Color>(null);

  useFrame((state) => {
    const p = scrollState.eased;

    samplePath(p, pos.current, look.current);
    sampleAir(p, air);

    /* Pointer parallax, chased rather than snapped so a flick of the mouse
       does not jolt the whole world. */
    if (!reduced) {
      lean.current.x += (state.pointer.x * PARALLAX_X - lean.current.x) * PARALLAX_CHASE;
      lean.current.y += (state.pointer.y * PARALLAX_Y - lean.current.y) * PARALLAX_CHASE;
    }

    const camera = state.camera;
    camera.position.set(
      pos.current[0] + lean.current.x,
      pos.current[1] + lean.current.y,
      pos.current[2],
    );
    target.current.set(look.current[0], look.current[1], look.current[2]);
    camera.lookAt(target.current);

    /* A little bank into the travel. Small enough to register as weight
       rather than as a camera doing tricks. */
    if (!reduced) {
      camera.rotation.z += Math.max(-0.05, Math.min(0.05, scrollState.velocity * ROLL));
    }

    fog.current?.color.setRGB(air.fog[0], air.fog[1], air.fog[2]);
    if (fog.current) fog.current.density = air.density;
    background.current?.setRGB(air.fog[0], air.fog[1], air.fog[2]);
  });

  return (
    <>
      <fogExp2 ref={fog} attach="fog" args={[0x08090a, 0.02]} />
      <color ref={background} attach="background" args={[0x08090a]} />
    </>
  );
}

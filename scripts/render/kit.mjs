/**
 * Shared parts for the five environments.
 *
 * The facility established what makes a room in this world read: lit surfaces
 * that leave the frame, a deck polished enough to carry the lights down it, a
 * repeating rhythm of structure, real haze, and a small pool of real lights
 * that follows the camera because a building cannot afford one light per
 * fixture. Everything after it uses the same parts, which is most of why five
 * very different spaces still look like one building.
 */

import { glowTexture, panelTexture, floorTexture, floorRoughness } from "./textures.mjs";

/** One set of materials for the whole world, built once. */
export function buildKit(THREE) {
  const glow = glowTexture(THREE);

  const panel = panelTexture(THREE);
  const floorMap = floorTexture(THREE);
  const floorRough = floorRoughness(THREE);

  const mat = {
    /* Plated wall. */
    wall: new THREE.MeshStandardMaterial({
      map: panel,
      color: 0xd6dee6,
      roughness: 0.7,
      metalness: 0.3,
      envMapIntensity: 0.9,
    }),
    /* Polished deck. The single most valuable material in the world. */
    floor: new THREE.MeshStandardMaterial({
      map: floorMap,
      roughnessMap: floorRough,
      color: 0xb6bec6,
      roughness: 0.3,
      metalness: 0.45,
      envMapIntensity: 1.5,
    }),
    ceiling: new THREE.MeshStandardMaterial({
      map: panel,
      color: 0x9aa3ac,
      roughness: 0.9,
      metalness: 0.1,
      envMapIntensity: 0.7,
    }),
    steel: new THREE.MeshStandardMaterial({
      color: 0x8b949d,
      roughness: 0.42,
      metalness: 0.85,
      envMapIntensity: 1.2,
    }),
    dark: new THREE.MeshStandardMaterial({
      color: 0x4a535c,
      roughness: 0.62,
      metalness: 0.55,
      envMapIntensity: 0.9,
    }),
    /* Chrome, for the one hero object in a room. Used sparingly: the whole
       point of a mirrored thing is that nothing else nearby is. */
    chrome: new THREE.MeshStandardMaterial({
      color: 0xf2f6fa,
      roughness: 0.055,
      metalness: 1,
      envMapIntensity: 2.4,
    }),
    /* Smoked glass, for the same job where chrome would be too loud. */
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xc4d4e2,
      roughness: 0.08,
      metalness: 0,
      transmission: 0.92,
      thickness: 1.6,
      ior: 1.45,
      envMapIntensity: 1.6,
      transparent: true,
    }),
    lamp: new THREE.MeshBasicMaterial({ color: 0xdce8f2 }),
    accent: new THREE.MeshBasicMaterial({ color: 0xaee83c }),
  };

  /** A camera-facing haze card. Two per light, tight and wide. */
  function haze(color, opacity) {
    return new THREE.SpriteMaterial({
      map: glow,
      color,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
  }

  return { mat, glow, haze, panel, floorMap, floorRough };
}

/**
 * A pool of real lights that jumps to whichever emitters the camera is near.
 *
 * Emitters are registered as plain positions by each environment. Nothing in
 * the world gets a dedicated light, so a space can carry two hundred fixtures
 * and still compile.
 */
export function createLightPool(THREE, scene, { size = 10, shadows = 3, reach = 46 } = {}) {
  const lights = [];
  for (let i = 0; i < size; i++) {
    const light = new THREE.PointLight(0xc8dcf0, 0, 34, 2);
    if (i < shadows) {
      light.castShadow = true;
      light.shadow.mapSize.set(1024, 1024);
      light.shadow.bias = -0.004;
    }
    scene.add(light);
    lights.push(light);
  }

  const emitters = [];

  return {
    /** position: [x,y,z]; intensity and distance are per emitter. */
    add(position, { intensity = 22, distance = 34, color = 0xc8dcf0 } = {}) {
      emitters.push({ position, intensity, distance, color });
    },
    update(camera) {
      const c = camera.position;
      const near = emitters
        .map((e) => ({
          e,
          d: Math.hypot(e.position[0] - c.x, e.position[1] - c.y, e.position[2] - c.z),
        }))
        .sort((a, b) => a.d - b.d)
        .slice(0, size);

      lights.forEach((light, i) => {
        const hit = near[i];
        if (!hit || hit.d > reach) {
          light.intensity = 0;
          return;
        }
        light.position.set(...hit.e.position);
        light.color.setHex(hit.e.color);
        light.distance = hit.e.distance;
        /* Faded by range so a light never snaps on as it enters the set. */
        light.intensity = hit.e.intensity * Math.max(0, 1 - hit.d / reach);
      });
    },
  };
}

/** Suspended particulate for a box-shaped volume. */
export function addDust(THREE, group, { count, box, size = 0.018, opacity = 0.32 }) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = box.x[0] + Math.random() * (box.x[1] - box.x[0]);
    pos[i * 3 + 1] = box.y[0] + Math.random() * (box.y[1] - box.y[0]);
    pos[i * 3 + 2] = box.z[0] + Math.random() * (box.z[1] - box.z[0]);
  }
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const points = new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      color: 0x93a6b8,
      size,
      sizeAttenuation: true,
      transparent: true,
      opacity,
      depthWrite: false,
    }),
  );
  group.add(points);
  return points;
}

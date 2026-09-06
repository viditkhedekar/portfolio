/**
 * Display surfaces: where the HTML goes.
 *
 * The rooms are photographed offline, but the words in them are not. Every
 * console screen, nameplate and wall panel is registered here as a rectangle
 * in world space, and the harness exports those rectangles alongside the
 * camera. At runtime the page projects each one into screen space and lays
 * real HTML onto it in perspective.
 *
 * That split is the whole point. The picture keeps the lighting, the haze and
 * the reflections that only an offline render can afford; the text stays
 * text, so it is crisp at any size, still comes from the data files, can be
 * focused and read aloud, and can be clicked. Baking the words into the
 * frames would have cost all four.
 *
 * A surface is registered by handing over an Object3D that is already
 * positioned and parented. Its world matrix is read at export time, so the
 * scene code never has to do the trigonometry twice.
 */

export function createSurfaceRegistry() {
  const entries = [];

  return {
    /**
     * @param id      stable identifier the runtime keys its content off
     * @param kind    what sort of thing this is, for styling
     * @param object  an Object3D already in the scene at the right place
     * @param width   surface width in metres
     * @param height  surface height in metres
     */
    add(id, kind, object, width, height, extra = {}) {
      entries.push({ id, kind, object, width, height, extra });
    },

    /** Flatten to plain data. Call after the scene graph is built. */
    export(THREE) {
      const out = [];
      const position = new THREE.Vector3();
      const quaternion = new THREE.Quaternion();
      const scale = new THREE.Vector3();

      for (const entry of entries) {
        entry.object.updateWorldMatrix(true, false);
        entry.object.matrixWorld.decompose(position, quaternion, scale);

        out.push({
          id: entry.id,
          kind: entry.kind,
          /* Half extents, so the runtime can build the four corners without
             needing to know which way round the rectangle was authored. */
          w: entry.width / 2,
          h: entry.height / 2,
          p: [round(position.x), round(position.y), round(position.z)],
          q: [
            round(quaternion.x),
            round(quaternion.y),
            round(quaternion.z),
            round(quaternion.w),
          ],
          ...entry.extra,
        });
      }
      return out;
    },
  };
}

/** Four decimals is a tenth of a millimetre at these scales. */
function round(n) {
  return Math.round(n * 10000) / 10000;
}

/**
 * The physical fitting a surface sits in.
 *
 * Every display in the building gets one of these so the HTML has somewhere
 * to be: a recessed dark face with a bezel round it and a strip of light
 * under it. Without the fitting the text would be floating on a wall, which
 * is the look this whole change is trying to get away from.
 */
export function buildFitting(THREE, kit, { width, height, depth = 0.35, lit = true }) {
  const { mat } = kit;
  const group = new THREE.Group();

  const bezel = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.42, height + 0.42, depth),
    mat.steel,
  );
  bezel.position.z = -depth / 2 - 0.02;
  bezel.castShadow = true;
  group.add(bezel);

  const recess = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.16, height + 0.16, depth * 0.6),
    mat.dark,
  );
  recess.position.z = -depth * 0.3;
  group.add(recess);

  /* The face itself. Very dark, so the HTML that lands on it reads as lit
     phosphor rather than as paper stuck to a wall. */
  const face = new THREE.Mesh(
    new THREE.PlaneGeometry(width, height),
    new THREE.MeshBasicMaterial({ color: 0x0a1006 }),
  );
  group.add(face);

  if (lit) {
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(width * 0.9, 0.07, 0.07),
      mat.accent,
    );
    strip.position.set(0, -height / 2 - 0.28, 0.06);
    group.add(strip);
  }

  return { group, face };
}

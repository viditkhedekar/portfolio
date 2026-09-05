/**
 * The corridors between the rooms.
 *
 * These are what make the journey a building instead of five sets with cuts
 * between them. They are also where the pace is set: a link is narrow and
 * low after the hall, so arriving in the observatory drum lands as a change
 * of scale rather than just a change of scenery.
 */

/**
 * A straight run of corridor along -Z.
 *
 * Returns nothing useful. It registers its own lights with the pool and adds
 * itself to the scene, which is all any of the connective architecture needs
 * to do.
 */
export function buildCorridor(
  THREE,
  scene,
  kit,
  pool,
  { from, to, width = 9, height = 6, y = 0, step = 6, accent = false },
) {
  const { mat, haze } = kit;
  const group = new THREE.Group();
  scene.add(group);

  const length = from - to;
  const midZ = (from + to) / 2;

  const wall = mat.wall.clone();
  wall.map = kit.panel.clone();
  wall.map.repeat.set(length / 7, height / 4);

  const deck = mat.floor.clone();
  deck.map = kit.floorMap.clone();
  deck.map.repeat.set(width / 4, length / 4);
  deck.roughnessMap = kit.floorRough.clone();
  deck.roughnessMap.repeat.copy(deck.map.repeat);

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(width, length), deck);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, y, midZ);
  floor.receiveShadow = true;
  group.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(width, length), mat.ceiling);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, y + height, midZ);
  group.add(ceiling);

  for (const side of [-1, 1]) {
    const face = new THREE.Mesh(new THREE.PlaneGeometry(length, height), wall);
    face.rotation.y = (side * -Math.PI) / 2;
    face.position.set((side * width) / 2, y + height / 2, midZ);
    face.receiveShadow = true;
    group.add(face);
  }

  /* Ribs, and a light in the crown of every second one. A corridor is mostly
     rhythm: without it this is a tube. */
  const ribGeo = new THREE.BoxGeometry(width + 0.4, 0.5, 0.6);
  const jambGeo = new THREE.BoxGeometry(0.5, height, 0.6);
  const lampGeo = new THREE.BoxGeometry(width * 0.34, 0.12, 0.3);

  let n = 0;
  for (let z = from; z >= to; z -= step, n++) {
    const rib = new THREE.Mesh(ribGeo, mat.steel);
    rib.position.set(0, y + height - 0.25, z);
    group.add(rib);

    for (const side of [-1, 1]) {
      const jamb = new THREE.Mesh(jambGeo, mat.steel);
      jamb.position.set((side * width) / 2 - side * 0.2, y + height / 2, z);
      group.add(jamb);
    }

    if (n % 2 === 0) {
      const lamp = new THREE.Mesh(lampGeo, mat.lamp);
      lamp.position.set(0, y + height - 0.55, z);
      group.add(lamp);

      const near = new THREE.Sprite(haze(0xbcd2e6, 0.42));
      near.position.set(0, y + height - 0.75, z);
      near.scale.set(6, 2.4, 1);
      group.add(near);

      pool.add([0, y + height - 1.0, z], { intensity: 16, distance: 22 });
    }
  }

  /* A guide line down the deck. In the hall this was the only lime on the
     floor and it is the thread that ties the corridors to it. */
  if (accent) {
    for (const side of [-1, 1]) {
      const line = new THREE.Mesh(
        new THREE.PlaneGeometry(0.09, length),
        new THREE.MeshBasicMaterial({ color: 0x1d2b0d }),
      );
      line.rotation.x = -Math.PI / 2;
      line.position.set(side * (width / 2 - 1.1), y + 0.012, midZ);
      group.add(line);
    }
  }

  return group;
}

/**
 * A threshold: the frame you pass through leaving one room for the next.
 *
 * Worth its own piece because a doorway is the cheapest way to tell someone
 * they have arrived somewhere, and every room here needs that more than it
 * needs another light.
 */
export function buildThreshold(THREE, scene, kit, pool, { z, width, height, y = 0 }) {
  const { mat, haze } = kit;
  const group = new THREE.Group();
  scene.add(group);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width + 2.4, height + 1.6, 1.4),
    mat.dark,
  );
  frame.position.set(0, y + (height + 1.6) / 2, z);
  group.add(frame);

  /* Cut the opening by putting the void in front of the slab rather than
     doing real CSG: nothing ever sees the back of it. */
  const opening = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, 1.8),
    new THREE.MeshBasicMaterial({ color: 0x000000 }),
  );
  opening.position.set(0, y + height / 2, z);
  group.add(opening);

  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.8, 0.12, 0.2),
    mat.accent,
  );
  lintel.position.set(0, y + height - 0.3, z - 0.75);
  group.add(lintel);

  const bloom = new THREE.Sprite(haze(0xaee83c, 0.22));
  bloom.position.set(0, y + height - 0.3, z - 0.9);
  bloom.scale.set(width, 2.4, 1);
  group.add(bloom);

  pool.add([0, y + height - 0.6, z - 1.2], {
    intensity: 6,
    distance: 12,
    color: 0xaee83c,
  });

  return group;
}

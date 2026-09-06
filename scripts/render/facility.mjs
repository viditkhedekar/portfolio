/**
 * 01 — PROJECT FACILITY, built as somewhere you are actually standing.
 *
 * The previous version of this was a handful of wireframe ribs in a black
 * void, and it read as a diagram of a corridor rather than a corridor. What
 * makes an interior feel like an interior is not more detail in the middle of
 * the frame, it is that the surfaces run past every edge of it: floor under
 * you, ceiling over you, walls out of shot on both sides, and a hundred
 * metres of it disappearing into haze ahead.
 *
 * Everything here is built for one purpose, which is to be photographed
 * offline. Nothing is budgeted for a sixty-times-a-second redraw, so the
 * surfaces are lit, the lights cast shadows, and the haze is real geometry.
 */

import { addDust } from "./kit.mjs";
import { buildFitting } from "./surfaces.mjs";

/* The hall. Wide and tall enough that the walls leave the frame. */
export const HALL = {
  width: 22,
  height: 10,
  from: 10,
  to: -150,
};

/* Ceiling fixtures: two runs down the hall, which is what gives the receding
   perspective its rhythm and the floor its long specular streaks. */
const FIXTURE_STEP = 7;
const FIXTURE_X = 5.4;
const FIXTURE_Y = 9.5;

/**
 * The five stations.
 *
 * Each station has two display surfaces: the console the camera passes at
 * eye level, and the board above it carrying the project's own screenshot.
 * Neither is painted into the render. They are registered as rectangles and
 * filled with real HTML at runtime, which is why the console can be read and
 * the screenshot is sharp.
 */
const STATIONS = [
  { id: "PX-001", z: -22, side: -1 },
  { id: "PX-002", z: -46, side: 1 },
  { id: "PX-003", z: -70, side: -1 },
  { id: "PX-004", z: -94, side: 1 },
  { id: "PX-005", z: -118, side: -1 },
];

/** Station ids, so the runtime knows which surfaces this room produces. */
export const STATION_IDS = STATIONS.map((s) => s.id);

export function buildFacility(THREE, scene, kit, pool, surfaces) {
  const group = new THREE.Group();
  scene.add(group);

  const { mat, haze } = kit;
  const length = HALL.from - HALL.to;
  const midZ = (HALL.from + HALL.to) / 2;

  /* ------------------------------------------------------------- shell */

  /* The kit's materials, with their maps re-tiled for a room this size. A
     shared material with one repeat would stretch the plating over a hundred
     and sixty metres of wall. */
  const wallMat = mat.wall.clone();
  wallMat.map = kit.panel.clone();
  wallMat.map.repeat.set(length / 8, HALL.height / 5);

  const floorMat = mat.floor.clone();
  floorMat.map = kit.floorMap.clone();
  floorMat.map.repeat.set(HALL.width / 4, length / 4);
  floorMat.roughnessMap = kit.floorRough.clone();
  floorMat.roughnessMap.repeat.copy(floorMat.map.repeat);

  const ceilMat = mat.ceiling;

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HALL.width, length), floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = midZ;
  floor.receiveShadow = true;
  group.add(floor);

  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(HALL.width, length), ceilMat);
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.set(0, HALL.height, midZ);
  group.add(ceiling);

  for (const side of [-1, 1]) {
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(length, HALL.height), wallMat);
    wall.rotation.y = side * -Math.PI / 2;
    wall.position.set((side * HALL.width) / 2, HALL.height / 2, midZ);
    wall.receiveShadow = true;
    group.add(wall);
  }

  /* ------------------------------------------------------------ structure */

  const steelMat = mat.steel;
  const darkMat = mat.dark;

  /* Portal arches. The rhythm of these is what the camera reads as speed, and
     the ones nearest the lens sweep past as foreground, which is the single
     strongest depth cue available. */
  const columnGeo = new THREE.BoxGeometry(0.7, HALL.height, 1.1);
  const lintelGeo = new THREE.BoxGeometry(HALL.width, 0.8, 1.1);
  const braceGeo = new THREE.BoxGeometry(2.6, 0.34, 0.7);

  for (let z = HALL.from; z >= HALL.to; z -= 8) {
    for (const side of [-1, 1]) {
      const col = new THREE.Mesh(columnGeo, steelMat);
      col.position.set((side * (HALL.width - 0.7)) / 2, HALL.height / 2, z);
      col.castShadow = true;
      group.add(col);

      const brace = new THREE.Mesh(braceGeo, darkMat);
      brace.position.set((side * (HALL.width - 3.4)) / 2, HALL.height - 1.5, z);
      brace.rotation.z = side * 0.5;
      group.add(brace);
    }
    const lintel = new THREE.Mesh(lintelGeo, steelMat);
    lintel.position.set(0, HALL.height - 0.4, z);
    lintel.castShadow = true;
    group.add(lintel);
  }

  /* Services: trays and conduit running the length of both walls, at two
     heights. Cheap geometry, and it stops the walls being blank. */
  const trayGeo = new THREE.BoxGeometry(0.55, 0.3, length);
  const pipeGeo = new THREE.CylinderGeometry(0.14, 0.14, length, 8);
  for (const side of [-1, 1]) {
    for (const [y, geo] of [[7.4, trayGeo], [6.8, pipeGeo], [2.1, trayGeo]]) {
      const m = new THREE.Mesh(geo, geo === pipeGeo ? steelMat : darkMat);
      if (geo === pipeGeo) m.rotation.x = Math.PI / 2;
      m.position.set((side * (HALL.width - 1.6)) / 2, y, midZ);
      group.add(m);
    }
  }

  /* ------------------------------------------------------------- lighting */

  const fixtureMat = mat.lamp;
  const fixtureGeo = new THREE.BoxGeometry(0.42, 0.16, 4.6);
  const housingGeo = new THREE.BoxGeometry(0.9, 0.5, 5.0);

  const glowMat = haze(0xbcd2e6, 0.5);

  for (let z = HALL.from; z >= HALL.to; z -= FIXTURE_STEP) {
    for (const side of [-1, 1]) {
      const x = side * FIXTURE_X;

      const housing = new THREE.Mesh(housingGeo, darkMat);
      housing.position.set(x, FIXTURE_Y + 0.3, z);
      group.add(housing);

      const bar = new THREE.Mesh(fixtureGeo, fixtureMat);
      bar.position.set(x, FIXTURE_Y, z);
      group.add(bar);

      /* The haze around the tube. Two sprites, a tight one and a wide one,
         which fakes a volume far more convincingly than one ever does. */
      const near = new THREE.Sprite(glowMat);
      near.position.set(x, FIXTURE_Y - 0.15, z);
      near.scale.set(7.5, 2.6, 1);
      group.add(near);

      const wide = new THREE.Sprite(glowMat.clone());
      wide.material.opacity = 0.16;
      wide.position.set(x, FIXTURE_Y - 1.1, z);
      wide.scale.set(15, 9, 1);
      group.add(wide);

      pool.add([x, FIXTURE_Y - 0.4, z], { intensity: 22, distance: 34 });
    }
  }

  /* Inset floor channels, running the whole length under each fixture run. */
  const channelMat = new THREE.MeshBasicMaterial({ color: 0x1d2b0d });
  for (const side of [-1, 1]) {
    const channel = new THREE.Mesh(new THREE.PlaneGeometry(0.1, length), channelMat);
    channel.rotation.x = -Math.PI / 2;
    channel.position.set(side * 8.6, 0.012, midZ);
    group.add(channel);
  }

  /* -------------------------------------------------------------- stations */

  const accentGlowMat = haze(0xaee83c, 0.26);

  for (const station of STATIONS) {
    const inst = new THREE.Group();
    inst.position.set(station.side * 8.2, 0, station.z);
    inst.rotation.y = station.side * -0.46;
    group.add(inst);

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(6.6, 1.05, 2.6), darkMat);
    plinth.position.y = 0.525;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    inst.add(plinth);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.16, 2.9), steelMat);
    deck.position.y = 1.1;
    deck.castShadow = true;
    inst.add(deck);

    /* The console. Much larger than it was: this is the surface a visitor is
       meant to read, and at the old size the text on it was a texture of a
       screen rather than a screen. */
    const desk = buildFitting(THREE, kit, { width: 6.4, height: 3.9, depth: 0.5 });
    desk.group.position.set(0, 3.5, 0.1);
    inst.add(desk.group);
    surfaces.add(`project-${station.id}`, "console", desk.face, 6.4, 3.9, {
      project: station.id,
    });

    /* The screen throws light, but a monitor is not a floodlight: at the
       first setting it washed ten metres of deck lime green. */
    pool.add(
      [station.side * 8.2, 3.4, station.z + 1.6],
      { intensity: 3.2, distance: 10, color: 0xaee83c },
    );

    const bloomCard = new THREE.Sprite(accentGlowMat);
    bloomCard.position.set(0, 3.5, 0.7);
    bloomCard.scale.set(10, 7, 1);
    inst.add(bloomCard);

    /* No under-deck strip: the fitting already carries one, and the two
       together read as a double line under every console. */

    /* The project's own screenshot, on the wall above the console and turned
       in towards the aisle so the camera catches it as it passes. The picture
       is no longer painted into the render: it is another surface, so the
       screenshot arrives at its real resolution instead of at whatever a
       1440-pixel frame could spare for it. */
    const board = new THREE.Group();
    board.position.set(station.side * 2.2, 6.4, -2.6);
    board.rotation.y = station.side * 0.36;
    inst.add(board);

    const print = buildFitting(THREE, kit, {
      width: 7.4,
      height: 4.3,
      depth: 0.34,
      lit: false,
    });
    board.add(print.group);
    surfaces.add(`board-${station.id}`, "board", print.face, 7.4, 4.3, {
      project: station.id,
    });

    /* A picture light, which is also the only thing lifting the upper wall
       out of the dark along this stretch. A pool emitter rather than a
       spotlight of its own: five more shadow-casting cones is not what this
       scene should spend its light budget on. */
    pool.add([station.side * 4.6, 8.4, station.z - 1.6], {
      intensity: 22,
      distance: 22,
    });

    for (const side of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.6, 8), steelMat);
      post.position.set(side * 3.5, 3.0, 1.1);
      inst.add(post);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2.4), steelMat);
      rail.position.set(side * 3.5, 1.15, 0.2);
      inst.add(rail);
    }
  }

  /* ------------------------------------------------------------------ dust */

  addDust(THREE, group, {
    count: 1500,
    box: {
      x: [-(HALL.width - 1) / 2, (HALL.width - 1) / 2],
      y: [0, HALL.height],
      z: [HALL.to, HALL.from],
    },
  });

  return { group };
}

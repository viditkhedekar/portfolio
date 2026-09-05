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

import {
  floorRoughness,
  floorTexture,
  glowTexture,
  panelTexture,
  readoutTexture,
} from "./textures.mjs";

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

/** Real lights are expensive and finite, so a pool follows the camera. */
const LIGHT_POOL = 8;

/**
 * The five stations.
 *
 * `photo` is the project's own screenshot out of /public/projects. Hanging
 * the real thing on the wall behind each console is worth more than any
 * amount of invented instrumentation: it is the only surface in the hall that
 * proves the project exists.
 */
const STATIONS = [
  { id: "PX-001", name: "GROWTHKIT AI", kind: "network", sub: "CONTEXT // LOADED", z: -22, side: -1, photo: "px-001-landing" },
  { id: "PX-002", name: "PHYSIQAL PERFORMANCE", kind: "motion", sub: "MOTION ANALYSIS // ACTIVE", z: -46, side: 1, photo: "px-002-analysis" },
  { id: "PX-003", name: "TACTIX XI", kind: "pitch", sub: "MATCH ENGINE // ACTIVE", z: -70, side: -1, photo: "px-003-tactics" },
  { id: "PX-004", name: "BLACKOAK", kind: "market", sub: "BACKTEST ENGINE // READY", z: -94, side: 1, photo: "px-004-command-center" },
  { id: "PX-005", name: "KEYNESIUM", kind: "model", sub: "GDP / INFLATION / UNEMPLOYMENT", z: -118, side: -1, photo: "px-005-shock" },
];

/** The screenshots this scene wants, in load order. */
export const PHOTOS = STATIONS.map((s) => s.photo);

export function buildFacility(THREE, scene, photos = {}) {
  const group = new THREE.Group();
  scene.add(group);

  const glow = glowTexture(THREE);
  const panel = panelTexture(THREE);
  const floorMap = floorTexture(THREE);
  const floorRough = floorRoughness(THREE);

  const length = HALL.from - HALL.to;
  const midZ = (HALL.from + HALL.to) / 2;

  /* ------------------------------------------------------------- shell */

  panel.repeat.set(length / 8, HALL.height / 5);
  floorMap.repeat.set(HALL.width / 4, length / 4);
  floorRough.repeat.copy(floorMap.repeat);

  const wallMat = new THREE.MeshStandardMaterial({
    map: panel,
    color: 0xd6dee6,
    roughness: 0.7,
    metalness: 0.3,
    envMapIntensity: 0.9,
  });

  /* A polished deck. The metalness and the low roughness are doing the most
     important job in the scene: every fixture overhead is smeared down the
     floor as a long highlight, and that is most of what says "big room". */
  const floorMat = new THREE.MeshStandardMaterial({
    map: floorMap,
    roughnessMap: floorRough,
    color: 0xb6bec6,
    roughness: 0.3,
    metalness: 0.45,
    envMapIntensity: 1.5,
  });

  const ceilMat = new THREE.MeshStandardMaterial({
    map: panel,
    color: 0x9aa3ac,
    roughness: 0.9,
    metalness: 0.1,
    envMapIntensity: 0.7,
  });

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

  const steelMat = new THREE.MeshStandardMaterial({
    color: 0x8b949d,
    roughness: 0.42,
    metalness: 0.85,
    envMapIntensity: 1.2,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x4a535c,
    roughness: 0.62,
    metalness: 0.55,
    envMapIntensity: 0.9,
  });

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

  const fixtureMat = new THREE.MeshBasicMaterial({ color: 0xdce8f2 });
  const fixtureGeo = new THREE.BoxGeometry(0.42, 0.16, 4.6);
  const housingGeo = new THREE.BoxGeometry(0.9, 0.5, 5.0);

  const glowMat = new THREE.SpriteMaterial({
    map: glow,
    color: 0xbcd2e6,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const fixtures = [];
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

      fixtures.push({ x, y: FIXTURE_Y, z });
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

  /* The light pool: eight real lights that jump to whichever fixtures the
     camera is nearest. A hall this long cannot afford a light per fixture,
     and past twenty metres in this much haze nobody can tell. */
  const pool = [];
  for (let i = 0; i < LIGHT_POOL; i++) {
    const light = new THREE.PointLight(0xc8dcf0, 0, 34, 2);
    if (i < 3) {
      light.castShadow = true;
      light.shadow.mapSize.set(1024, 1024);
      light.shadow.bias = -0.004;
    }
    group.add(light);
    pool.push(light);
  }

  const ambient = new THREE.AmbientLight(0x38495a, 0.85);
  group.add(ambient);

  /* A cold fill from above and behind, so the shadowed sides of the structure
     are not pure black and the space keeps its shape. */
  const fill = new THREE.DirectionalLight(0x6f8fac, 0.55);
  fill.position.set(-6, 14, 20);
  group.add(fill);

  /* -------------------------------------------------------------- stations */

  const accentGlowMat = new THREE.SpriteMaterial({
    map: glow,
    color: 0xaee83c,
    transparent: true,
    opacity: 0.26,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  for (const station of STATIONS) {
    const inst = new THREE.Group();
    inst.position.set(station.side * 7.3, 0, station.z);
    inst.rotation.y = station.side * -0.42;
    group.add(inst);

    const plinth = new THREE.Mesh(new THREE.BoxGeometry(4.6, 1.05, 2.4), darkMat);
    plinth.position.y = 0.525;
    plinth.castShadow = true;
    plinth.receiveShadow = true;
    inst.add(plinth);

    const deck = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.16, 2.7), steelMat);
    deck.position.y = 1.1;
    deck.castShadow = true;
    inst.add(deck);

    /* Console body and the screen set into it. */
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.5, 3.1, 0.55), darkMat);
    body.position.set(0, 2.9, -0.2);
    body.castShadow = true;
    inst.add(body);

    const bezel = new THREE.Mesh(new THREE.BoxGeometry(4.1, 2.7, 0.12), steelMat);
    bezel.position.set(0, 2.95, 0.12);
    inst.add(bezel);

    const screenTex = readoutTexture(THREE, station.kind, station.name, station.sub);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(3.85, 2.42), screenMat);
    screen.position.set(0, 2.95, 0.2);
    inst.add(screen);

    /* The screen has to throw light, or it looks like a poster. */
    /* The screen throws light, but a monitor is not a floodlight: at the
       first setting it washed ten metres of deck lime green. */
    const spill = new THREE.PointLight(0xaee83c, 2.4, 8.5, 2);
    spill.position.set(0, 2.9, 1.4);
    inst.add(spill);

    const bloomCard = new THREE.Sprite(accentGlowMat);
    bloomCard.position.set(0, 2.95, 0.6);
    bloomCard.scale.set(7.5, 5.6, 1);
    inst.add(bloomCard);

    /* Under-deck strip, and a stanchion each side. */
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(4.3, 0.07, 0.07),
      new THREE.MeshBasicMaterial({ color: 0xaee83c }),
    );
    strip.position.set(0, 1.02, 1.28);
    inst.add(strip);

    /* The project itself, mounted on the wall above the console and turned
       in towards the aisle so the camera catches it side-on as it passes. */
    const photo = photos[station.photo];
    if (photo) {
      const board = new THREE.Group();
      board.position.set(station.side * 1.9, 5.1, -2.4);
      board.rotation.y = station.side * 0.34;
      inst.add(board);

      const backing = new THREE.Mesh(new THREE.BoxGeometry(8.2, 5.2, 0.3), darkMat);
      backing.position.z = -0.2;
      board.add(backing);

      const aspect = (photo.image?.width ?? 16) / (photo.image?.height ?? 9);
      const h = 4.6;
      const w = Math.min(7.8, h * aspect);
      const print = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        /* Dimmed rather than emissive: it is a lit print on a wall, not
           another screen, and five more screens would flatten the hall. */
        new THREE.MeshBasicMaterial({ map: photo, color: 0xb4bec8 }),
      );
      board.add(print);

      const trim = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.08, 0.12), steelMat);
      trim.position.set(0, -h / 2 - 0.18, 0.1);
      board.add(trim);

      /* A picture light, which is also the only thing lifting the upper wall
         out of the dark along this stretch. */
      const wash = new THREE.SpotLight(0xbcd0e2, 60, 18, 0.8, 0.55, 2);
      wash.position.set(0, 3.8, 3.2);
      wash.target = board;
      board.add(wash);
    }

    for (const s of [-1, 1]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.2, 8), steelMat);
      post.position.set(s * 2.5, 2.7, 1.0);
      inst.add(post);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 2.2), steelMat);
      rail.position.set(s * 2.5, 1.15, 0.2);
      inst.add(rail);
    }
  }

  /* ------------------------------------------------------------------ dust */

  const motes = new THREE.BufferGeometry();
  const count = 1500;
  const pos = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = (Math.random() - 0.5) * (HALL.width - 1);
    pos[i * 3 + 1] = Math.random() * HALL.height;
    pos[i * 3 + 2] = HALL.to + Math.random() * length;
  }
  motes.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(
    motes,
    new THREE.PointsMaterial({
      color: 0x93a6b8,
      size: 0.018,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.32,
      depthWrite: false,
    }),
  );
  group.add(dust);

  return {
    group,
    /** Snap the light pool to the fixtures nearest the camera. */
    update(camera) {
      const cz = camera.position.z;
      const near = fixtures
        .map((f) => ({ f, d: Math.abs(f.z - cz) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, LIGHT_POOL);

      pool.forEach((light, i) => {
        const hit = near[i];
        if (!hit) {
          light.intensity = 0;
          return;
        }
        light.position.set(hit.f.x, hit.f.y - 0.4, hit.f.z);
        /* Fade the far end of the pool out rather than letting a light pop
           on as it enters the set. */
        light.intensity = 22 * Math.max(0, 1 - hit.d / 40);
      });
    },
  };
}

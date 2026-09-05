/**
 * The room the metal reflects.
 *
 * Without this the floor is black. A polished surface shows whatever is
 * around it, and if the renderer has nothing to hand it, "around it" is
 * nothing: the deck goes pure black except where a point light happens to
 * land, which is exactly what the first test frames did.
 *
 * So the hall gets a crude double of itself, two lit strips in a dark box,
 * pre-filtered once and handed to every material in the scene. It never
 * appears on camera. It exists to be reflected.
 */
export function buildEnvironment(THREE, renderer) {
  const env = new THREE.Scene();

  const shell = new THREE.Mesh(
    new THREE.BoxGeometry(60, 26, 60),
    new THREE.MeshBasicMaterial({ color: 0x10161c, side: THREE.BackSide }),
  );
  env.add(shell);

  /* The two fixture runs, the thing actually worth reflecting. */
  for (const x of [-14, 14]) {
    const strip = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 54),
      new THREE.MeshBasicMaterial({ color: 0x9fc4e4 }),
    );
    strip.rotation.x = Math.PI / 2;
    strip.position.set(x, 12.4, 0);
    env.add(strip);
  }

  /* A dim floor bounce, so the undersides of things are not dead. */
  const bounce = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshBasicMaterial({ color: 0x161d24 }),
  );
  bounce.rotation.x = -Math.PI / 2;
  bounce.position.y = -12.9;
  env.add(bounce);

  /* And a trace of the accent, so the lime is present in reflections rather
     than only where a screen is directly in shot. */
  const accent = new THREE.Mesh(
    new THREE.PlaneGeometry(30, 3),
    new THREE.MeshBasicMaterial({ color: 0x131a09 }),
  );
  accent.position.set(0, 2, -29.8);
  env.add(accent);

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const target = pmrem.fromScene(env, 0.05);
  pmrem.dispose();

  return target.texture;
}

// Orbit, card shader, poster loading, and drag inertia ported from Growency
// homepage/src/hero/{heroScene,card,media}.ts (2ddcb0f). The homepage's
// wordmark, mark assembly, and reel phases are outside this gallery.
import * as THREE from "three";

const FOV = 30;
const CAM_Z = 20;
const BASE_DRIFT = .1;
const TAU = Math.PI * 2;
const INTRO_MS = 2600;
const INTRO_POSTER_WAIT_MS = 450;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const lerp = (from: number, to: number, t: number) => from + (to - from) * t;
const smooth = (t: number) => t * t * (3 - 2 * t);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

const vertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

// Growency's orbit card branch, with the portfolio's paper colour.
const fragmentShader = /* glsl */ `
uniform sampler2D map;
uniform float uTexAspect, uPlaneAspect, uFront, uOpacity;
uniform vec3 uPaper;
varying vec2 vUv;
void main() {
  vec2 uv = vUv - 0.5;
  float r = uPlaneAspect / uTexAspect;
  if (r > 1.0) uv.y /= r; else uv.x *= r;
  vec3 col = texture2D(map, uv + 0.5).rgb;

  float radius = 0.045;
  vec2 q = abs(vUv - 0.5) * vec2(uPlaneAspect, 1.0);
  vec2 hb = vec2(0.5 * uPlaneAspect, 0.5) - radius;
  float rd = length(max(q - hb, 0.0)) - radius;
  float raa = max(fwidth(rd), 1e-4);
  float cardMask = 1.0 - smoothstep(-raa, raa, rd);
  col = mix(uPaper, col, mix(0.36, 1.0, uFront));
  float edge = (1.0 - smoothstep(0.001, 0.004, -rd)) * cardMask;
  col = mix(col, vec3(0.21, 0.17, 0.11), edge * mix(0.065, 0.18, uFront));
  float alpha = cardMask * uOpacity;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(col, alpha);
}`;

export type AdBounds = { left: number; top: number; width: number; height: number; rotation: number };
type Choice = { index: number; bounds: () => AdBounds };
type OrbitOptions = {
  canvas: HTMLCanvasElement;
  context: WebGL2RenderingContext;
  posters: readonly string[];
  onReady: () => void;
  onFallback: () => void;
  onSelect: (index: number) => void;
  onOpen: (choice: Choice) => void;
};

function orbitCard(geometry: THREE.PlaneGeometry) {
  const uniforms = {
    map: { value: null as THREE.Texture | null },
    uTexAspect: { value: .8 },
    uPlaneAspect: { value: .8 },
    uFront: { value: 1 },
    uOpacity: { value: 0 },
    uPaper: { value: new THREE.Vector3(.976, .969, .949) },
  };
  const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: true });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.visible = false;
  return { mesh, uniforms };
}

export class GrowencyAdOrbit {
  private abort = new AbortController();
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, .1, 100);
  private geometry = new THREE.PlaneGeometry(1, 1);
  private cards: ReturnType<typeof orbitCard>[];
  private resizeObserver: ResizeObserver;
  private visibilityObserver: IntersectionObserver;
  private raycaster = new THREE.Raycaster();
  private rotation = new THREE.Matrix4();
  private position = new THREE.Vector3();
  private frameId = 0;
  private previousTime = 0;
  private startTime: number | null = null;
  private introDeadline = 0;
  private ready = false;
  private paused = false;
  private visible = false;
  private preview: { index: number; openedAt: number } | null = null;
  private spin = 0;
  private spinVel = 0;
  private pendingSpin = 0;
  private dragging: { id: number; x: number; y: number; lastX: number; lastTime: number; index?: number } | null = null;
  private width = 0;
  private height = 0;
  private ringRadius = 0;
  private cardWidth = 0;
  private tilt = 0;
  private frontMin = 0;
  private frontMax = 0;
  private ringCenterY = 0;

  constructor(private options: OrbitOptions) {
    const { canvas, posters } = options;
    this.renderer = new THREE.WebGLRenderer({ canvas, context: options.context, antialias: true, alpha: true, powerPreference: "default" });
    this.renderer.setClearColor(0xffffff, 0);
    this.camera.position.set(0, 0, CAM_Z);
    this.cards = posters.map(() => orbitCard(this.geometry));
    for (const { mesh } of this.cards) this.scene.add(mesh);
    this.resize();
    this.resizeObserver = new ResizeObserver(this.resize);
    this.resizeObserver.observe(canvas);
    this.visibilityObserver = new IntersectionObserver(([entry]) => {
      this.visible = entry.isIntersecting;
      this.schedule();
    });
    this.visibilityObserver.observe(canvas);
    this.bindInput();
    this.loadPosters();
  }

  // Load the front of the ring first, with the same concurrency as Growency.
  private loadPosters() {
    const { posters } = this.options;
    const order = this.cards.map((_, index) => index)
      .sort((a, b) => Math.cos(this.angleOf(b)) - Math.cos(this.angleOf(a)));
    const loader = new THREE.TextureLoader();
    const anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
    let next = 0;
    let completed = 0;
    this.introDeadline = performance.now() + INTRO_POSTER_WAIT_MS;

    const requestNext = () => {
      const index = order[next++];
      if (index === undefined || this.abort.signal.aborted) return;
      const complete = () => {
        if (this.abort.signal.aborted) return;
        completed++;
        if (completed === posters.length && this.cards.every(({ uniforms }) => !uniforms.map.value)) {
          this.options.onFallback();
        } else requestNext();
      };
      loader.load(posters[index], (texture) => {
        if (this.abort.signal.aborted) {
          texture.dispose();
          return;
        }
        const image = texture.image as HTMLImageElement;
        texture.colorSpace = THREE.NoColorSpace;
        texture.anisotropy = anisotropy;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        const { uniforms } = this.cards[index];
        uniforms.map.value = texture;
        uniforms.uTexAspect.value = image.naturalWidth / image.naturalHeight;
        this.schedule();
        complete();
      }, undefined, complete);
    };

    for (let slot = 0; slot < 4; slot++) requestNext();
  }

  private resize = () => {
    const { canvas } = this.options;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (!width || !height) return;
    this.width = width;
    this.height = height;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    const visH = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    const visW = visH * (width / height);
    const small = width < 700;
    const cardRatio = small ? .46 : .42;
    this.frontMin = small ? .7 : .74;
    this.frontMax = small ? 1.16 : 1.22;
    this.tilt = small ? .42 : .3;
    const rByW = (visW * (small ? 1.27 : .98)) / (2 + cardRatio * .7);
    const rByH = ((height - 28) * visH / height) / (2 * Math.sin(this.tilt) + cardRatio * 1.25 * this.frontMax + .24);
    this.ringRadius = Math.min(rByW, rByH, 7.8);
    this.cardWidth = this.ringRadius * cardRatio;
    this.ringCenterY = this.ringRadius * .19;
    this.rotation.makeRotationFromEuler(new THREE.Euler(this.tilt, 0, -.07));
    this.schedule();
  };

  private angleOf(index: number) {
    return index / this.cards.length * TAU + this.spin;
  }

  private schedule = () => {
    if (this.frameId || !this.visible || document.hidden || this.abort.signal.aborted) return;
    this.frameId = requestAnimationFrame(this.frame);
  };

  private frame = (now: number) => {
    this.frameId = 0;
    if (!this.visible || document.hidden) {
      this.previousTime = 0;
      return;
    }
    const dt = this.previousTime ? THREE.MathUtils.clamp((now - this.previousTime) / 1000, 0, .05) : 0;
    this.previousTime = now;
    const lead = this.cards[0].uniforms.map.value;
    if (this.startTime === null && (lead || (now >= this.introDeadline && this.cards.some(({ uniforms }) => uniforms.map.value)))) {
      this.startTime = now;
    }

    const intro = this.startTime === null ? 0 : clamp01(((this.preview?.openedAt ?? now) - this.startTime) / INTRO_MS);
    const movement = this.pendingSpin * (1 - Math.exp(-dt * 28));
    if (!this.preview) {
      this.spin += movement;
      this.pendingSpin -= movement;
      if (!this.dragging) {
        const decay = Math.exp(-dt * 3.4);
        this.spin += (this.paused || intro < 1 ? 0 : BASE_DRIFT) * dt + this.spinVel * (1 - decay) / 3.4;
        this.spinVel *= decay;
      }
    }

    this.cards.forEach(({ mesh, uniforms }, index) => {
      const delayOnLoad = index / this.cards.length * .42;
      const arrival = easeOut(clamp01((intro - delayOnLoad) / .58));
      const entering = 1 - arrival;
      const angle = this.angleOf(index) - entering * 1.6;
      const front = (Math.cos(angle) + 1) / 2;
      const size = lerp(this.frontMin, this.frontMax, smooth(front)) * lerp(.6, 1, arrival);
      const radius = this.ringRadius * lerp(1.9, 1, arrival);
      const roll = Math.sin(angle) * (.07 + entering * .11);
      const sideProfile = lerp(.72, 1, Math.abs(Math.cos(angle)));

      this.position.set(Math.sin(angle) * radius, entering * this.ringRadius * .7, Math.cos(angle) * radius)
        .applyMatrix4(this.rotation);
      this.position.y += this.ringCenterY;
      mesh.position.copy(this.position);
      mesh.rotation.z = roll;
      mesh.scale.set(this.cardWidth * size * sideProfile, this.cardWidth * 1.25 * size, 1);
      uniforms.uFront.value = front;
      uniforms.uPlaneAspect.value = .8;
      const texture = uniforms.map.value;
      const opacity = lerp(uniforms.uOpacity.value, texture ? smooth(arrival) : 0, 1 - Math.exp(-dt * 24));
      uniforms.uOpacity.value = opacity > .995 ? 1 : opacity;
      mesh.visible = Boolean(texture) && arrival > .001 && this.preview?.index !== index;
    });

    this.renderer.render(this.scene, this.camera);
    if (!this.ready && intro >= .17 && this.cards.some(({ uniforms }) => uniforms.uOpacity.value > .12)) {
      this.ready = true;
      this.options.onReady();
    }
    const unsettled = Math.abs(this.pendingSpin) > .00005 || Math.abs(this.spinVel) > .001;
    if (!this.preview && (intro < 1 || !this.paused || this.dragging || unsettled)) this.schedule();
  };

  private bindInput() {
    const { canvas, onSelect } = this.options;
    const signal = this.abort.signal;
    canvas.addEventListener("webglcontextlost", this.options.onFallback, { signal });
    document.addEventListener("visibilitychange", this.schedule, { signal });

    canvas.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || !event.isPrimary || this.preview || this.dragging) return;
      const rect = canvas.getBoundingClientRect();
      this.raycaster.setFromCamera(new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        1 - ((event.clientY - rect.top) / rect.height) * 2,
      ), this.camera);
      const hit = this.raycaster.intersectObjects(this.cards.filter(({ mesh }) => mesh.visible).map(({ mesh }) => mesh))[0];
      this.dragging = {
        id: event.pointerId, x: event.clientX, y: event.clientY, lastX: event.clientX, lastTime: event.timeStamp,
        index: hit ? this.cards.findIndex(({ mesh }) => mesh === hit.object) : undefined,
      };
      this.spinVel = 0;
      canvas.setPointerCapture(event.pointerId);
      canvas.dataset.dragging = "";
      this.schedule();
    }, { signal });

    canvas.addEventListener("pointermove", (event) => {
      const drag = this.dragging;
      if (drag?.id !== event.pointerId) return;
      if (Math.hypot(event.clientX - drag.x, event.clientY - drag.y) > 9) drag.index = undefined;
      const dx = event.clientX - drag.lastX;
      const dt = Math.max(1, event.timeStamp - drag.lastTime) / 1000;
      const delta = dx * (TAU / Math.max(600, this.width)) * .9;
      this.pendingSpin += delta;
      const speed = THREE.MathUtils.clamp(delta / dt, -5, 5);
      this.spinVel = lerp(this.spinVel, speed, 1 - Math.exp(-dt * 16));
      drag.lastX = event.clientX;
      drag.lastTime = event.timeStamp;
    }, { signal });

    const end = (event: PointerEvent) => {
      const drag = this.dragging;
      if (drag?.id !== event.pointerId) return;
      this.dragging = null;
      delete canvas.dataset.dragging;
      if (event.timeStamp - drag.lastTime > 90 || event.type !== "pointerup") this.spinVel = 0;
      if (drag.index !== undefined && event.type === "pointerup") {
        this.open(drag.index);
      } else {
        onSelect(this.frontIndex());
      }
      this.schedule();
    };
    canvas.addEventListener("pointerup", end, { signal });
    canvas.addEventListener("pointercancel", end, { signal });
    canvas.addEventListener("lostpointercapture", end, { signal });
  }

  private frontIndex() {
    const index = Math.round(-(this.spin + this.pendingSpin) / TAU * this.cards.length);
    return ((index % this.cards.length) + this.cards.length) % this.cards.length;
  }

  rotate(direction: -1 | 1) {
    const step = TAU / this.cards.length;
    const front = Math.round(-(this.spin + this.pendingSpin) / step);
    this.pendingSpin = -(front + direction) * step - this.spin;
    this.spinVel = 0;
    this.options.onSelect(((front + direction) % this.cards.length + this.cards.length) % this.cards.length);
    this.schedule();
  }

  setPaused(paused: boolean) {
    this.paused = paused;
    this.schedule();
  }

  open(index = this.frontIndex()) {
    if (!this.cards[index].uniforms.map.value || this.preview) return;
    this.spinVel = 0;
    this.preview = { index, openedAt: performance.now() };
    this.options.onOpen({ index, bounds: () => this.bounds(index) });
    this.schedule();
  }

  close() {
    if (!this.preview) return;
    if (this.startTime !== null) this.startTime += performance.now() - this.preview.openedAt;
    this.preview = null;
    this.schedule();
  }

  private bounds(index: number): AdBounds {
    const { mesh } = this.cards[index];
    mesh.updateMatrixWorld(true);
    const corners = [[-.5, .5], [.5, .5], [.5, -.5], [-.5, -.5]].map(([x, y]) => {
      const point = mesh.localToWorld(new THREE.Vector3(x, y, 0)).project(this.camera);
      return { x: (point.x * .5 + .5) * this.width, y: (-point.y * .5 + .5) * this.height };
    });
    const rect = this.options.canvas.getBoundingClientRect();
    const xs = corners.map(({ x }) => x);
    const ys = corners.map(({ y }) => y);
    return {
      left: rect.left + Math.min(...xs),
      top: rect.top + Math.min(...ys),
      width: Math.max(12, Math.max(...xs) - Math.min(...xs)),
      height: Math.max(12, Math.max(...ys) - Math.min(...ys)),
      rotation: Math.atan2(corners[1].y - corners[0].y, corners[1].x - corners[0].x) * 180 / Math.PI,
    };
  }

  destroy() {
    this.abort.abort();
    this.resizeObserver.disconnect();
    this.visibilityObserver.disconnect();
    cancelAnimationFrame(this.frameId);
    for (const { mesh, uniforms } of this.cards) {
      mesh.material.dispose();
      uniforms.map.value?.dispose();
    }
    this.geometry.dispose();
    this.renderer.dispose();
  }
}

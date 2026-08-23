"use client";

import * as React from "react";
import { useMediaQuery } from "@/lib/hooks";
import { parseHeadCloud, placeholderHead, type PointCloud } from "@/lib/headCloud";

/**
 * A head, drawn as a point cloud, that turns to face the cursor.
 *
 * The geometry comes from `@/lib/headCloud` and is deliberately not this
 * component's business: hand it a sculpt or a photogrammetry scan and it
 * renders either without changes.
 *
 * Everything is 2D canvas. The rotation and projection are a few lines of
 * maths, which is cheaper in every sense than pulling in a 3D engine to draw
 * four thousand dots.
 */

/* Rotation. Yaw is generous so the head really does turn away at the edges. */
const MAX_YAW = 2.5;
const MAX_PITCH = 0.5;
const SPRING = 0.06;
const DAMPING = 0.82;

/* Idle, used on touch devices and before the pointer has ever moved. */
const IDLE_SPEED = 0.16;
const IDLE_YAW = 0.85;
const IDLE_PITCH = 0.1;

/* Projection. */
const CAMERA_Z = 4.2;
const FOCAL = 2.35;

/** How fast the cloud brightens once the pointer is in the band. */
const GLOW_RATE = 0.07;

/* A fixed key light, up and to the left, slightly in front of the head. The
   cloud is lit rather than flat-shaded: dots alone carry no sense of surface,
   and it is the shading that turns a scatter of points into a face. */
const LIGHT = (() => {
  const [x, y, z] = [-0.42, 0.5, 0.76];
  const len = Math.hypot(x, y, z);
  return { x: x / len, y: y / len, z: z / len };
})();

/* Painter's ordering runs through fixed depth buckets rather than a real
   sort. At this point count the difference is invisible and the cost is not. */
const BUCKETS = 48;

export function HeadCloud({ className }: { className?: string }) {
  const hostRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const readoutRef = React.useRef<HTMLSpanElement>(null);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarse = useMediaQuery("(pointer: coarse)");

  React.useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* The sculpt renders immediately; the scan replaces it the moment it
       lands. Swapping the reference is all it takes, since the pool is read
       fresh every frame. */
    let cloud: PointCloud = placeholderHead();

    let width = 0;
    let height = 0;
    let raf = 0;
    let disposed = false;
    let visible = true;
    let last = performance.now();
    let elapsed = 0;

    /* Current and target orientation, plus velocity for the spring. */
    let yaw = 0;
    let pitch = 0;
    let vYaw = 0;
    let vPitch = 0;
    let glow = 0;
    let targetGlow = 0;

    /* Until the pointer moves we have nothing to look at, so the head idles. */
    let tracking = false;
    const pointer = { x: 0, y: 0 };

    const styles = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) =>
      styles.getPropertyValue(name).trim() || fallback;
    const fg = parseHex(read("--vk-fg", "#e9eaec"));
    const accent = parseHex(read("--vk-accent", "#aee83c"));

    /* Reused each frame so the render loop allocates nothing. Rebuilt only
       when the cloud itself is swapped. */
    const bucketCount = new Int32Array(BUCKETS);
    const bucketStart = new Int32Array(BUCKETS);
    const cursorInto = new Int32Array(BUCKETS);
    let px = new Float32Array(cloud.count);
    let py = new Float32Array(cloud.count);
    let depth = new Float32Array(cloud.count);
    let facing = new Float32Array(cloud.count);
    let lambert = new Float32Array(cloud.count);
    let order = new Int32Array(cloud.count);

    const swapCloud = (next: PointCloud) => {
      cloud = next;
      px = new Float32Array(next.count);
      py = new Float32Array(next.count);
      depth = new Float32Array(next.count);
      facing = new Float32Array(next.count);
      lambert = new Float32Array(next.count);
      order = new Int32Array(next.count);
    };

    /* The scan is an optional upgrade, not a requirement: if it is missing or
       malformed the sculpt simply stays on screen. */
    const controller = new AbortController();
    fetch("/head-cloud.bin", { signal: controller.signal })
      .then((res) => (res.ok ? res.arrayBuffer() : Promise.reject(new Error(String(res.status)))))
      .then((buffer) => {
        if (disposed) return;
        swapCloud(parseHeadCloud(buffer));
      })
      .catch(() => {
        /* Keep the sculpt. */
      });

    const measure = () => {
      const rect = host.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return false;
      width = rect.width;
      height = rect.height;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return true;
    };

    const onPointerMove = (e: PointerEvent) => {
      tracking = true;
      pointer.x = e.clientX;
      pointer.y = e.clientY;

      /* Brighten on approach rather than strictly on hover, so the head lights
         up as you come toward it instead of snapping at the border. */
      const rect = host.getBoundingClientRect();
      const dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
      const dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
      const distance = Math.hypot(dx, dy);
      targetGlow = Math.max(0, 1 - distance / 260);
    };

    const onPointerLeave = () => {
      targetGlow = 0;
    };

    const step = (now: number) => {
      raf = requestAnimationFrame(step);
      if (!visible || width === 0) {
        last = now;
        return;
      }

      /* Frame-rate independent, and clamped so a backgrounded tab does not
         return and lurch the head across in one step. */
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;

      let targetYaw: number;
      let targetPitch: number;

      if (tracking && !coarse) {
        const rect = host.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        /* Normalised against the viewport, not the band, so the head keeps
           following once the cursor leaves the section. */
        const nx = clamp((pointer.x - cx) / (window.innerWidth / 2), -1, 1);
        const ny = clamp((pointer.y - cy) / (window.innerHeight / 2), -1, 1);
        targetYaw = nx * MAX_YAW;
        targetPitch = ny * MAX_PITCH;
      } else {
        targetYaw = Math.sin(elapsed * IDLE_SPEED) * IDLE_YAW;
        targetPitch = Math.sin(elapsed * IDLE_SPEED * 0.63) * IDLE_PITCH;
      }

      if (reduced) {
        yaw = targetYaw;
        pitch = targetPitch;
      } else {
        const k = SPRING * (dt * 60);
        vYaw = (vYaw + (targetYaw - yaw) * k) * DAMPING;
        vPitch = (vPitch + (targetPitch - pitch) * k) * DAMPING;
        yaw += vYaw;
        pitch += vPitch;
      }

      glow += (targetGlow - glow) * GLOW_RATE * (dt * 60);

      draw();
      updateReadout();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const cosY = Math.cos(yaw);
      const sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch);
      const sinP = Math.sin(pitch);

      /* The band is wide and short, so height is what constrains the head.
         Sizing off the shorter axis alone leaves it marooned in white space. */
      const scale = Math.min(height * 0.62, width * 0.3);
      const originX = width / 2;
      const originY = height / 2 - scale * 0.12;

      bucketCount.fill(0);

      for (let i = 0; i < cloud.count; i += 1) {
        const x = cloud.data[i * 4];
        const y = cloud.data[i * 4 + 1];
        const z = cloud.data[i * 4 + 2];

        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y2 = y * cosP - z1 * sinP;
        const z2 = y * sinP + z1 * cosP;

        const perspective = FOCAL / (CAMERA_Z - z2);
        px[i] = originX + x1 * perspective * scale;
        py[i] = originY - y2 * perspective * scale;
        depth[i] = z2;

        /* Normals ride the same rotation as the points they belong to. */
        const nx = cloud.normals[i * 3];
        const ny = cloud.normals[i * 3 + 1];
        const nz = cloud.normals[i * 3 + 2];
        const nx1 = nx * cosY + nz * sinY;
        const nz1 = -nx * sinY + nz * cosY;
        const ny2 = ny * cosP - nz1 * sinP;
        const nz2 = ny * sinP + nz1 * cosP;

        facing[i] = nz2;
        lambert[i] = Math.max(0, nx1 * LIGHT.x + ny2 * LIGHT.y + nz2 * LIGHT.z);

        const b = clamp(Math.floor(((z2 + 1.6) / 3.2) * BUCKETS), 0, BUCKETS - 1);
        bucketCount[b] += 1;
      }

      /* Prefix sum, then scatter, giving a back-to-front order in two passes. */
      let running = 0;
      for (let b = 0; b < BUCKETS; b += 1) {
        bucketStart[b] = running;
        running += bucketCount[b];
      }
      cursorInto.set(bucketStart);
      for (let i = 0; i < cloud.count; i += 1) {
        const b = clamp(Math.floor((depth[i] + 1.6) / 3.2 * BUCKETS), 0, BUCKETS - 1);
        order[cursorInto[b]] = i;
        cursorInto[b] += 1;
      }

      const lift = glow;
      for (let n = 0; n < cloud.count; n += 1) {
        const i = order[n];
        const towards = facing[i];

        /* Back-facing points are behind the skull and would otherwise show
           through the face. Culling them is what gives the head solidity. */
        if (towards < 0.02) continue;

        const weight = cloud.data[i * 4 + 3];

        /* Two terms: the key light picks out brow, nose and jaw, and a rim
           term keeps the silhouette crisp where the surface turns away. */
        const rim = 1 - towards;
        const shade = 0.14 + 0.86 * lambert[i] ** 1.1;
        const alpha = clamp((shade + 0.4 * rim ** 3) * (0.78 + 0.22 * weight) * (0.68 + 0.32 * lift), 0, 1);
        if (alpha < 0.02) continue;

        const radius = 1.1 + 0.5 * towards;

        /* A trace of accent on the nearest dots once the pointer is close. */
        const tint = lift * towards ** 3 * 0.5;
        const r = Math.round(fg[0] + (accent[0] - fg[0]) * tint);
        const g = Math.round(fg[1] + (accent[1] - fg[1]) * tint);
        const bl = Math.round(fg[2] + (accent[2] - fg[2]) * tint);

        ctx.fillStyle = `rgba(${r},${g},${bl},${alpha.toFixed(3)})`;
        ctx.fillRect(px[i] - radius / 2, py[i] - radius / 2, radius, radius);
      }
    };

    let lastReadout = "";
    const updateReadout = () => {
      const node = readoutRef.current;
      if (!node) return;
      const y = (((yaw * 180) / Math.PI) % 360).toFixed(0).padStart(4, " ");
      const p = ((pitch * 180) / Math.PI).toFixed(0).padStart(3, " ");
      const next = `YAW ${y}° · PITCH ${p}°`;
      if (next !== lastReadout) {
        node.textContent = next;
        lastReadout = next;
      }
    };

    if (measure()) draw();

    const resize = new ResizeObserver(() => {
      if (measure()) draw();
    });
    resize.observe(host);

    /* The band sits below the fold, so there is no reason to burn frames on it
       until it is actually on screen. */
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { rootMargin: "120px" },
    );
    io.observe(host);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    raf = requestAnimationFrame(step);

    return () => {
      disposed = true;
      controller.abort();
      cancelAnimationFrame(raf);
      resize.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reduced, coarse]);

  return (
    <div
      ref={hostRef}
      className={`relative h-[clamp(360px,52vh,560px)] w-full ${className ?? ""}`}
    >
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden="true" />

      <div className="pointer-events-none absolute left-0 top-0 flex items-center gap-3">
        <span className="vk-mono text-[10px] tracking-[0.2em] text-[var(--vk-fg-faint)]">
          OPERATOR
        </span>
        <span className="h-px w-8 bg-[var(--vk-line-mid)]" />
        <span className="vk-mono text-[10px] tracking-[0.2em] text-[var(--vk-fg-ghost)]">
          VISUAL
        </span>
      </div>

      <span
        ref={readoutRef}
        className="vk-mono pointer-events-none absolute bottom-0 right-0 text-[10px] tracking-[0.18em] text-[var(--vk-fg-ghost)] tabular-nums"
      >
        YAW 0° · PITCH 0°
      </span>

      <span className="sr-only">
        A rotating point-cloud portrait of the operator that follows the cursor.
      </span>
    </div>
  );
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/** #rgb or #rrggbb to an [r,g,b] triple. */
function parseHex(hex: string): [number, number, number] {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

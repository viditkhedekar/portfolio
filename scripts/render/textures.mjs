/**
 * Procedural textures for the render harness.
 *
 * Everything the world is surfaced with is generated here rather than loaded,
 * so the repository carries no image assets for a thing that is itself going
 * to be shipped as images. Canvas is the right tool: these are all flat
 * graphics, panel seams and readouts, not photographs.
 */

/** A canvas of the given size, with its 2D context. */
function sheet(w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  return { canvas, ctx: canvas.getContext("2d") };
}

function toTexture(THREE, canvas, { repeat = [1, 1], srgb = false } = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat[0], repeat[1]);
  tex.anisotropy = 8;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/**
 * A soft round falloff, used for every glow in the scene.
 *
 * The steep inner curve matters: a linear gradient reads as a flat disc and
 * gives the haze a papery edge, where this holds a hot core and fades to
 * nothing well before the quad's border.
 */
export function glowTexture(THREE) {
  const { canvas, ctx } = sheet(256, 256);
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0.0, "rgba(255,255,255,1)");
  g.addColorStop(0.12, "rgba(255,255,255,0.72)");
  g.addColorStop(0.32, "rgba(255,255,255,0.24)");
  g.addColorStop(0.62, "rgba(255,255,255,0.05)");
  g.addColorStop(1.0, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 256, 256);
  return toTexture(THREE, canvas);
}

/** Wall plating: seams, bolt lines and a little tonal drift. */
export function panelTexture(THREE) {
  const { canvas, ctx } = sheet(512, 512);

  ctx.fillStyle = "#15181b";
  ctx.fillRect(0, 0, 512, 512);

  /* Uneven tone so a long wall never looks like one flat colour under fog. */
  for (let i = 0; i < 240; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 20 + Math.random() * 90;
    ctx.fillStyle = `rgba(255,255,255,${0.004 + Math.random() * 0.012})`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /* Seams. */
  ctx.strokeStyle = "rgba(0,0,0,0.55)";
  ctx.lineWidth = 3;
  for (const x of [0, 256]) {
    ctx.beginPath();
    ctx.moveTo(x + 1.5, 0);
    ctx.lineTo(x + 1.5, 512);
    ctx.stroke();
  }
  for (const y of [0, 170, 341]) {
    ctx.beginPath();
    ctx.moveTo(0, y + 1.5);
    ctx.lineTo(512, y + 1.5);
    ctx.stroke();
  }

  /* A highlight along the top of each seam, which is what makes a flat
     texture read as a panel with a thickness. */
  ctx.strokeStyle = "rgba(255,255,255,0.05)";
  ctx.lineWidth = 1;
  for (const y of [4, 174, 345]) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  /* Bolts. */
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  for (const y of [22, 148, 192, 318, 363, 489]) {
    for (let x = 26; x < 512; x += 64) {
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return toTexture(THREE, canvas, { srgb: true });
}

/** Floor: a dark deck with a tread pattern and a long inset channel. */
export function floorTexture(THREE) {
  const { canvas, ctx } = sheet(512, 512);

  ctx.fillStyle = "#0c0e10";
  ctx.fillRect(0, 0, 512, 512);

  for (let i = 0; i < 300; i++) {
    ctx.fillStyle = `rgba(255,255,255,${0.003 + Math.random() * 0.01})`;
    const r = 30 + Math.random() * 120;
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, r, 0, Math.PI * 2);
    ctx.fill();
  }

  /* Deck plates. */
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.lineWidth = 2;
  for (let i = 0; i <= 512; i += 128) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 512);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(512, i);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.035)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 512; i += 128) {
    ctx.beginPath();
    ctx.moveTo(i + 2, 0);
    ctx.lineTo(i + 2, 512);
    ctx.stroke();
  }

  return toTexture(THREE, canvas, { srgb: true });
}

/** Roughness map, so the floor is not uniformly polished. */
export function floorRoughness(THREE) {
  const { canvas, ctx } = sheet(512, 512);
  ctx.fillStyle = "#6a6a6a";
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 400; i++) {
    const v = 60 + Math.floor(Math.random() * 130);
    ctx.fillStyle = `rgba(${v},${v},${v},0.5)`;
    const r = 24 + Math.random() * 140;
    ctx.beginPath();
    ctx.arc(Math.random() * 512, Math.random() * 512, r, 0, Math.PI * 2);
    ctx.fill();
  }
  return toTexture(THREE, canvas);
}

/* ------------------------------------------------------------- readouts */

const ACCENT = "#aee83c";

/**
 * A station's display.
 *
 * Drawn at the size it will be seen at, because these are the only surfaces
 * in the world a viewer will actually try to read. Each one is the instrument
 * its project would really have.
 */
export function readoutTexture(THREE, kind, label, sub) {
  const W = 1024;
  const H = 640;
  const { canvas, ctx } = sheet(W, H);

  ctx.fillStyle = "#070a06";
  ctx.fillRect(0, 0, W, H);

  /* A faint graticule under everything, the way an instrument screen has. */
  ctx.strokeStyle = "rgba(174,232,60,0.07)";
  ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y <= H; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  const pad = 54;
  const plotW = W - pad * 2;
  const plotH = H - pad * 2 - 66;
  const plotY = pad + 52;

  ctx.save();
  ctx.translate(pad, plotY);
  ctx.strokeStyle = ACCENT;
  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  drawInstrument(ctx, kind, plotW, plotH);
  ctx.restore();

  /* Header. */
  ctx.fillStyle = ACCENT;
  ctx.font = "600 30px ui-monospace, Menlo, monospace";
  ctx.fillText(label, pad, pad + 18);

  ctx.fillStyle = "rgba(174,232,60,0.45)";
  ctx.font = "500 22px ui-monospace, Menlo, monospace";
  ctx.fillText(sub, pad, H - pad + 6);

  /* Corner ticks. */
  ctx.strokeStyle = "rgba(174,232,60,0.5)";
  ctx.lineWidth = 3;
  const t = 26;
  for (const [cx, cy, sx, sy] of [
    [18, 18, 1, 1],
    [W - 18, 18, -1, 1],
    [18, H - 18, 1, -1],
    [W - 18, H - 18, -1, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + sy * t);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + sx * t, cy);
    ctx.stroke();
  }

  return toTexture(THREE, canvas, { srgb: true });
}

function drawInstrument(ctx, kind, w, h) {
  const rand = mulberry(kind.length * 977 + 13);

  if (kind === "motion") {
    const joints = [
      [0.5, 0.06], [0.5, 0.26], [0.5, 0.54],
      [0.31, 0.32], [0.18, 0.52],
      [0.69, 0.34], [0.83, 0.55],
      [0.4, 0.74], [0.34, 0.96],
      [0.62, 0.74], [0.72, 0.96],
    ];
    const bones = [[0,1],[1,2],[1,3],[3,4],[1,5],[5,6],[2,7],[7,8],[2,9],[9,10]];
    /* Ghosts of the previous frames, the way capture software draws a trail. */
    for (let g = 3; g >= 1; g--) {
      ctx.globalAlpha = 0.1 * g;
      ctx.lineWidth = 2;
      for (const [a, b] of bones) {
        ctx.beginPath();
        ctx.moveTo(joints[a][0] * w - g * 12, joints[a][1] * h);
        ctx.lineTo(joints[b][0] * w - g * 12, joints[b][1] * h);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    ctx.lineWidth = 4;
    for (const [a, b] of bones) {
      ctx.beginPath();
      ctx.moveTo(joints[a][0] * w, joints[a][1] * h);
      ctx.lineTo(joints[b][0] * w, joints[b][1] * h);
      ctx.stroke();
    }
    ctx.fillStyle = "#ffffff";
    for (const [x, y] of joints) {
      ctx.beginPath();
      ctx.arc(x * w, y * h, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (kind === "pitch") {
    ctx.lineWidth = 2.5;
    ctx.strokeRect(0, 0, w, h);
    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, h * 0.16, 0, Math.PI * 2);
    ctx.stroke();
    for (const side of [0, 1]) {
      const bx = side ? w - w * 0.13 : 0;
      ctx.strokeRect(bx, h * 0.28, w * 0.13, h * 0.44);
    }
    /* Players, and the lanes between them. */
    const pts = [];
    for (let i = 0; i < 11; i++) pts.push([0.08 + rand() * 0.84, 0.08 + rand() * 0.84]);
    ctx.strokeStyle = "rgba(174,232,60,0.35)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
        if (d > 0.26) continue;
        ctx.beginPath();
        ctx.moveTo(pts[i][0] * w, pts[i][1] * h);
        ctx.lineTo(pts[j][0] * w, pts[j][1] * h);
        ctx.stroke();
      }
    }
    ctx.fillStyle = ACCENT;
    for (const [x, y] of pts) {
      ctx.beginPath();
      ctx.arc(x * w, y * h, 7, 0, Math.PI * 2);
      ctx.fill();
    }
    return;
  }

  if (kind === "market") {
    const n = 64;
    const series = [];
    let v = 0.5;
    for (let i = 0; i < n; i++) {
      v += (rand() - 0.47) * 0.08;
      v = Math.min(0.94, Math.max(0.08, v));
      series.push(v);
    }
    /* Filled area under the line: the single cheapest way to stop a chart
       reading as a bare squiggle. */
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, h);
    series.forEach((s, i) => ctx.lineTo((i / (n - 1)) * w, (1 - s) * h));
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = "rgba(174,232,60,0.14)";
    ctx.fill();
    ctx.restore();

    ctx.lineWidth = 3;
    ctx.beginPath();
    series.forEach((s, i) => {
      const x = (i / (n - 1)) * w;
      const y = (1 - s) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.strokeStyle = "rgba(174,232,60,0.4)";
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 2;
    for (const f of [0.25, 0.5, 0.75]) {
      ctx.beginPath();
      ctx.moveTo(0, f * h);
      ctx.lineTo(w, f * h);
      ctx.stroke();
    }
    ctx.setLineDash([]);
    return;
  }

  if (kind === "model") {
    const bars = 14;
    const gap = w / bars;
    for (let i = 0; i < bars; i++) {
      const bh = (0.14 + rand() * 0.78) * h;
      ctx.fillStyle = `rgba(174,232,60,${0.22 + (bh / h) * 0.5})`;
      ctx.fillRect(i * gap + gap * 0.2, h - bh, gap * 0.6, bh);
      ctx.strokeStyle = ACCENT;
      ctx.lineWidth = 2;
      ctx.strokeRect(i * gap + gap * 0.2, h - bh, gap * 0.6, bh);
    }
    ctx.strokeStyle = "rgba(174,232,60,0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.42);
    ctx.lineTo(w, h * 0.42);
    ctx.stroke();
    return;
  }

  /* network */
  const nodes = [];
  for (let i = 0; i < 22; i++) nodes.push([0.05 + rand() * 0.9, 0.05 + rand() * 0.9]);
  ctx.strokeStyle = "rgba(174,232,60,0.3)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < nodes.length; i++) {
    const near = nodes
      .map((p, j) => ({ j, d: Math.hypot(p[0] - nodes[i][0], p[1] - nodes[i][1]) }))
      .filter((e) => e.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    for (const { j } of near) {
      ctx.beginPath();
      ctx.moveTo(nodes[i][0] * w, nodes[i][1] * h);
      ctx.lineTo(nodes[j][0] * w, nodes[j][1] * h);
      ctx.stroke();
    }
  }
  nodes.forEach(([x, y], i) => {
    const r = i % 5 === 0 ? 11 : 6;
    ctx.fillStyle = i % 5 === 0 ? "#ffffff" : ACCENT;
    ctx.beginPath();
    ctx.arc(x * w, y * h, r, 0, Math.PI * 2);
    ctx.fill();
  });
}

function mulberry(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

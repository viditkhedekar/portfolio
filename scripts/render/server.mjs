/**
 * VKOS/01 — offline render harness server.
 *
 * The landing page's world is not drawn in the browser at runtime. It is a
 * camera flight rendered here, once, as slowly and expensively as it likes,
 * and shipped as an image sequence. This is the same technique the reference
 * site uses, and it is the only way to get a frame that is full of light
 * rather than full of black.
 *
 * The server does three jobs:
 *
 *   1. serves the harness page and its modules
 *   2. serves three.js straight out of node_modules, so the harness runs the
 *      exact version the project already depends on
 *   3. takes finished frames back over POST and writes them to disk
 *
 * The last one is the point of having a server at all. A browser cannot write
 * a few hundred files to a repo, and passing them back through the agent
 * would be absurd.
 *
 *   node scripts/render/server.mjs
 */

import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { registerHooks } from "node:module";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const PORT = 4321;

/*
 * The scenes need to know how many certifications, channels and subjects
 * there are, and those numbers live in the app's TypeScript. Copying them
 * into the render scripts is what this hook exists to stop: the count was
 * transcribed as thirteen when it was twelve, the vault lit a safe that held
 * nothing, and nothing complained.
 *
 * So the server reads the real data and serves it, and the scenes ask.
 */
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/")) {
      const target = path.join(ROOT, "src", specifier.slice(2));
      return { url: pathToFileURL(`${target}.ts`).href, shortCircuit: true };
    }
    return next(specifier, context);
  },
});

async function counts() {
  const [certs, identity, school, projects] = await Promise.all([
    import(pathToFileURL(path.join(ROOT, "src/lib/data/certifications.ts")).href),
    import(pathToFileURL(path.join(ROOT, "src/lib/data/identity.ts")).href),
    import(pathToFileURL(path.join(ROOT, "src/lib/data/school.ts")).href),
    import(pathToFileURL(path.join(ROOT, "src/lib/data/projects.ts")).href),
  ]);

  return {
    certifications: certs.certifications.length,
    providers: certs.certificationGroups.length,
    channels: identity.channels.length,
    openChannels: identity.channels.filter((c) => c.href).length,
    subjects: school.subjects.length,
    projects: projects.liveProjects.map((p) => p.id),
  };
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webp": "image/webp",
  ".png": "image/png",
  ".bin": "application/octet-stream",
};

async function send(res, file) {
  try {
    const body = await fs.readFile(file);
    res.writeHead(200, {
      "content-type": TYPES[path.extname(file)] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}

/** Everything the harness is allowed to read, and where it lives. */
function resolveGet(url) {
  if (url === "/" || url === "/index.html") return path.join(HERE, "index.html");

  /* three, served from the project's own dependency. */
  if (url.startsWith("/three/")) {
    return path.join(ROOT, "node_modules/three", url.slice("/three/".length));
  }

  /* The head scan, so the harness can place the real geometry if it needs to. */
  if (url.startsWith("/public/")) {
    return path.join(ROOT, "public", url.slice("/public/".length));
  }

  /* Harness modules. */
  const local = path.join(HERE, url.replace(/^\/+/, ""));
  if (local.startsWith(HERE)) return local;

  return null;
}

const server = http.createServer(async (req, res) => {
  const url = (req.url ?? "/").split("?")[0];

  if (req.method === "POST" && url === "/frame") {
    const chunks = [];
    for await (const c of req) chunks.push(c);

    let payload;
    try {
      payload = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    } catch {
      res.writeHead(400).end("bad json");
      return;
    }

    const { dir, name, data } = payload;
    /* The harness names its own files, so the names are checked here rather
       than trusted: this process can write anywhere the repo can. */
    if (!/^[a-z0-9/_-]+$/i.test(dir ?? "") || !/^[a-z0-9._-]+$/i.test(name ?? "")) {
      res.writeHead(400).end("bad path");
      return;
    }

    const out = path.join(ROOT, "public", dir);
    await fs.mkdir(out, { recursive: true });
    const body = Buffer.from(String(data).split(",")[1] ?? "", "base64");
    await fs.writeFile(path.join(out, name), body);

    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, bytes: body.length }));
    return;
  }

  if (req.method === "GET" && url === "/counts.json") {
    try {
      const body = JSON.stringify(await counts());
      res.writeHead(200, {
        "content-type": "application/json",
        "cache-control": "no-store",
      });
      res.end(body);
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
    return;
  }

  if (req.method !== "GET") {
    res.writeHead(405).end("method not allowed");
    return;
  }

  const file = resolveGet(url);
  if (!file) {
    res.writeHead(403).end("forbidden");
    return;
  }
  await send(res, file);
});

server.listen(PORT, () => {
  console.log(`render harness on http://localhost:${PORT}`);
});

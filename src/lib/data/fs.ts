import type { Project } from "@/lib/types";
import { archivedProjects, liveProjects, projects, slugOf } from "@/lib/data/projects";

/**
 * VKOS/01 — VIRTUAL FILESYSTEM.
 *
 * The terminal presents the site as a directory tree so `cd`, `ls`, `cat` and
 * friends behave the way a shell user expects.
 *
 * There is no stored working directory: the browser's current route *is* the
 * working directory. `pwd` reads the route, and `cd` navigates. That keeps the
 * terminal and the address bar from ever disagreeing.
 */

export type NodeKind = "dir" | "page" | "file";

export interface FsNode {
  name: string;
  kind: NodeKind;
  href: string;
  note: string;
}

/** Top level of the tree. */
export const ROOT: FsNode[] = [
  { name: "projects", kind: "dir", href: "/projects", note: "selected builds" },
  { name: "archive", kind: "dir", href: "/archive", note: "cold storage" },
  { name: "school", kind: "page", href: "/school", note: "academic system" },
  {
    name: "certifications",
    kind: "page",
    href: "/certifications",
    note: "credential database",
  },
  { name: "about", kind: "page", href: "/about", note: "identity file" },
  { name: "contact", kind: "page", href: "/contact", note: "communications" },
];

function projectNode(p: Project): FsNode {
  return {
    name: slugOf(p),
    kind: "file",
    href: `/projects/${slugOf(p)}`,
    note: p.name,
  };
}

/** Route path -> the segments the shell displays, e.g. ["projects","px-001"]. */
function segmentsOf(pathname: string): string[] {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return [];

  /* Archived files live under /projects/<slug> but read as ~/archive/<slug>. */
  if (parts[0] === "projects" && parts[1]) {
    const found = projects.find((p) => slugOf(p) === parts[1]);
    if (found?.archived) return ["archive", parts[1]];
  }
  return parts;
}

/** `pwd` — the shell path for a route. */
export function pwdOf(pathname: string): string {
  const parts = segmentsOf(pathname);
  return parts.length === 0 ? "~" : `~/${parts.join("/")}`;
}

/**
 * Resolve a path argument against the current route.
 *
 * Accepts absolute (`/school`, `~/projects`), relative (`px-001`), and `.`/`..`
 * segments. Returns null when the path does not exist.
 */
export function resolve(
  pathname: string,
  arg: string,
): { href: string; path: string } | null {
  const raw = arg.trim();
  const absolute = raw === "" || raw === "~" || raw === "/" || /^[~/]/.test(raw);

  const base = absolute ? [] : segmentsOf(pathname);
  const rest = raw.replace(/^~?\/?/, "");

  const out = [...base];
  for (const part of rest.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "..") {
      out.pop();
      continue;
    }
    out.push(part);
  }

  if (out.length === 0) return { href: "/", path: "~" };

  const [head, next, ...extra] = out;
  if (extra.length > 0) return null;

  const top = ROOT.find((n) => n.name === head);
  if (!top) return null;

  if (!next) return { href: top.href, path: `~/${head}` };
  if (top.kind !== "dir") return null;

  /* Only descend into a directory that actually holds the file. */
  const pool = head === "archive" ? archivedProjects : liveProjects;
  const found = pool.find((p) => slugOf(p) === next.toLowerCase());
  if (!found) return null;

  return { href: `/projects/${slugOf(found)}`, path: `~/${head}/${slugOf(found)}` };
}

/** `ls` — the entries at a resolved path. A file lists only itself. */
export function list(path: string): FsNode[] | null {
  if (path === "~") return ROOT;

  const parts = path.replace(/^~\/?/, "").split("/").filter(Boolean);
  const [head, next] = parts;
  const top = ROOT.find((n) => n.name === head);
  if (!top) return null;

  if (next) {
    const pool = head === "archive" ? archivedProjects : liveProjects;
    const found = pool.find((p) => slugOf(p) === next);
    return found ? [projectNode(found)] : null;
  }

  if (head === "projects") return liveProjects.map(projectNode);
  if (head === "archive") return archivedProjects.map(projectNode);
  return [top];
}

/** The project a `cat`/`stat` argument refers to, from anywhere in the tree. */
export function fileAt(pathname: string, arg: string): Project | undefined {
  const target = resolve(pathname, arg);
  if (!target) return undefined;
  const slug = target.href.startsWith("/projects/")
    ? target.href.slice("/projects/".length)
    : "";
  return slug ? projects.find((p) => slugOf(p) === slug) : undefined;
}

/** `tree` — the whole filesystem as indented lines. */
export function treeLines(): string[] {
  const out: string[] = ["~"];
  ROOT.forEach((node, i) => {
    const last = i === ROOT.length - 1;
    out.push(`${last ? "└──" : "├──"} ${node.name}${node.kind === "dir" ? "/" : ""}`);

    const pool =
      node.name === "projects" ? liveProjects : node.name === "archive" ? archivedProjects : [];
    pool.forEach((p, j) => {
      const lastChild = j === pool.length - 1;
      out.push(`${last ? "   " : "│  "} ${lastChild ? "└──" : "├──"} ${slugOf(p)}`);
    });
  });
  return out;
}

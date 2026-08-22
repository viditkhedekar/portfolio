import { modules } from "@/lib/data/system";

/**
 * VKOS/01 — APPLICATION REGISTRY.
 *
 * Every route other than the desktop (`/`) is presented as a running
 * application: it gets window chrome, a launch transition and a dock entry.
 * The registry derives from `modules` so adding a module adds an app.
 */

export interface AppDescriptor {
  id: string;
  /** Display name, e.g. "SCHOOL". */
  name: string;
  /** Filename shown in the title bar, e.g. "SCHOOL.app". */
  file: string;
  /** Shell path shown beside the filename. */
  path: string;
  href: string;
  /** Two-character rail number, or "··" for apps outside the module index. */
  index: string;
  description: string;
}

function toApp(
  id: string,
  name: string,
  href: string,
  index: string,
  description: string,
): AppDescriptor {
  return { id, name, file: `${name}.app`, path: `~/vkos${href}`, href, index, description };
}

export const apps: AppDescriptor[] = [
  ...modules.map((m) => toApp(m.id, m.name, m.href, m.index, m.description)),
  toApp("archive", "ARCHIVE", "/archive", "··", "COLD STORAGE"),
];

/**
 * The app owning a pathname, or null on the desktop.
 *
 * A nested route (`/projects/px-001`) belongs to its parent app but reports its
 * own path, so the title bar tracks where you actually are.
 */
export function appForPath(pathname: string): AppDescriptor | null {
  if (pathname === "/") return null;

  const owner = apps.find(
    (a) => pathname === a.href || pathname.startsWith(`${a.href}/`),
  );

  if (!owner) {
    /* Unresolved paths still render as a window so the 404 stays in-world. */
    return {
      id: "system",
      name: "SYSTEM",
      file: "SYSTEM.app",
      path: `~/vkos${pathname}`,
      href: pathname,
      index: "!!",
      description: "UNRESOLVED PATH",
    };
  }

  return { ...owner, path: `~/vkos${pathname}` };
}

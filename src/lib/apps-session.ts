import { apps } from "@/lib/data/apps";

/**
 * Which applications have been opened this session.
 *
 * Kept in a tiny external store, mirroring src/lib/boot.ts, so the dock can
 * read it through useSyncExternalStore rather than assigning state inside an
 * effect. Snapshots are cached by reference — returning a fresh array on every
 * read would loop the store.
 */

const STORAGE_KEY = "vkos.open-apps";
const EMPTY: string[] = [];

let cache: string[] | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (!Array.isArray(parsed)) return EMPTY;
    /* Ignore ids that no longer exist in the registry. */
    const valid = parsed.filter(
      (id): id is string => typeof id === "string" && apps.some((a) => a.id === id),
    );
    return valid.length ? valid : EMPTY;
  } catch {
    return EMPTY;
  }
}

export function subscribeOpenApps(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Client snapshot. */
export function getOpenApps(): string[] {
  if (cache === null) cache = read();
  return cache;
}

/** Server snapshot: the dock is empty until the session is known. */
export function getOpenAppsServer(): string[] {
  return EMPTY;
}

/** Marks an app as running. No-op if it already is. */
export function openApp(id: string): void {
  const current = getOpenApps();
  if (current.includes(id)) return;

  cache = [...current, id];
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    /* private mode — the dock simply resets on the next load */
  }
  listeners.forEach((l) => l());
}

import { apps } from "@/lib/data/apps";

/**
 * Window-manager state for the session: which applications are open, which are
 * minimised, and whether the window is maximised.
 *
 * Kept in a tiny external store, mirroring src/lib/boot.ts, so the dock and the
 * window chrome can read it through useSyncExternalStore rather than assigning
 * state inside an effect. Snapshots are cached by reference — returning a fresh
 * object on every read would loop the store.
 */

const STORAGE_KEY = "vkos.window-state";

export interface WindowState {
  /** Apps opened this session, in the order they were first opened. */
  open: string[];
  /** Subset of `open` that has been minimised to the dock. */
  minimised: string[];
  maximised: boolean;
}

const EMPTY: WindowState = { open: [], minimised: [], maximised: false };

let cache: WindowState | null = null;
const listeners = new Set<() => void>();

function known(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (id): id is string => typeof id === "string" && apps.some((a) => a.id === id),
  );
}

function read(): WindowState {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return EMPTY;
    const record = parsed as Record<string, unknown>;
    const open = known(record.open);
    if (open.length === 0) return EMPTY;
    return {
      open,
      /* A minimised id that is no longer open would be a dangling chip. */
      minimised: known(record.minimised).filter((id) => open.includes(id)),
      maximised: record.maximised === true,
    };
  } catch {
    return EMPTY;
  }
}

function commit(next: WindowState): void {
  cache = next;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* private mode — window state simply resets on the next load */
  }
  listeners.forEach((l) => l());
}

export function subscribeWindows(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Client snapshot. */
export function getWindows(): WindowState {
  if (cache === null) cache = read();
  return cache;
}

/** Server snapshot: no windows are open until the session is known. */
export function getWindowsServer(): WindowState {
  return EMPTY;
}

/**
 * Marks an app as open and focused. Opening an app always un-minimises it —
 * navigating to a route is what "restoring a window" means here.
 */
export function openApp(id: string): void {
  const current = getWindows();
  const alreadyOpen = current.open.includes(id);
  const wasMinimised = current.minimised.includes(id);
  if (alreadyOpen && !wasMinimised) return;

  commit({
    ...current,
    open: alreadyOpen ? current.open : [...current.open, id],
    minimised: current.minimised.filter((m) => m !== id),
  });
}

/** Minimise: the app stays in the dock and can be restored by clicking it. */
export function minimiseApp(id: string): void {
  const current = getWindows();
  if (!current.open.includes(id) || current.minimised.includes(id)) return;
  commit({ ...current, minimised: [...current.minimised, id] });
}

/** Close: the app leaves the dock entirely. */
export function closeApp(id: string): void {
  const current = getWindows();
  if (!current.open.includes(id)) return;
  commit({
    ...current,
    open: current.open.filter((o) => o !== id),
    minimised: current.minimised.filter((m) => m !== id),
  });
}

/** Maximise is a display preference, so it persists across navigation. */
export function toggleMaximised(): void {
  const current = getWindows();
  commit({ ...current, maximised: !current.maximised });
}

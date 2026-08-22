/**
 * Boot state, kept in a tiny external store so components can read it through
 * useSyncExternalStore rather than assigning state inside an effect.
 *
 * The session flag is written once the sequence completes; an inline script in
 * the document head mirrors it as html[data-boot="pending"] before first paint.
 */

const STORAGE_KEY = "vkos.booted";

function readSession(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

let pending: boolean | null = null;
const listeners = new Set<() => void>();

function ensure(): boolean {
  if (pending === null) pending = !readSession();
  return pending;
}

export function subscribeBoot(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Client snapshot: true while the boot sequence still needs to run. */
export function getBootPending(): boolean {
  return ensure();
}

/** Server snapshot: never boots during SSR. */
export function getBootPendingServer(): boolean {
  return false;
}

export function markBooted(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private mode — the sequence simply replays next load */
  }
  pending = false;
  document.documentElement.removeAttribute("data-boot");
  listeners.forEach((l) => l());
}

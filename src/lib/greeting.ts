/**
 * Whether the terminal has already greeted this session.
 *
 * The terminal opens itself once, on the desktop, just after boot — like a
 * login shell. Dismiss it and it stays dismissed until a new session.
 */

const STORAGE_KEY = "vkos.greeted";

export function hasGreeted(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    /* private mode — treat it as already greeted rather than reopening
       the terminal on every navigation. */
    return true;
  }
}

export function markGreeted(): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* nothing to persist to */
  }
}

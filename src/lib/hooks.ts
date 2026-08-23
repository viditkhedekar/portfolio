"use client";

import * as React from "react";

/* --------------------------------------------------------------- clock */

let tick = 0;
const clockListeners = new Set<() => void>();
let timer: number | null = null;

function subscribeClock(listener: () => void): () => void {
  clockListeners.add(listener);
  if (timer === null) {
    tick = Date.now();
    timer = window.setInterval(() => {
      tick = Date.now();
      clockListeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    clockListeners.delete(listener);
    if (clockListeners.size === 0 && timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  };
}

/**
 * A once-per-second clock. Returns null during SSR and on the very first
 * client render so nothing hydrates with a mismatched timestamp.
 */
export function useClock(): Date | null {
  const ms = React.useSyncExternalStore(
    subscribeClock,
    () => tick,
    () => 0,
  );
  return ms === 0 ? null : new Date(ms);
}

/* -------------------------------------------------------- media queries */

const mediaStores = new Map<
  string,
  { mql: MediaQueryList; listeners: Set<() => void>; matches: boolean }
>();

function mediaStore(query: string) {
  let store = mediaStores.get(query);
  if (!store) {
    const mql = window.matchMedia(query);
    store = { mql, listeners: new Set(), matches: mql.matches };
    const onChange = () => {
      store!.matches = store!.mql.matches;
      store!.listeners.forEach((l) => l());
    };
    mql.addEventListener("change", onChange);
    mediaStores.set(query, store);
  }
  return store;
}

/** SSR-safe media query. Always false on the server. */
export function useMediaQuery(query: string): boolean {
  const subscribe = React.useCallback(
    (listener: () => void) => {
      const store = mediaStore(query);
      store.listeners.add(listener);
      return () => {
        store.listeners.delete(listener);
      };
    },
    [query],
  );

  return React.useSyncExternalStore(
    subscribe,
    () => mediaStore(query).matches,
    () => false,
  );
}

/** Never fires; the value it guards only ever changes at hydration. */
const noSubscribe = () => () => {};

/**
 * False on the server and on the hydrating render, true afterwards.
 *
 * For work that needs a real DOM, such as portalling into document.body.
 */
export function useMounted(): boolean {
  return React.useSyncExternalStore(
    noSubscribe,
    () => true,
    () => false,
  );
}

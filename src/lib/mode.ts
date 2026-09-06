"use client";

import * as React from "react";
import { MODE_KEY, type Mode } from "@/lib/mode-gate";

export type { Mode } from "@/lib/mode-gate";

/**
 * Which landing page you get.
 *
 * `world` is the rendered flight: a canvas, a few megabytes of frames and a
 * scroll-driven camera. `lite` is the desktop this site had before the world
 * was built, and it downloads none of that.
 *
 * The choice has to be known before the first paint, or a machine that cannot
 * afford the world would start fetching it anyway in the moment before React
 * decided otherwise. So an inline script in the document head resolves it and
 * writes it onto `<html>`, and everything here reads it back off the
 * attribute. That is the same trick the boot gate uses.
 *
 * The script itself lives in `mode-gate.ts`, which the server can actually
 * read. See the note there.
 */

function readMode(): Mode {
  if (typeof document === "undefined") return "world";
  return document.documentElement.getAttribute("data-mode") === "lite"
    ? "lite"
    : "world";
}

const listeners = new Set<() => void>();

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** The current mode. Re-renders every consumer when it changes. */
export function useMode(): Mode {
  return React.useSyncExternalStore(subscribe, readMode, () => "world" as Mode);
}

/**
 * Switch modes.
 *
 * The world cannot be un-downloaded and the lite desktop cannot be grafted
 * onto a page that has already mounted the film, so this reloads. It is a
 * deliberate, once-in-a-visit action and a reload is the honest way to do it.
 */
export function setMode(mode: Mode): void {
  try {
    window.localStorage.setItem(MODE_KEY, mode);
  } catch {
    /* Private browsing, or storage disabled. The attribute below still takes
       effect for this page view, which is the part that matters. */
  }
  document.documentElement.setAttribute("data-mode", mode);
  for (const fn of listeners) fn();
  window.location.reload();
}

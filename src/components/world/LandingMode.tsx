"use client";

import type * as React from "react";
import { useMode } from "@/lib/mode";

/**
 * Picks which landing page to render.
 *
 * Both trees are built on the server and handed in, so the choice costs one
 * client component and the page file stays a single readable description of
 * both. Nothing in the branch that is not chosen is mounted, which is what
 * keeps the film from loading in low-RAM mode.
 */
export function LandingMode({
  world,
  lite,
}: {
  world: React.ReactNode;
  lite: React.ReactNode;
}) {
  return useMode() === "lite" ? lite : world;
}

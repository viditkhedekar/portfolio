"use client";

import * as React from "react";
import Link from "next/link";
import { domains, mapEdges, mapNodes, neighboursOf } from "@/lib/data/graph";
import { Label, cx } from "@/components/ui";
import { liveProjects } from "@/lib/data/projects";

/**
 * SYSTEM ARCHITECTURE — an interactive map of how the domains and the project
 * files relate. Edges live in an SVG scaled to the container (straight lines
 * stay straight under non-uniform scaling); nodes are positioned HTML so the
 * labels keep their typography and stay focusable.
 */
export function SystemMap() {
  const [focus, setFocus] = React.useState<string | null>(null);
  const lit = React.useMemo(() => (focus ? neighboursOf(focus) : null), [focus]);

  const nodeById = React.useMemo(
    () => new Map(mapNodes.map((n) => [n.id, n])),
    [],
  );

  return (
    <section aria-labelledby="architecture-heading" id="architecture">
      <div className="flex items-center gap-4 border-b border-[var(--vk-line)] pb-3">
        <h2 id="architecture-heading" className="vk-label text-[var(--vk-fg-dim)]">
          SYSTEM ARCHITECTURE
        </h2>
        <div className="h-px flex-1 bg-[var(--vk-line)]" />
        <span className="vk-label">
          {domains.length} DOMAINS / {liveProjects.length} FILES
        </span>
      </div>

      {/* Graph — tablet and up */}
      <div
        className="vk-grid-bg relative hidden h-[520px] w-full border-x border-b border-[var(--vk-line)] bg-[var(--vk-bg-panel)] md:block"
        onMouseLeave={() => setFocus(null)}
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {mapEdges.map((e, i) => {
            const a = nodeById.get(e.from);
            const b = nodeById.get(e.to);
            if (!a || !b) return null;
            const active = lit ? lit.has(a.id) && lit.has(b.id) : false;
            return (
              <line
                key={`${e.from}-${e.to}-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                vectorEffect="non-scaling-stroke"
                stroke={active ? "var(--vk-accent)" : "var(--vk-line-mid)"}
                strokeWidth={active ? 1 : 1}
                strokeDasharray={a.kind === "project" || b.kind === "project" ? "3 3" : undefined}
                style={{
                  opacity: lit ? (active ? 1 : 0.18) : 0.75,
                  transition: "opacity 260ms linear, stroke 260ms linear",
                }}
              />
            );
          })}
        </svg>

        {mapNodes.map((n) => {
          const on = lit ? lit.has(n.id) : true;
          const isFocus = focus === n.id;
          const inner = (
            <>
              <span
                aria-hidden
                className={cx(
                  "absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45",
                  n.kind === "domain"
                    ? isFocus
                      ? "bg-[var(--vk-accent)]"
                      : "bg-[var(--vk-fg-faint)]"
                    : isFocus
                      ? "bg-[var(--vk-accent)]"
                      : "bg-[var(--vk-fg-ghost)]",
                )}
                style={{ transition: "background 200ms linear" }}
              />
              <span
                className={cx(
                  "vk-mono absolute left-1/2 top-1/2 -translate-x-1/2 translate-y-[10px] whitespace-nowrap tracking-[0.16em] transition-colors duration-200",
                  n.kind === "domain" ? "text-[10px]" : "text-[9px]",
                  isFocus
                    ? "text-[var(--vk-accent)]"
                    : n.kind === "domain"
                      ? "text-[var(--vk-fg-dim)]"
                      : "text-[var(--vk-fg-ghost)]",
                )}
              >
                {n.label}
              </span>
            </>
          );

          const common = {
            className: cx(
              "absolute block h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full",
              "transition-opacity duration-260",
            ),
            style: {
              left: `${n.x}%`,
              top: `${n.y}%`,
              opacity: on ? 1 : 0.22,
            } as React.CSSProperties,
            onMouseEnter: () => setFocus(n.id),
            onFocus: () => setFocus(n.id),
          };

          return n.href ? (
            <Link
              key={n.id}
              href={n.href}
              data-cursor={n.kind === "project" ? "OPEN FILE" : "ACCESS MODULE"}
              data-cursor-sub={n.label}
              aria-label={`${n.label} — open`}
              {...common}
            >
              {inner}
            </Link>
          ) : (
            <div key={n.id} tabIndex={0} role="button" aria-label={n.label} {...common}>
              {inner}
            </div>
          );
        })}

        <div className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-5">
          <span className="vk-mono flex items-center gap-2 text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
            <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-[var(--vk-fg-faint)]" />
            DOMAIN
          </span>
          <span className="vk-mono flex items-center gap-2 text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
            <span aria-hidden className="h-1.5 w-1.5 rotate-45 bg-[var(--vk-fg-ghost)]" />
            FILE
          </span>
        </div>

        <div className="pointer-events-none absolute bottom-4 right-4">
          <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
            HOVER TO TRACE CONNECTIONS
          </span>
        </div>
      </div>

      {/* Nested list — mobile */}
      <div className="border-x border-b border-[var(--vk-line)] bg-[var(--vk-bg-panel)] md:hidden">
        <ul>
          {domains.map((d) => {
            const attached = liveProjects.filter((p) => p.domains?.includes(d.id));
            return (
              <li key={d.id} className="border-b border-[var(--vk-line)] px-5 py-4 last:border-b-0">
                <div className="flex items-center justify-between">
                  <span className="vk-mono text-[11px] tracking-[0.18em] text-[var(--vk-fg)]">
                    {d.label}
                  </span>
                  <Label>{attached.length} FILES</Label>
                </div>
                {attached.length > 0 && (
                  <ul className="mt-3 space-y-1.5 border-l border-[var(--vk-line)] pl-4">
                    {attached.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/projects/${p.id.toLowerCase()}`}
                          className="vk-mono text-[10px] tracking-[0.14em] text-[var(--vk-fg-faint)]"
                        >
                          {p.id}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

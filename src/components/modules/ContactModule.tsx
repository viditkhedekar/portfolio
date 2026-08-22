"use client";

import * as React from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { Container, Label, ModuleHeading, SectionTitle, Slot, cx } from "@/components/ui";
import { channels, contactNote, identity } from "@/lib/data/identity";
import { StatusDot } from "@/components/ui";

export function ContactModule() {
  const [copied, setCopied] = React.useState<string | null>(null);
  const configured = channels.filter((c) => c.href);

  const copy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      window.setTimeout(() => setCopied(null), 1600);
    } catch {
      /* clipboard unavailable — the handle is visible on screen anyway */
    }
  };

  return (
    <Container>
      <ModuleHeading index="05" name="CONTACT" subtitle="COMMUNICATIONS SYSTEM" />

      <div className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-20">
        <div>
          <SectionTitle right={`${String(channels.length).padStart(2, "0")} CHANNELS`}>
            AVAILABLE CHANNELS
          </SectionTitle>

          <ul className="mt-2">
            {channels.map((c) => {
              const live = Boolean(c.href);
              return (
                <li
                  key={c.id}
                  className="grid items-center gap-x-6 gap-y-3 border-b border-[var(--vk-line)] py-6 sm:grid-cols-[minmax(0,1fr)_auto]"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <StatusDot status={live ? "ONLINE" : "ARCHIVED"} pulse={live} />
                      <h3 className="vk-mono text-[11px] tracking-[0.18em] text-[var(--vk-fg-dim)]">
                        {c.label}
                      </h3>
                      {c.primary && (
                        <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                          PRIMARY
                        </span>
                      )}
                    </div>
                    <p className="mt-2.5 truncate text-[19px] tracking-tight">
                      <Slot className="text-[var(--vk-fg)]">{c.handle}</Slot>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {live && (
                      <button
                        type="button"
                        onClick={() => copy(c.id, c.handle)}
                        aria-label={`Copy ${c.label}`}
                        className="flex h-9 w-9 items-center justify-center border border-[var(--vk-line)] text-[var(--vk-fg-faint)] transition-colors hover:border-[var(--vk-line-mid)] hover:text-[var(--vk-fg)]"
                      >
                        {copied === c.id ? (
                          <Check size={13} strokeWidth={1.5} className="text-[var(--vk-accent)]" />
                        ) : (
                          <Copy size={13} strokeWidth={1.5} />
                        )}
                      </button>
                    )}

                    {live ? (
                      <a
                        href={c.href}
                        target={c.id === "email" ? undefined : "_blank"}
                        rel="noreferrer noopener"
                        data-cursor="OPEN CHANNEL"
                        data-cursor-sub={c.label}
                        className="vk-mono group flex h-9 items-center gap-2 border border-[var(--vk-line)] px-4 text-[10px] tracking-[0.16em] text-[var(--vk-fg-dim)] transition-colors hover:border-[var(--vk-accent)] hover:text-[var(--vk-accent)]"
                      >
                        OPEN CHANNEL
                        <ArrowUpRight size={12} strokeWidth={1.5} />
                      </a>
                    ) : (
                      <span className="vk-mono flex h-9 items-center border border-dashed border-[var(--vk-line)] px-4 text-[10px] tracking-[0.16em] text-[var(--vk-fg-ghost)]">
                        UNCONFIGURED
                      </span>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <p className="mt-8 max-w-[54ch] text-[15px] leading-relaxed">
            <Slot className="text-[var(--vk-fg-dim)]">{contactNote}</Slot>
          </p>
        </div>

        {/* Console */}
        <aside>
          <div className="border border-[var(--vk-line)] bg-[var(--vk-bg-panel)]">
            <div className="flex h-9 items-center justify-between border-b border-[var(--vk-line)] px-4">
              <Label>TRANSMISSION</Label>
              <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                OUTBOUND
              </span>
            </div>
            <dl>
              {[
                {
                  k: "MESSAGE STATUS",
                  v: configured.length ? "READY" : "STANDBY",
                  accent: configured.length > 0,
                },
                { k: "CHANNELS ONLINE", v: `${configured.length} / ${channels.length}` },
                { k: "OPERATOR", v: identity.name },
                { k: "LOCATION", v: identity.based },
              ].map((f) => (
                <div
                  key={f.k}
                  className="flex items-baseline justify-between gap-4 border-b border-[var(--vk-line)] px-4 py-3 last:border-b-0"
                >
                  <Label as="dt">{f.k}</Label>
                  <dd
                    className={cx(
                      "vk-mono text-[11px] tracking-[0.1em]",
                      f.accent && "text-[var(--vk-accent)]",
                    )}
                  >
                    <Slot className="text-[var(--vk-fg)]">{f.v}</Slot>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <p className="vk-mono mt-4 text-[9px] leading-relaxed tracking-[0.12em] text-[var(--vk-fg-ghost)]">
            NO MESSAGE FORM IS EXPOSED. CHANNELS OPEN IN YOUR OWN CLIENT.
          </p>
        </aside>
      </div>
    </Container>
  );
}

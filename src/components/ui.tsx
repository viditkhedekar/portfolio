import * as React from "react";

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/* ---------------------------------------------------------------- Label */

export function Label({
  children,
  className,
  as: As = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "span" | "h2" | "h3" | "dt";
}) {
  return <As className={cx("vk-label", className)}>{children}</As>;
}

/* ------------------------------------------------------------ Container */

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mx-auto w-full max-w-[1440px] px-5 sm:px-8 lg:px-12", className)}>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------- Sections */

export function ModuleHeading({
  index,
  name,
  subtitle,
}: {
  index: string;
  name: string;
  subtitle: string;
}) {
  return (
    <header className="border-b border-[var(--vk-line)] pb-8 pt-10 sm:pt-14">
      <div className="flex items-baseline gap-3">
        <span className="vk-mono text-[11px] tracking-[0.2em] text-[var(--vk-accent)]">
          {index}
        </span>
        <span className="vk-mono text-[11px] tracking-[0.2em] text-[var(--vk-fg-ghost)]">/</span>
        <h1 className="vk-mono text-[11px] tracking-[0.2em] text-[var(--vk-fg-dim)]">{name}</h1>
      </div>
      <p className="vk-display mt-5 text-[clamp(2.1rem,6vw,4.25rem)] text-[var(--vk-fg)]">
        {subtitle}
      </p>
    </header>
  );
}

export function SectionTitle({
  children,
  right,
  className,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cx(
        "flex items-center gap-4 border-b border-[var(--vk-line)] pb-3",
        className,
      )}
    >
      <h2 className="vk-label text-[var(--vk-fg-dim)]">{children}</h2>
      <div className="h-px flex-1 bg-[var(--vk-line)]" />
      {right ? <div className="vk-label">{right}</div> : null}
    </div>
  );
}

/* --------------------------------------------------------------- Status */

const STATUS_COLOR: Record<string, string> = {
  ACTIVE: "var(--vk-status-active)",
  ONLINE: "var(--vk-status-active)",
  OPEN: "var(--vk-status-active)",
  BUILDING: "var(--vk-status-building)",
  "R&D": "var(--vk-status-rd)",
  ARCHIVED: "var(--vk-status-archived)",
};

export function statusColor(status: string): string {
  return STATUS_COLOR[status] ?? "var(--vk-fg-faint)";
}

export function StatusDot({
  status,
  pulse = false,
  size = 5,
}: {
  status: string;
  pulse?: boolean;
  size?: number;
}) {
  return (
    <span
      aria-hidden
      className={cx("inline-block shrink-0 rounded-full", pulse && "vk-pulse")}
      style={{
        width: size,
        height: size,
        background: statusColor(status),
        boxShadow: `0 0 6px ${statusColor(status)}40`,
      }}
    />
  );
}

export function StatusTag({ status, pulse }: { status: string; pulse?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <StatusDot status={status} pulse={pulse} />
      <span
        className="vk-mono text-[10px] tracking-[0.14em]"
        style={{ color: statusColor(status) }}
      >
        {status}
      </span>
    </span>
  );
}

/* ---------------------------------------------------------------- Field */

/** Tiny uppercase label above a larger value — the core metadata pattern. */
export function Field({
  label,
  value,
  accent = false,
  className,
}: {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label as="dt">{label}</Label>
      <dd
        className={cx(
          "vk-mono mt-2 text-[13px] leading-snug",
          accent ? "text-[var(--vk-accent)]" : "text-[var(--vk-fg)]",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

/* ---------------------------------------------------------- Placeholder */

/**
 * Renders template text like "[ PROJECT NAME ]" in a visibly unfilled state so
 * placeholder content never reads as a real claim.
 */
export function isPlaceholder(value?: string | null): boolean {
  return typeof value === "string" && /^\s*\[.*\]\s*$/.test(value);
}

export function Slot({
  children,
  className,
}: {
  children?: string | null;
  className?: string;
}) {
  if (!children) return null;
  if (!isPlaceholder(children)) return <span className={className}>{children}</span>;
  return (
    <span
      className={cx("text-[var(--vk-fg-ghost)]", className)}
      title="Unfilled placeholder — edit src/lib/data/"
    >
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- Panel */

export function Panel({
  children,
  className,
  as: As = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "aside";
}) {
  return (
    <As
      className={cx(
        "border border-[var(--vk-line)] bg-[var(--vk-bg-panel)]",
        className,
      )}
    >
      {children}
    </As>
  );
}

export function PanelHeader({
  children,
  right,
}: {
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex h-9 items-center justify-between border-b border-[var(--vk-line)] px-4">
      <span className="vk-label">{children}</span>
      {right}
    </div>
  );
}

/* --------------------------------------------------------------- Prose  */

export function Prose({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p
      className={cx(
        "max-w-[62ch] text-[15px] leading-[1.75]",
        isPlaceholder(children) ? "text-[var(--vk-fg-ghost)]" : "text-[var(--vk-fg-dim)]",
      )}
    >
      {children}
    </p>
  );
}

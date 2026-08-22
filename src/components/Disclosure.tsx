import * as React from "react";
import { Plus } from "lucide-react";
import { cx } from "@/components/ui";

/**
 * A collapsible block, closed by default.
 *
 * Built on <details>/<summary> so it works without JavaScript, stays keyboard
 * operable and is announced correctly — this keeps the modules that use it
 * server-rendered.
 */
export function Disclosure({
  index,
  title,
  summary,
  meta,
  children,
  className,
}: {
  /** Two-digit rail number, e.g. "01". */
  index?: string;
  title: string;
  /** One line describing the contents, shown while closed. */
  summary?: string;
  /** Right-aligned count, e.g. "13 ENTRIES". */
  meta?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <details
      className={cx("group border-b border-[var(--vk-line)]", className)}
    >
      <summary
        data-cursor="EXPAND"
        data-cursor-sub={title}
        className="flex cursor-pointer list-none items-start gap-4 py-6 transition-colors hover:bg-[var(--vk-bg-panel)] [&::-webkit-details-marker]:hidden"
      >
        {index && (
          <span className="vk-mono mt-1.5 shrink-0 text-[10px] tracking-[0.14em] text-[var(--vk-fg-ghost)] transition-colors group-open:text-[var(--vk-accent)]">
            {index}
          </span>
        )}

        <span className="min-w-0 flex-1">
          <span className="block text-[17px] leading-snug tracking-tight text-[var(--vk-fg)]">
            {title}
          </span>
          {summary && (
            <span className="mt-1.5 block text-[13px] leading-relaxed text-[var(--vk-fg-faint)]">
              {summary}
            </span>
          )}
        </span>

        {meta && (
          <span className="vk-mono mt-1.5 hidden shrink-0 text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)] sm:block">
            {meta}
          </span>
        )}

        <span
          aria-hidden
          className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-[var(--vk-line)] text-[var(--vk-fg-faint)] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:border-[var(--vk-line-mid)] group-hover:text-[var(--vk-fg)] group-open:rotate-45 group-open:border-[var(--vk-accent)] group-open:text-[var(--vk-accent)]"
        >
          <Plus size={13} strokeWidth={1.5} />
        </span>
      </summary>

      <div className="pb-8">{children}</div>
    </details>
  );
}

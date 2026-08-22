import { ArrowUpRight } from "lucide-react";
import { githubUrl } from "@/lib/data/identity";
import { cx } from "@/components/ui";

/** lucide-react ships no brand marks, so the GitHub glyph lives here. */
function GithubMark({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      focusable="false"
    >
      <path d="M12 .5C5.73.5.67 5.57.67 11.85c0 5.02 3.24 9.28 7.74 10.78.57.11.78-.24.78-.55 0-.27-.01-1.17-.02-2.12-3.15.69-3.81-1.34-3.81-1.34-.52-1.31-1.26-1.66-1.26-1.66-1.03-.7.08-.69.08-.69 1.14.08 1.74 1.17 1.74 1.17 1.01 1.74 2.65 1.24 3.3.95.1-.73.4-1.24.72-1.52-2.52-.29-5.16-1.26-5.16-5.6 0-1.24.44-2.25 1.17-3.04-.12-.29-.51-1.44.11-3 0 0 .95-.31 3.12 1.16a10.8 10.8 0 0 1 5.68 0c2.17-1.47 3.12-1.16 3.12-1.16.62 1.56.23 2.71.11 3 .73.79 1.17 1.8 1.17 3.04 0 4.35-2.65 5.31-5.17 5.59.41.35.77 1.05.77 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.2.67.79.55a11.36 11.36 0 0 0 7.73-10.78C23.33 5.57 18.27.5 12 .5Z" />
    </svg>
  );
}

/**
 * The GitHub profile link. `panel` is the full bordered block used at the foot
 * of a page; `inline` is the compact button used inside a header row.
 */
export function GithubLink({
  variant = "panel",
  className,
}: {
  variant?: "panel" | "inline" | "header";
  className?: string;
}) {
  if (!githubUrl) return null;

  /* Header slot — present on every page, so it stays compact. */
  if (variant === "header") {
    return (
      <a
        href={githubUrl}
        target="_blank"
        rel="noreferrer noopener"
        data-cursor="OPEN CHANNEL"
        data-cursor-sub="GITHUB"
        aria-label="GitHub profile (opens in a new tab)"
        className={cx(
          "vk-mono inline-flex items-center gap-2 border border-[var(--vk-accent-soft)] bg-[var(--vk-accent-ghost)] px-2.5 py-1.5 text-[9px] tracking-[0.14em] text-[var(--vk-accent)] transition-colors hover:border-[var(--vk-accent)] hover:bg-[var(--vk-accent-faint)]",
          className,
        )}
      >
        <GithubMark size={12} />
        GITHUB
      </a>
    );
  }

  if (variant === "inline") {
    return (
      <a
        href={githubUrl}
        target="_blank"
        rel="noreferrer noopener"
        data-cursor="OPEN CHANNEL"
        data-cursor-sub="GITHUB"
        className={cx(
          "vk-mono inline-flex h-9 items-center gap-2.5 border border-[var(--vk-accent-soft)] bg-[var(--vk-accent-ghost)] px-4 text-[10px] tracking-[0.16em] text-[var(--vk-accent)] transition-colors hover:border-[var(--vk-accent)] hover:bg-[var(--vk-accent-faint)]",
          className,
        )}
      >
        <GithubMark size={13} />
        GITHUB
        <ArrowUpRight size={12} strokeWidth={1.5} />
      </a>
    );
  }

  return (
    <a
      href={githubUrl}
      target="_blank"
      rel="noreferrer noopener"
      data-cursor="OPEN CHANNEL"
      data-cursor-sub="GITHUB"
      className={cx(
        "group flex items-center justify-between gap-6 border border-[var(--vk-accent-soft)] bg-[var(--vk-accent-ghost)] p-6 transition-colors hover:border-[var(--vk-accent)] hover:bg-[var(--vk-accent-faint)] sm:p-7",
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-5 sm:gap-6">
        <span className="shrink-0 text-[var(--vk-accent)] drop-shadow-[0_0_10px_var(--vk-accent-faint)]">
          <GithubMark size={30} />
        </span>
        <div className="min-w-0">
          <span className="vk-mono text-[9px] tracking-[0.18em] text-[var(--vk-accent)]">
            SOURCE
          </span>
          <p className="mt-2 text-[clamp(1.1rem,2.4vw,1.4rem)] tracking-tight text-[var(--vk-fg)]">
            github.com/viditkhedekar
          </p>
          <p className="mt-1.5 text-[13px] text-[var(--vk-fg-dim)]">
            Repositories behind the builds listed here.
          </p>
        </div>
      </div>
      <span className="vk-mono shrink-0 text-[10px] tracking-[0.16em] text-[var(--vk-accent)] transition-transform duration-300 group-hover:translate-x-1">
        OPEN →
      </span>
    </a>
  );
}

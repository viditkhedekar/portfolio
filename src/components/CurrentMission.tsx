import Link from "next/link";
import { mission } from "@/lib/data/system";
import { getProject, slugOf } from "@/lib/data/projects";
import { Label, Slot, StatusTag, cx } from "@/components/ui";

/**
 * The persistent mission panel. Compact by default; `variant="feature"` is the
 * larger version used on the home dashboard.
 */
export function CurrentMission({
  variant = "compact",
  className,
}: {
  variant?: "compact" | "feature";
  className?: string;
}) {
  const project = mission.projectId ? getProject(mission.projectId) : undefined;
  const href = project ? `/projects/${slugOf(project)}` : undefined;

  const body = (
    <>
      <div className="flex items-center justify-between gap-4">
        <Label>CURRENT MISSION</Label>
        <StatusTag status={mission.status} pulse />
      </div>

      <div
        className={cx(
          "mt-4 tracking-tight text-[var(--vk-fg)]",
          variant === "feature" ? "text-[26px] leading-[1.1] sm:text-[32px]" : "text-[17px]",
        )}
      >
        <Slot>{mission.title}</Slot>
      </div>

      <dl className={cx("mt-5 grid gap-5", variant === "feature" ? "sm:grid-cols-2" : "")}>
        <div>
          <Label as="dt">OBJECTIVE</Label>
          <dd className="mt-2 text-[13px] leading-relaxed">
            <Slot className="text-[var(--vk-fg-dim)]">{mission.objective}</Slot>
          </dd>
        </div>
        <div>
          <Label as="dt">NEXT TARGET</Label>
          <dd className="mt-2 text-[13px] leading-relaxed">
            <Slot className="text-[var(--vk-fg-dim)]">{mission.nextTarget}</Slot>
          </dd>
        </div>
      </dl>

      {href && (
        <div className="vk-mono mt-5 text-[10px] tracking-[0.16em] text-[var(--vk-fg-faint)] transition-colors group-hover:text-[var(--vk-accent)]">
          OPEN FILE {mission.projectId} →
        </div>
      )}
    </>
  );

  const shell = cx(
    "group block border border-[var(--vk-line)] bg-[var(--vk-bg-panel)] p-5 transition-colors",
    href && "hover:border-[var(--vk-line-mid)]",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={shell} data-cursor="OPEN FILE" data-cursor-sub={mission.projectId ?? undefined}>
        {body}
      </Link>
    );
  }
  return <section className={shell}>{body}</section>;
}

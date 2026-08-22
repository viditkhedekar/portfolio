import Image from "next/image";
import type { ProjectMedia } from "@/lib/types";
import { Label, cx } from "@/components/ui";

/**
 * A framed "display" inside the VKOS interface. Media is labelled as system
 * output rather than as a screenshot. An empty `src` renders an explicit
 * awaiting-media state instead of a broken image.
 */
export function Display({
  media,
  className,
  priority = false,
}: {
  media: ProjectMedia;
  className?: string;
  priority?: boolean;
}) {
  const empty = !media.src;

  return (
    <figure
      className={cx(
        "border border-[var(--vk-line)] bg-[var(--vk-bg-panel)]",
        className,
      )}
    >
      <figcaption className="flex h-9 items-center justify-between border-b border-[var(--vk-line)] px-4">
        <Label>{media.label}</Label>
        {media.ref && (
          <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
            {media.ref}
          </span>
        )}
      </figcaption>

      <div className="vk-scanlines relative aspect-[16/9] w-full overflow-hidden bg-[var(--vk-bg)]">
        {empty ? (
          <div className="vk-grid-bg absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="vk-mono text-[10px] tracking-[0.2em] text-[var(--vk-fg-ghost)]">
              NO SIGNAL
            </span>
            <span className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)]/70">
              AWAITING MEDIA
            </span>
          </div>
        ) : media.kind === "video" ? (
          <video
            src={media.src}
            className="h-full w-full object-cover"
            muted
            loop
            playsInline
            autoPlay
            aria-label={media.alt}
          />
        ) : (
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            className="object-cover"
            priority={priority}
          />
        )}
      </div>
    </figure>
  );
}

import Link from "next/link";
import { apps } from "@/lib/data/apps";
import { projectStats } from "@/lib/data/projects";
import { subjects } from "@/lib/data/school";
import { certifications } from "@/lib/data/certifications";
import { channels } from "@/lib/data/identity";
import { HeadCloud } from "@/components/HeadCloud";
import { ItemMark } from "@/components/ItemMark";

/** Counts come from the data files so a box never contradicts its app. */
function appMeta(id: string): string {
  switch (id) {
    case "projects":
      return `${String(projectStats.indexed).padStart(2, "0")} FILES`;
    case "school":
      return `${String(subjects.length).padStart(2, "0")} SUBJECTS`;
    case "certifications":
      return `${String(certifications.length).padStart(2, "0")} RECORDS`;
    case "about":
      return "IDENTITY";
    case "contact":
      return `${String(channels.length).padStart(2, "0")} CHANNELS`;
    case "archive":
      return "COLD STORAGE";
    default:
      return "";
  }
}

/**
 * Where each app sits around the head.
 *
 * The order is the module rail read down the left side and then down the
 * right, which leaves CONTACT and ARCHIVE as the pair beneath: the two you
 * reach for last.
 */
const SEATS = ["a", "b", "c", "d", "e", "f"] as const;

function AppBox({ id, seat }: { id: string; seat: string }) {
  const app = apps.find((a) => a.id === id);
  if (!app) return null;

  return (
    <Link
      href={app.href}
      className={`vk-orbit-${seat} group relative flex items-center gap-4 border border-[var(--vk-accent-line)] bg-[var(--vk-accent-ghost)] px-4 py-4 transition-colors duration-200 [transition-timing-function:var(--vk-ease)] hover:border-[var(--vk-accent)] hover:bg-[var(--vk-accent-faint)] focus-visible:border-[var(--vk-accent)] focus-visible:bg-[var(--vk-accent-faint)] focus-visible:outline-none`}
    >
      <ItemMark itemKey={app.id} label={app.name} kind="app" size={36} className="shrink-0" />

      <span className="min-w-0">
        <span className="flex items-baseline gap-2">
          <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
            {app.index}
          </span>
          <span className="vk-mono text-[12px] tracking-[0.18em] text-[var(--vk-fg-dim)] transition-colors duration-200 group-hover:text-[var(--vk-accent)] group-focus-visible:text-[var(--vk-accent)]">
            {app.name}
          </span>
        </span>
        <span className="vk-mono mt-1 block truncate text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)]">
          {appMeta(app.id)}
        </span>
      </span>
    </Link>
  );
}

/**
 * The desktop: the scanned head with the six applications set around it.
 *
 * This replaces both the VK particle mark and the icon grid that used to sit
 * further down the page, so the head is the only way in and every app is one
 * click from the top of the page.
 */
export function HeadOrbit() {
  return (
    <nav aria-label="Applications" className="vk-orbit">
      <HeadCloud className="vk-orbit-head" />
      {apps.map((a, i) => (
        <AppBox key={a.id} id={a.id} seat={SEATS[i] ?? "f"} />
      ))}
    </nav>
  );
}

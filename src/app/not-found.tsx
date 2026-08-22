import Link from "next/link";
import { Container, Label } from "@/components/ui";

export default function NotFound() {
  return (
    <Container>
      <div className="flex min-h-[60vh] flex-col justify-center py-20">
        <Label>ERROR 404</Label>
        <h1 className="vk-display mt-6 text-[clamp(2.2rem,7vw,4.5rem)] text-[var(--vk-fg)]">
          FILE NOT FOUND
        </h1>
        <p className="vk-mono mt-6 max-w-[46ch] text-[11px] leading-[1.8] tracking-[0.14em] text-[var(--vk-fg-faint)]">
          THE REQUESTED PATH DOES NOT EXIST IN THIS SYSTEM.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/"
            className="vk-mono border border-[var(--vk-line)] px-5 py-3 text-[10px] tracking-[0.16em] text-[var(--vk-fg-dim)] transition-colors hover:border-[var(--vk-accent)] hover:text-[var(--vk-accent)]"
          >
            RETURN TO SYSTEM ROOT
          </Link>
          <Link
            href="/projects"
            className="vk-mono border border-[var(--vk-line)] px-5 py-3 text-[10px] tracking-[0.16em] text-[var(--vk-fg-dim)] transition-colors hover:border-[var(--vk-line-mid)] hover:text-[var(--vk-fg)]"
          >
            PROJECT INDEX
          </Link>
        </div>
      </div>
    </Container>
  );
}

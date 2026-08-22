"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { liveProjects, projectStats, projects, slugOf } from "@/lib/data/projects";
import { formatDot, modules, system, uptimeYears } from "@/lib/data/system";
import { githubUrl } from "@/lib/data/identity";

type LineKind = "input" | "out" | "dim" | "accent" | "error";
interface Line {
  kind: LineKind;
  text: string;
}

const PROMPT = "visitor@vkos:~$";

const HELP: Line[] = [
  { kind: "dim", text: "AVAILABLE COMMANDS" },
  { kind: "out", text: "" },
  { kind: "out", text: "  help              this list" },
  { kind: "out", text: "  projects          load the project index" },
  { kind: "out", text: "  open <id>         open a project file, e.g. open px-001" },
  { kind: "out", text: "  school            academic system" },
  { kind: "out", text: "  certifications    credential database" },
  { kind: "out", text: "  about             identity file" },
  { kind: "out", text: "  contact           communications system" },
  { kind: "out", text: "  archive           archived builds" },
  { kind: "out", text: "  github            open the github profile" },
  { kind: "out", text: "  status            system telemetry" },
  { kind: "out", text: "  clear             clear the buffer" },
  { kind: "out", text: "  exit              close the terminal" },
];

const BANNER: Line[] = [
  { kind: "accent", text: "VKOS/01 TERMINAL" },
  { kind: "dim", text: `${system.fullName}` },
  { kind: "out", text: "" },
  { kind: "dim", text: "Type 'help' for available commands." },
  { kind: "out", text: "" },
];

export function Terminal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [lines, setLines] = React.useState<Line[]>(BANNER);
  const [value, setValue] = React.useState("");
  const [history, setHistory] = React.useState<string[]>([]);
  const [cursor, setCursor] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, open]);

  const push = React.useCallback((next: Line[]) => {
    setLines((prev) => [...prev, ...next]);
  }, []);

  const go = React.useCallback(
    (href: string, label: string) => {
      push([
        { kind: "dim", text: `LOADING ${label}...` },
        { kind: "out", text: "" },
      ]);
      window.setTimeout(() => {
        router.push(href);
        onClose();
      }, 260);
    },
    [onClose, push, router],
  );

  const run = React.useCallback(
    (raw: string) => {
      const input = raw.trim();
      push([{ kind: "input", text: `${PROMPT} ${input}` }]);
      if (!input) return;

      setHistory((h) => [input, ...h]);
      setCursor(-1);

      const [cmd, ...args] = input.toLowerCase().split(/\s+/);
      const arg = args.join(" ");

      switch (cmd) {
        case "help":
        case "?":
          push([...HELP, { kind: "out", text: "" }]);
          return;

        case "clear":
          setLines([]);
          return;

        case "exit":
        case "close":
        case "quit":
          onClose();
          return;

        case "projects":
        case "ls": {
          push([
            { kind: "accent", text: "PROJECT INDEX LOADED" },
            { kind: "out", text: "" },
            ...liveProjects.map<Line>((p) => ({
              kind: "out",
              text: `  ${p.id}   ${p.name.padEnd(24)} ${p.status}`,
            })),
            { kind: "out", text: "" },
            { kind: "dim", text: `${projectStats.indexed} FILES / ${projectStats.archived} ARCHIVED` },
            { kind: "out", text: "" },
          ]);
          go("/projects", "PROJECT INDEX");
          return;
        }

        case "open": {
          const found = projects.find(
            (p) => p.id.toLowerCase() === arg || slugOf(p) === arg,
          );
          if (!found) {
            push([
              { kind: "error", text: `FILE NOT FOUND: ${arg || "(no id given)"}` },
              { kind: "dim", text: "Try 'projects' for the index." },
              { kind: "out", text: "" },
            ]);
            return;
          }
          push([
            { kind: "dim", text: "OPENING FILE..." },
            { kind: "accent", text: `${found.id}  ${found.name}` },
            { kind: "out", text: "" },
          ]);
          window.setTimeout(() => {
            router.push(`/projects/${slugOf(found)}`);
            onClose();
          }, 320);
          return;
        }

        case "school":
          go("/school", "ACADEMIC SYSTEM");
          return;
        case "certifications":
        case "certs":
          go("/certifications", "CREDENTIAL DATABASE");
          return;
        case "about":
          go("/about", "IDENTITY FILE");
          return;
        case "contact":
          go("/contact", "COMMUNICATIONS SYSTEM");
          return;
        case "archive":
          go("/archive", "ARCHIVE");
          return;
        case "github":
          push([
            { kind: "dim", text: "OPENING EXTERNAL CHANNEL..." },
            { kind: "accent", text: githubUrl },
            { kind: "out", text: "" },
          ]);
          window.open(githubUrl, "_blank", "noopener,noreferrer");
          return;
        case "home":
        case "cd":
          go("/", "SYSTEM ROOT");
          return;

        case "status":
          push([
            { kind: "accent", text: "SYSTEM STATUS" },
            { kind: "out", text: "" },
            { kind: "out", text: `  STATE          ${system.state}` },
            { kind: "out", text: `  PROJECTS       ${projectStats.indexed}` },
            { kind: "out", text: `  ACTIVE         ${projectStats.active}` },
            { kind: "out", text: `  BUILDING       ${projectStats.building}` },
            { kind: "out", text: `  R&D            ${projectStats.rd}` },
            { kind: "out", text: `  ARCHIVED       ${projectStats.archived}` },
            { kind: "out", text: `  MODULES        ${modules.length}` },
            { kind: "out", text: `  UPTIME         ${uptimeYears()} YEARS` },
            { kind: "out", text: `  LAST UPDATE    ${formatDot(system.lastUpdate)}` },
            { kind: "out", text: "" },
          ]);
          return;

        case "whoami":
          push([
            { kind: "accent", text: system.operator },
            { kind: "out", text: "" },
            { kind: "out", text: "  STUDENT" },
            { kind: "out", text: "  BUILDER" },
            { kind: "out", text: "  RESEARCHER" },
            { kind: "out", text: "" },
          ]);
          return;

        case "system":
          push([
            { kind: "accent", text: system.code },
            { kind: "dim", text: system.fullName },
            { kind: "out", text: "" },
            { kind: "out", text: "  KERNEL         VKOS 1.0.0" },
            { kind: "out", text: "  OPERATOR       " + system.operator },
            { kind: "out", text: `  AGE            ${system.age}` },
            { kind: "out", text: "  DISCIPLINES    " + system.disciplines.join(" / ") },
            { kind: "out", text: `  MODULES        ${modules.length}` },
            { kind: "out", text: `  BUILD          ${formatDot(system.lastUpdate)}` },
            { kind: "out", text: "" },
          ]);
          return;

        case "sudo": {
          if (arg === "access_future") {
            push([
              { kind: "error", text: "ACCESS DENIED" },
              { kind: "out", text: "" },
              { kind: "out", text: "FUTURE DATA DOES NOT EXIST." },
              { kind: "out", text: "" },
              { kind: "accent", text: "YET." },
              { kind: "out", text: "" },
            ]);
            return;
          }
          push([
            { kind: "error", text: "PERMISSION DENIED" },
            { kind: "dim", text: "visitor is not in the sudoers file." },
            { kind: "out", text: "" },
          ]);
          return;
        }

        case "uptime":
          push([
            { kind: "out", text: `${uptimeYears()} YEARS, 0 REBOOTS.` },
            { kind: "out", text: "" },
          ]);
          return;

        case "date":
          push([{ kind: "out", text: new Date().toUTCString() }, { kind: "out", text: "" }]);
          return;

        case "echo":
          push([{ kind: "out", text: args.join(" ") }, { kind: "out", text: "" }]);
          return;

        default:
          push([
            { kind: "error", text: `COMMAND NOT RECOGNISED: ${cmd}` },
            { kind: "dim", text: "Type 'help' for available commands." },
            { kind: "out", text: "" },
          ]);
      }
    },
    [go, onClose, push, router],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(value);
      setValue("");
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(cursor + 1, history.length - 1);
      if (next >= 0) {
        setCursor(next);
        setValue(history[next]);
      }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = cursor - 1;
      setCursor(next);
      setValue(next >= 0 ? history[next] : "");
      return;
    }
    if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const colorFor = (kind: LineKind) =>
    kind === "input"
      ? "text-[var(--vk-fg)]"
      : kind === "accent"
        ? "text-[var(--vk-accent)]"
        : kind === "dim"
          ? "text-[var(--vk-fg-faint)]"
          : kind === "error"
            ? "text-[#e8735c]"
            : "text-[var(--vk-fg-dim)]";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/55 px-4 pb-4 pt-[10vh] backdrop-blur-[2px] sm:px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="VKOS/01 terminal"
            initial={{ opacity: 0, y: -8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.995 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="vk-scanlines relative flex h-[min(560px,72vh)] w-full max-w-[720px] flex-col border border-[var(--vk-line-mid)] bg-[var(--vk-bg-panel)] shadow-[0_24px_80px_-12px_rgba(0,0,0,0.8)]"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-[var(--vk-line)] px-4">
              <span className="vk-mono text-[10px] tracking-[0.18em] text-[var(--vk-fg-dim)]">
                VKOS/01 TERMINAL
              </span>
              <button
                type="button"
                onClick={onClose}
                className="vk-mono text-[9px] tracking-[0.16em] text-[var(--vk-fg-ghost)] transition-colors hover:text-[var(--vk-fg-dim)]"
              >
                ESC
              </button>
            </div>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3"
              onClick={() => inputRef.current?.focus()}
            >
              {lines.map((l, i) => (
                <div
                  key={i}
                  className={`vk-mono whitespace-pre-wrap text-[12px] leading-[1.65] ${colorFor(l.kind)}`}
                >
                  {l.text || " "}
                </div>
              ))}

              <div className="flex items-center gap-2">
                <span className="vk-mono shrink-0 text-[12px] text-[var(--vk-accent)]">
                  {PROMPT}
                </span>
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Terminal input"
                  /* The native caret is the focus indicator here; a ring around
                     the full-width input reads as an error state. */
                  className="vk-mono min-w-0 flex-1 bg-transparent text-[12px] text-[var(--vk-fg)] caret-[var(--vk-accent)] outline-none focus-visible:outline-none"
                />
              </div>
            </div>

            <div className="flex h-8 shrink-0 items-center gap-4 border-t border-[var(--vk-line)] px-4">
              <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                ↑↓ HISTORY
              </span>
              <span className="vk-mono text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                HELP
              </span>
              <span className="vk-mono ml-auto text-[9px] tracking-[0.14em] text-[var(--vk-fg-ghost)]">
                SECONDARY NAVIGATION
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

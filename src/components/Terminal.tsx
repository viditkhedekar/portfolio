"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { projectStats, projects, slugOf } from "@/lib/data/projects";
import { formatDot, modules, system, uptimeYears } from "@/lib/data/system";
import { githubUrl } from "@/lib/data/identity";
import { apps } from "@/lib/data/apps";
import { getWindows } from "@/lib/apps-session";
import { ROOT, fileAt, list, pwdOf, resolve, treeLines } from "@/lib/data/fs";
import { channels } from "@/lib/data/identity";

type LineKind = "input" | "out" | "dim" | "accent" | "error" | "gems";

/** The collapsed list under `help`. Half real system commands, half jokes. */
const GEMS: Array<{ cmd: string; note: string }> = [
  { cmd: "whoami", note: "print the operator record" },
  { cmd: "uname -a", note: "kernel and build info" },
  { cmd: "ps", note: "running processes" },
  { cmd: "top", note: "processes by load" },
  { cmd: "df", note: "disk usage" },
  { cmd: "env", note: "environment variables" },
  { cmd: "dmesg", note: "kernel log" },
  { cmd: "uptime", note: "years since first boot" },
  { cmd: "date", note: "current system time" },
  { cmd: "echo <text>", note: "repeat something back" },
  { cmd: "kill <pid>", note: "end a process" },
  { cmd: "github", note: "open the github profile" },
  { cmd: "sudo access_future", note: "try it" },
  { cmd: "coffee", note: "brew one" },
  { cmd: "matrix", note: "look busy" },
  { cmd: "42", note: "the answer" },
  { cmd: "hello", note: "say hi" },
];
interface Line {
  kind: LineKind;
  text: string;
}

/** The prompt reflects the current route, so it doubles as a location readout. */
function promptFor(pathname: string): string {
  return `visitor@vkos:${pwdOf(pathname)}$`;
}

/** Soft-wrap dossier prose to the transcript width. */
function wrap(text: string, width = 58): string[] {
  const out: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    if (line && line.length + word.length + 1 > width) {
      out.push(line);
      line = word;
    } else {
      line = line ? `${line} ${word}` : word;
    }
  }
  if (line) out.push(line);
  return out;
}

const HELP: Line[] = [
  { kind: "dim", text: "AVAILABLE COMMANDS" },
  { kind: "out", text: "" },
  { kind: "out", text: "  ls [path]         list a directory" },
  { kind: "out", text: "  cd <path>         change directory" },
  { kind: "out", text: "  pwd               print working directory" },
  { kind: "out", text: "  tree              print the whole filesystem" },
  { kind: "out", text: "  cat <file>        print a project dossier" },
  { kind: "out", text: "  stat <file>       file metadata" },
  { kind: "out", text: "  open <file>       open a project file" },
  { kind: "out", text: "  find <term>       search files by name, tech or status" },
  { kind: "out", text: "  man <command>     manual page for a command" },
  { kind: "out", text: "  history           previous commands" },
  { kind: "out", text: "  status            system telemetry" },
  { kind: "out", text: "  help              this list" },
  { kind: "out", text: "  clear             clear the buffer" },
  { kind: "out", text: "  exit              close the terminal" },
  { kind: "out", text: "" },
  { kind: "dim", text: "Paths work like a shell: cd projects, cd .., cd ~, ls archive" },
  { kind: "out", text: "" },
  { kind: "gems", text: "" },
];

/** Manual pages for `man`. */
const MAN: Record<string, string[]> = {
  ls: ["ls [path]", "", "List the contents of a directory.", "With no path, lists the current one."],
  cd: [
    "cd <path>",
    "",
    "Change directory. This navigates the interface, so the",
    "route and the prompt never disagree.",
    "",
    "  cd projects      a directory",
    "  cd projects/px-001   a file",
    "  cd ..            up one level",
    "  cd ~             back to the desktop",
  ],
  pwd: ["pwd", "", "Print the working directory, read from the current route."],
  tree: ["tree", "", "Print the whole filesystem as a tree."],
  cat: ["cat <file>", "", "Print a project's dossier as plain text.", "", "  cat px-001"],
  stat: ["stat <file>", "", "Print a project file's metadata: status, year, stack, links."],
  open: ["open <file>", "", "Open a project file in the interface.", "Also accepts 'open github'."],
  find: [
    "find <term>",
    "",
    "Search project files by id, name, category, status or",
    "technology. Case-insensitive.",
    "",
    "  find python",
  ],
  man: ["man <command>", "", "Print the manual page for a command."],
  history: ["history", "", "List the commands entered this session."],
  status: ["status", "", "Print system telemetry: files, modules, uptime."],
  help: ["help", "", "List the available commands."],
  clear: ["clear", "", "Clear the buffer. Ctrl+L does the same."],
  exit: ["exit", "", "Close the terminal. Escape does the same."],
};

const BANNER: Line[] = [
  { kind: "accent", text: "VKOS/01 TERMINAL" },
  { kind: "dim", text: `${system.fullName}` },
  { kind: "out", text: "" },
  { kind: "dim", text: "Type 'help' for available commands, or 'ls' to look around." },
  { kind: "dim", text: "Click anywhere outside to browse normally." },
  { kind: "out", text: "" },
];

/**
 * The collapsed extras under `help`. Built on <details> so it opens without any
 * state of its own and keeps working with a keyboard.
 */
function GemsBlock() {
  return (
    <details className="group my-1">
      <summary
        className="vk-mono flex cursor-pointer list-none items-center gap-2 text-[12px] leading-[1.65] text-[var(--vk-fg-faint)] transition-colors hover:text-[var(--vk-fg-dim)] [&::-webkit-details-marker]:hidden"
        /* The transcript focuses the input on click; this must not steal it back. */
        onClick={(e) => e.stopPropagation()}
      >
        <span aria-hidden className="inline-block transition-transform group-open:rotate-90">
          ▸
        </span>
        And some hidden gems...
      </summary>

      <div className="mt-1.5 border-l border-[var(--vk-line)] pl-4">
        {GEMS.map((g) => (
          <div
            key={g.cmd}
            className="vk-mono whitespace-pre-wrap text-[12px] leading-[1.65] text-[var(--vk-fg-dim)]"
          >
            {`  ${g.cmd.padEnd(20)}${g.note}`}
          </div>
        ))}
      </div>
    </details>
  );
}

export function Terminal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
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
      push([{ kind: "input", text: `${promptFor(pathname)} ${input}` }]);
      if (!input) return;

      setHistory((h) => [input, ...h]);
      setCursor(-1);

      const [cmdRaw, ...args] = input.split(/\s+/);
      const cmd = cmdRaw.toLowerCase();
      const arg = args.join(" ");
      const here = pwdOf(pathname);

      /** A path argument that does not resolve. */
      const noSuchPath = (what: string) =>
        push([
          { kind: "error", text: `${cmd}: ${what}: No such file or directory` },
          { kind: "out", text: "" },
        ]);

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

        case "pwd":
          push([{ kind: "out", text: here }, { kind: "out", text: "" }]);
          return;

        case "ls":
        case "dir": {
          const target = resolve(pathname, arg);
          if (!target) {
            noSuchPath(arg);
            return;
          }
          const entries = list(target.path);
          if (!entries) {
            noSuchPath(arg);
            return;
          }
          push([
            ...entries.map<Line>((n) => ({
              kind: "out",
              text: `  ${(n.name + (n.kind === "dir" ? "/" : "")).padEnd(20)}${n.note}`,
            })),
            { kind: "out", text: "" },
            { kind: "dim", text: `${entries.length} ENTRIES IN ${target.path}` },
            { kind: "out", text: "" },
          ]);
          return;
        }

        case "cd": {
          /* `cd` with no argument goes home, as it does in a real shell. */
          const target = resolve(pathname, arg || "~");
          if (!target) {
            push([
              { kind: "error", text: `cd: ${arg}: No such file or directory` },
              { kind: "dim", text: "Try 'ls' to see what is here." },
              { kind: "out", text: "" },
            ]);
            return;
          }
          go(target.href, target.path);
          return;
        }

        case "tree":
          push([
            ...treeLines().map<Line>((t) => ({ kind: "out", text: t })),
            { kind: "out", text: "" },
          ]);
          return;

        case "cat": {
          if (!arg) {
            push([
              { kind: "error", text: "cat: missing operand" },
              { kind: "out", text: "" },
            ]);
            return;
          }
          const found = fileAt(pathname, arg);
          if (!found) {
            noSuchPath(arg);
            return;
          }
          const sections: Array<[string, string | undefined]> = [
            ["OBJECTIVE", found.objective],
            ["SYSTEM", found.system],
            ["IMPLEMENTATION", found.implementation],
            ["RESULT", found.result],
            ["PROBLEMS", found.problems],
            ["CURRENT STATE", found.currentState],
            ["NEXT ITERATION", found.nextIteration],
          ];
          const body: Line[] = [];
          sections.forEach(([title, text], i) => {
            if (!text) return;
            body.push({ kind: "accent", text: `${String(i + 1).padStart(2, "0")} ${title}` });
            wrap(text).forEach((w) => body.push({ kind: "out", text: `   ${w}` }));
            body.push({ kind: "out", text: "" });
          });
          push([
            { kind: "accent", text: `${found.id}  ${found.name}` },
            { kind: "dim", text: found.summary },
            { kind: "out", text: "" },
            ...body,
          ]);
          return;
        }

        case "stat": {
          const found = fileAt(pathname, arg);
          if (!found) {
            noSuchPath(arg);
            return;
          }
          push([
            { kind: "accent", text: `File: ${slugOf(found)}` },
            { kind: "out", text: "" },
            { kind: "out", text: `  ID           ${found.id}` },
            { kind: "out", text: `  NAME         ${found.name}` },
            { kind: "out", text: `  CATEGORY     ${found.category}` },
            { kind: "out", text: `  STATUS       ${found.status}` },
            { kind: "out", text: `  YEAR         ${found.year}` },
            { kind: "out", text: `  STACK        ${found.technologies.join(", ")}` },
            ...(found.links ?? []).map<Line>((l) => ({
              kind: "out",
              text: `  LINK         ${l.href || l.label}`,
            })),
            { kind: "out", text: "" },
          ]);
          return;
        }

        case "find":
        case "grep": {
          const term = arg.toLowerCase();
          if (!term) {
            push([
              { kind: "error", text: `${cmd}: missing search term` },
              { kind: "out", text: "" },
            ]);
            return;
          }
          const hits = projects.filter((p) =>
            [p.id, p.name, p.category, p.status, ...p.technologies]
              .join(" ")
              .toLowerCase()
              .includes(term),
          );
          if (hits.length === 0) {
            push([
              { kind: "dim", text: `No files match "${arg}".` },
              { kind: "out", text: "" },
            ]);
            return;
          }
          push([
            ...hits.map<Line>((p) => ({
              kind: "out",
              text:
                `  ${(p.archived ? "archive/" : "projects/") + slugOf(p)}`.padEnd(28) + p.name,
            })),
            { kind: "out", text: "" },
            { kind: "dim", text: `${hits.length} MATCH${hits.length === 1 ? "" : "ES"}` },
            { kind: "out", text: "" },
          ]);
          return;
        }

        case "man": {
          const page = MAN[arg.toLowerCase()];
          if (!page) {
            push([
              { kind: "error", text: `No manual entry for ${arg || "(nothing)"}` },
              { kind: "out", text: "" },
            ]);
            return;
          }
          push([
            { kind: "accent", text: page[0] },
            ...page.slice(1).map<Line>((l) => ({ kind: "out", text: l })),
            { kind: "out", text: "" },
          ]);
          return;
        }

        case "history":
          push([
            ...[...history].reverse().map<Line>((h, i) => ({
              kind: "out",
              text: `  ${String(i + 1).padStart(3, " ")}  ${h}`,
            })),
            { kind: "out", text: "" },
          ]);
          return;

        case "open": {
          if (arg === "github") {
            push([
              { kind: "dim", text: "OPENING EXTERNAL CHANNEL..." },
              { kind: "accent", text: githubUrl },
              { kind: "out", text: "" },
            ]);
            window.open(githubUrl, "_blank", "noopener,noreferrer");
            return;
          }
          const found = fileAt(pathname, arg);
          if (!found) {
            push([
              { kind: "error", text: `open: ${arg || "(no file given)"}: No such file` },
              { kind: "dim", text: "Try 'ls projects' for the index." },
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

        case "github":
          push([
            { kind: "dim", text: "OPENING EXTERNAL CHANNEL..." },
            { kind: "accent", text: githubUrl },
            { kind: "out", text: "" },
          ]);
          window.open(githubUrl, "_blank", "noopener,noreferrer");
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
            { kind: "out", text: `  ROLE           ${system.role}` },
            { kind: "out", text: `  AGE            ${system.age}` },
            { kind: "out", text: `  LOCATION       ${system.location}` },
            { kind: "out", text: `  DISCIPLINES    ${system.disciplines.join(" / ")}` },
            { kind: "out", text: "" },
          ]);
          return;

        case "uname":
          push([
            {
              kind: "out",
              text:
                arg === "-a"
                  ? `VKOS 1.0.0 vkos-shell ${formatDot(system.lastUpdate)} x86_64 ${system.operator}`
                  : "VKOS",
            },
            { kind: "out", text: "" },
          ]);
          return;

        case "env":
          push([
            { kind: "out", text: `OPERATOR=${system.operator}` },
            { kind: "out", text: "SHELL=/bin/vksh" },
            { kind: "out", text: "USER=visitor" },
            { kind: "out", text: "HOME=~" },
            { kind: "out", text: `PWD=${here}` },
            { kind: "out", text: `EMAIL=${channels.find((c) => c.id === "email")?.handle ?? ""}` },
            { kind: "out", text: "TERM=vkos-256color" },
            { kind: "out", text: "" },
          ]);
          return;

        case "df":
          push([
            { kind: "out", text: "FILESYSTEM      SIZE  USED  AVAIL  USE%  MOUNTED ON" },
            {
              kind: "out",
              text: `/dev/vkos1      ${String(projects.length).padStart(3, " ")}f  ${String(
                projectStats.indexed,
              ).padStart(3, " ")}f   ${String(projectStats.archived).padStart(3, " ")}f   ${String(
                Math.round((projectStats.indexed / projects.length) * 100),
              ).padStart(3, " ")}%  ~/projects`,
            },
            { kind: "out", text: "ambition          ∞     ∞      0  100%  /" },
            { kind: "out", text: "" },
          ]);
          return;

        case "ps": {
          const windows = getWindows();
          const running = windows.open
            .map((id) => apps.find((a) => a.id === id))
            .filter((a): a is (typeof apps)[number] => Boolean(a));
          push([
            { kind: "accent", text: "PID   PROCESS" },
            { kind: "out", text: "" },
            { kind: "out", text: "  1   vkos-shell" },
            { kind: "out", text: "  2   terminal" },
            ...running.map<Line>((a, i) => ({
              kind: "out",
              text: `${String(i + 3).padStart(3, " ")}   ${a.file.toLowerCase()}${
                windows.minimised.includes(a.id) ? "  (minimised)" : ""
              }`,
            })),
            { kind: "out", text: "" },
            { kind: "dim", text: `${running.length + 2} PROCESSES` },
            { kind: "out", text: "" },
          ]);
          return;
        }

        case "top":
          push([
            { kind: "accent", text: "PID   PROCESS        CPU%   STATE" },
            { kind: "out", text: "" },
            { kind: "out", text: "  1   vkos-shell      0.4   sleeping" },
            { kind: "out", text: "  2   terminal        1.1   running" },
            { kind: "out", text: "  3   curiosity      98.2   running" },
            { kind: "out", text: "  4   sleep           0.0   blocked" },
            { kind: "out", text: "" },
          ]);
          return;

        case "kill":
          push([
            {
              kind: "error",
              text: arg ? `kill: (${arg}) - Operation not permitted` : "kill: usage: kill <pid>",
            },
            { kind: "dim", text: "Everything in here is load-bearing." },
            { kind: "out", text: "" },
          ]);
          return;

        case "dmesg":
          push([
            { kind: "dim", text: "[    0.000000] vkos: kernel 1.0.0 booting" },
            { kind: "dim", text: "[    0.120000] core: online" },
            { kind: "dim", text: "[    0.270000] database: mounted read-only" },
            { kind: "dim", text: `[    0.460000] index: ${projectStats.indexed} files registered` },
            { kind: "dim", text: `[    0.590000] modules: ${modules.length} loaded` },
            { kind: "dim", text: "[    0.760000] network: link up" },
            { kind: "dim", text: "[    0.930000] operator: authenticated" },
            { kind: "dim", text: "[    1.000000] vkos: all systems operational" },
            { kind: "out", text: "" },
          ]);
          return;

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

        case "sudo": {
          if (arg.startsWith("rm -rf")) {
            push([
              { kind: "error", text: "NICE TRY, VISITOR." },
              { kind: "dim", text: "This filesystem is load-bearing." },
              { kind: "out", text: "" },
            ]);
            return;
          }
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

        case "coffee":
          push([
            { kind: "dim", text: "BREWING..." },
            { kind: "out", text: "" },
            { kind: "error", text: "ERR: NO HARDWARE" },
            { kind: "dim", text: "This system has never been fitted with a kettle." },
            { kind: "out", text: "" },
          ]);
          return;

        case "matrix": {
          const glyphs = "01<>[]{}/\\|=+*-#@$%&";
          const rows = Array.from({ length: 6 }, () =>
            Array.from(
              { length: 46 },
              () => glyphs[Math.floor(Math.random() * glyphs.length)],
            ).join(""),
          );
          push([
            ...rows.map<Line>((r) => ({ kind: "accent", text: r })),
            { kind: "out", text: "" },
            { kind: "dim", text: "There is no spoon. There is a portfolio." },
            { kind: "out", text: "" },
          ]);
          return;
        }

        case "42":
          push([
            { kind: "accent", text: "42" },
            { kind: "dim", text: "Answer located. Question still outstanding." },
            { kind: "out", text: "" },
          ]);
          return;

        case "hello":
        case "hi":
          push([
            { kind: "out", text: "hello, visitor." },
            { kind: "dim", text: "You are the only process with a pulse in here." },
            { kind: "out", text: "" },
          ]);
          return;

        default: {
          /* The old bare-word shortcuts are gone; point them at the shell. */
          const asPath = ROOT.find((n) => n.name === cmd);
          push([
            { kind: "error", text: `COMMAND NOT RECOGNISED: ${cmd}` },
            {
              kind: "dim",
              text: asPath ? `Did you mean 'cd ${cmd}'?` : "Type 'help' for available commands.",
            },
            { kind: "out", text: "" },
          ]);
        }
      }
    },
    [go, history, onClose, pathname, push, router],
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
              {lines.map((l, i) =>
                l.kind === "gems" ? (
                  <GemsBlock key={i} />
                ) : (
                  <div
                    key={i}
                    className={`vk-mono whitespace-pre-wrap text-[12px] leading-[1.65] ${colorFor(l.kind)}`}
                  >
                    {l.text || " "}
                  </div>
                ),
              )}

              <div className="flex items-center gap-2">
                <span className="vk-mono shrink-0 text-[12px] text-[var(--vk-accent)]">
                  {promptFor(pathname)}
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

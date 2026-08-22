# VKOS/01

`VIDIT KHEDEKAR OPERATING SYSTEM / 01` — a personal portfolio built as a
fictional operating system: boot sequence, module index, project file explorer
and an interactive terminal.

Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Lucide.

```bash
npm run dev
```

Then open http://localhost:3000.

## Where the content lives

All content sits in `src/lib/data/`. Nothing is hard-coded into components, and
**every string wrapped in `[ SQUARE BRACKETS ]` is an unfilled placeholder** —
it renders in a dimmed colour so an unfinished field is obvious on screen and
never reads as a real claim.

| File | What it holds |
| --- | --- |
| `system.ts` | Name, age, disciplines, current system state, module list, the CURRENT MISSION panel, boot copy |
| `projects.ts` | The project index and archive. Everything else derives from this array |
| `school.ts` | Level, predicted grades, subjects, and the collapsible achievement sections |
| `certifications.ts` | Credential records grouped by provider, and evidence file paths |
| `identity.ts` | The About statement blocks, the contact channels, and the GitHub URL |

### Adding a project

Copy a block in `src/lib/data/projects.ts`, give it the next free `PX-0NN` id,
and fill in the brackets. That single edit updates the project index, the file
counts in the header and footer telemetry, the terminal's `projects` and `open`
commands, and the static routes.

Set `archived: true` to move an entry into `/archive` instead.

`tagline` is the short hook — it shows in the index row and as the large lead
line on the file page. `summary` is the descriptive paragraph beneath it.

The status filters and the stat tiles on `/projects` are built from the
statuses actually present, so a status nothing uses never appears as an empty
control.

### Adding media

Drop files into `public/` and point a project's `media[].src` at them. Each
frame is labelled as system output rather than as a screenshot:

```ts
media: [
  { src: "/px-001/output.png", label: "SYSTEM OUTPUT", ref: "PX-001 / BUILD 042", alt: "…" },
]
```

An empty `src` renders a deliberate `NO SIGNAL / AWAITING MEDIA` state, so the
layout is never broken by a missing file.

### Certification evidence

Put the PDF or image in `public/certifications/` and set `evidence` plus
`evidenceKind` on the record. The document view embeds it.

### Achievement sections

`achievementSections` in `school.ts` drives the two collapsible blocks on
`/school`. Each section holds one or more labelled `groups` of entries; both
sections render closed. They are built on `<details>`/`<summary>`, so they open
without JavaScript and the module stays a server component.

## Things worth knowing

- **Counts are derived, never typed.** `PROJECTS`, `ACTIVE`, `ARCHIVED` and the
  file totals all come from the projects array. `UPTIME` comes from `system.age`,
  or is calculated from `system.birthDate` if you set one.
- **Predicted grades are labelled as such.** `/school` prints
  `INTERNALLY PREDICTED — NOT OFFICIAL` beneath them. Keep that caveat.
- **Contact channels are opt-in.** A channel with an empty `href` renders as
  `UNCONFIGURED` rather than as a broken link, so nothing is published until you
  fill it in.
- **The terminal is secondary navigation.** `⌘K` / `Ctrl+K` opens it; every
  destination is also reachable through normal links and keyboard focus.
- **Reduced motion is respected.** `prefers-reduced-motion` skips the boot
  sequence, the file-opening transition and the custom cursor.

## Commands

```bash
npm run dev      # dev server
npm run build    # production build
npm run lint     # eslint
npx tsc --noEmit # typecheck
```

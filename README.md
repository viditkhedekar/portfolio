# VKOS/01

`VIDIT KHEDEKAR OPERATING SYSTEM / 01` — a personal portfolio built as a
fictional operating system: boot sequence, a desktop of application icons,
window chrome, a running-apps dock, a project file explorer and an interactive
terminal.

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
| `apps.ts` | The application registry. Derived from `system.ts`, plus ARCHIVE |

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

Drop files into `public/projects/` and point a project's `media[].src` at them.
Each frame is labelled as system output rather than as a screenshot. Frames crop
to fill; selecting one opens the capture uncropped at full size:

```ts
media: [
  { src: "/projects/px-001-landing.png", label: "LANDING", ref: "PX-001 / VIEW 01", alt: "…" },
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

## The application metaphor

`/` is the **desktop**: the typed hero, a grid of application icons and a recent
files strip. It has no window chrome.

Every other route is an **application**, resolved by `appForPath()` in
`src/lib/data/apps.ts`:

- **Window chrome** (`AppWindow`) wraps the page in a title bar carrying
  `NAME.app` and the shell path. The three controls are real: **close** drops
  the app from the dock, **minimise** leaves it there dimmed and marked `MIN`,
  and **maximise** widens the window. Each is a labelled button, so the chrome
  is operable by keyboard and announced properly.
- **A launch transition** (`AppLauncher`) plays a short `LAUNCHING NAME.app`
  splash on client-side navigation into an app. It deliberately does not run on
  a cold load, where the boot sequence already covers the same moment.
- **The dock** (`Taskbar`) lists apps opened this session, backed by the window
  store in `src/lib/apps-session.ts` (open / minimised / maximised). Clicking a
  minimised chip restores it. The terminal has its own chip, and a quiet status
  line rotates every 45s. Desktop only, and unresolved paths never join it — a
  404 renders as `SYSTEM.app` but is not "running".
- **The terminal opens itself once per session** on the desktop, just after
  boot, like a login shell (`TerminalGreeter` + `src/lib/greeting.ts`). Click
  anywhere outside to dismiss it and browse normally; it will not reopen until
  a new session.

Adding a module to `system.ts` therefore installs an app: icon, window, launch
splash and dock entry all follow.

## The world on the landing page

`/` is a camera flight through a five-room facility. It is **not** rendered in
the browser. The rooms are built with three.js in `scripts/render/`, the flight
is rendered offline to a numbered sequence of stills in `public/seq/`, and the
landing page plays that sequence back on a 2D canvas with the scroll position
choosing the frame.

This is deliberate, and it is the reason the world looks the way it does. A
frame that has to be drawn sixty times a second can afford thin lines in a
mostly black room; a frame rendered once, slowly, can afford lit surfaces, real
shadows, bloom and a hundred and sixty metres of hall. Three is a build-time
dependency only. Nothing 3D ships to the browser.

### Regenerating the flight

```bash
node scripts/render/server.mjs        # harness on :4321
```

Open <http://localhost:4321> and, in the console:

```js
VK.resize(1440, 810);
VK.manifest(180);                // writes public/seq/manifest.json
VK.sequence(180, "seq", 0.86);   // writes public/seq/0000.webp …
VK.still(0.3, "test.webp");      // one frame, into public/render-tests/
```

Always re-export the manifest when the geometry moves, or the HTML will be
laid onto fittings that are no longer there.

The tab has to stay visible: a browser stops running animation frames in a
background tab, so a hidden one renders nothing. The last full run was 180
frames at about 4.7 MB.

### The words on the walls

The rooms are photographed offline. The text in them is not. Every console,
nameplate and wall panel is registered in the scene as a rectangle
(`scripts/render/surfaces.mjs`), exported into `public/seq/manifest.json`
alongside the camera, and filled with real HTML at runtime by
`src/components/world/WorldSurfaces.tsx`, transformed onto the fitting in
perspective.

That means the walls are still driven by `src/lib/data/`: edit a grade and the
wall it is written on changes, with no re-render. It also means the text is
crisp at any size, can be focused and read aloud, and can be clicked.

- **What each surface says** is `src/components/world/surfaceContent.tsx`,
  keyed by the id the renderer gave the rectangle. Adding a display is a
  matter of registering it in the scene and adding a case there.
- **Clicking one** opens the file in place over the world
  (`WorldOverlay.tsx`), with a link through to the module page.
- **Type is sized in the surface's own space**, a hundred pixels to the metre.
  A panel eleven metres wide is an eleven hundred pixel box, which is why the
  font sizes in the wall CSS look enormous next to the rest of the interface.

```bash
npm run check:surfaces
```

This is the check worth running after touching any of it. Placement fails
invisibly: if the projection or the homography is slightly wrong, a single
frame still looks right and the text slides off its bezel as the camera moves.
The check compares the runtime's projection against three's own answer, and
round-trips the CSS transform against the quad it was built from. Re-record
the fixture in it with `VK.probe(...)` if the camera path or the PX-002
station moves.

### Editing the world

| File | What it is |
| --- | --- |
| `scripts/render/path.mjs` | The camera flight, and the fog and exposure per room |
| `scripts/render/kit.mjs` | Shared materials, the light pool, haze |
| `scripts/render/facility.mjs` | 01, the project hall and its five stations |
| `scripts/render/observatory.mjs` | 02, the drum and the chrome armillary |
| `scripts/render/vault.mjs` | 03, the record wall |
| `scripts/render/chamber.mjs` | 04, the identity chamber |
| `scripts/render/comms.mjs` | 05, the array |
| `scripts/render/links.mjs` | Corridors and thresholds between rooms |
| `scripts/render/textures.mjs` | Procedural plating and decking |
| `scripts/render/surfaces.mjs` | The display surface registry and their fittings |

Two counts in the render mirror the real data and have to be kept in step by
hand, because the renderer is a plain script and does not import the app's
TypeScript: the lit drawers in `vault.mjs` (`FILLED`) and the channel consoles
in `comms.mjs` (`CHANNELS`).

The scroll fractions in `scripts/render/path.mjs` and the zone ranges in
`src/lib/world.ts` describe the same journey from two ends. If you retime one,
retime the other, or a panel will be on screen while the wrong room is on
camera.

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
  destination is also reachable through normal links and keyboard focus. `help`
  lists the documented commands and hides the rest behind a collapsed
  "And some hidden gems..." block.
- **The hero is typed, but the text is real.** `HeroType` keeps the full string
  in the DOM as visually-hidden text and animates an `aria-hidden` copy on top,
  so the heading survives without JavaScript and for screen readers.
- **Reduced motion is respected.** `prefers-reduced-motion` skips the boot
  sequence, the launch splash, the hero typing, the file-opening transition,
  the custom cursor and the chrome shimmer on the wordmark.
- **The landing page works without the film.** The frames load progressively
  and out of order, sparsely first, so the journey is scrubbable early. If none
  of them arrive, every zone is still a complete block of HTML.
- **The head is the only live thing in the picture.** It is a 2D canvas point
  cloud, mounted in the shell so it survives navigation, and it tracks the
  cursor on every route.
- **Frames are cross-faded.** Scroll lands between frames far more often than
  on one, so the two either side are drawn and blended. It is much cheaper
  than shipping more frames, and it is what stops a hundred and eighty stills
  reading as a hundred and eighty stills.
- **There is a low-RAM landing page.** Offered on the opening screen, honoured
  automatically for anyone whose browser asks for Save-Data, and remembered
  afterwards. It is the desktop this site had before the world was built, and
  it downloads none of the film. `src/lib/mode-gate.ts` resolves it before
  first paint.

## Commands

```bash
npm run dev             # dev server
npm run build           # production build
npm run lint            # eslint
npm run check:surfaces  # wall HTML lands on its fitting
npx tsc --noEmit        # typecheck
```

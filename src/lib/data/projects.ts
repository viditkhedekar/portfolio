import type { Project } from "@/lib/types";

/**
 * VKOS/01 — PROJECT INDEX.
 *
 * PX-001..PX-005 are real: names, taglines, stacks, dossiers, screenshots and
 * links are all Vidit's own. Anything still in [ SQUARE BRACKETS ] is an
 * unfilled slot and renders dimmed on screen until it is written.
 *
 * Do not invent results or metrics for these. Where a dossier section states an
 * outcome, it is one Vidit has confirmed.
 *
 * Screenshots live in /public/projects/. Each project carries two views; both
 * are cropped in the frame and open full-size in the viewer.
 *
 * PX-006..PX-009 are archive placeholders — replace or delete them.
 *
 * To add a project: copy a block, give it the next free PX-0NN id, and fill in
 * the brackets. The index page, archive, telemetry counts, system map and
 * terminal all read from this array — nothing else needs touching.
 *
 * Valid statuses: ACTIVE | BUILDING | R&D | ARCHIVED.
 */

export const projects: Project[] = [
  {
    id: "PX-001",
    name: "GrowthKit AI",
    tagline: "Turn an idea into something people actually want.",
    category: "AI / FOUNDER TOOLS",
    status: "ACTIVE",
    year: "2026",
    summary:
      "GrowthKit AI helps founders work through ideas, understand their market and build a clearer path to growth, with AI woven into the process.",
    technologies: ["Next.js", "Supabase", "TypeScript"],
    domains: ["ai", "software"],
    objective:
      "Help founders turn an early-stage idea into a structured growth plan without having to figure out the entire process themselves.",
    system:
      "A Next.js application combines Supabase authentication, a guided onboarding system, AI workflows and user entitlements to create a personalised growth experience.",
    implementation:
      "Built the onboarding flow around adaptive questions, progressively refining the user's context before feeding it into the relevant AI workflows.",
    result:
      "Created a working AI growth platform with a structured multi-step onboarding experience and gated product access.",
    problems:
      "The challenge was preventing the AI experience from becoming generic, requiring increasingly specific user context and tighter workflow design.",
    currentState:
      "Functional product with the core onboarding, authentication and AI experience in place.",
    nextIteration:
      "Make the generated advice more specific and useful by improving context collection and the underlying growth workflows.",
    media: [
      {
        src: "/projects/px-001-landing.png",
        label: "LANDING",
        ref: "PX-001 / VIEW 01",
        alt: "GrowthKit AI landing page, headlined \"Markets, dissected, not guessed\", with a specimen panel listing market map, competitor teardown, gap analysis and a 90-day action plan.",
      },
      {
        src: "/projects/px-001-deliverable.png",
        label: "DELIVERABLE",
        ref: "PX-001 / VIEW 02",
        alt: "A generated deliverable showing a market map plotting competitors by price against workflow depth, with an identified gap zone and the start of a competitor teardown table.",
      },
    ],
    links: [{ label: "GROWTHKITAI.COM", href: "https://growthkitai.com" }],
  },
  {
    id: "PX-002",
    name: "PhysIQal Performance",
    tagline: "See how you actually move.",
    category: "COMPUTER VISION / SPORTS",
    status: "ACTIVE",
    year: "2026",
    summary:
      "Physiqal uses computer vision to analyse exercise form, track reps and spot subtle technique issues. It turns a normal workout video into detailed feedback on how you move and where you can improve.",
    technologies: ["Next.js", "FastAPI", "Python", "TypeScript"],
    domains: ["sports", "ai"],
    objective:
      "Analyse exercise technique through video, tracking reps and identifying biomechanical faults that are difficult to spot manually.",
    system:
      "A Next.js frontend sends workout video to a FastAPI backend, where pose estimation extracts body landmarks that are analysed to score reps and technique.",
    implementation:
      "Built the video pipeline, pose-estimation system and exercise-specific analysis, then iterated heavily on inference speed and deployment performance.",
    result:
      "Successfully detects reps and produces technique scores alongside specific feedback on issues such as shoulder movement, wrist position and elbow drift.",
    problems:
      "Cloud inference was significantly slower than local processing, with video decoding and pose estimation becoming major bottlenecks.",
    currentState:
      "Working prototype with video-based exercise analysis, rep tracking and biomechanical feedback.",
    nextIteration:
      "Improve inference speed and movement analysis so feedback becomes more precise while remaining fast enough for a smooth user experience.",
    media: [
      {
        src: "/projects/px-002-landing.png",
        label: "LANDING",
        ref: "PX-002 / VIEW 01",
        alt: "physIQal landing page offering frame-by-frame biomechanical feedback from an uploaded training video, listing the supported lifts.",
      },
      {
        src: "/projects/px-002-analysis.png",
        label: "ANALYSIS OUTPUT",
        ref: "PX-002 / VIEW 02",
        alt: "An analysis result showing a pose overlay of a push-up, an overall technique score of 82, an elbow-angle-over-time chart with rep boundaries, and a per-rep breakdown table.",
      },
    ],
    links: [
      { label: "PHYSIQAL-PERFORMANCE.VERCEL.APP", href: "https://physiqal-performance.vercel.app/" },
    ],
  },
  {
    id: "PX-003",
    name: "Tactix XI",
    tagline: "Football management built around how the game actually works.",
    category: "SIMULATION / FOOTBALL",
    status: "ACTIVE",
    year: "2026",
    summary:
      "Tactix XI is a football simulation focused on tactics, player movement and decision-making. The aim is to make matches feel less like animations and more like 22 players constantly reacting to the game around them.",
    technologies: ["Next.js", "TypeScript"],
    domains: ["sports", "software"],
    objective:
      "Build a football management simulation where matches emerge from realistic player movement, decisions and tactical interactions rather than scripted animations.",
    system:
      "A football simulation engine models players, positions, tactics and match state, continuously updating player behaviour based on the game around them.",
    implementation:
      "Started with the pitch and player simulation, then focused on making movement less robotic through acceleration, direction changes, reactions and tactical behaviour.",
    result:
      "A functioning football simulation with players moving around a live pitch and responding to match situations.",
    problems:
      "Player movement currently feels too smooth and predictable, making the simulation look more like animation than real football.",
    currentState:
      "Early playable simulation with the core match environment and player movement working.",
    nextIteration:
      "Introduce sharper movement, acceleration limits, reaction delays and more varied decision-making to make players behave less mechanically.",
    media: [
      {
        src: "/projects/px-003-tactics.png",
        label: "TACTICS",
        ref: "PX-003 / VIEW 01",
        alt: "The tactics screen: a drag-to-arrange pitch shape on the left, the full squad list with ratings and condition in the centre, and style and instruction sliders on the right.",
      },
      {
        src: "/projects/px-003-match-report.png",
        label: "MATCH REPORT",
        ref: "PX-003 / VIEW 02",
        alt: "A post-match report showing a 3-0 scoreline, a highlight frame with player positions on the pitch, what went well and needs work panels, and opposition player ratings.",
      },
    ],
    links: [{ label: "TACTIQ-XI.VERCEL.APP", href: "https://tactiq-xi.vercel.app/" }],
  },
  {
    id: "PX-004",
    name: "BlackOak",
    tagline: "Build, test and trade your ideas.",
    category: "QUANTITATIVE FINANCE / TRADING",
    status: "ACTIVE",
    year: "2026",
    summary:
      "BlackOak is a trading platform built around quantitative strategies. It gives you a place to develop strategies, backtest them against historical markets and paper-trade them before risking real capital.",
    technologies: ["Next.js", "FastAPI", "PostgreSQL", "Python"],
    domains: ["finance", "mathematics"],
    objective:
      "Create a platform where users can build, test and paper-trade quantitative investment strategies without immediately risking real capital.",
    system:
      "A Next.js frontend connects to a FastAPI backend and PostgreSQL database, with historical market data feeding a backtesting and paper-trading engine.",
    implementation:
      "Built the platform around formula-based strategies, historical data and benchmark comparisons, prioritising honest performance measurement over pretending simple signals can reliably beat the market.",
    result:
      "A working platform capable of running strategy logic against historical market data and evaluating performance against benchmarks.",
    problems:
      "Simple combinations of technical and fundamental signals can easily look better in testing than they perform in reality, making overfitting and honest evaluation major concerns.",
    currentState: "Early-stage quantitative research and paper-trading platform.",
    nextIteration:
      "Expand the strategy engine and testing framework with stronger validation, transaction costs and more realistic execution assumptions.",
    media: [
      {
        src: "/projects/px-004-command-center.png",
        label: "COMMAND CENTER",
        ref: "PX-004 / VIEW 01",
        alt: "The command centre dashboard: equity, cash and position tiles, a portfolio value chart plotted against SPY, an open positions list and a live decision feed. Marked paper trading only.",
      },
      {
        src: "/projects/px-004-research.png",
        label: "RESEARCH",
        ref: "PX-004 / VIEW 02",
        alt: "The research view: a candlestick price chart with range selectors above a composite research score, a factor radar chart and a table of financial health and growth factors.",
      },
    ],
    links: [{ label: "BLACK-OAK-BLACK.VERCEL.APP", href: "https://black-oak-black.vercel.app/" }],
  },
  {
    id: "PX-005",
    name: "Keynesium",
    tagline: "Change the economy. See what happens.",
    category: "SIMULATION / MACROECONOMICS",
    status: "ACTIVE",
    year: "2026",
    summary:
      "Keynesium is a macroeconomic sandbox that lets you experiment with an economy and watch the consequences unfold. Change interest rates, taxes, government spending and other economic variables, then see how inflation, growth, unemployment and markets respond.",
    technologies: ["Next.js", "TypeScript", "JavaScript"],
    domains: ["mathematics", "finance"],
    objective:
      "Create a macroeconomic sandbox where users can change economic policy and conditions and immediately see how the wider economy responds.",
    system:
      "An interactive economic model takes user-controlled variables such as interest rates, taxation and government spending and feeds them through interconnected macroeconomic relationships.",
    implementation:
      "Built the simulation around a collection of economic equations and relationships, then wrapped them in an interactive interface so users can experiment with different scenarios.",
    result:
      "A working sandbox that allows users to manipulate economic variables and observe changes across indicators such as growth, inflation and unemployment.",
    problems:
      "Real economies are far more complex than a closed mathematical model, so simplifying relationships without making the results meaningless is one of the hardest parts.",
    currentState:
      "Interactive macroeconomic simulation designed primarily for experimentation and learning.",
    nextIteration:
      "Make the underlying model more sophisticated by introducing additional relationships, feedback loops and shocks so economic behaviour becomes more realistic.",
    media: [
      {
        src: "/projects/px-005-baseline.png",
        label: "BASELINE STATE",
        ref: "PX-005 / VIEW 01",
        alt: "The simulator at rest: policy instrument sliders on the left, five synchronised time-series charts for output, inflation, unemployment, policy rate and confidence, a circular flow diagram, and an economic state panel reading stable.",
      },
      {
        src: "/projects/px-005-shock.png",
        label: "SHOCK RESPONSE",
        ref: "PX-005 / VIEW 02",
        alt: "The same simulator twenty cycles after a shock: output has fallen, inflation and unemployment have risen, the circular flow is marked in red and green, and the signal log reports a critical system stress reading.",
      },
    ],
    links: [{ label: "NEW-KEYNESIUM.VERCEL.APP", href: "https://new-keynesium.vercel.app/" }],
  },

  /* ---------- ARCHIVE ----------
     Placeholder slots for earlier work. Replace or delete. */

  {
    id: "PX-006",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "ARCHIVED",
    year: "[ YEAR ]",
    summary: "[ ONE LINE ON WHAT THIS WAS. ]",
    technologies: ["[ TECH ]"],
    domains: ["finance"],
    archived: true,
    archiveNote: "[ WHY THIS WAS SHELVED, AND WHAT IT TAUGHT. ]",
    objective: "[ What this project was designed to do. ]",
    problems: "[ What did not work. ]",
    currentState: "Archived. No longer maintained.",
  },
  {
    id: "PX-007",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "ARCHIVED",
    year: "[ YEAR ]",
    summary: "[ ONE LINE ON WHAT THIS WAS. ]",
    technologies: ["[ TECH ]"],
    domains: ["software"],
    archived: true,
    archiveNote: "[ WHY THIS WAS SHELVED, AND WHAT IT TAUGHT. ]",
    objective: "[ What this project was designed to do. ]",
    problems: "[ What did not work. ]",
    currentState: "Archived. No longer maintained.",
  },
  {
    id: "PX-008",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "ARCHIVED",
    year: "[ YEAR ]",
    summary: "[ ONE LINE ON WHAT THIS WAS. ]",
    technologies: ["[ TECH ]"],
    domains: ["ai"],
    archived: true,
    archiveNote: "[ WHY THIS WAS SHELVED, AND WHAT IT TAUGHT. ]",
    objective: "[ What this project was designed to do. ]",
    problems: "[ What did not work. ]",
    currentState: "Archived. No longer maintained.",
  },
  {
    id: "PX-009",
    name: "[ PROJECT NAME ]",
    category: "[ CATEGORY / DOMAIN ]",
    status: "ARCHIVED",
    year: "[ YEAR ]",
    summary: "[ ONE LINE ON WHAT THIS WAS. ]",
    technologies: ["[ TECH ]"],
    domains: ["systems"],
    archived: true,
    archiveNote: "[ WHY THIS WAS SHELVED, AND WHAT IT TAUGHT. ]",
    currentState: "Archived. No longer maintained.",
  },
];

export const liveProjects = projects.filter((p) => !p.archived);
export const archivedProjects = projects.filter((p) => p.archived);

export function slugOf(project: Project): string {
  return project.id.toLowerCase();
}

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.id.toLowerCase() === slug.toLowerCase());
}

/** All counts derive from the array above — nothing is hand-written. */
export const projectStats = {
  /** Everything on file, archive included. */
  total: projects.length,
  /** Live entries — what the index and the FILES readouts count. */
  indexed: liveProjects.length,
  active: projects.filter((p) => p.status === "ACTIVE").length,
  building: projects.filter((p) => p.status === "BUILDING").length,
  rd: projects.filter((p) => p.status === "R&D").length,
  archived: archivedProjects.length,
};

/** Statuses actually present in the live index, for the explorer filters. */
export const liveStatuses = [...new Set(liveProjects.map((p) => p.status))];

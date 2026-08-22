import type { ResearchItem, Subject } from "@/lib/types";

/**
 * VKOS/01 — ACADEMIC SYSTEM.
 * Placeholder data. Fill the brackets; invent nothing.
 */

export const school = {
  currentLevel: "GCSE",
  institution: "[ SCHOOL NAME ]",
  yearGroup: "[ YEAR ]",
  completion: "[ EXPECTED COMPLETION ]",
  note: "[ OPTIONAL ONE-LINE NOTE ON THE ACADEMIC ROUTE BEING TAKEN. ]",
};

export const subjects: Subject[] = [
  { name: "MATHEMATICS", board: "[ BOARD ]", note: "[ NOTE ]" },
  { name: "ECONOMICS", board: "[ BOARD ]", note: "[ NOTE ]" },
  { name: "COMPUTER SCIENCE", board: "[ BOARD ]", note: "[ NOTE ]" },
  { name: "SCIENCES", board: "[ BOARD ]", note: "[ NOTE ]" },
  { name: "HISTORY", board: "[ BOARD ]", note: "[ NOTE ]" },
  { name: "LANGUAGES", board: "[ BOARD ]", note: "[ NOTE ]" },
];

/** Academic results, competitions, prizes. Leave empty until real. */
export const achievements: { title: string; detail: string; year: string }[] = [
  { title: "[ ACHIEVEMENT ]", detail: "[ DETAIL ]", year: "[ YEAR ]" },
  { title: "[ ACHIEVEMENT ]", detail: "[ DETAIL ]", year: "[ YEAR ]" },
];

/** Independent study — things being learned outside the syllabus. */
export const research: ResearchItem[] = [
  { title: "[ TOPIC ]", field: "MATHEMATICS", note: "[ WHAT IS BEING STUDIED AND WHY. ]", progress: 0 },
  { title: "[ TOPIC ]", field: "PROBABILITY", note: "[ WHAT IS BEING STUDIED AND WHY. ]", progress: 0 },
  { title: "[ TOPIC ]", field: "FINANCE", note: "[ WHAT IS BEING STUDIED AND WHY. ]", progress: 0 },
  { title: "[ TOPIC ]", field: "ALGORITHMS", note: "[ WHAT IS BEING STUDIED AND WHY. ]", progress: 0 },
  { title: "[ TOPIC ]", field: "MACHINE LEARNING", note: "[ WHAT IS BEING STUDIED AND WHY. ]", progress: 0 },
];

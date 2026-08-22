import type { AchievementSection, Subject } from "@/lib/types";

/**
 * VKOS/01 — ACADEMIC SYSTEM.
 */

export const school = {
  currentLevel: "GCSE",
  institution: "QUEEN ELIZABETH'S SCHOOL, BARNET",
  yearGroup: "YEAR 10",
  completion: "2029",
  since: "SEPTEMBER 2022",
  note: "Enrolled September 2022. Nine subjects in progress alongside a completed Higher Project Qualification.",
};

/** Predicted grades are internal, not awarded. The caveat renders with them. */
export const predicted = {
  grades: "9 9 9 9 9 9 9 9 9",
  caveat: "INTERNALLY PREDICTED — NOT OFFICIAL",
};

export const qualification = {
  name: "HIGHER PROJECT QUALIFICATION",
  grade: "A*",
  mark: "49 / 50",
  detail: "Research project analysing wealth inequality in capitalism.",
};

export const subjects: Subject[] = [
  { name: "MATHEMATICS" },
  { name: "ENGLISH" },
  { name: "BIOLOGY" },
  { name: "PHYSICS" },
  { name: "CHEMISTRY" },
  { name: "HISTORY" },
  { name: "GEOGRAPHY" },
  { name: "ECONOMICS" },
  { name: "FRENCH" },
];

/**
 * Collapsible record blocks. Both render closed by default — the module page
 * leads with the academic summary, not a wall of bullets.
 */
export const achievementSections: AchievementSection[] = [
  {
    id: "school",
    title: "SCHOOL AWARDS, ACTIVITIES & RESPONSIBILITIES",
    summary: "Commendations, subject awards, prefecture and societies",
    groups: [
      {
        entries: [
          {
            title: "23 commendations over the last 3 years",
            detail:
              "Awarded for performance and commitment in examinations and in class.",
          },
          {
            title: "Junior Award in History, Senior Award in English",
            detail: "Awarded for exceptional performance in the subject.",
          },
          {
            title: "Peer Mentor",
            detail:
              "Chosen to mentor younger students academically and pastorally.",
          },
          {
            title: "Junior Prefect",
            detail:
              "One of few prefects in the year group. Managing younger students and co-ordinating events.",
          },
          { title: "Form captain" },
          {
            title: "Model United Nations society",
            detail:
              "Participant in the HalcyonMUN conference, where I passed a resolution.",
          },
          {
            title: "The Elizabethan Union",
            detail: "Member of the school's debating union.",
          },
          {
            title: "4 articles published in the school economics newsletter",
            detail:
              "On the possibilities of a post-American supply chain, the relevance of Hyman Minsky's school of thought today, and the downsides of America's reserve currency privilege.",
          },
          {
            title: "Elite Maths society",
            detail: "Selected as a member.",
          },
        ],
      },
    ],
  },
  {
    id: "other",
    title: "OTHER ACHIEVEMENTS & AWARDS",
    summary: "Olympiads, public speaking, economics and extra-curricular",
    groups: [
      {
        label: "MATHEMATICAL",
        entries: [
          {
            title:
              "4 consecutive gold certificates in the Junior and Intermediate Mathematical Challenges",
            detail: "With admission into the Olympiad on all occasions.",
          },
          {
            title: "Bronze medallist, Junior Mathematical Olympiad",
            detail:
              "Top 200 in my age group, from an initial 280,000 in the JMC.",
          },
          {
            title: "Merit in the Intermediate Mathematical Cayley Olympiad",
            detail: "A few marks from distinction.",
          },
          {
            title:
              "Pre-final round of the International Youth Maths Challenge",
          },
          {
            title:
              "Comprehensive Oxford Mathematics and Physics Online School",
            detail: "Selected as a member.",
          },
        ],
      },
      {
        label: "COMMUNICATION",
        entries: [
          {
            title: "Distinction in Grade 8 LAMDA public speaking",
            detail: "Scored 96%.",
          },
          {
            title: "2 TEDx speeches",
            detail:
              "On the impact of technology on youth, and on Aristotle's concept of eudaimonia.",
          },
        ],
      },
      {
        label: "ECONOMICS",
        entries: [
          {
            title: "180 / 200 in round one of the Great British Economics Olympiad",
          },
        ],
      },
      {
        label: "EXTRA-CURRICULAR",
        entries: [
          {
            title: "100% in the Bebras Challenge",
            detail:
              "A coding challenge testing logical reasoning and problem solving.",
          },
          { title: "Bronze Duke of Edinburgh Award" },
          {
            title: "Mensa IQ score of 162",
          },
        ],
      },
    ],
  },
];

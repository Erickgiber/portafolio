// Centralized typed skills data
// Each category has a title, optional color variant key used for icon bg/text colors, and grouped rows of skill badges.

export type SkillBadge = string;

export interface SkillCategory {
  key: string; // unique id
  title: string;
  color: "primary" | "secondary" | "accent";
  icon: string; // heroicon path data or similar
  groups: SkillBadge[][]; // arrays (rows) of badges for layout
}

// Frontend icon (monitor)
const ICON_FRONTEND =
  "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z";
// Backend icon (server stack)
const ICON_BACKEND =
  "M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2";
// Tools icon (cog cluster)
const ICON_TOOLS =
  "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z";
// Testing icon (beaker)
const ICON_TESTING =
  "M19 4h-4l-1-2h-4l-1 2H5v2h14V4z M6 8l1.5 12.5A2 2 0 009.49 22h5.02a2 2 0 001.99-1.5L18 8H6z";

export const skillCategories: SkillCategory[] = [
  {
    key: "frontend",
    title: "Frontend",
    color: "primary",
    icon: ICON_FRONTEND,
    groups: [
      ["React", "Svelte", "Vue.js", "Angular"],
      ["TypeScript", "JavaScript"],
      ["Tailwind CSS", "CSS3"],
      ["Astro", "Nextjs", "Gatsby"],
    ],
  },
  {
    key: "backend",
    title: "Backend",
    color: "secondary",
    icon: ICON_BACKEND,
    groups: [
      ["Node.js", "Express", "Python"],
      ["PostgreSQL", "MongoDB", "MySQL"],
      ["REST APIs", "GraphQL", "Supabase"],
      ["Firebase", "Socket"],
    ],
  },
  {
    key: "tools",
    title: "Herramientas",
    color: "accent",
    icon: ICON_TOOLS,
    groups: [
      ["Git", "Docker", "AWS"],
      ["Figma", "Postman"],
      ["Linux", "VS Code"],
    ],
  },
  {
    key: "testing",
    title: "Testing",
    color: "primary",
    icon: ICON_TESTING,
    groups: [["Jest", "Vitest", "Cypress", "Playwright", "Puppeteer"]],
  },
];

export function getCategoryDelay(index: number): number {
  // mimic original 50,150,250 pattern
  return 50 + index * 100;
}

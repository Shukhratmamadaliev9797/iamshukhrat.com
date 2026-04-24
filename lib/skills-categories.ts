export const SKILL_CATEGORIES = ["FRONTEND", "BACKEND", "OTHERS"] as const

export type SkillCategory = (typeof SKILL_CATEGORIES)[number]

export function normalizeSkillCategory(value: unknown): SkillCategory {
  const category = String(value ?? "").trim().toUpperCase()
  if (category === "FRONTEND" || category === "BACKEND" || category === "OTHERS") {
    return category
  }
  return "OTHERS"
}


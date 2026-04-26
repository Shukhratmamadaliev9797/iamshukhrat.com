export const SKILL_CATEGORIES = [
  "FRONTEND_ENGINEERING",
  "MOBILE_DEVELOPMENT",
  "BACKEND_ENGINEERING",
  "DATABASES",
  "DEVOPS_TOOLING",
  "CLOUD_SERVICES",
  "ARCHITECTURE_PRACTICES",
] as const

export const FRONTEND_SKILL_SUBCATEGORIES = [
  "CORE_TECHNOLOGIES",
  "FRAMEWORKS_LIBRARIES",
  "STATE_MANAGEMENT",
  "UI_STYLING",
] as const

export type SkillCategory = (typeof SKILL_CATEGORIES)[number]
export type FrontendSkillSubcategory = (typeof FRONTEND_SKILL_SUBCATEGORIES)[number]
export type SkillSubcategory = FrontendSkillSubcategory

export function getSkillCategoryLabel(category: SkillCategory) {
  if (category === "FRONTEND_ENGINEERING") return "FRONTEND ENGINEERING"
  if (category === "MOBILE_DEVELOPMENT") return "MOBILE DEVELOPMENT"
  if (category === "BACKEND_ENGINEERING") return "BACKEND ENGINEERING"
  if (category === "DATABASES") return "DATABASES"
  if (category === "DEVOPS_TOOLING") return "DEVOPS & TOOLING"
  if (category === "CLOUD_SERVICES") return "CLOUD & SERVICES"
  return "ARCHITECTURE & PRACTICES"
}

export function normalizeSkillCategory(value: unknown): SkillCategory {
  const category = String(value ?? "").trim().toUpperCase()

  if (category === "FRONTEND_ENGINEERING") return "FRONTEND_ENGINEERING"
  if (category === "MOBILE_DEVELOPMENT" || category === "MOBILE DEVELOPMENT") return "MOBILE_DEVELOPMENT"
  if (category === "BACKEND_ENGINEERING") return "BACKEND_ENGINEERING"
  if (category === "DATABASES") return "DATABASES"
  if (category === "DEVOPS_TOOLING" || category === "DEVOPS & TOOLING") return "DEVOPS_TOOLING"
  if (category === "CLOUD_SERVICES" || category === "CLOUD & SERVICES") return "CLOUD_SERVICES"
  if (category === "ARCHITECTURE_PRACTICES" || category === "ARCHITECTURE & PRACTICES") {
    return "ARCHITECTURE_PRACTICES"
  }

  // Legacy values
  if (category === "FRONTEND") return "FRONTEND_ENGINEERING"
  if (category === "BACKEND") return "BACKEND_ENGINEERING"
  if (category === "OTHERS") return "ARCHITECTURE_PRACTICES"

  return "BACKEND_ENGINEERING"
}

export function getDefaultSkillSubcategory(category: SkillCategory): SkillSubcategory | null {
  if (category === "FRONTEND_ENGINEERING") return "CORE_TECHNOLOGIES"
  return null
}

export function normalizeSkillSubcategory(value: unknown, category: SkillCategory): SkillSubcategory | null {
  if (category !== "FRONTEND_ENGINEERING") return null

  const subcategory = String(value ?? "").trim().toUpperCase()

  if (subcategory === "CORE_TECHNOLOGIES") return "CORE_TECHNOLOGIES"
  if (subcategory === "FRAMEWORKS_LIBRARIES") return "FRAMEWORKS_LIBRARIES"
  if (subcategory === "STATE_MANAGEMENT") return "STATE_MANAGEMENT"
  if (subcategory === "UI_STYLING") return "UI_STYLING"

  // Legacy values
  if (subcategory === "BASIC") return "CORE_TECHNOLOGIES"
  if (subcategory === "FRAMEWORKS_STATE") return "FRAMEWORKS_LIBRARIES"
  if (subcategory === "UI_DESIGN") return "UI_STYLING"

  return "CORE_TECHNOLOGIES"
}

export function getSkillSubcategoryLabel(subcategory: SkillSubcategory) {
  if (subcategory === "CORE_TECHNOLOGIES") return "Core Technologies"
  if (subcategory === "FRAMEWORKS_LIBRARIES") return "Frameworks & Libraries"
  if (subcategory === "STATE_MANAGEMENT") return "State Management"
  return "UI & Styling"
}

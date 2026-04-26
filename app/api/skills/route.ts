import { NextResponse } from "next/server"
import { normalizeSkillCategory, normalizeSkillSubcategory } from "@/lib/skills-categories"
import { createSkillInDb, getSkillsFromDb, hasSkillsDatabaseConfig } from "@/lib/skills-db"

export async function GET() {
  if (!hasSkillsDatabaseConfig()) {
    return NextResponse.json({ success: false, message: "DATABASE_URL is missing.", skills: [] }, { status: 400 })
  }

  try {
    const skills = await getSkillsFromDb()
    return NextResponse.json({ success: true, skills })
  } catch (error) {
    console.error("Failed to fetch skills:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch skills.", skills: [] }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!hasSkillsDatabaseConfig()) {
    return NextResponse.json({ success: false, message: "DATABASE_URL is missing." }, { status: 400 })
  }

  try {
    const body = await req.json()
    const nameI18nRaw = {
      uz: String(body?.nameI18n?.uz ?? "").trim(),
      ru: String(body?.nameI18n?.ru ?? "").trim(),
      en: String(body?.nameI18n?.en ?? "").trim(),
    }
    const nameI18n = nameI18nRaw.uz || nameI18nRaw.ru || nameI18nRaw.en ? nameI18nRaw : null
    const name = String(body?.name ?? "").trim() || (nameI18n?.uz || nameI18n?.en || nameI18n?.ru || "")
    const img = String(body?.img ?? "").trim() || "/placeholder.svg"
    const imagePublicId = String(body?.imagePublicId ?? "").trim() || null
    const category = normalizeSkillCategory(body?.category)
    const subcategory = normalizeSkillSubcategory(body?.subcategory, category)

    if (!name) {
      return NextResponse.json({ success: false, message: "Skill name is required." }, { status: 400 })
    }

    const skill = await createSkillInDb({ name, nameI18n, img, imagePublicId, category, subcategory })
    return NextResponse.json({ success: true, skill }, { status: 201 })
  } catch (error) {
    console.error("Failed to create skill:", error)
    return NextResponse.json({ success: false, message: "Failed to create skill." }, { status: 500 })
  }
}

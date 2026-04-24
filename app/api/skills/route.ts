import { NextResponse } from "next/server"
import { normalizeSkillCategory } from "@/lib/skills-categories"
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
    const name = String(body?.name ?? "").trim()
    const img = String(body?.img ?? "").trim() || "/placeholder.svg"
    const imagePublicId = String(body?.imagePublicId ?? "").trim() || null
    const category = normalizeSkillCategory(body?.category)

    if (!name) {
      return NextResponse.json({ success: false, message: "Skill name is required." }, { status: 400 })
    }

    const skill = await createSkillInDb({ name, img, imagePublicId, category })
    return NextResponse.json({ success: true, skill }, { status: 201 })
  } catch (error) {
    console.error("Failed to create skill:", error)
    return NextResponse.json({ success: false, message: "Failed to create skill." }, { status: 500 })
  }
}

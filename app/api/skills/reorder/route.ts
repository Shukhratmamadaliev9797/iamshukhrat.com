import { NextResponse } from "next/server"
import { hasSkillsDatabaseConfig, reorderSkillsInDb } from "@/lib/skills-db"

export async function PATCH(req: Request) {
  if (!hasSkillsDatabaseConfig()) {
    return NextResponse.json({ success: false, message: "DATABASE_URL is missing." }, { status: 400 })
  }

  try {
    const body = await req.json()
    const idsRaw = Array.isArray(body?.ids) ? body.ids : []
    const ids = idsRaw
      .map((value: unknown) => Number(value))
      .filter((value: number) => Number.isInteger(value) && value > 0)

    if (ids.length === 0 || ids.length !== idsRaw.length) {
      return NextResponse.json({ success: false, message: "Valid ids array is required." }, { status: 400 })
    }

    await reorderSkillsInDb(ids)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to reorder skills:", error)
    return NextResponse.json({ success: false, message: "Failed to reorder skills." }, { status: 500 })
  }
}

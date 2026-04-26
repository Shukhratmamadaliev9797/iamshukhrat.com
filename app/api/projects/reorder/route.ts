import { NextResponse } from "next/server"
import { hasDatabaseConfig, reorderProjectsInDb, type ProjectCategory } from "@/lib/projects-db"

export async function PATCH(req: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ success: false, message: "DATABASE_URL is missing." }, { status: 400 })
  }

  try {
    const body = await req.json()
    const category = String(body?.category ?? "").trim().toLowerCase() as ProjectCategory
    const ids = Array.isArray(body?.ids) ? body.ids.map((value: unknown) => Number(value)) : []

    if (!["real", "personal"].includes(category)) {
      return NextResponse.json({ success: false, message: "Invalid category." }, { status: 400 })
    }

    if (ids.length === 0 || ids.some((id: number) => !Number.isInteger(id) || id <= 0)) {
      return NextResponse.json({ success: false, message: "Invalid ids payload." }, { status: 400 })
    }

    await reorderProjectsInDb(category, ids)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to reorder projects:", error)
    return NextResponse.json({ success: false, message: "Failed to reorder projects." }, { status: 500 })
  }
}

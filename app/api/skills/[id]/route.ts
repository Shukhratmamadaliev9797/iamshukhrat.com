import { NextResponse } from "next/server"
import { deleteCloudinaryImage, hasCloudinaryConfig } from "@/lib/cloudinary"
import { normalizeSkillCategory, normalizeSkillSubcategory } from "@/lib/skills-categories"
import { deleteSkillInDb, getSkillByIdFromDb, hasSkillsDatabaseConfig, updateSkillInDb } from "@/lib/skills-db"

function parseSkillId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  if (!hasSkillsDatabaseConfig()) {
    return NextResponse.json({ success: false, message: "DATABASE_URL is missing." }, { status: 400 })
  }

  const { id: rawId } = await context.params
  const id = parseSkillId(rawId)
  if (!id) return NextResponse.json({ success: false, message: "Invalid skill id." }, { status: 400 })

  try {
    const skill = await getSkillByIdFromDb(id)
    if (!skill) return NextResponse.json({ success: false, message: "Skill not found." }, { status: 404 })
    return NextResponse.json({ success: true, skill })
  } catch (error) {
    console.error("Failed to fetch skill:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch skill." }, { status: 500 })
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!hasSkillsDatabaseConfig()) {
    return NextResponse.json({ success: false, message: "DATABASE_URL is missing." }, { status: 400 })
  }

  const { id: rawId } = await context.params
  const id = parseSkillId(rawId)
  if (!id) return NextResponse.json({ success: false, message: "Invalid skill id." }, { status: 400 })

  try {
    const body = await req.json()
    const nameI18nRaw = {
      uz: String(body?.nameI18n?.uz ?? "").trim(),
      ru: String(body?.nameI18n?.ru ?? "").trim(),
      en: String(body?.nameI18n?.en ?? "").trim(),
    }
    const hasNameI18n = Object.prototype.hasOwnProperty.call(body ?? {}, "nameI18n")
    const parsedNameI18n = nameI18nRaw.uz || nameI18nRaw.ru || nameI18nRaw.en ? nameI18nRaw : null
    const img = String(body?.img ?? "").trim()
    const imagePublicId = String(body?.imagePublicId ?? "").trim() || null

    const existingSkill = await getSkillByIdFromDb(id)
    if (!existingSkill) return NextResponse.json({ success: false, message: "Skill not found." }, { status: 404 })

    const category = body?.category ? normalizeSkillCategory(body.category) : existingSkill.category
    const hasSubcategory = Object.prototype.hasOwnProperty.call(body ?? {}, "subcategory")
    const subcategory = hasSubcategory
      ? normalizeSkillSubcategory(body?.subcategory, category)
      : normalizeSkillSubcategory(existingSkill.subcategory, category)
    const nameI18n = hasNameI18n ? parsedNameI18n : existingSkill.nameI18n
    const name = String(body?.name ?? "").trim() || (nameI18n?.uz || nameI18n?.en || nameI18n?.ru || existingSkill.name)

    if (!name || !img) {
      return NextResponse.json({ success: false, message: "Required fields: name, img." }, { status: 400 })
    }

    const updatedSkill = await updateSkillInDb(id, { name, nameI18n, img, imagePublicId, category, subcategory })
    if (!updatedSkill) return NextResponse.json({ success: false, message: "Skill not found." }, { status: 404 })

    if (
      hasCloudinaryConfig() &&
      existingSkill.imagePublicId &&
      existingSkill.imagePublicId !== updatedSkill.imagePublicId
    ) {
      try {
        await deleteCloudinaryImage(existingSkill.imagePublicId)
      } catch (cleanupError) {
        console.error("Failed to remove old skill image:", cleanupError)
      }
    }

    return NextResponse.json({ success: true, skill: updatedSkill })
  } catch (error) {
    console.error("Failed to update skill:", error)
    return NextResponse.json({ success: false, message: "Failed to update skill." }, { status: 500 })
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  if (!hasSkillsDatabaseConfig()) {
    return NextResponse.json({ success: false, message: "DATABASE_URL is missing." }, { status: 400 })
  }

  const { id: rawId } = await context.params
  const id = parseSkillId(rawId)
  if (!id) return NextResponse.json({ success: false, message: "Invalid skill id." }, { status: 400 })

  try {
    const existingSkill = await getSkillByIdFromDb(id)
    if (!existingSkill) return NextResponse.json({ success: false, message: "Skill not found." }, { status: 404 })

    const deleted = await deleteSkillInDb(id)
    if (!deleted) return NextResponse.json({ success: false, message: "Skill not found." }, { status: 404 })

    if (hasCloudinaryConfig() && existingSkill.imagePublicId) {
      try {
        await deleteCloudinaryImage(existingSkill.imagePublicId)
      } catch (cleanupError) {
        console.error("Failed to remove deleted skill image:", cleanupError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete skill:", error)
    return NextResponse.json({ success: false, message: "Failed to delete skill." }, { status: 500 })
  }
}

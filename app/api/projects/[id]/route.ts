import { NextResponse } from "next/server"
import {
  deleteProjectInDb,
  getProjectByIdFromDb,
  hasDatabaseConfig,
  type I18nText,
  type ProjectCategory,
  type ProjectPreviewType,
  updateProjectInDb,
} from "@/lib/projects-db"
import { deleteCloudinaryImage, hasCloudinaryConfig } from "@/lib/cloudinary"

function parseProjectId(value: string) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function normalizeI18nPayload(value: unknown) {
  const source = typeof value === "object" && value ? (value as Record<string, unknown>) : {}
  return {
    uz: String(source.uz ?? "").trim(),
    ru: String(source.ru ?? "").trim(),
    en: String(source.en ?? "").trim(),
  } satisfies I18nText
}

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ success: false, message: "DATABASE_URL is missing." }, { status: 400 })
  }

  const { id: rawId } = await context.params
  const id = parseProjectId(rawId)
  if (!id) {
    return NextResponse.json({ success: false, message: "Invalid project id." }, { status: 400 })
  }

  try {
    const project = await getProjectByIdFromDb(id)
    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 })
    }

    return NextResponse.json({ success: true, project })
  } catch (error) {
    console.error("Failed to fetch project:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch project." }, { status: 500 })
  }
}

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ success: false, message: "DATABASE_URL is missing." }, { status: 400 })
  }

  const { id: rawId } = await context.params
  const id = parseProjectId(rawId)
  if (!id) {
    return NextResponse.json({ success: false, message: "Invalid project id." }, { status: 400 })
  }

  try {
    const body = await req.json()

    const category = body?.category as ProjectCategory
    const previewType = (String(body?.previewType ?? "desktop").trim().toLowerCase() === "mobile"
      ? "mobile"
      : "desktop") as ProjectPreviewType
    const url = String(body?.url ?? "").trim()
    const img = String(body?.img ?? "").trim()
    const imagePublicId = String(body?.imagePublicId ?? "").trim() || null
    const github = String(body?.github ?? "").trim() || null
    const admin = String(body?.admin ?? "").trim() || null
    const nameI18n = normalizeI18nPayload(body?.nameI18n)
    const descriptionI18n = normalizeI18nPayload(body?.descriptionI18n)
    const badgeI18nRaw = normalizeI18nPayload(body?.badgeI18n)
    const badgeI18n = badgeI18nRaw.uz || badgeI18nRaw.ru || badgeI18nRaw.en ? badgeI18nRaw : null

    const name = nameI18n.uz || nameI18n.en || nameI18n.ru
    const description = descriptionI18n.uz || descriptionI18n.en || descriptionI18n.ru
    const badge = badgeI18n?.uz || badgeI18n?.en || badgeI18n?.ru || null

    const technologiesRaw = Array.isArray(body?.technologies) ? body.technologies : []
    const technologies = technologiesRaw.map((tech: unknown) => String(tech).trim()).filter(Boolean)

    if (!["real", "personal"].includes(category)) {
      return NextResponse.json({ success: false, message: "Invalid category." }, { status: 400 })
    }
    if (!["desktop", "mobile"].includes(previewType)) {
      return NextResponse.json({ success: false, message: "Invalid previewType." }, { status: 400 })
    }

    if (!name || !img || !description || technologies.length === 0) {
      return NextResponse.json(
        { success: false, message: "Required fields: category, name, img, technologies, description." },
        { status: 400 },
      )
    }

    const existingProject = await getProjectByIdFromDb(id)
    if (!existingProject) {
      return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 })
    }

    const updatedProject = await updateProjectInDb(id, {
      category,
      name,
      url,
      img,
      technologies,
      description,
      badge,
      github,
      admin,
      imagePublicId,
      previewType,
      nameI18n,
      descriptionI18n,
      badgeI18n,
    })

    if (!updatedProject) {
      return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 })
    }

    const oldImagePublicId = existingProject.imagePublicId
    const newImagePublicId = updatedProject.imagePublicId
    if (
      hasCloudinaryConfig() &&
      oldImagePublicId &&
      oldImagePublicId !== newImagePublicId
    ) {
      try {
        await deleteCloudinaryImage(oldImagePublicId)
      } catch (cleanupError) {
        console.error("Failed to remove old cloudinary image:", cleanupError)
      }
    }

    return NextResponse.json({ success: true, project: updatedProject })
  } catch (error) {
    console.error("Failed to update project:", error)
    return NextResponse.json({ success: false, message: "Failed to update project." }, { status: 500 })
  }
}

export async function DELETE(_req: Request, context: { params: Promise<{ id: string }> }) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ success: false, message: "DATABASE_URL is missing." }, { status: 400 })
  }

  const { id: rawId } = await context.params
  const id = parseProjectId(rawId)
  if (!id) {
    return NextResponse.json({ success: false, message: "Invalid project id." }, { status: 400 })
  }

  try {
    const existingProject = await getProjectByIdFromDb(id)
    if (!existingProject) {
      return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 })
    }

    const deleted = await deleteProjectInDb(id)
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 })
    }

    if (hasCloudinaryConfig() && existingProject.imagePublicId) {
      try {
        await deleteCloudinaryImage(existingProject.imagePublicId)
      } catch (cleanupError) {
        console.error("Failed to remove deleted project's cloudinary image:", cleanupError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete project:", error)
    return NextResponse.json({ success: false, message: "Failed to delete project." }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import {
  deleteProjectInDb,
  getProjectByIdFromDb,
  hasDatabaseConfig,
  type I18nText,
  type ProjectAdditionalImage,
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

function normalizeAdditionalImagesPayload(value: unknown): ProjectAdditionalImage[] {
  if (!Array.isArray(value)) return []

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const source = item as Record<string, unknown>
      const url = String(source.url ?? "").trim()
      if (!url) return null
      const publicIdRaw = String(source.publicId ?? "").trim()
      return {
        url,
        publicId: publicIdRaw || null,
      } satisfies ProjectAdditionalImage
    })
    .filter((item): item is ProjectAdditionalImage => Boolean(item))
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
    const playStoreUrl = String(body?.playStoreUrl ?? "").trim() || null
    const appStoreUrl = String(body?.appStoreUrl ?? "").trim() || null
    const youtubeUrl = String(body?.youtubeUrl ?? "").trim() || null
    const img = String(body?.img ?? "").trim()
    const imagePublicId = String(body?.imagePublicId ?? "").trim() || null
    const additionalImages = normalizeAdditionalImagesPayload(body?.additionalImages)
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
    if (previewType === "mobile" && !playStoreUrl && !appStoreUrl) {
      return NextResponse.json(
        { success: false, message: "Mobile project uchun Play Market yoki App Store URL kiriting." },
        { status: 400 },
      )
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
      playStoreUrl,
      appStoreUrl,
      youtubeUrl,
      img,
      technologies,
      additionalImages,
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

    const oldAdditionalPublicIds = (existingProject.additionalImages ?? [])
      .map((item) => String(item.publicId ?? "").trim())
      .filter(Boolean)
    const newAdditionalPublicIds = new Set(
      (updatedProject.additionalImages ?? []).map((item) => String(item.publicId ?? "").trim()).filter(Boolean),
    )

    if (hasCloudinaryConfig()) {
      for (const publicId of oldAdditionalPublicIds) {
        if (newAdditionalPublicIds.has(publicId)) continue
        try {
          await deleteCloudinaryImage(publicId)
        } catch (cleanupError) {
          console.error("Failed to remove outdated additional project image:", cleanupError)
        }
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

    if (hasCloudinaryConfig()) {
      const additionalPublicIds = (existingProject.additionalImages ?? [])
        .map((item) => String(item.publicId ?? "").trim())
        .filter(Boolean)

      for (const publicId of additionalPublicIds) {
        try {
          await deleteCloudinaryImage(publicId)
        } catch (cleanupError) {
          console.error("Failed to remove deleted project's additional image:", cleanupError)
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to delete project:", error)
    return NextResponse.json({ success: false, message: "Failed to delete project." }, { status: 500 })
  }
}

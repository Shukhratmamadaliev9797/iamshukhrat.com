import { NextResponse } from "next/server"
import {
  createProjectInDb,
  getProjectsGroupedFromDb,
  hasDatabaseConfig,
  type I18nText,
  type ProjectAdditionalImage,
  type ProjectCategory,
  type ProjectPreviewType,
} from "@/lib/projects-db"

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

export async function GET() {
  if (!hasDatabaseConfig()) {
    return NextResponse.json({ success: false, message: "DATABASE_URL is missing." }, { status: 400 })
  }

  try {
    const data = await getProjectsGroupedFromDb()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Failed to read projects from database:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch projects." }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      {
        success: false,
        message: "DATABASE_URL is missing. Configure database before creating projects.",
      },
      { status: 400 },
    )
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
    const img = String(body?.img ?? "").trim() || "/placeholder.svg"
    const imagePublicId = String(body?.imagePublicId ?? "").trim() || null
    const additionalImages = normalizeAdditionalImagesPayload(body?.additionalImages)
    const github = String(body?.github ?? "").trim() || null
    const admin = String(body?.admin ?? "").trim() || null
    const nameI18n = {
      uz: String(body?.nameI18n?.uz ?? "").trim(),
      ru: String(body?.nameI18n?.ru ?? "").trim(),
      en: String(body?.nameI18n?.en ?? "").trim(),
    } satisfies I18nText
    const descriptionI18n = {
      uz: String(body?.descriptionI18n?.uz ?? "").trim(),
      ru: String(body?.descriptionI18n?.ru ?? "").trim(),
      en: String(body?.descriptionI18n?.en ?? "").trim(),
    } satisfies I18nText
    const badgeI18nRaw = {
      uz: String(body?.badgeI18n?.uz ?? "").trim(),
      ru: String(body?.badgeI18n?.ru ?? "").trim(),
      en: String(body?.badgeI18n?.en ?? "").trim(),
    } satisfies I18nText
    const badgeI18n = badgeI18nRaw.uz || badgeI18nRaw.ru || badgeI18nRaw.en ? badgeI18nRaw : null

    const name = nameI18n.uz || nameI18n.en || nameI18n.ru
    const description = descriptionI18n.uz || descriptionI18n.en || descriptionI18n.ru
    const badge = badgeI18n?.uz || badgeI18n?.en || badgeI18n?.ru || null
    const technologiesRaw = Array.isArray(body?.technologies) ? body.technologies : []
    const technologies = technologiesRaw
      .map((tech: unknown) => String(tech).trim())
      .filter(Boolean)

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
        {
          success: false,
          message: "Required fields: category, name, img, technologies, description.",
        },
        { status: 400 },
      )
    }

    const project = await createProjectInDb({
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

    return NextResponse.json({ success: true, project }, { status: 201 })
  } catch (error) {
    console.error("Failed to create project:", error)
    return NextResponse.json({ success: false, message: "Failed to create project." }, { status: 500 })
  }
}

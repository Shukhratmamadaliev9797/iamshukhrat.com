import { NextResponse } from "next/server"
import { hasCloudinaryConfig, uploadProjectImageToCloudinary } from "@/lib/cloudinary"
import { getSkillByIdFromDb, hasSkillsDatabaseConfig } from "@/lib/skills-db"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function POST(req: Request) {
  if (!hasCloudinaryConfig()) {
    return NextResponse.json({ success: false, message: "Cloudinary env variables are missing." }, { status: 400 })
  }
  if (!hasSkillsDatabaseConfig()) {
    return NextResponse.json({ success: false, message: "DATABASE_URL is missing." }, { status: 400 })
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file")
    const skillName = String(formData.get("skillName") ?? "").trim()
    const skillIdRaw = String(formData.get("skillId") ?? "").trim()
    const skillId = Number(skillIdRaw)

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: "Image file is required." }, { status: 400 })
    }
    if (!skillName) {
      return NextResponse.json({ success: false, message: "Skill name is required." }, { status: 400 })
    }
    if (!Number.isInteger(skillId) || skillId <= 0) {
      return NextResponse.json({ success: false, message: "Valid skillId is required." }, { status: 400 })
    }

    const existingSkill = await getSkillByIdFromDb(skillId)
    if (!existingSkill) {
      return NextResponse.json({ success: false, message: "Skill not found." }, { status: 404 })
    }

    const slug = slugify(skillName)
    const bytes = await file.arrayBuffer()
    const fileBuffer = Buffer.from(bytes)

    const uploaded = await uploadProjectImageToCloudinary({
      fileBuffer,
      mimeType: file.type || "image/jpeg",
      folder: `skills/${skillId}-${slug}`,
      publicId: `${skillId}-${slug}-${Date.now()}`,
    })

    return NextResponse.json({
      success: true,
      imageUrl: uploaded.secureUrl,
      publicId: uploaded.publicId,
      folder: `skills/${skillId}-${slug}`,
    })
  } catch (error) {
    console.error("Skill image upload failed:", error)
    return NextResponse.json({ success: false, message: "Image upload failed." }, { status: 500 })
  }
}

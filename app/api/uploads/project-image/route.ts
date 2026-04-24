import { NextResponse } from "next/server"
import { hasCloudinaryConfig, uploadProjectImageToCloudinary } from "@/lib/cloudinary"
import { getProjectByIdFromDb, hasDatabaseConfig } from "@/lib/projects-db"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export async function POST(req: Request) {
  if (!hasCloudinaryConfig()) {
    return NextResponse.json(
      {
        success: false,
        message: "Cloudinary env variables are missing.",
      },
      { status: 400 },
    )
  }
  if (!hasDatabaseConfig()) {
    return NextResponse.json(
      {
        success: false,
        message: "DATABASE_URL is missing.",
      },
      { status: 400 },
    )
  }

  try {
    const formData = await req.formData()
    const file = formData.get("file")
    const projectName = String(formData.get("projectName") ?? "").trim()
    const projectIdRaw = String(formData.get("projectId") ?? "").trim()
    const projectId = Number(projectIdRaw)

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: "Image file is required." }, { status: 400 })
    }

    if (!projectName) {
      return NextResponse.json({ success: false, message: "Project name is required." }, { status: 400 })
    }
    if (!Number.isInteger(projectId) || projectId <= 0) {
      return NextResponse.json({ success: false, message: "Valid projectId is required." }, { status: 400 })
    }

    const projectSlug = slugify(projectName)
    if (!projectSlug) {
      return NextResponse.json({ success: false, message: "Invalid project name." }, { status: 400 })
    }

    const project = await getProjectByIdFromDb(projectId)
    if (!project) {
      return NextResponse.json({ success: false, message: "Project not found." }, { status: 404 })
    }

    const bytes = await file.arrayBuffer()
    const fileBuffer = Buffer.from(bytes)

    const uploaded = await uploadProjectImageToCloudinary({
      fileBuffer,
      mimeType: file.type || "image/jpeg",
      folder: `projects/${projectId}-${projectSlug}`,
      publicId: `${projectId}-${projectSlug}-${Date.now()}`,
    })

    return NextResponse.json({
      success: true,
      imageUrl: uploaded.secureUrl,
      publicId: uploaded.publicId,
      folder: `projects/${projectId}-${projectSlug}`,
    })
  } catch (error) {
    console.error("Cloudinary upload failed:", error)
    return NextResponse.json({ success: false, message: "Image upload failed." }, { status: 500 })
  }
}

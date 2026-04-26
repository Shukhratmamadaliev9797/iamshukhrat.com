import { v2 as cloudinary } from "cloudinary"

let isConfigured = false

function ensureCloudinaryConfig() {
  if (isConfigured) return

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary environment variables")
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })

  isConfigured = true
}

export function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  )
}

function sanitizeFolder(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9/_-]/g, "")
    .replace(/\/{2,}/g, "/")
    .replace(/^\/|\/$/g, "")
}

function withBaseFolder(folder: string) {
  const base = sanitizeFolder(process.env.CLOUDINARY_FOLDER_PREFIX || "iamshukhrat.com")
  const sub = sanitizeFolder(folder)
  return sub ? `${base}/${sub}` : base
}

function toDataUri(fileBuffer: Buffer, mimeType: string) {
  return `data:${mimeType};base64,${fileBuffer.toString("base64")}`
}

export async function uploadProjectImageToCloudinary(params: {
  fileBuffer: Buffer
  mimeType: string
  folder: string
  publicId?: string
}) {
  ensureCloudinaryConfig()

  const dataUri = toDataUri(params.fileBuffer, params.mimeType)
  const scopedFolder = withBaseFolder(params.folder)
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: scopedFolder,
    resource_type: "image",
    public_id: params.publicId,
    overwrite: true,
  })

  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  }
}

export async function deleteCloudinaryImage(publicId: string) {
  ensureCloudinaryConfig()
  return cloudinary.uploader.destroy(publicId, { resource_type: "image" })
}

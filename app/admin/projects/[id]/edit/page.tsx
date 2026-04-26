"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"

type LocalizedField = {
  uz: string
  ru: string
  en: string
}

type FormState = {
  category: "real" | "personal"
  previewType: "desktop" | "mobile"
  name: LocalizedField
  url: string
  playStoreUrl: string
  appStoreUrl: string
  youtubeUrl: string
  img: string
  imagePublicId: string
  additionalImages: AdditionalImage[]
  technologies: string[]
  description: LocalizedField
  badge: LocalizedField
  github: string
  admin: string
}

type SkillOption = {
  id: number
  name: string
}

type AdditionalImage = {
  url: string
  publicId: string | null
}

function normalizeTechnologyName(value: string) {
  return value.trim().toLowerCase()
}

function dedupeTechnologies(technologies: string[]) {
  const seen = new Set<string>()
  const result: string[] = []

  for (const raw of technologies) {
    const value = String(raw).trim()
    const key = normalizeTechnologyName(value)
    if (!value || seen.has(key)) continue
    seen.add(key)
    result.push(value)
  }

  return result
}

function reconcileTechnologiesWithSkills(technologies: string[], skills: SkillOption[]) {
  if (skills.length === 0) return dedupeTechnologies(technologies)

  const skillNameByNormalized = new Map<string, string>()
  for (const skill of skills) {
    const key = normalizeTechnologyName(skill.name)
    if (!key || skillNameByNormalized.has(key)) continue
    skillNameByNormalized.set(key, skill.name)
  }

  const reconciled = technologies
    .map((tech) => {
      const key = normalizeTechnologyName(tech)
      return skillNameByNormalized.get(key) ?? ""
    })
    .filter(Boolean)

  return dedupeTechnologies(reconciled as string[])
}

const initialLocalized: LocalizedField = { uz: "", ru: "", en: "" }

const initialState: FormState = {
  category: "real",
  previewType: "desktop",
  name: { ...initialLocalized },
  url: "",
  playStoreUrl: "",
  appStoreUrl: "",
  youtubeUrl: "",
  img: "",
  imagePublicId: "",
  additionalImages: [],
  technologies: [],
  description: { ...initialLocalized },
  badge: { ...initialLocalized },
  github: "",
  admin: "",
}

function toLocalized(value?: LocalizedField | null, fallback = ""): LocalizedField {
  return {
    uz: value?.uz ?? fallback,
    ru: value?.ru ?? "",
    en: value?.en ?? "",
  }
}

function resolveImageSrc(src: string) {
  if (!src) return "/placeholder.jpg"
  if (
    src.startsWith("http://") ||
    src.startsWith("https://") ||
    src.startsWith("/") ||
    src.startsWith("blob:") ||
    src.startsWith("data:")
  ) {
    return src
  }
  return `/${src}`
}

export default function EditAdminProjectPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const projectId = useMemo(() => Number(params?.id ?? 0), [params])

  const [form, setForm] = useState<FormState>(initialState)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState("")
  const [selectedAdditionalImageFiles, setSelectedAdditionalImageFiles] = useState<File[]>([])
  const [additionalPreviewUrls, setAdditionalPreviewUrls] = useState<string[]>([])
  const additionalPreviewUrlsRef = useRef<string[]>([])
  const [error, setError] = useState("")
  const [uploadMessage, setUploadMessage] = useState("")
  const [skills, setSkills] = useState<SkillOption[]>([])
  const [skillsLoading, setSkillsLoading] = useState(true)
  const [skillsError, setSkillsError] = useState("")

  const projectNameForUpload = form.name.uz.trim() || form.name.en.trim() || form.name.ru.trim()
  const previewImage = resolveImageSrc(localPreviewUrl || form.img)
  const selectedTechSet = useMemo(
    () => new Set(form.technologies.map((tech) => normalizeTechnologyName(tech))),
    [form.technologies],
  )

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl)
    }
  }, [localPreviewUrl])

  useEffect(() => {
    additionalPreviewUrlsRef.current = additionalPreviewUrls
  }, [additionalPreviewUrls])

  useEffect(() => {
    return () => {
      for (const previewUrl of additionalPreviewUrlsRef.current) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [])

  function setLocalizedField(field: "name" | "description" | "badge", lang: keyof LocalizedField, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        [lang]: value,
      },
    }))
  }

  useEffect(() => {
    let isMounted = true

    async function loadSkills() {
      setSkillsLoading(true)
      setSkillsError("")
      try {
        const response = await fetch("/api/skills", { cache: "no-store" })
        const payload = await response.json()
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "Skills yuklab bo'lmadi.")
        }

        if (isMounted) {
          setSkills(payload.skills ?? [])
        }
      } catch (loadError) {
        if (isMounted) {
          setSkillsError(loadError instanceof Error ? loadError.message : "Skills yuklashda xatolik.")
        }
      } finally {
        if (isMounted) {
          setSkillsLoading(false)
        }
      }
    }

    loadSkills()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    async function loadProject() {
      if (!projectId || Number.isNaN(projectId)) {
        setError("Invalid project id.")
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/projects/${projectId}`, { cache: "no-store" })
        const payload = await res.json()
        if (!res.ok || !payload?.success || !payload?.project) {
          throw new Error(payload?.message || "Project topilmadi.")
        }

        const project = payload.project
        setForm({
          category: project.category,
          previewType: project.previewType === "mobile" ? "mobile" : "desktop",
          name: toLocalized(project.nameI18n, project.name),
          url: project.url,
          playStoreUrl: String(project.playStoreUrl ?? ""),
          appStoreUrl: String(project.appStoreUrl ?? ""),
          youtubeUrl: String(project.youtubeUrl ?? ""),
          img: project.img,
          imagePublicId: project.imagePublicId ?? "",
          additionalImages: Array.isArray(project.additionalImages)
            ? project.additionalImages
                .map((item: unknown) => {
                  if (!item || typeof item !== "object") return null
                  const source = item as Record<string, unknown>
                  const url = String(source.url ?? "").trim()
                  if (!url) return null
                  const publicIdRaw = String(source.publicId ?? "").trim()
                  return {
                    url,
                    publicId: publicIdRaw || null,
                  } satisfies AdditionalImage
                })
                .filter((item: AdditionalImage | null): item is AdditionalImage => Boolean(item))
            : [],
          technologies: Array.isArray(project.technologies)
            ? dedupeTechnologies(project.technologies.map((tech: unknown) => String(tech).trim()).filter(Boolean))
            : [],
          description: toLocalized(project.descriptionI18n, project.description),
          badge: toLocalized(project.badgeI18n, project.badge ?? ""),
          github: project.github ?? "",
          admin: project.admin ?? "",
        })
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "Projectni yuklab bo'lmadi.")
      } finally {
        setIsLoading(false)
      }
    }

    loadProject()
  }, [projectId])

  useEffect(() => {
    if (skills.length === 0) return

    setForm((prev) => {
      const normalized = reconcileTechnologiesWithSkills(prev.technologies, skills)
      const isSame =
        normalized.length === prev.technologies.length &&
        normalized.every((value, index) => value === prev.technologies[index])

      if (isSame) return prev
      return { ...prev, technologies: normalized }
    })
  }, [skills])

  function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl)

    const previewUrl = URL.createObjectURL(file)
    setSelectedImageFile(file)
    setLocalPreviewUrl(previewUrl)
    setUploadMessage("Yangi rasm tanlandi. Saqlanganda upload bo'ladi.")
  }

  function handleAdditionalImagesSelect(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    if (files.length === 0) return

    const nextPreviewUrls = files.map((file) => URL.createObjectURL(file))
    setSelectedAdditionalImageFiles((prev) => [...prev, ...files])
    setAdditionalPreviewUrls((prev) => [...prev, ...nextPreviewUrls])
    event.target.value = ""
    setUploadMessage("Qo'shimcha rasmlar tanlandi. Saqlaganda upload bo'ladi.")
  }

  function removePendingAdditionalImageAt(index: number) {
    setSelectedAdditionalImageFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
    setAdditionalPreviewUrls((prev) => {
      const target = prev[index]
      if (target) URL.revokeObjectURL(target)
      return prev.filter((_, itemIndex) => itemIndex !== index)
    })
  }

  function removeExistingAdditionalImageAt(index: number) {
    setForm((prev) => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, itemIndex) => itemIndex !== index),
    }))
  }

  function buildPayload(overrides?: { img?: string; imagePublicId?: string; additionalImages?: AdditionalImage[] }) {
    const syncedTechnologies = reconcileTechnologiesWithSkills(form.technologies, skills)

    return {
      category: form.category,
      previewType: form.previewType,
      url: form.url,
      playStoreUrl: form.playStoreUrl,
      appStoreUrl: form.appStoreUrl,
      youtubeUrl: form.youtubeUrl,
      img: overrides?.img ?? form.img,
      imagePublicId: overrides?.imagePublicId ?? form.imagePublicId,
      additionalImages: overrides?.additionalImages ?? form.additionalImages,
      technologies: syncedTechnologies,
      github: form.github,
      admin: form.admin,
      nameI18n: form.name,
      descriptionI18n: form.description,
      badgeI18n: form.badge,
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError("")
    setUploadMessage("")

    try {
      if (form.technologies.length === 0) {
        throw new Error("Kamida bitta technology tanlang.")
      }

      let img = form.img
      let imagePublicId = form.imagePublicId

      if (selectedImageFile) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", selectedImageFile)
        uploadFormData.append("projectName", projectNameForUpload)
        uploadFormData.append("projectId", String(projectId))

        const uploadResponse = await fetch("/api/uploads/project-image", {
          method: "POST",
          body: uploadFormData,
        })
        const uploadPayload = await uploadResponse.json()

        if (!uploadResponse.ok || !uploadPayload?.success || !uploadPayload?.imageUrl) {
          throw new Error(uploadPayload?.message || "Rasm upload xatoligi.")
        }

        img = uploadPayload.imageUrl
        imagePublicId = uploadPayload.publicId ?? ""
      }

      const additionalImages: AdditionalImage[] = [...form.additionalImages]
      if (selectedAdditionalImageFiles.length > 0) {
        for (const additionalFile of selectedAdditionalImageFiles) {
          const uploadFormData = new FormData()
          uploadFormData.append("file", additionalFile)
          uploadFormData.append("projectName", projectNameForUpload)
          uploadFormData.append("projectId", String(projectId))

          const uploadResponse = await fetch("/api/uploads/project-image", {
            method: "POST",
            body: uploadFormData,
          })
          const uploadPayload = await uploadResponse.json()

          if (!uploadResponse.ok || !uploadPayload?.success || !uploadPayload?.imageUrl) {
            throw new Error(uploadPayload?.message || "Qo'shimcha rasm upload xatoligi.")
          }

          additionalImages.push({
            url: String(uploadPayload.imageUrl),
            publicId: String(uploadPayload.publicId ?? "") || null,
          })
        }
      }

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload({ img, imagePublicId, additionalImages })),
      })

      const payload = await response.json()
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Projectni yangilashda xatolik bo'ldi.")
      }

      router.push("/admin/projects")
      router.refresh()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Noma'lum xatolik yuz berdi.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function toggleTechnology(techName: string) {
    setForm((prev) => {
      const normalizedTechName = normalizeTechnologyName(techName)
      const exists = prev.technologies.some((tech) => normalizeTechnologyName(tech) === normalizedTechName)
      if (exists) {
        return {
          ...prev,
          technologies: prev.technologies.filter((tech) => normalizeTechnologyName(tech) !== normalizedTechName),
        }
      }
      return { ...prev, technologies: dedupeTechnologies([...prev.technologies, techName]) }
    })
  }

  if (isLoading) {
    return <section className="p-4 text-sm text-muted-foreground">Loading project...</section>
  }

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Projectni tahrirlash</h1>
        <Link
          href="/admin/projects"
          className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Orqaga
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4 rounded-2xl border border-border bg-card/30 p-5">
        <label className="grid gap-2">
          <span className="text-sm font-medium">Category</span>
          <select
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as "real" | "personal" }))}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="real">Real</option>
            <option value="personal">Personal</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Preview Type</span>
          <select
            value={form.previewType}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, previewType: e.target.value as "desktop" | "mobile" }))
            }
            className="rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="desktop">Desktop (MacBook frame)</option>
            <option value="mobile">Mobile (Phone frame)</option>
          </select>
        </label>

        <div className="grid gap-2">
          <span className="text-sm font-medium">Project name (UZ/RU/EN)</span>
          <div className="grid gap-3 md:grid-cols-3">
            <input required value={form.name.uz} onChange={(e) => setLocalizedField("name", "uz", e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Nomi (UZ)" />
            <input value={form.name.ru} onChange={(e) => setLocalizedField("name", "ru", e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Название (RU)" />
            <input value={form.name.en} onChange={(e) => setLocalizedField("name", "en", e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Name (EN)" />
          </div>
        </div>

        {form.previewType === "mobile" ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Play Market URL</span>
              <input
                type="url"
                value={form.playStoreUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, playStoreUrl: e.target.value }))}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="https://play.google.com/store/apps/details?id=..."
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">App Store URL</span>
              <input
                type="url"
                value={form.appStoreUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, appStoreUrl: e.target.value }))}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="https://apps.apple.com/app/..."
              />
            </label>
          </div>
        ) : (
          <label className="grid gap-2">
            <span className="text-sm font-medium">Project URL</span>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
              className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              placeholder="https://example.com (optional)"
            />
          </label>
        )}

        <label className="grid gap-2">
          <span className="text-sm font-medium">Project image (Cloudinary)</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
          />
          {previewImage ? (
            <img src={previewImage} alt="Project preview" className="h-24 w-40 rounded-md border border-border object-cover" />
          ) : null}
          {uploadMessage ? <p className="text-xs text-muted-foreground">{uploadMessage}</p> : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Additional images (optional)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleAdditionalImagesSelect}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
          />

          {form.additionalImages.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {form.additionalImages.map((image, index) => (
                <div key={`${image.url}-${index}`} className="space-y-2">
                  <img
                    src={resolveImageSrc(image.url)}
                    alt={`Additional image ${index + 1}`}
                    className="h-24 w-full rounded-md border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingAdditionalImageAt(index)}
                    className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    Olib tashlash
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {additionalPreviewUrls.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {additionalPreviewUrls.map((previewUrl, index) => (
                <div key={`${previewUrl}-${index}`} className="space-y-2">
                  <img src={previewUrl} alt={`New additional image ${index + 1}`} className="h-24 w-full rounded-md border border-border object-cover" />
                  <button
                    type="button"
                    onClick={() => removePendingAdditionalImageAt(index)}
                    className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                  >
                    Olib tashlash
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Technologies (skills dan tanlang)</span>
          {skillsLoading ? <p className="text-sm text-muted-foreground">Skills yuklanmoqda...</p> : null}
          {skillsError ? <p className="text-sm text-red-400">{skillsError}</p> : null}

          {!skillsLoading && skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const isSelected = selectedTechSet.has(normalizeTechnologyName(skill.name))
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => toggleTechnology(skill.name)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/15 text-primary"
                        : "border-border bg-background text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {skill.name}
                  </button>
                )
              })}
            </div>
          ) : null}

          {!skillsLoading && skills.length === 0 && !skillsError ? (
            <p className="text-sm text-muted-foreground">Skill topilmadi. Avval `admin/skills` da skill qo&apos;shing.</p>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Tanlandi: {form.technologies.length > 0 ? form.technologies.join(", ") : "hech narsa tanlanmagan"}
          </p>
        </label>

        <div className="grid gap-2">
          <span className="text-sm font-medium">Description (UZ/RU/EN)</span>
          <div className="grid gap-3 md:grid-cols-3">
            <textarea required rows={5} value={form.description.uz} onChange={(e) => setLocalizedField("description", "uz", e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Tavsif (UZ)" />
            <textarea rows={5} value={form.description.ru} onChange={(e) => setLocalizedField("description", "ru", e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Описание (RU)" />
            <textarea rows={5} value={form.description.en} onChange={(e) => setLocalizedField("description", "en", e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Description (EN)" />
          </div>
        </div>

        <div className="grid gap-2">
          <span className="text-sm font-medium">Badge (optional, UZ/RU/EN)</span>
          <div className="grid gap-3 md:grid-cols-3">
            <input value={form.badge.uz} onChange={(e) => setLocalizedField("badge", "uz", e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Badge (UZ)" />
            <input value={form.badge.ru} onChange={(e) => setLocalizedField("badge", "ru", e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Badge (RU)" />
            <input value={form.badge.en} onChange={(e) => setLocalizedField("badge", "en", e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Badge (EN)" />
          </div>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">YouTube URL (optional)</span>
          <input type="url" value={form.youtubeUrl} onChange={(e) => setForm((prev) => ({ ...prev, youtubeUrl: e.target.value }))} className="rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="https://youtube.com/watch?v=..." />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Github URL (optional)</span>
          <input type="url" value={form.github} onChange={(e) => setForm((prev) => ({ ...prev, github: e.target.value }))} className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Admin URL (optional)</span>
          <input type="url" value={form.admin} onChange={(e) => setForm((prev) => ({ ...prev, admin: e.target.value }))} className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
        </label>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">
          {isSubmitting ? "Saqlanmoqda..." : "Yangilash"}
        </button>
      </form>
    </section>
  )
}

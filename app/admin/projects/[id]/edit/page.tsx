"use client"

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react"
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
  img: string
  imagePublicId: string
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

const initialLocalized: LocalizedField = { uz: "", ru: "", en: "" }

const initialState: FormState = {
  category: "real",
  previewType: "desktop",
  name: { ...initialLocalized },
  url: "",
  img: "",
  imagePublicId: "",
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

export default function EditAdminProjectPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const projectId = useMemo(() => Number(params?.id ?? 0), [params])

  const [form, setForm] = useState<FormState>(initialState)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [localPreviewUrl, setLocalPreviewUrl] = useState("")
  const [error, setError] = useState("")
  const [uploadMessage, setUploadMessage] = useState("")
  const [skills, setSkills] = useState<SkillOption[]>([])
  const [skillsLoading, setSkillsLoading] = useState(true)
  const [skillsError, setSkillsError] = useState("")

  const projectNameForUpload = form.name.uz.trim() || form.name.en.trim() || form.name.ru.trim()
  const previewImage = localPreviewUrl || form.img

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl)
    }
  }, [localPreviewUrl])

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
          img: project.img,
          imagePublicId: project.imagePublicId ?? "",
          technologies: Array.isArray(project.technologies)
            ? project.technologies.map((tech: unknown) => String(tech).trim()).filter(Boolean)
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

  function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl)

    const previewUrl = URL.createObjectURL(file)
    setSelectedImageFile(file)
    setLocalPreviewUrl(previewUrl)
    setUploadMessage("Yangi rasm tanlandi. Saqlanganda upload bo'ladi.")
  }

  function buildPayload(overrides?: { img?: string; imagePublicId?: string }) {
    return {
      category: form.category,
      previewType: form.previewType,
      url: form.url,
      img: overrides?.img ?? form.img,
      imagePublicId: overrides?.imagePublicId ?? form.imagePublicId,
      technologies: form.technologies,
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

      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload({ img, imagePublicId })),
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
      const exists = prev.technologies.includes(techName)
      if (exists) {
        return { ...prev, technologies: prev.technologies.filter((tech) => tech !== techName) }
      }
      return { ...prev, technologies: [...prev.technologies, techName] }
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

        <label className="grid gap-2">
          <span className="text-sm font-medium">Project URL</span>
          <input type="url" value={form.url} onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))} className="rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="https://example.com (optional)" />
        </label>

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
          <span className="text-sm font-medium">Technologies (skills dan tanlang)</span>
          {skillsLoading ? <p className="text-sm text-muted-foreground">Skills yuklanmoqda...</p> : null}
          {skillsError ? <p className="text-sm text-red-400">{skillsError}</p> : null}

          {!skillsLoading && skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => {
                const isSelected = form.technologies.includes(skill.name)
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

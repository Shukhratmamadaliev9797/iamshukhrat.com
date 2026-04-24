"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SKILL_CATEGORIES, SkillCategory } from "@/lib/skills-categories"

type Skill = {
  id: number
  name: string
  img: string
  imagePublicId?: string | null
  category: SkillCategory
}

type Mode = "create" | "edit"

function resolveImageSrc(src: string) {
  if (!src) return "/placeholder.svg"
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src
  return `/${src}`
}

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("create")
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [name, setName] = useState("")
  const [category, setCategory] = useState<SkillCategory>("OTHERS")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const previewImageSrc = useMemo(() => {
    if (localPreview) return localPreview
    if (editingSkill?.img) return resolveImageSrc(editingSkill.img)
    return ""
  }, [editingSkill?.img, localPreview])

  const groupedSkills = useMemo(() => {
    return SKILL_CATEGORIES.map((categoryItem) => ({
      category: categoryItem,
      skills: skills.filter((skill) => skill.category === categoryItem),
    })).filter((group) => group.skills.length > 0)
  }, [skills])

  async function loadSkills() {
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/skills", { cache: "no-store" })
      const payload = await res.json()
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Skills yuklab bo'lmadi.")
      }
      setSkills(payload.skills ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noma'lum xatolik")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSkills()
  }, [])

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview)
    }
  }, [localPreview])

  function openCreateModal() {
    setMode("create")
    setEditingSkill(null)
    setName("")
    setCategory("OTHERS")
    if (localPreview) URL.revokeObjectURL(localPreview)
    setLocalPreview("")
    setSelectedImage(null)
    setMessage("")
    setError("")
    setModalOpen(true)
  }

  function openEditModal(skill: Skill) {
    setMode("edit")
    setEditingSkill(skill)
    setName(skill.name)
    setCategory(skill.category)
    if (localPreview) URL.revokeObjectURL(localPreview)
    setLocalPreview("")
    setSelectedImage(null)
    setMessage("")
    setError("")
    setModalOpen(true)
  }

  function onSelectImage(file: File | null) {
    if (!file) return
    if (localPreview) URL.revokeObjectURL(localPreview)
    setSelectedImage(file)
    setLocalPreview(URL.createObjectURL(file))
    setMessage("Rasm tanlandi. Saqlaganda Cloudinary'ga yuklanadi.")
  }

  async function uploadSkillImage(skillId: number, skillName: string, file: File) {
    const fd = new FormData()
    fd.append("file", file)
    fd.append("skillName", skillName)
    fd.append("skillId", String(skillId))

    const uploadRes = await fetch("/api/uploads/skill-image", {
      method: "POST",
      body: fd,
    })
    const uploadPayload = await uploadRes.json()
    if (!uploadRes.ok || !uploadPayload?.success || !uploadPayload?.imageUrl) {
      throw new Error(uploadPayload?.message || "Rasm upload xatoligi.")
    }

    return {
      imageUrl: String(uploadPayload.imageUrl),
      publicId: String(uploadPayload.publicId ?? ""),
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")
    setMessage("")

    try {
      const trimmedName = name.trim()
      if (!trimmedName) throw new Error("Skill nomi kiritilishi shart.")

      if (mode === "create") {
        const createRes = await fetch("/api/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            img: "/placeholder.svg",
            imagePublicId: "",
            category,
          }),
        })
        const createPayload = await createRes.json()
        if (!createRes.ok || !createPayload?.success || !createPayload?.skill?.id) {
          throw new Error(createPayload?.message || "Skill yaratishda xatolik bo'ldi.")
        }

        const createdId = Number(createPayload.skill.id)
        if (selectedImage) {
          const uploaded = await uploadSkillImage(createdId, trimmedName, selectedImage)
          const patchRes = await fetch(`/api/skills/${createdId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: trimmedName,
              img: uploaded.imageUrl,
              imagePublicId: uploaded.publicId,
              category,
            }),
          })
          const patchPayload = await patchRes.json()
          if (!patchRes.ok || !patchPayload?.success) {
            throw new Error(patchPayload?.message || "Skill image update xatoligi.")
          }
        }
      } else {
        if (!editingSkill) throw new Error("Editing skill topilmadi.")

        let img = editingSkill.img
        let imagePublicId = editingSkill.imagePublicId ?? ""

        if (selectedImage) {
          const uploaded = await uploadSkillImage(editingSkill.id, trimmedName, selectedImage)
          img = uploaded.imageUrl
          imagePublicId = uploaded.publicId
        }

        const patchRes = await fetch(`/api/skills/${editingSkill.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: trimmedName,
            img,
            imagePublicId,
            category,
          }),
        })
        const patchPayload = await patchRes.json()
        if (!patchRes.ok || !patchPayload?.success) {
          throw new Error(patchPayload?.message || "Skillni yangilashda xatolik bo'ldi.")
        }
      }

      setModalOpen(false)
      await loadSkills()
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Noma'lum xatolik")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(skill: Skill) {
    const confirmed = window.confirm(`"${skill.name}" skillini o'chirasizmi?`)
    if (!confirmed) return

    try {
      const res = await fetch(`/api/skills/${skill.id}`, { method: "DELETE" })
      const payload = await res.json()
      if (!res.ok || !payload?.success) throw new Error(payload?.message || "Delete xatosi.")
      await loadSkills()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Delete xatoligi.")
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Skills</h1>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Yangi skill qo&apos;shish
        </button>
      </div>

      <p className="text-muted-foreground">Skills listini shu yerda boshqarasiz: create, edit, delete.</p>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {loading ? (
        <div className="rounded-xl border border-border bg-card/30 p-6 text-sm text-muted-foreground">Loading...</div>
      ) : groupedSkills.length === 0 ? (
        <div className="rounded-xl border border-border bg-card/30 p-6 text-sm text-muted-foreground">
          Hozircha skill topilmadi.
        </div>
      ) : (
        <div className="space-y-6">
          {groupedSkills.map((group) => (
            <section key={group.category} className="space-y-3">
              <h2 className="text-lg md:text-xl font-semibold tracking-wide">{group.category}</h2>
              <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
                {group.skills.map((skill) => (
                  <article key={skill.id} className="group mx-auto w-full max-w-[140px]">
                    <div className="relative aspect-square w-full rounded-3xl glass-card overflow-hidden p-3 md:p-4 flex items-center justify-center transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10">
                      <img src={resolveImageSrc(skill.img)} alt={skill.name} className="h-14 w-14 md:h-16 md:w-16 object-cover" />

                      <div className="pointer-events-none absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => openEditModal(skill)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background"
                          aria-label={`${skill.name} ni tahrirlash`}
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(skill)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25"
                          aria-label={`${skill.name} ni o'chirish`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="mt-2 text-center text-xs md:text-sm text-muted-foreground line-clamp-2">{skill.name}</h3>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Yangi skill qo'shish" : "Skillni tahrirlash"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Skill nomi</span>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="React"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SkillCategory)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {SKILL_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">Rasm</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onSelectImage(e.target.files?.[0] ?? null)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
              />
            </label>

            {previewImageSrc ? (
              <img
                src={previewImageSrc}
                alt="Skill preview"
                className="h-20 w-20 rounded-lg border border-border object-cover"
              />
            ) : null}

            {message ? <p className="text-xs text-muted-foreground">{message}</p> : null}
            {error ? <p className="text-sm text-red-400">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {isSubmitting ? "Saqlanmoqda..." : mode === "create" ? "Skillni yaratish" : "Skillni yangilash"}
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}

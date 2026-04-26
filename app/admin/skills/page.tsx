"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  FRONTEND_SKILL_SUBCATEGORIES,
  getDefaultSkillSubcategory,
  getSkillCategoryLabel,
  getSkillSubcategoryLabel,
  normalizeSkillCategory,
  normalizeSkillSubcategory,
  SKILL_CATEGORIES,
  SkillCategory,
  SkillSubcategory,
} from "@/lib/skills-categories"

type Skill = {
  id: number
  name: string
  nameI18n?: {
    uz: string
    ru: string
    en: string
  } | null
  img: string
  imagePublicId?: string | null
  category: SkillCategory
  subcategory: SkillSubcategory | null
}

type Mode = "create" | "edit"

function resolveImageSrc(src: string) {
  if (!src) return "/placeholder.svg"
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src
  return `/${src}`
}

export default function AdminSkillsPage() {
  const emptyNameI18n = { uz: "", ru: "", en: "" }
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [isReordering, setIsReordering] = useState(false)
  const [draggingSkillId, setDraggingSkillId] = useState<number | null>(null)
  const [dropTargetSkillId, setDropTargetSkillId] = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("create")
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [name, setName] = useState("")
  const [nameI18n, setNameI18n] = useState(emptyNameI18n)
  const [category, setCategory] = useState<SkillCategory>("BACKEND_ENGINEERING")
  const [subcategory, setSubcategory] = useState<SkillSubcategory | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [localPreview, setLocalPreview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const isArchitectureCategory = category === "ARCHITECTURE_PRACTICES"

  function getPrimaryNameFromI18n(value: { uz: string; ru: string; en: string }) {
    return value.uz.trim() || value.en.trim() || value.ru.trim()
  }

  const previewImageSrc = useMemo(() => {
    if (localPreview) return localPreview
    if (editingSkill?.img) return resolveImageSrc(editingSkill.img)
    return ""
  }, [editingSkill?.img, localPreview])

  const groupedSkills = useMemo(() => {
    return SKILL_CATEGORIES.map((categoryItem) => {
      const categorySkills = skills.filter((skill) => skill.category === categoryItem)
      if (categoryItem !== "FRONTEND_ENGINEERING") {
        return { category: categoryItem, groups: [{ key: categoryItem, label: null, skills: categorySkills }] }
      }

      const frontendGroups = FRONTEND_SKILL_SUBCATEGORIES.map((subcategoryItem) => ({
        key: subcategoryItem,
        label: getSkillSubcategoryLabel(subcategoryItem),
        skills: categorySkills.filter((skill) => skill.subcategory === subcategoryItem),
      })).filter((group) => group.skills.length > 0)

      return { category: categoryItem, groups: frontendGroups }
    }).filter((group) => group.groups.length > 0)
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

      const normalized = (payload.skills ?? []).map((skill: Partial<Skill>) => {
        const normalizedCategory = normalizeSkillCategory(skill.category)
        const normalizedNameI18n = {
          uz: String(skill.nameI18n?.uz ?? "").trim(),
          ru: String(skill.nameI18n?.ru ?? "").trim(),
          en: String(skill.nameI18n?.en ?? "").trim(),
        }
        const hasNameI18n = Boolean(normalizedNameI18n.uz || normalizedNameI18n.ru || normalizedNameI18n.en)
        return {
          id: Number(skill.id),
          name: String(skill.name ?? ""),
          nameI18n: hasNameI18n ? normalizedNameI18n : null,
          img: String(skill.img ?? "/placeholder.svg"),
          imagePublicId: skill.imagePublicId ?? null,
          category: normalizedCategory,
          subcategory: normalizeSkillSubcategory(skill.subcategory, normalizedCategory),
        } satisfies Skill
      })

      setSkills(normalized)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Noma'lum xatolik")
    } finally {
      setLoading(false)
    }
  }

  async function saveOrder(updatedSkills: Skill[]) {
    setIsReordering(true)
    try {
      const response = await fetch("/api/skills/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: updatedSkills.map((skill) => skill.id) }),
      })
      const payload = await response.json()
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Tartibni saqlab bo'lmadi.")
      }
    } catch (reorderError) {
      setError(reorderError instanceof Error ? reorderError.message : "Tartibni saqlashda xatolik.")
      await loadSkills()
    } finally {
      setIsReordering(false)
    }
  }

  function reorderSkillsWithinGroup(currentSkills: Skill[], draggedId: number, targetId: number) {
    const draggedSkill = currentSkills.find((skill) => skill.id === draggedId)
    const targetSkill = currentSkills.find((skill) => skill.id === targetId)
    if (!draggedSkill || !targetSkill) return currentSkills

    if (draggedSkill.category !== targetSkill.category) return currentSkills
    if ((draggedSkill.subcategory ?? null) !== (targetSkill.subcategory ?? null)) return currentSkills

    const groupSkills = currentSkills.filter(
      (skill) =>
        skill.category === draggedSkill.category &&
        (skill.subcategory ?? null) === (draggedSkill.subcategory ?? null),
    )

    const fromIndex = groupSkills.findIndex((skill) => skill.id === draggedId)
    const toIndex = groupSkills.findIndex((skill) => skill.id === targetId)
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return currentSkills

    const reorderedGroupSkills = [...groupSkills]
    const [moved] = reorderedGroupSkills.splice(fromIndex, 1)
    reorderedGroupSkills.splice(toIndex, 0, moved)

    let pointer = 0
    return currentSkills.map((skill) => {
      if (
        skill.category !== draggedSkill.category ||
        (skill.subcategory ?? null) !== (draggedSkill.subcategory ?? null)
      ) {
        return skill
      }

      const replacement = reorderedGroupSkills[pointer]
      pointer += 1
      return replacement
    })
  }

  async function handleDrop(targetSkillId: number) {
    if (draggingSkillId === null || draggingSkillId === targetSkillId) {
      setDraggingSkillId(null)
      setDropTargetSkillId(null)
      return
    }

    const reordered = reorderSkillsWithinGroup(skills, draggingSkillId, targetSkillId)
    if (reordered === skills) {
      setDraggingSkillId(null)
      setDropTargetSkillId(null)
      return
    }

    setSkills(reordered)
    setDraggingSkillId(null)
    setDropTargetSkillId(null)
    await saveOrder(reordered)
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
    setNameI18n(emptyNameI18n)
    setCategory("BACKEND_ENGINEERING")
    setSubcategory(null)
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
    setNameI18n({
      uz: String(skill.nameI18n?.uz ?? ""),
      ru: String(skill.nameI18n?.ru ?? ""),
      en: String(skill.nameI18n?.en ?? ""),
    })
    setCategory(skill.category)
    setSubcategory(skill.subcategory)
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
      const normalizedNameI18n = {
        uz: nameI18n.uz.trim(),
        ru: nameI18n.ru.trim(),
        en: nameI18n.en.trim(),
      }
      const trimmedName = name.trim()
      const nameForSave = isArchitectureCategory ? getPrimaryNameFromI18n(normalizedNameI18n) : trimmedName
      const nameI18nForSave = isArchitectureCategory
        ? normalizedNameI18n.uz || normalizedNameI18n.ru || normalizedNameI18n.en
          ? normalizedNameI18n
          : null
        : null

      if (!nameForSave) throw new Error("Skill nomi kiritilishi shart.")

      if (mode === "create") {
        const createRes = await fetch("/api/skills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameForSave,
            nameI18n: nameI18nForSave,
            img: "/placeholder.svg",
            imagePublicId: "",
            category,
            subcategory,
          }),
        })
        const createPayload = await createRes.json()
        if (!createRes.ok || !createPayload?.success || !createPayload?.skill?.id) {
          throw new Error(createPayload?.message || "Skill yaratishda xatolik bo'ldi.")
        }

        const createdId = Number(createPayload.skill.id)
        if (selectedImage && !isArchitectureCategory) {
          const uploaded = await uploadSkillImage(createdId, nameForSave, selectedImage)
          const patchRes = await fetch(`/api/skills/${createdId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: nameForSave,
              nameI18n: nameI18nForSave,
              img: uploaded.imageUrl,
              imagePublicId: uploaded.publicId,
              category,
              subcategory,
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

        if (selectedImage && !isArchitectureCategory) {
          const uploaded = await uploadSkillImage(editingSkill.id, nameForSave, selectedImage)
          img = uploaded.imageUrl
          imagePublicId = uploaded.publicId
        }

        const patchRes = await fetch(`/api/skills/${editingSkill.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: nameForSave,
            nameI18n: nameI18nForSave,
            img,
            imagePublicId,
            category,
            subcategory,
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

  function renderSkillCard(skill: Skill) {
    return (
      <article
        key={skill.id}
        draggable
        onDragStart={() => setDraggingSkillId(skill.id)}
        onDragEnd={() => {
          setDraggingSkillId(null)
          setDropTargetSkillId(null)
        }}
        onDragOver={(event) => {
          event.preventDefault()
          if (draggingSkillId !== skill.id) {
            setDropTargetSkillId(skill.id)
          }
        }}
        onDrop={(event) => {
          event.preventDefault()
          void handleDrop(skill.id)
        }}
        className={`group mx-auto w-full max-w-[140px] cursor-grab active:cursor-grabbing ${draggingSkillId === skill.id ? "opacity-60" : ""}`}
      >
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-3xl glass-card p-3 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/10 md:p-4">
          {dropTargetSkillId === skill.id && draggingSkillId !== skill.id ? (
            <div className="absolute inset-0 z-20 rounded-3xl border-2 border-dashed border-primary/70 bg-primary/10" />
          ) : null}

          <img src={resolveImageSrc(skill.img)} alt={skill.name} className="h-14 w-14 object-cover md:h-16 md:w-16" />

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
        <h3 className="mt-2 line-clamp-2 text-center text-xs text-muted-foreground md:text-sm">{skill.name}</h3>
      </article>
    )
  }

  function renderTextSkillItem(skill: Skill) {
    return (
      <li key={skill.id} className="flex items-center justify-between rounded-md border border-border bg-card/30 px-3 py-2">
        <span className="text-sm text-foreground">• {skill.name}</span>
        <span className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => openEditModal(skill)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background"
            aria-label={`${skill.name} ni tahrirlash`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(skill)}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-500/15 text-red-400 hover:bg-red-500/25"
            aria-label={`${skill.name} ni o'chirish`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </span>
      </li>
    )
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

      {isReordering ? <p className="text-xs text-muted-foreground">Tartib saqlanmoqda...</p> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {loading ? (
        <div className="rounded-xl border border-border bg-card/30 p-6 text-sm text-muted-foreground">Loading...</div>
      ) : groupedSkills.length === 0 ? (
        <div className="rounded-xl border border-border bg-card/30 p-6 text-sm text-muted-foreground">Hozircha skill topilmadi.</div>
      ) : (
        <div className="space-y-6">
          {groupedSkills.map((group) => (
            <section key={group.category} className="space-y-3">
              <h2 className="text-lg font-semibold tracking-wide md:text-xl">{getSkillCategoryLabel(group.category)}</h2>

              <div className="space-y-4">
                {group.groups.map((subgroup) => (
                  <div key={subgroup.key} className="space-y-2">
                    {subgroup.label ? <h3 className="text-sm font-medium text-muted-foreground">{subgroup.label}</h3> : null}
                    {group.category === "ARCHITECTURE_PRACTICES" ? (
                      <ul className="space-y-2">{subgroup.skills.map((skill) => renderTextSkillItem(skill))}</ul>
                    ) : (
                      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7">
                        {subgroup.skills.map((skill) => renderSkillCard(skill))}
                      </div>
                    )}
                  </div>
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
              <span className="text-sm font-medium">Category</span>
              <select
                value={category}
                onChange={(e) => {
                  const nextCategory = e.target.value as SkillCategory
                  if (nextCategory === "ARCHITECTURE_PRACTICES" && !nameI18n.uz && !nameI18n.ru && !nameI18n.en && name.trim()) {
                    setNameI18n({ uz: name.trim(), ru: "", en: "" })
                  }
                  if (category === "ARCHITECTURE_PRACTICES" && nextCategory !== "ARCHITECTURE_PRACTICES") {
                    const fallbackName = getPrimaryNameFromI18n(nameI18n)
                    if (fallbackName) setName(fallbackName)
                  }
                  setCategory(nextCategory)
                  setSubcategory(getDefaultSkillSubcategory(nextCategory))
                  if (nextCategory === "ARCHITECTURE_PRACTICES") {
                    if (localPreview) URL.revokeObjectURL(localPreview)
                    setLocalPreview("")
                    setSelectedImage(null)
                    setMessage("")
                  }
                }}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm"
              >
                {SKILL_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {getSkillCategoryLabel(item)}
                  </option>
                ))}
              </select>
            </label>

            {isArchitectureCategory ? (
              <div className="grid gap-2">
                <span className="text-sm font-medium">Skill nomi (3 ta til)</span>
                <div className="grid gap-3 md:grid-cols-3">
                  <input
                    required
                    value={nameI18n.uz}
                    onChange={(e) => setNameI18n((prev) => ({ ...prev, uz: e.target.value }))}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Nomi (UZ)"
                  />
                  <input
                    value={nameI18n.ru}
                    onChange={(e) => setNameI18n((prev) => ({ ...prev, ru: e.target.value }))}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Название (RU)"
                  />
                  <input
                    value={nameI18n.en}
                    onChange={(e) => setNameI18n((prev) => ({ ...prev, en: e.target.value }))}
                    className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                    placeholder="Name (EN)"
                  />
                </div>
              </div>
            ) : (
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
            )}

            {category === "FRONTEND_ENGINEERING" ? (
              <label className="grid gap-2">
                <span className="text-sm font-medium">Frontend Subcategory</span>
                <select
                  value={subcategory ?? "CORE_TECHNOLOGIES"}
                  onChange={(e) => setSubcategory(e.target.value as SkillSubcategory)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                >
                  {FRONTEND_SKILL_SUBCATEGORIES.map((item) => (
                    <option key={item} value={item}>
                      {getSkillSubcategoryLabel(item)}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {!isArchitectureCategory ? (
              <label className="grid gap-2">
                <span className="text-sm font-medium">Rasm</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => onSelectImage(e.target.files?.[0] ?? null)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-primary-foreground"
                />
              </label>
            ) : null}

            {previewImageSrc ? <img src={previewImageSrc} alt="Skill preview" className="h-20 w-20 rounded-lg border border-border object-cover" /> : null}
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

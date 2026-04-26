"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { ExternalLink, Github } from "lucide-react"
import { MacbookFrame } from "@/components/macbook-frame"
import { PhoneFrame } from "@/components/phone-frame"
import { ProjectCardActions } from "@/components/admin/project-card-actions"
import type { GroupedProjects, ProjectCategory, ProjectRecord } from "@/lib/projects-db"

type Section = {
  title: "Real" | "Personal"
  category: ProjectCategory
  items: ProjectRecord[]
}

type SkillOption = {
  name: string
  img: string
}

function normalizeTechName(value: string) {
  return value.trim().toLowerCase()
}

function resolveImageSrc(src: string) {
  if (!src) return "/placeholder.jpg"
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src
  return `/${src}`
}

function AdminProjectCardContent({
  project,
  onDeleted,
  techImageMap,
}: {
  project: ProjectRecord
  onDeleted?: () => void
  techImageMap: Record<string, string>
}) {
  const isMobileByTech = project.technologies?.some((tech) =>
    ["react-native", "expo", "flutter", "swift", "kotlin", "android", "ios", "mobile"].includes(
      String(tech).toLowerCase(),
    ),
  )
  const isMobileProject = project.previewType ? project.previewType === "mobile" : isMobileByTech

  return (
    <article className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-12">
      <div className={`flex justify-center ${isMobileProject ? "" : "lg:justify-start"}`}>
        {isMobileProject ? (
          <PhoneFrame imageSrc={resolveImageSrc(project.img)} alt={project.name} />
        ) : (
          <MacbookFrame imageSrc={resolveImageSrc(project.img)} alt={project.name} />
        )}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl font-bold text-foreground md:text-2xl">{project.name}</h3>
          {project.badge ? (
            <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">{project.badge}</span>
          ) : null}
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted-foreground">
            {project.category.toUpperCase()}
          </span>
        </div>

        <p className="text-sm leading-relaxed text-muted-foreground">{project.description}</p>

        <div>
          <h4 className="mb-3 text-sm font-semibold text-foreground">Technologies</h4>
          <div className="flex flex-wrap gap-2">
            {project.technologies?.map((tech, index) => (
              <img
                key={`${project.id ?? project.name}-${tech}-${index}`}
                className="h-10 w-10 object-cover"
                src={techImageMap[normalizeTechName(tech)] ?? `${tech}.png`}
                alt={tech}
                loading="lazy"
                decoding="async"
                onError={(event) => {
                  const target = event.currentTarget
                  target.onerror = null
                  target.src = "/placeholder.jpg"
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          {project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
            >
              Live
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : null}

          {project.github ? (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-transparent px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
            >
              Github
              <Github className="h-4 w-4" />
            </a>
          ) : null}

          {project.id ? <ProjectCardActions projectId={project.id} onDeleted={onDeleted} /> : null}
        </div>
      </div>
    </article>
  )
}

function reorderProjects(items: ProjectRecord[], draggedId: number, targetId: number) {
  const fromIndex = items.findIndex((item) => item.id === draggedId)
  const toIndex = items.findIndex((item) => item.id === targetId)
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items

  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

export function ProjectsAdminClient({ initialProjects }: { initialProjects: GroupedProjects }) {
  const [projects, setProjects] = useState<GroupedProjects>(initialProjects)
  const [draggingProjectId, setDraggingProjectId] = useState<number | null>(null)
  const [draggingCategory, setDraggingCategory] = useState<ProjectCategory | null>(null)
  const [dropTargetProjectId, setDropTargetProjectId] = useState<number | null>(null)
  const [isReordering, setIsReordering] = useState(false)
  const [error, setError] = useState("")
  const [techImageMap, setTechImageMap] = useState<Record<string, string>>({})

  useEffect(() => {
    setProjects(initialProjects)
  }, [initialProjects])

  useEffect(() => {
    let isMounted = true

    async function loadSkillsMap() {
      try {
        const response = await fetch("/api/skills", { cache: "no-store" })
        if (!response.ok) return
        const payload = await response.json()
        const skills = Array.isArray(payload?.skills) ? (payload.skills as SkillOption[]) : []
        const map = skills.reduce<Record<string, string>>((accumulator, skill) => {
          const key = normalizeTechName(String(skill.name ?? ""))
          if (!key) return accumulator
          accumulator[key] = resolveImageSrc(String(skill.img ?? ""))
          return accumulator
        }, {})

        if (isMounted) {
          setTechImageMap(map)
        }
      } catch {
        // Ignore skills map fetch errors on admin page.
      }
    }

    loadSkillsMap()

    return () => {
      isMounted = false
    }
  }, [])

  const sections: Section[] = useMemo(
    () => [
      { title: "Real", category: "real", items: projects.real },
      { title: "Personal", category: "personal", items: projects.personal },
    ],
    [projects],
  )
  const totalProjects = projects.real.length + projects.personal.length

  async function saveOrder(category: ProjectCategory, ids: number[]) {
    setIsReordering(true)
    setError("")
    try {
      const response = await fetch("/api/projects/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, ids }),
      })
      const payload = await response.json()
      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Tartibni saqlab bo'lmadi.")
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Tartibni saqlashda xatolik.")
      setProjects(initialProjects)
    } finally {
      setIsReordering(false)
    }
  }

  async function handleDrop(targetProjectId: number, category: ProjectCategory) {
    if (draggingProjectId === null || draggingProjectId === targetProjectId || draggingCategory !== category) {
      setDraggingProjectId(null)
      setDraggingCategory(null)
      setDropTargetProjectId(null)
      return
    }

    const currentList = category === "real" ? projects.real : projects.personal
    const reordered = reorderProjects(currentList, draggingProjectId, targetProjectId)
    if (reordered === currentList) {
      setDraggingProjectId(null)
      setDraggingCategory(null)
      setDropTargetProjectId(null)
      return
    }

    const nextProjects =
      category === "real" ? { ...projects, real: reordered } : { ...projects, personal: reordered }
    setProjects(nextProjects)
    setDraggingProjectId(null)
    setDraggingCategory(null)
    setDropTargetProjectId(null)

    const ids = reordered.map((project) => Number(project.id)).filter((id) => Number.isInteger(id) && id > 0)
    await saveOrder(category, ids)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Link
          href="/admin/projects/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Yangi project qo&apos;shish
        </Link>
      </div>

      <p className="text-muted-foreground">
        Drag and drop orqali har bir category ichida projectlar tartibini o&apos;zgartirishingiz mumkin.
      </p>

      {isReordering ? <p className="text-xs text-muted-foreground">Tartib saqlanmoqda...</p> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {totalProjects === 0 ? (
        <div className="rounded-xl border border-border bg-card/30 p-6 text-sm text-muted-foreground">
          Hozircha project topilmadi.
        </div>
      ) : (
        <div className="space-y-16">
          {sections.map((section) => (
            <section key={section.title} className="space-y-10">
              <h2 className="text-3xl font-bold md:text-4xl">
                <span className="text-primary">{section.title}</span> <span className="text-foreground">Projects</span>
              </h2>

              {section.items.length === 0 ? (
                <p className="text-sm text-muted-foreground">{section.title} projects topilmadi.</p>
              ) : (
                <div className="space-y-16">
                  {section.items.map((project) => (
                    <div
                      key={`${project.category}-${project.id ?? project.name}`}
                      draggable
                      onDragStart={() => {
                        if (!project.id) return
                        setDraggingProjectId(project.id)
                        setDraggingCategory(section.category)
                      }}
                      onDragEnd={() => {
                        setDraggingProjectId(null)
                        setDraggingCategory(null)
                        setDropTargetProjectId(null)
                      }}
                      onDragOver={(event) => {
                        event.preventDefault()
                        if (draggingCategory === section.category && draggingProjectId !== project.id) {
                          setDropTargetProjectId(Number(project.id ?? 0))
                        }
                      }}
                      onDrop={(event) => {
                        event.preventDefault()
                        if (!project.id) return
                        void handleDrop(project.id, section.category)
                      }}
                      className={`cursor-grab active:cursor-grabbing ${
                        draggingProjectId === project.id ? "opacity-60" : "opacity-100"
                      }`}
                    >
                      {dropTargetProjectId === project.id && draggingProjectId !== project.id ? (
                        <div className="mb-4 rounded-xl border-2 border-dashed border-primary/70 bg-primary/10 p-2 text-xs text-primary">
                          Bu yerga tushirsangiz shu joyga ko&apos;chadi
                        </div>
                      ) : null}
                      <AdminProjectCardContent
                        project={project}
                        techImageMap={techImageMap}
                        onDeleted={() => {
                          setProjects((prev) => ({
                            ...prev,
                            [section.category]: prev[section.category].filter((item) => item.id !== project.id),
                          }))
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </section>
  )
}

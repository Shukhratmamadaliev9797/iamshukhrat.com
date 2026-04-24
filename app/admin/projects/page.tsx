import Link from "next/link"
import { ExternalLink, Github } from "lucide-react"
import { getProjectsGroupedFromDb, hasDatabaseConfig, type ProjectRecord } from "@/lib/projects-db"
import { ProjectCardActions } from "@/components/admin/project-card-actions"

function resolveImageSrc(src: string) {
  if (!src) return "/placeholder.svg"
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src
  return `/${src}`
}

async function getProjectsForAdmin(): Promise<ProjectRecord[]> {
  if (!hasDatabaseConfig()) return []

  try {
    const grouped = await getProjectsGroupedFromDb()
    return [...grouped.real, ...grouped.personal]
  } catch (error) {
    console.error("Failed loading projects for admin page:", error)
    return []
  }
}

export default async function AdminProjectsPage() {
  const projects = await getProjectsForAdmin()

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
        Manage your portfolio projects from this section: add, edit, reorder, and publish items.
      </p>

      {projects.length === 0 ? (
        <div className="rounded-xl border border-border bg-card/30 p-6 text-sm text-muted-foreground">
          Hozircha project topilmadi.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {projects.map((project) => (
            <article
              key={`${project.category}-${project.id ?? project.name}`}
              className="overflow-hidden rounded-xl border border-border bg-card/30"
            >
              <img
                src={resolveImageSrc(project.img)}
                alt={project.name}
                className="h-52 w-full border-b border-border object-cover object-top"
              />

              <div className="space-y-4 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-primary">{project.category}</p>
                    <h2 className="text-lg font-semibold">{project.name}</h2>
                  </div>
                  {project.badge ? (
                    <span className="rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary">
                      {project.badge}
                    </span>
                  ) : null}
                </div>

                <p className="line-clamp-3 text-sm text-muted-foreground">{project.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {project.technologies.slice(0, 8).map((tech) => (
                    <span
                      key={tech}
                      className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.url ? (
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-secondary"
                    >
                      Live
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                  {project.github ? (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-secondary"
                    >
                      Github
                      <Github className="h-3.5 w-3.5" />
                    </a>
                  ) : null}
                  {project.id ? <ProjectCardActions projectId={project.id} /> : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

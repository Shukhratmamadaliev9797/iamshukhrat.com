"use client"

import { useEffect, useState } from "react"
import { Apple, ExternalLink, Github, PlayCircle, Youtube } from "lucide-react"
import { MacbookFrame } from "@/components/macbook-frame"
import { PhoneFrame } from "@/components/phone-frame"
import { Navbar } from "@/components/navbar"

const techColors: Record<string, string> = {
  "React": "#61DAFB",
  "Redux": "#764ABC",
  "Sass": "#CC6699",
  "Bootstrap": "#7952B3",
  "Node.js": "#339933",
  "Express": "#000000",
  "MongoDB": "#47A248",
  "Stripe": "#008CDD",
  "AWS": "#FF9900",
  "Socket.io": "#010101",
  "Cloudinary": "#3448C5",
  "YouTube API": "#FF0000",
  "HTML": "#E34F26",
  "CSS": "#1572B6",
  "JavaScript": "#F7DF1E",
}

function TechBadge({ tech }: { tech: string }) {
  const color = techColors[tech] || "#888888"
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-transform hover:scale-110"
      style={{ backgroundColor: `${color}20`, color: color, border: `1px solid ${color}40` }}
      title={tech}
    >
      {tech.slice(0, 2).toUpperCase()}
    </span>
  )
}

interface Project {
  name: string
  url?: string
  playStoreUrl?: string
  appStoreUrl?: string
  youtubeUrl?: string
  img: string
  technologies: string[]
  description: string
  github?: string
  highlights?: string[]
  badge?: string
  previewType?: "desktop" | "mobile"
}

type SkillOption = {
  name: string
  img: string
}

type ProjectsPayload = {
  real: Project[]
  personal: Project[]
}

function normalizeTechName(value: string) {
  return value.trim().toLowerCase()
}

function resolveSkillImageSrc(src: string) {
  if (!src) return "/placeholder.jpg"
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src
  return `/${src}`
}

function ProjectCardSkeleton() {
  return (
    <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-12 animate-pulse">
      <div className="mx-auto h-[260px] w-full max-w-[500px] rounded-2xl border border-border bg-card/40 md:h-[300px]" />

      <div className="space-y-4">
        <div className="h-7 w-3/5 rounded-md bg-card/60" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded-md bg-card/60" />
          <div className="h-4 w-11/12 rounded-md bg-card/60" />
          <div className="h-4 w-10/12 rounded-md bg-card/60" />
        </div>

        <div className="space-y-3">
          <div className="h-4 w-24 rounded-md bg-card/60" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="h-10 w-10 rounded-md bg-card/60" />
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <div className="h-10 w-24 rounded-full bg-card/60" />
          <div className="h-10 w-24 rounded-full bg-card/60" />
        </div>
      </div>
    </div>
  )
}

function ProjectsSectionSkeleton({ title }: { title: "Real" | "Personal" }) {
  return (
    <section className="mb-16">
      <h2 className="mb-10 text-3xl font-bold md:text-4xl">
        <span className="text-primary">{title}</span> <span className="text-foreground">Projects</span>
      </h2>

      <div className="space-y-16">
        <ProjectCardSkeleton />
        <ProjectCardSkeleton />
      </div>
    </section>
  )
}

function ProjectCard({
  project,
  index,
  isVisible,
  techImageMap,
}: {
  project: Project
  index: number
  isVisible: boolean
  techImageMap: Record<string, string>
}) {
  const isMobileByTech = project.technologies?.some((tech) =>
    ["react-native", "expo", "flutter", "swift", "kotlin", "android", "ios", "mobile"].includes(
      tech.toLowerCase(),
    ),
  )
  const isMobileProject = project.previewType
    ? project.previewType === "mobile"
    : isMobileByTech

  const highlightText = (text: string, highlights?: string[]) => {
    if (!highlights || highlights.length === 0) return text
    
    let result = text
    for (const word of highlights) {
      const regex = new RegExp(`(${word})`, 'gi')
      result = result.replace(regex, `<span class="text-primary font-medium">$1</span>`)
    }
    return result
  }

  return (
    <div
      className={`grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
      style={{ transitionDelay: `${index * 150}ms` }}
    >
      {/* Device frame with project image */}
      <div className={`flex justify-center ${isMobileProject ? "" : "lg:justify-start"}`}>
        {isMobileProject ? (
          <PhoneFrame imageSrc={project.img} alt={project.name} />
        ) : (
          <MacbookFrame imageSrc={project.img} alt={project.name} />
        )}
      </div>

      {/* Project details */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-xl md:text-2xl font-bold text-foreground">{project.name}</h3>
          {project.badge && (
            <span className="px-3 py-1 text-xs font-medium bg-primary/20 text-primary rounded-full">
              {project.badge}
            </span>
          )}
        </div>
        <p
          className="text-muted-foreground text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: highlightText(project.description, project.highlights) }}
        />

        {/* Technologies */}
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Technologies</h4>
          <div className="flex flex-wrap gap-2">
            {project.technologies?.map((tech, idx) => {
              const techImage = techImageMap[normalizeTechName(tech)] ?? `${tech}.png`
              return (
                <img
                  key={`${project.name}-${tech}-${idx}`}
                  className="h-9 w-9 object-cover"
                  src={techImage}
                  alt={tech}
                  loading="lazy"
                  decoding="async"
                  onError={(event) => {
                    const target = event.currentTarget
                    target.onerror = null
                    target.src = "/placeholder.jpg"
                  }}
                />
              )
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {!isMobileProject && project.url ? (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-transparent text-foreground text-sm font-medium transition-all hover:bg-primary/10 hover:border-primary hover:text-primary"
            >
              Live
              <ExternalLink className="w-4 h-4" />
            </a>
          ) : null}
          {isMobileProject && project.playStoreUrl ? (
            <a
              href={project.playStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-transparent text-foreground text-sm font-medium transition-all hover:bg-primary/10 hover:border-primary hover:text-primary"
            >
              <PlayCircle className="w-4 h-4" />
              Play Market
            </a>
          ) : null}
          {isMobileProject && project.appStoreUrl ? (
            <a
              href={project.appStoreUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-transparent text-foreground text-sm font-medium transition-all hover:bg-primary/10 hover:border-primary hover:text-primary"
            >
              <Apple className="w-4 h-4" />
              App Store
            </a>
          ) : null}
          {project.youtubeUrl ? (
            <a
              href={project.youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-transparent text-foreground text-sm font-medium transition-all hover:bg-primary/10 hover:border-primary hover:text-primary"
            >
              <Youtube className="w-4 h-4" />
              YouTube
            </a>
          ) : null}
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-transparent text-foreground text-sm font-medium transition-all hover:bg-primary/10 hover:border-primary hover:text-primary"
            >
              Github
              <Github className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProjectsPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [projects, setProjects] = useState<ProjectsPayload>({ real: [], personal: [] })
  const [techImageMap, setTechImageMap] = useState<Record<string, string>>({})

  useEffect(() => {
    let isMounted = true

    async function loadProjects() {
      try {
        setIsVisible(false)
        setError("")
        setIsLoading(true)
        const [projectsResponse, skillsResponse] = await Promise.all([
          fetch("/api/projects", { cache: "no-store" }),
          fetch("/api/skills", { cache: "no-store" }),
        ])
        const payload = await projectsResponse.json()

        if (!projectsResponse.ok) {
          throw new Error(payload?.message || `Request failed with status ${projectsResponse.status}`)
        }

        if (isMounted && payload?.success && payload?.data) {
          setProjects(payload.data)
        }

        if (isMounted && skillsResponse.ok) {
          const skillsPayload = await skillsResponse.json()
          const skills = Array.isArray(skillsPayload?.skills) ? (skillsPayload.skills as SkillOption[]) : []
          const map = skills.reduce<Record<string, string>>((accumulator, skill) => {
            const key = normalizeTechName(String(skill.name ?? ""))
            if (!key) return accumulator
            accumulator[key] = resolveSkillImageSrc(String(skill.img ?? ""))
            return accumulator
          }, {})
          setTechImageMap(map)
        }
      } catch (error) {
        if (isMounted) {
          setError(error instanceof Error ? error.message : "Projects yuklab bo'lmadi.")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadProjects()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (isLoading) return

    const raf = requestAnimationFrame(() => {
      setIsVisible(true)
    })

    return () => cancelAnimationFrame(raf)
  }, [isLoading])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
        <div className="mx-auto max-w-6xl">
          {isLoading ? (
            <>
              <ProjectsSectionSkeleton title="Real" />
              <ProjectsSectionSkeleton title="Personal" />
            </>
          ) : null}

          {error ? (
            <div className="mb-8 rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">{error}</div>
          ) : null}

          {!isLoading ? (
            <>
              {/* Real Projects Section */}
              <section className="mb-16">
                <h2
                  className={`text-3xl md:text-4xl font-bold mb-10 transition-all duration-700 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
                  }`}
                >
                  <span className="text-primary">Real</span>{" "}
                  <span className="text-foreground">Projects</span>
                </h2>

                <div className="space-y-16">
                  {projects.real.map((project, index) => (
                    <ProjectCard
                      key={project.name}
                      project={project}
                      index={index}
                      isVisible={isVisible}
                      techImageMap={techImageMap}
                    />
                  ))}
                </div>
                {projects.real.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Real projects topilmadi.</p> : null}
              </section>

              {/* Personal Projects Section */}
              <section>
                <h2
                  className={`text-3xl md:text-4xl font-bold mb-10 transition-all duration-700 delay-300 ${
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"
                  }`}
                >
                  <span className="text-primary">Personal</span>{" "}
                  <span className="text-foreground">Projects</span>
                </h2>

                <div className="space-y-16">
                  {projects.personal.map((project, index) => (
                    <ProjectCard
                      key={project.name}
                      project={project}
                      index={index + projects.real.length}
                      isVisible={isVisible}
                      techImageMap={techImageMap}
                    />
                  ))}
                </div>
                {projects.personal.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Personal projects topilmadi.</p> : null}
              </section>
            </>
          ) : null}
        </div>
      </main>
    </>
  )
}

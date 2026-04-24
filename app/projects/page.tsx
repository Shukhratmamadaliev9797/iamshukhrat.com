"use client"

import { useEffect, useState } from "react"
import { ExternalLink, Github } from "lucide-react"
import { MacbookFrame } from "@/components/macbook-frame"
import { PhoneFrame } from "@/components/phone-frame"
import { projectsData } from "@/lib/projects-data"
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
  img: string
  technologies: string[]
  description: string
  github?: string
  highlights?: string[]
  badge?: string
  previewType?: "desktop" | "mobile"
}

type ProjectsPayload = {
  real: Project[]
  personal: Project[]
}

function ProjectCard({ project, index, isVisible }: { project: Project; index: number; isVisible: boolean }) {
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
              return <img key={`${project.name}-${tech}-${idx}`} className="h-10 w-10 object-cover" src={`${tech}.png`} alt={tech} />
            })}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {project.url ? (
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
  const [projects, setProjects] = useState<ProjectsPayload>(projectsData)

  useEffect(() => {
    let isMounted = true

    async function loadProjects() {
      try {
        const response = await fetch("/api/projects", { cache: "no-store" })
        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`)
        }

        const payload = await response.json()
        if (isMounted && payload?.data) {
          setProjects(payload.data)
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error)
      } finally {
        if (isMounted) {
          setIsVisible(true)
        }
      }
    }

    loadProjects()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
        <div className="mx-auto max-w-6xl">
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
                />
              ))}
            </div>
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
                />
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  )
}

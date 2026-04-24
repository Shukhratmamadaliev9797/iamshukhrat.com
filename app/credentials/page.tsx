"use client"

import { useEffect, useMemo, useState } from "react"
import { Github, Instagram, Facebook, Linkedin } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { normalizeSkillCategory, SKILL_CATEGORIES, SkillCategory } from "@/lib/skills-categories"

type DynamicSkill = {
  id: number
  name: string
  img: string
  category: SkillCategory
}

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
]

function resolveSkillImageSrc(src: string) {
  if (!src) return "/placeholder.svg"
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src
  return `/${src}`
}

export default function CredentialsPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [skills, setSkills] = useState<DynamicSkill[]>([])
  const [skillsError, setSkillsError] = useState("")

  const groupedSkills = useMemo(() => {
    return SKILL_CATEGORIES.map((category) => ({
      category,
      skills: skills.filter((skill) => skill.category === category),
    })).filter((group) => group.skills.length > 0)
  }, [skills])

  useEffect(() => {
    setIsVisible(true)

    let isMounted = true

    async function loadSkills() {
      try {
        const response = await fetch("/api/skills", { cache: "no-store" })
        const payload = await response.json()
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || "Skillsni yuklab bo'lmadi.")
        }

        if (isMounted) {
          const normalized = (payload.skills ?? []).map((skill: Partial<DynamicSkill>) => ({
            id: Number(skill.id),
            name: String(skill.name ?? ""),
            img: String(skill.img ?? "/placeholder.svg"),
            category: normalizeSkillCategory(skill.category),
          }))
          setSkills(normalized)
        }
      } catch (error) {
        if (isMounted) {
          setSkillsError(error instanceof Error ? error.message : "Skills yuklashda xatolik yuz berdi.")
        }
      }
    }

    loadSkills()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div
              className={`glass-card rounded-3xl p-6 flex flex-col items-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden mb-6">
                <img src="me.jpg" alt="Shukhrat Mamadaliev" className="w-full h-full object-cover" />
              </div>

              <h2 className="text-xl font-bold text-foreground mb-1">Shukhrat Mamadaliev</h2>
              <p className="text-muted-foreground text-sm mb-6">@shukhratmamadaliev</p>

              <div className="flex items-center gap-3 mb-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center transition-all duration-300 hover:bg-primary/20 hover:scale-110"
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                  </a>
                ))}
              </div>

              <button
                type="button"
                className="w-full py-3 rounded-xl bg-secondary text-foreground font-medium transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
              >
                Contact Me
              </button>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
              <h1
                className={`text-4xl md:text-5xl font-black tracking-wider transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
                style={{ fontFamily: "Impact, sans-serif", letterSpacing: "0.1em" }}
              >
                <span className="text-foreground">SKILLS</span>
              </h1>

              <div
                className={`transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              >
                {groupedSkills.map((group) => (
                  <section key={group.category} className="space-y-3 mb-5 last:mb-0">
                    <h2 className="text-lg md:text-xl font-semibold tracking-wide">{group.category}</h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {group.skills.map((skill) => (
                        <div key={skill.id} className={`${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
                          <div className="aspect-square w-full p-4 md:p-5 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer hover:-translate-y-1 glass-card rounded-3xl overflow-hidden flex items-center justify-center">
                            <img
                              className="h-20 w-20 md:h-24 md:w-24 object-cover"
                              src={resolveSkillImageSrc(skill.img)}
                              alt={skill.name}
                            />
                          </div>
                          <p className="mt-2 text-center text-xs md:text-sm text-muted-foreground line-clamp-2">{skill.name}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}

                {groupedSkills.length === 0 && !skillsError ? (
                  <p className="text-sm text-muted-foreground mt-4">Hozircha skill topilmadi.</p>
                ) : null}
                {skillsError ? <p className="text-sm text-red-400 mt-4">{skillsError}</p> : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

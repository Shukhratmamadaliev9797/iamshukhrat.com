"use client"

import { useEffect, useMemo, useState } from "react"
import { Github, Instagram, Facebook, Linkedin } from "lucide-react"
import { Navbar } from "@/components/navbar"
import {
  FRONTEND_SKILL_SUBCATEGORIES,
  getSkillCategoryLabel,
  getSkillSubcategoryLabel,
  normalizeSkillCategory,
  normalizeSkillSubcategory,
  SKILL_CATEGORIES,
  SkillCategory,
  SkillSubcategory,
} from "@/lib/skills-categories"

type DynamicSkill = {
  id: number
  name: string
  img: string
  category: SkillCategory
  subcategory: SkillSubcategory | null
}

const socialLinks = [
  { icon: Github, href: "#", label: "GitHub" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
]

function SkillsSkeleton() {
  return (
    <div className="space-y-7">
      {Array.from({ length: 3 }).map((_, sectionIdx) => (
        <section key={sectionIdx} className="space-y-5">
          <div className="h-6 w-52 animate-pulse rounded-md bg-card/60" />
          <div className="space-y-3">
            <div className="h-4 w-40 animate-pulse rounded-md bg-card/60" />
            <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(104px,1fr))] md:[grid-template-columns:repeat(auto-fill,minmax(116px,1fr))]">
              {Array.from({ length: 10 }).map((__, cardIdx) => (
                <div key={cardIdx} className="w-full">
                  <div className="aspect-square w-full animate-pulse rounded-3xl bg-card/60" />
                  <div className="mx-auto mt-1 h-3 w-16 animate-pulse rounded-md bg-card/60" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  )
}

function resolveSkillImageSrc(src: string) {
  if (!src) return "/placeholder.svg"
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) return src
  return `/${src}`
}

export default function CredentialsPage() {
  const [isVisible, setIsVisible] = useState(false)
  const [skills, setSkills] = useState<DynamicSkill[]>([])
  const [skillsLoading, setSkillsLoading] = useState(true)
  const [skillsError, setSkillsError] = useState("")

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

  useEffect(() => {
    setIsVisible(true)

    let isMounted = true

    async function loadSkills() {
      setSkillsLoading(true)
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
            subcategory: normalizeSkillSubcategory(skill.subcategory, normalizeSkillCategory(skill.category)),
          }))
          setSkills(normalized)
        }
      } catch (error) {
        if (isMounted) {
          setSkillsError(error instanceof Error ? error.message : "Skills yuklashda xatolik yuz berdi.")
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

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-start">
            <div
              className={`self-start lg:sticky lg:top-24 glass-card rounded-3xl p-6 flex flex-col items-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
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
                {skillsLoading ? <SkillsSkeleton /> : null}

                {!skillsLoading
                  ? groupedSkills.map((group) => (
                  <section key={group.category} className="space-y-5 mb-7 last:mb-0">
                    <h2 className="text-lg md:text-xl font-semibold tracking-wide">{getSkillCategoryLabel(group.category)}</h2>

                    <div className="space-y-5">
                      {group.groups.map((subgroup) => (
                        <div key={subgroup.key} className="space-y-3">
                          {subgroup.label ? <h3 className="text-sm font-medium text-muted-foreground">{subgroup.label}</h3> : null}
                          {group.category === "ARCHITECTURE_PRACTICES" ? (
                            <div className="rounded-xl border border-border bg-card/30 p-3 md:p-4">
                              <ul className="space-y-2">
                                {subgroup.skills.map((skill) => (
                                  <li
                                    key={skill.id}
                                    className={`text-sm text-foreground ${
                                      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                                    }`}
                                  >
                                    • {skill.name}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <div className="grid gap-2 [grid-template-columns:repeat(auto-fill,minmax(104px,1fr))] md:[grid-template-columns:repeat(auto-fill,minmax(116px,1fr))]">
                              {subgroup.skills.map((skill) => (
                                <div
                                  key={skill.id}
                                  className={`group/skill w-full ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
                                >
                                  <div className="relative aspect-square w-full p-2.5 md:p-3 transition-all duration-500 cursor-pointer glass-card rounded-3xl overflow-hidden flex items-center justify-center hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover/skill:opacity-100" />
                                    <img
                                      className="relative z-10 h-16 w-16 md:h-[72px] md:w-[72px] object-cover transition-transform duration-300 group-hover/skill:scale-105"
                                      src={resolveSkillImageSrc(skill.img)}
                                      alt={skill.name}
                                    />
                                  </div>
                                  <p className="mt-1 text-center text-xs md:text-sm text-muted-foreground line-clamp-2 transition-colors duration-300 group-hover/skill:text-primary">{skill.name}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                ))
                  : null}

                {!skillsLoading && groupedSkills.length === 0 && !skillsError ? (
                  <p className="text-sm text-muted-foreground mt-4">Hozircha skill topilmadi.</p>
                ) : null}
                {!skillsLoading && skillsError ? <p className="text-sm text-red-400 mt-4">{skillsError}</p> : null}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

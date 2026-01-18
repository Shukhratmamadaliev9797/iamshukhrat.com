"use client"

import { useEffect, useState } from "react"
import { TransitionLink } from "@/components/page-transition"

export function HeroCard() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <TransitionLink href="/about" className="block h-full">
      <div className="group relative h-full rounded-3xl glass-card p-6 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer hover:-translate-y-1">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-primary/10 blur-3xl group-hover:bg-primary/20 transition-all duration-700" />
        <div className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar with glow effect */}
            <div
              className={`relative transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse" />
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg shadow-primary/20">
                <img
                  src="/stylized-developer-avatar-with-hoodie-dark-theme.jpg"
                  alt="Developer Avatar"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
            </div>

            <div
              className={`space-y-3 transition-all duration-700 delay-150 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
            >
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-medium">A Web Developer</p>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Shukhrat
                <br />
                <span className="text-primary">Mamadaliev</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-xs leading-relaxed">
                I am a Full Stack Developer based in Uzbekistan
              </p>
            </div>
          </div>

          {/* Logo watermark */}
          <div
            className={`mt-8 transition-all duration-700 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary/40 font-mono">SH</span>
            </div>
          </div>
        </div>
      </div>
    </TransitionLink>
  )
}

"use client"

import { TransitionLink } from "@/components/page-transition"

export function ProjectsCard() {
  return (
    <TransitionLink href="/projects" className="block h-full">
      <div className="group relative h-full rounded-3xl glass-card p-6 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Project preview */}
          <div className="flex-1 flex items-center justify-center relative">
            <div className="relative animate-float">
              <div className="w-28 h-20 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 shadow-lg transform rotate-[-5deg] transition-transform duration-300 group-hover:rotate-0 group-hover:scale-105">
                <div className="p-2">
                  <div className="w-full h-2 rounded bg-primary/30 mb-1" />
                  <div className="w-2/3 h-2 rounded bg-primary/20" />
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded bg-primary/30 transform rotate-12 transition-transform duration-300 group-hover:rotate-0" />
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Showcase</p>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                Projects
              </h3>
            </div>
            <span className="text-2xl font-bold text-primary/20 font-mono">SH</span>
          </div>
        </div>
      </div>
    </TransitionLink>
  )
}

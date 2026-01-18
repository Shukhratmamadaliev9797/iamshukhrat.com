"use client"

import { TransitionLink } from "@/components/page-transition"

export function CredentialsCard() {
  return (
    <TransitionLink href="/credentials" className="block h-full">
      <div className="group relative h-full rounded-3xl glass-card p-6 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Signature */}
          <div className="flex-1 flex items-center justify-center">
            <svg
              viewBox="0 0 200 80"
              className="w-full max-w-[150px] h-auto text-foreground/80 group-hover:text-foreground transition-colors duration-300"
            >
              <path
                d="M20 60 Q40 20 60 40 T100 30 T140 50 Q160 60 180 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                className="group-hover:stroke-primary transition-colors duration-300"
              />
            </svg>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">More About Me</p>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                Credentials
              </h3>
            </div>
            <span className="text-2xl font-bold text-primary/20 font-mono">SH</span>
          </div>
        </div>
      </div>
    </TransitionLink>
  )
}

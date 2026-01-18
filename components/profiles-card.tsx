"use client"

import { Github, Linkedin } from "lucide-react"

const profiles = [
  { icon: Linkedin, href: "https://www.linkedin.com/in/shukhrat-mamadaliev-b5423019a/", label: "LinkedIn" },
  { icon: Github, href: "https://github.com/Shukhratmamadaliev9797", label: "GitHub" },
]

export function ProfilesCard() {
  return (
    <div className="group relative h-full min-h-[200px] rounded-3xl glass-card p-6 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Social icons */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-4">
            {profiles.map((profile) => (
              <a
                key={profile.label}
                target="_blank"
                href={profile.href}
                className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center transition-all duration-300 hover:bg-primary/20 hover:scale-110 group/icon"
                aria-label={profile.label}
              >
                <profile.icon className="w-7 h-7 text-muted-foreground transition-colors duration-300 group-hover/icon:text-primary" />
              </a>
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Stay With Me</p>
            <h3 className="text-lg font-semibold text-foreground">Profiles</h3>
          </div>
          <span className="text-2xl font-bold text-primary/20 font-mono">SH</span>
        </div>
      </div>
    </div>
  )
}

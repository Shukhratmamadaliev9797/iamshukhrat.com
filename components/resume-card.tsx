"use client"

import { Download } from "lucide-react"

export function ResumeCard() {
  return (
    <a href="/cv.pdf" target="_blank">
<div className="group relative h-full min-h-[200px] rounded-3xl glass-card p-6 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex flex-col h-full justify-between">
        {/* Resume preview */}
        <div className="flex-1 flex items-center justify-start relative">
          <div className="relative">
            <div className="absolute -left-1 top-0 bottom-0 w-1 bg-primary rounded-full opacity-60" />
            <div className="ml-3 transform transition-transform duration-300 group-hover:translate-x-1">
              <div className="w-20 h-28 rounded-lg bg-gradient-to-br from-secondary to-card border border-border shadow-lg overflow-hidden">
                <div className="p-2 space-y-1">
                  <div className="text-[6px] text-primary font-bold">Your Name</div>
                  <div className="w-full h-1 rounded bg-muted" />
                  <div className="w-3/4 h-1 rounded bg-muted" />
                  <div className="w-full h-1 rounded bg-muted mt-2" />
                  <div className="w-2/3 h-1 rounded bg-muted" />
                  <div className="w-full h-1 rounded bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Resume</p>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
              Download
            </h3>
          </div>
          <span className="text-2xl font-bold text-primary/20 font-mono">SH</span>
        </div>
      </div>
    </div>
    </a>
    
  )
}

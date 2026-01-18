"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function ContactCard() {
  return (
    <Link href="/contact" className="block h-full">
      <div className="group relative h-full min-h-[200px] rounded-3xl glass-card p-8 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer hover:-translate-y-1">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/10 transition-all duration-700" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between h-full gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
              Let's
              <br />
              work{" "}
              <span className="text-primary relative">
                together
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center transition-all duration-300 group-hover:scale-110 animate-glow-pulse">
              <ArrowRight className="w-6 h-6 text-primary-foreground transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div className="absolute bottom-4 right-6">
          <span className="text-6xl font-bold text-primary/5 font-mono">SH</span>
        </div>
      </div>
    </Link>
  )
}

"use client"

import { useEffect, useState } from "react"

const stats = [
  { value: 4, suffix: "", label: "Years", sublabel: "Experience" },
  { value: 15, suffix: "+", label: "Clients", sublabel: "Worldwide" },
  { value: 30, suffix: "+", label: "Total", sublabel: "Projects" },
]

function AnimatedNumber({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setCount(value)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value])

  return (
    <span className="text-3xl md:text-4xl font-light text-foreground tabular-nums">
      {count.toString().padStart(2, "0")}
      {suffix}
    </span>
  )
}

export function StatsCard() {
  return (
    <div className="group relative h-full min-h-[160px] rounded-3xl glass-card p-6 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/5">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10 flex items-center justify-center h-full">
        <div className="flex items-center justify-around w-full gap-4">
          {stats.map((stat, index) => (
            <div key={stat.label} className="flex flex-col items-center">
              <div className="px-6 py-4 rounded-2xl bg-secondary/50 border border-border/50 transition-all duration-300 hover:border-primary/30 hover:bg-secondary">
                <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                <div className="mt-2 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{stat.sublabel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

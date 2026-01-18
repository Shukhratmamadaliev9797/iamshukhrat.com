"use client"

import Link from "next/link"
import { Blocks, Code2, Monitor, Smartphone } from "lucide-react"

const services = [
  { icon: Blocks, label: "UI/UX Design" },
  { icon: Code2, label: "Development" },
  { icon: Monitor, label: "Web Apps" },
  { icon: Smartphone, label: "Mobile" },
]

export function ServicesCard() {
  return (
    <Link href="/services" className="block h-full">
      <div className="group relative h-full min-h-[200px] rounded-3xl glass-card p-6 overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Services icons */}
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-6 md:gap-10">
              {services.map((service, index) => (
                <div
                  key={service.label}
                  className="flex flex-col items-center gap-2 group/item"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-secondary flex items-center justify-center transition-all duration-300 hover:bg-primary/20 hover:scale-110 hover:-translate-y-1">
                    <service.icon className="w-6 h-6 md:w-7 md:h-7 text-muted-foreground transition-colors duration-300 group-hover/item:text-primary" />
                  </div>
                  <span className="text-[10px] text-muted-foreground opacity-0 group-hover/item:opacity-100 transition-opacity duration-300">
                    {service.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Specialization</p>
              <h3 className="text-lg font-semibold text-foreground">Services Offering</h3>
            </div>
            <span className="text-2xl font-bold text-primary/20 font-mono">SH</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

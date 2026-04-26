"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { LayoutDashboard, FolderKanban, Mail, PanelLeft, Sparkles } from "lucide-react"

type AdminShellProps = {
  children: ReactNode
}

const navItems = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/skills",
    label: "Skills",
    icon: Sparkles,
  },
  {
    href: "/admin/projects",
    label: "Projects",
    icon: FolderKanban,
  },
  {
    href: "/admin/messages",
    label: "Messages",
    icon: Mail,
  },
]

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname()

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      <header className="z-20 shrink-0 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="flex h-16 w-full items-center justify-between px-4 md:px-6">
          <Link href="/admin/dashboard" className="text-lg font-semibold tracking-wide">
            Admin Panel
          </Link>
          <Link
            href="/"
            className="rounded-md border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to Site
          </Link>
        </div>
      </header>

      <div className="grid h-[calc(100vh-4rem)] w-full min-h-0 grid-cols-1 md:grid-cols-[220px_1fr]">
        <aside className="shrink-0 overflow-hidden border-r border-border/70 bg-background p-3 md:p-3">
          <div className="mb-3 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <PanelLeft className="h-4 w-4" />
            <span>Menu</span>
          </div>

          <nav className="flex gap-2 md:flex-col md:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "inline-flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "inline-flex h-7 w-7 items-center justify-center rounded-md border",
                      isActive
                        ? "border-primary-foreground/30 bg-primary-foreground/10"
                        : "border-border/70 bg-secondary/40",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        <main className="min-h-0 overflow-y-auto bg-muted/30 p-4 md:p-8">
          <div className="rounded-2xl border border-border/60 bg-background/85 p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  )
}

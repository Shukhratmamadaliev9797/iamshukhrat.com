"use client"

import type { ReactNode } from "react"
import Link from "next/link"

// Simple wrapper component for clickable cards - no animation
interface TransitionLinkProps {
  href: string
  children: ReactNode
  className?: string
}

export function TransitionLink({ href, children, className = "" }: TransitionLinkProps) {
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

// Empty provider for backwards compatibility
export function PageTransitionProvider({ children }: { children: ReactNode }) {
  return <>{children}</>
}

"use client"

import { useEffect, useState } from "react"

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"loading" | "lineAnimation" | "splitting" | "done">("loading")
  const [lineProgress, setLineProgress] = useState(0)

  useEffect(() => {
    // Trigger content to show immediately so it's visible behind the split
    if (phase === "loading") {
      onComplete()
    }
  }, [phase, onComplete])

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase("lineAnimation")
    }, 250)

    return () => clearTimeout(timer)
  }, [])

  // Line animation from left to right
  useEffect(() => {
    if (phase === "lineAnimation") {
      const duration = 400
      const startTime = Date.now()

      const animateLine = () => {
        const elapsed = Date.now() - startTime
        const newLineProgress = Math.min(100, (elapsed / duration) * 100)

        setLineProgress(newLineProgress)

        if (newLineProgress < 100) {
          requestAnimationFrame(animateLine)
        } else {
          setTimeout(() => {
            setPhase("splitting")
          }, 100)

          setTimeout(() => {
            setPhase("done")
          }, 1100)
        }
      }

      requestAnimationFrame(animateLine)
    }
  }, [phase])

  if (phase === "done") return null

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Top half */}
      <div 
        className="absolute left-0 right-0 top-0 h-1/2 transition-transform ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ 
          backgroundColor: "oklch(0.18 0.01 250)",
          transform: phase === "splitting" ? "translateY(-100%)" : "translateY(0)",
          transitionDuration: "900ms",
        }}
      />
      
      {/* Bottom half */}
      <div 
        className="absolute left-0 right-0 bottom-0 h-1/2 transition-transform ease-[cubic-bezier(0.76,0,0.24,1)]"
        style={{ 
          backgroundColor: "oklch(0.18 0.01 250)",
          transform: phase === "splitting" ? "translateY(100%)" : "translateY(0)",
          transitionDuration: "900ms",
        }}
      />

      {/* Animated line from left to right before split */}
      {phase === "lineAnimation" && (
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-[3px] left-0"
          style={{ 
            width: `${lineProgress}%`,
            background: "linear-gradient(90deg, oklch(0.72 0.17 55 / 0.3) 0%, oklch(0.72 0.17 55) 90%, oklch(0.72 0.17 55) 100%)",
            boxShadow: "0 0 20px 3px oklch(0.72 0.17 55 / 0.5)",
          }}
        />
      )}

      {/* Split glow lines - top goes up, bottom goes down */}
      {phase === "splitting" && (
        <>
          {/* Top glow line */}
          <div 
            className="absolute left-0 right-0 h-[3px] transition-all ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{ 
              top: "50%",
              transform: "translateY(-100%)",
              background: "linear-gradient(90deg, transparent 0%, oklch(0.72 0.17 55) 10%, oklch(0.72 0.17 55) 90%, transparent 100%)",
              boxShadow: "0 0 20px 3px oklch(0.72 0.17 55 / 0.5)",
              animation: "glow-line-up 900ms cubic-bezier(0.76, 0, 0.24, 1) forwards",
            }}
          />
          {/* Bottom glow line */}
          <div 
            className="absolute left-0 right-0 h-[3px] transition-all ease-[cubic-bezier(0.76,0,0.24,1)]"
            style={{ 
              top: "50%",
              background: "linear-gradient(90deg, transparent 0%, oklch(0.72 0.17 55) 10%, oklch(0.72 0.17 55) 90%, transparent 100%)",
              boxShadow: "0 0 20px 3px oklch(0.72 0.17 55 / 0.5)",
              animation: "glow-line-down 900ms cubic-bezier(0.76, 0, 0.24, 1) forwards",
            }}
          />
        </>
      )}
    </div>
  )
}

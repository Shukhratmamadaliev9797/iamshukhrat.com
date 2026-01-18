"use client"

import { useEffect, useState } from "react"

export function Preloader({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<"loading" | "lineAnimation" | "splitting" | "done">("loading")
  const [lineProgress, setLineProgress] = useState(0)
  
  // Segmented circle properties
  const totalSegments = 36
  const size = 280
  const radius = 110
  const segmentAngle = 360 / totalSegments // Full circle (360 degrees)

  useEffect(() => {
    // Trigger content to show immediately so it's visible behind the split
    if (phase === "loading") {
      onComplete()
    }
  }, [phase, onComplete])

  useEffect(() => {
    // Animate progress from 0 to 100
    const duration = 2500
    const startTime = Date.now()
    
    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(100, Math.floor((elapsed / duration) * 100))
      
      setProgress(newProgress)
      
      if (newProgress < 100) {
        requestAnimationFrame(animateProgress)
      } else {
        // Start line animation from left to right
        setTimeout(() => {
          setPhase("lineAnimation")
        }, 300)
      }
    }
    
    requestAnimationFrame(animateProgress)
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
          // Start split after line reaches the end
          setTimeout(() => {
            setPhase("splitting")
          }, 100)
          
          // Complete
          setTimeout(() => {
            setPhase("done")
          }, 1100)
        }
      }
      
      requestAnimationFrame(animateLine)
    }
  }, [phase])

  if (phase === "done") return null

  // Calculate how many segments should be filled
  const filledSegments = Math.floor((progress / 100) * totalSegments)

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

      {/* Centered progress circle and number */}
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-opacity duration-300"
        style={{
          opacity: phase === "splitting" || phase === "lineAnimation" ? 0 : 1,
        }}
      >
        {/* Segmented full circle */}
        <svg width={size} height={size} className="transform -rotate-90">
          {Array.from({ length: totalSegments }).map((_, index) => {
            // Calculate angle for each segment (starting from top, going clockwise)
            const angle = index * segmentAngle
            const angleRad = (angle * Math.PI) / 180
            
            // Calculate position for each segment (thicker and longer dashes)
            const x1 = size / 2 + (radius - 18) * Math.cos(angleRad)
            const y1 = size / 2 + (radius - 18) * Math.sin(angleRad)
            const x2 = size / 2 + (radius + 18) * Math.cos(angleRad)
            const y2 = size / 2 + (radius + 18) * Math.sin(angleRad)
            
            const isFilled = index < filledSegments
            
            return (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isFilled ? "oklch(0.72 0.17 55)" : "oklch(0.30 0.01 250)"}
                strokeWidth={6}
                strokeLinecap="round"
                className="transition-all duration-75"
              />
            )
          })}
        </svg>
        
        {/* Centered number with percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span 
            className="text-3xl md:text-4xl font-semibold tabular-nums"
            style={{ color: "oklch(0.95 0 0)" }}
          >
            {progress}%
          </span>
        </div>
      </div>

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

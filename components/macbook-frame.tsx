"use client"

import { useEffect, useState } from "react"

interface MacbookFrameProps {
  imageSrc: string
  alt: string
}

export function MacbookFrame({ imageSrc, alt }: MacbookFrameProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
  }, [imageSrc])

  return (
    <div className="relative w-full max-w-[500px] overflow-hidden">
      {/* MacBook frame image */}
      <img
        src="/macbook-frame-base.png"
        alt="MacBook frame"
        className="w-full h-auto relative z-10"
        loading="lazy"
        decoding="async"
      />
      
      {/* Project screenshot positioned inside the screen */}
      <div
        className="absolute z-0 overflow-hidden bg-black"
        style={{
          top: "2.131%",
          left: "10.699%",
          width: "78.602%",
          height: "86.318%",
        }}
      >
        {!loaded ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-muted/60">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          </div>
        ) : null}

        <img
          src={imageSrc || "/placeholder.svg"}
          alt={alt}
          className={`h-full w-full object-cover object-top transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      </div>
    </div>
  )
}

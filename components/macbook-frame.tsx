"use client"

import { useState } from "react"

interface MacbookFrameProps {
  imageSrc: string
  alt: string
}

export function MacbookFrame({ imageSrc, alt }: MacbookFrameProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative w-full max-w-[500px] overflow-hidden">
      {!loaded ? (
        <div
          className="absolute z-0 animate-pulse rounded-md bg-muted/70"
          style={{ top: "2.131%", left: "10.699%", width: "78.602%", height: "86.318%" }}
        />
      ) : null}

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
        className="absolute z-0"
        style={{
          top: "2.131%",
          left: "10.699%",
          width: "78.602%",
          height: "86.318%",
        }}
      >
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover object-top"
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>
  )
}

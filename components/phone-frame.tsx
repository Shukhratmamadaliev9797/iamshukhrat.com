"use client"

import { useEffect, useState } from "react"

interface PhoneFrameProps {
  imageSrc: string
  alt: string
}

export function PhoneFrame({ imageSrc, alt }: PhoneFrameProps) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setLoaded(false)
  }, [imageSrc])

  return (
    <div className="relative mx-auto -translate-x-3 md:-translate-x-4 h-[370px] md:h-[410px] aspect-[1500/2580] overflow-hidden drop-shadow-[0_0_12px_rgba(255,255,255,0.22)]">
      <img
        src="/mobile-frame-iphone16-cropped.png"
        alt="Phone frame"
        className="relative z-10 w-full h-full"
        loading="lazy"
        decoding="async"
      />

      <div
        className="absolute z-0 overflow-hidden bg-black"
        style={{
          top: "3.41%",
          left: "12.13%",
          width: "74.4%",
          height: "89.61%",
          clipPath: "inset(0 0 0 0 round 8.5%)",
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

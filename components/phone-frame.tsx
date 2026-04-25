"use client"

import { useState } from "react"

interface PhoneFrameProps {
  imageSrc: string
  alt: string
}

export function PhoneFrame({ imageSrc, alt }: PhoneFrameProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="relative mx-auto -translate-x-3 md:-translate-x-4 h-[370px] md:h-[410px] aspect-[1500/2580] overflow-hidden drop-shadow-[0_0_12px_rgba(255,255,255,0.22)]">
      {!loaded ? (
        <div
          className="absolute z-0 animate-pulse bg-muted/70"
          style={{ top: "3.41%", left: "12.13%", width: "74.4%", height: "89.61%", borderRadius: "8.5%" }}
        />
      ) : null}

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

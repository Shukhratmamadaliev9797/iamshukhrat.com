interface MacbookFrameProps {
  imageSrc: string
  alt: string
}

export function MacbookFrame({ imageSrc, alt }: MacbookFrameProps) {
  return (
    <div className="relative w-full max-w-[500px] overflow-hidden">
      {/* MacBook frame image */}
      <img
        src="/macbook-frame-base.png"
        alt="MacBook frame"
        className="w-full h-auto relative z-10"
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
        />
      </div>
    </div>
  )
}

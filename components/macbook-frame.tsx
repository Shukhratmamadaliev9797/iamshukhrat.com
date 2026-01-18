interface MacbookFrameProps {
  imageSrc: string
  alt: string
}

export function MacbookFrame({ imageSrc, alt }: MacbookFrameProps) {
  return (
    <div className="relative w-full max-w-[500px]">
      {/* MacBook frame image */}
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/macbook-frame-LhfI9NvVncSBuyDwHy8l9WfyDgBqle.png"
        alt="MacBook frame"
        className="w-full h-auto relative z-10"
      />
      
      {/* Project screenshot positioned inside the screen */}
      <div 
        className="absolute z-0"
        style={{
          top: '4.2%',
          left: '11.8%',
          width: '76.4%',
          height: '78.5%',
        }}
      >
        <img
          src={imageSrc || "/placeholder.svg"}
          alt={alt}
          className="w-full h-full object-cover object-top rounded-[2px]"
        />
      </div>
    </div>
  )
}

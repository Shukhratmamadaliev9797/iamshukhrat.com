export function Marquee() {
  return (
    <div className="relative h-[60px] rounded-3xl glass-card overflow-hidden flex items-center">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4">
            <span className="text-sm uppercase tracking-wider text-muted-foreground">Latest Work and</span>
            <span className="text-sm uppercase tracking-wider text-foreground font-bold">Featured</span>
            <span className="text-primary text-lg">✦</span>
            <span className="text-sm uppercase tracking-wider text-muted-foreground">Latest Work and</span>
            <span className="text-sm uppercase tracking-wider text-foreground font-bold">Featured</span>
            <span className="text-primary text-lg">✦</span>
          </div>
        ))}
      </div>
    </div>
  )
}

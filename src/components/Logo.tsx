const Logo = ({ className = "", size = 40 }: { className?: string; size?: number }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="10" className="fill-primary" />
      <path d="M14 34V14h4v16h10v4H14z" fill="white" />
      <path d="M26 14h4l4 10 4-10h4L36 28l-2 6h-4l-2-6L26 14z" fill="white" opacity="0.85" />
    </svg>
    <div className="flex flex-col leading-tight">
      <span className="text-lg font-bold font-display tracking-tight text-foreground">Launch House</span>
      <span className="text-xs font-medium tracking-[0.15em] uppercase text-muted-foreground">Events</span>
    </div>
  </div>
);

export default Logo;

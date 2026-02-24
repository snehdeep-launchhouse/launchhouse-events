import { Flame } from "lucide-react";

const IgnitionLogo = ({ size = 36, className = "" }: { size?: number; className?: string }) => (
  <div className={`flex items-center gap-2.5 ${className}`}>
    <div
      className="flex items-center justify-center rounded-lg"
      style={{
        width: size,
        height: size,
        background: "linear-gradient(135deg, hsl(24 95% 53%), hsl(16 90% 45%))",
      }}
    >
      <Flame className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} strokeWidth={2.5} />
    </div>
    <div className="flex flex-col leading-tight">
      <span className="text-lg font-bold font-display tracking-tight" style={{ color: "hsl(220 50% 14%)" }}>
        Ignition
      </span>
      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
        Dashboard
      </span>
    </div>
  </div>
);

export default IgnitionLogo;

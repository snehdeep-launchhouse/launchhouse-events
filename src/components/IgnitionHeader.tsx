import IgnitionLogo from "./IgnitionLogo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface IgnitionHeaderProps {
  userEmail: string | null;
  onLogout: () => void;
}

const IgnitionHeader = ({ userEmail, onLogout }: IgnitionHeaderProps) => (
  <header className="sticky top-0 z-30 border-b bg-card/80 backdrop-blur-md" style={{ borderColor: "hsl(220 15% 88%)" }}>
    <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
      <IgnitionLogo size={34} />
      <div className="flex items-center gap-4">
        {userEmail && (
          <span className="text-sm text-muted-foreground hidden sm:inline">
            <span className="font-medium text-foreground">{userEmail}</span>
          </span>
        )}
        <Button variant="outline" size="sm" onClick={onLogout} className="gap-1.5">
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
    </div>
  </header>
);

export default IgnitionHeader;

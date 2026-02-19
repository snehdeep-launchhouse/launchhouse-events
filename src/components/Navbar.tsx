import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Home", href: "/", type: "route" as const },
  { label: "About Us", href: "/about", type: "route" as const },
  { label: "Our Services", href: "/services", type: "route" as const },
  { label: "Why Us", href: "#why-us", type: "scroll" as const },
  { label: "Pricing", href: "/pricing", type: "route" as const },
  { label: "Contact", href: "#contact", type: "scroll" as const },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (link: typeof navLinks[0]) => {
    setMobileOpen(false);
    if (link.type === "route") {
      navigate(link.href);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (location.pathname !== "/") {
      navigate("/" + link.href);
    } else {
      document.querySelector(link.href)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleCta = () => {
    setMobileOpen(false);
    window.open("/build-request", "_blank");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-[var(--nav-height)]">
        <Logo />
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((l) => (
            <button
              key={l.href}
              onClick={() => handleNav(l)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCta} size="sm" className="hidden md:inline-flex">
            Get Started
          </Button>
          <Button onClick={handleCta} size="sm" className="md:hidden">
            Get Started
          </Button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg">
          <div className="container py-4 flex flex-col gap-3">
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => handleNav(l)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left py-2"
              >
                {l.label}
              </button>
            ))}
            <Button onClick={handleCta} size="sm" className="w-full mt-2">
              Get Started
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

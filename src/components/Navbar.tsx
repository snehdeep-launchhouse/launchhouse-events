import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useContactPanel } from "./ContactPanelProvider";

const navLinks = [
  { label: "Home", href: "/", type: "route" as const },
  { label: "About Us", href: "/about", type: "route" as const },
  { label: "Our Services", href: "/services", type: "route" as const },
  { label: "Pricing", href: "/pricing", type: "route" as const },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { openContactPanel, openDemoPanel } = useContactPanel();

  const handleNav = (e: React.MouseEvent<HTMLAnchorElement>, link: typeof navLinks[0]) => {
    e.preventDefault();
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

  const handleContact = () => {
    setMobileOpen(false);
    openContactPanel();
  };

  const handleDemo = () => {
    setMobileOpen(false);
    openDemoPanel();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="container flex items-center justify-between h-[var(--nav-height)]">
          <Logo />
          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.type === "route" ? l.href : `/${l.href}`}
                onClick={(e) => handleNav(e, l)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleContact} size="sm" variant="outline" className="hidden lg:inline-flex">
              Contact Us
            </Button>
            <Button onClick={handleDemo} size="sm" className="hidden lg:inline-flex">
              Book a Free Consultation
            </Button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-border/50 bg-background/95 backdrop-blur-lg">
            <div className="container py-4 flex flex-col gap-3">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.type === "route" ? l.href : `/${l.href}`}
                  onClick={(e) => handleNav(e, l)}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors text-left py-2"
                >
                  {l.label}
                </a>
              ))}
              <Button onClick={handleDemo} size="sm" className="w-full mt-2">
                Book a Free Consultation
              </Button>
              <Button onClick={handleContact} size="sm" variant="outline" className="w-full">
                Contact Us
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Sticky mobile CTA */}
      {!mobileOpen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 pb-safe bg-background/95 backdrop-blur-lg border-t border-border/50">
          <Button onClick={handleDemo} className="w-full shadow-btn min-h-[44px]">
            Book a Free Consultation
          </Button>
        </div>
      )}
    </>
  );
};

export default Navbar;

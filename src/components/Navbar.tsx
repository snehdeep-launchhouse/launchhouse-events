import { useNavigate, useLocation } from "react-router-dom";
import Logo from "./Logo";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Home", href: "/", type: "route" as const },
  { label: "Our Services", href: "/services", type: "route" as const },
  { label: "Why Us", href: "#why-us", type: "scroll" as const },
  { label: "Pricing", href: "#pricing", type: "scroll" as const },
  { label: "Contact", href: "#contact", type: "scroll" as const },
];

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (link: typeof navLinks[0]) => {
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
    if (location.pathname !== "/") {
      navigate("/#contact");
    } else {
      document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container flex items-center justify-between h-[var(--nav-height)]">
        <Logo />
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
        <Button onClick={handleCta} size="sm">
          Get Started
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;

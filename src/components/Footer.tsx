import Logo from "./Logo";

const Footer = () => (
  <footer className="py-12 pb-40 lg:pb-12 border-t border-border/50">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
      <Logo size={32} />
      <div className="text-sm text-muted-foreground text-center">
        <p>© {new Date().getFullYear()} LaunchHouse Events. A division of Rina Event Tech</p>
        <p>All rights reserved.</p>
      </div>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:gap-6 text-sm text-muted-foreground">
        <a href="/privacy-policy" className="hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>
        <a href="/terms-of-service" className="hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
          Terms of Service
        </a>
        <a href="/pre-launch-checks" className="hover:text-primary transition-colors">
          Pre-Launch Checks
        </a>
        <a href="mailto:snehdeep@launchhouse.events" className="hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
          Contact
        </a>
        <a href="tel:+15714448523" className="hover:text-primary transition-colors">
          +1 (571) 444-8523
        </a>
        <button
          onClick={() => window.dispatchEvent(new Event("open-cookie-settings"))}
          className="hover:text-primary transition-colors"
        >
          Cookie Settings
        </button>
      </div>
    </div>
  </footer>
);

export default Footer;

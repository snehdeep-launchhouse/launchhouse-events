import Logo from "./Logo";

const Footer = () => (
  <footer className="py-12 border-t border-border/50">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
      <Logo size={32} />
      <div className="text-sm text-muted-foreground text-center">
        <p>© {new Date().getFullYear()} LaunchHouse Events. A division of Rina Event Tech</p>
        <p>All rights reserved.</p>
      </div>
      <div className="flex gap-6 text-sm text-muted-foreground">
        <a href="/privacy-policy" className="hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>
        <a href="/terms-of-service" className="hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
          Terms
        </a>
        <a href="mailto:snehdeep@launchhouse.events" className="hover:text-primary transition-colors" target="_blank" rel="noopener noreferrer">
          Contact
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;

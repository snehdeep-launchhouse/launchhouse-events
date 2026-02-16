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
        <a href="mailto:snehdeep@launchhouse.events" className="hover:text-primary transition-colors">
          Contact
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;

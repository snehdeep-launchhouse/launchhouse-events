import Logo from "./Logo";

const Footer = () => (
  <footer className="py-12 border-t border-border/50">
    <div className="container flex flex-col md:flex-row items-center justify-between gap-6">
      <Logo size={32} />
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} Launch House Events. All rights reserved.
      </p>
      <div className="flex gap-6 text-sm text-muted-foreground">
        <a href="mailto:snehdeep@launchhouse.events" className="hover:text-primary transition-colors">
          Contact
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;

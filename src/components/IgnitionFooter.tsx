const IgnitionFooter = () => (
  <footer className="border-t py-6 mt-auto" style={{ borderColor: "hsl(220 15% 88%)" }}>
    <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
      <p>© {new Date().getFullYear()} LaunchHouse Events · Ignition Dashboard</p>
      <div className="flex gap-4">
        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Privacy</a>
        <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">Terms</a>
      </div>
    </div>
  </footer>
);

export default IgnitionFooter;

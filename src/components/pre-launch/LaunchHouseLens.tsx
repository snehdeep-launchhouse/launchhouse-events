import { LAUNCHHOUSE_LENS } from "@/lib/pre-launch/content";

export default function LaunchHouseLens() {
  return (
    <section
      id="launchhouse-lens"
      tabIndex={-1}
      className="scroll-mt-[var(--nav-height)] py-16 md:py-24 outline-none"
      aria-labelledby="lens-heading"
    >
      <div className="container max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          {LAUNCHHOUSE_LENS.eyebrow}
        </p>
        <h2
          id="lens-heading"
          data-quick-index-heading
          className="scroll-mt-[calc(var(--nav-height)+2.5rem)] text-3xl md:text-4xl font-bold font-display tracking-tight mb-6"
        >
          {LAUNCHHOUSE_LENS.heading}
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          {LAUNCHHOUSE_LENS.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

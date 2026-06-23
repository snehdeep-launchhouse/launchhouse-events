import { LAUNCHHOUSE_LENS } from "@/lib/pre-launch/content";
import BackToIndex from "./BackToIndex";

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
          className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-6"
        >
          {LAUNCHHOUSE_LENS.heading}
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          {LAUNCHHOUSE_LENS.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="mt-8 rounded-xl border border-border bg-card-gradient p-5 md:p-6">
          <p className="text-base md:text-lg font-semibold text-foreground">
            {LAUNCHHOUSE_LENS.callout}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {LAUNCHHOUSE_LENS.calloutUrl}
          </p>
        </div>
        <BackToIndex />
      </div>
    </section>
  );
}

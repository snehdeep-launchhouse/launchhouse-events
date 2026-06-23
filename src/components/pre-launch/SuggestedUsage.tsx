import { SUGGESTED_USAGE } from "@/lib/pre-launch/content";
import BackToIndex from "./BackToIndex";

export default function SuggestedUsage() {
  return (
    <section
      id="suggested-usage"
      tabIndex={-1}
      className="scroll-mt-[var(--nav-height)] py-16 md:py-24 bg-muted/30 outline-none"
      aria-labelledby="usage-heading"
    >
      <div className="container max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          {SUGGESTED_USAGE.eyebrow}
        </p>
        <h2
          id="usage-heading"
          className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4"
        >
          {SUGGESTED_USAGE.heading}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-8">
          {SUGGESTED_USAGE.intro}
        </p>

        <ol className="space-y-4">
          {SUGGESTED_USAGE.passes.map((p) => (
            <li
              key={p.number}
              className="rounded-lg border border-border bg-card p-5 flex gap-4"
            >
              <span className="font-bold font-display text-primary text-2xl shrink-0">
                {p.number}
              </span>
              <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
                {p.body}
              </p>
            </li>
          ))}
        </ol>

        <p className="mt-6 text-sm text-muted-foreground italic">
          {SUGGESTED_USAGE.closing}
        </p>

        <BackToIndex />
      </div>
    </section>
  );
}

import { GUARDRAILS } from "@/lib/pre-launch/content";
import BackToIndex from "./BackToIndex";

export default function Guardrails() {
  return (
    <section
      id="guardrails"
      tabIndex={-1}
      className="scroll-mt-[var(--nav-height)] py-16 md:py-24 outline-none"
      aria-labelledby="guardrails-heading"
    >
      <div className="container max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          {GUARDRAILS.eyebrow}
        </p>
        <h2
          id="guardrails-heading"
          className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4"
        >
          {GUARDRAILS.heading}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {GUARDRAILS.intro}
        </p>
        <ul className="space-y-3">
          {GUARDRAILS.items.map((it, i) => (
            <li
              key={i}
              className="rounded-lg border border-border bg-card p-4 text-sm md:text-base text-foreground/90 leading-relaxed"
            >
              {it}
            </li>
          ))}
        </ul>

        <div className="mt-8 pt-6 border-t border-border space-y-2">
          {GUARDRAILS.footer.map((line, i) => (
            <p
              key={i}
              className="text-xs uppercase tracking-widest text-muted-foreground"
            >
              {line}
            </p>
          ))}
        </div>

        <BackToIndex />
      </div>
    </section>
  );
}

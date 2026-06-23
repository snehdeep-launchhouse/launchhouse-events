import { RED_FLAGS, RED_FLAGS_META, RED_FLAGS_CLOSING } from "@/lib/pre-launch/content";
import BackToIndex from "./BackToIndex";
import { AlertTriangle } from "lucide-react";

export default function RedFlags() {
  return (
    <section
      id="red-flags"
      tabIndex={-1}
      className="scroll-mt-[var(--nav-height)] py-16 md:py-24 bg-muted/30 outline-none"
      aria-labelledby="red-flags-heading"
    >
      <div className="container max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-destructive mb-3">
          {RED_FLAGS_META.eyebrow}
        </p>
        <h2
          id="red-flags-heading"
          className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-7 h-7 text-destructive" aria-hidden="true" />
          {RED_FLAGS_META.heading}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {RED_FLAGS_META.intro}
        </p>

        <ol className="space-y-3">
          {RED_FLAGS.map((f) => (
            <li
              key={f.number}
              className="rounded-lg border border-border bg-card p-4 flex gap-3"
            >
              <span className="inline-flex items-center justify-center min-w-8 h-7 rounded-md bg-destructive/10 text-destructive text-sm font-semibold shrink-0">
                {f.number}
              </span>
              <span className="text-sm md:text-base text-foreground/90 leading-relaxed">
                {f.text}
              </span>
            </li>
          ))}
        </ol>

        <p className="mt-6 text-sm italic text-muted-foreground">{RED_FLAGS_CLOSING}</p>

        <BackToIndex />
      </div>
    </section>
  );
}

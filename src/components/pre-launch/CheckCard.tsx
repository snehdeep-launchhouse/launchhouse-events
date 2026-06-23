import type { Check, SectionLetter } from "@/lib/pre-launch/content";

interface Props {
  sectionLetter: SectionLetter;
  check: Check;
}

export default function CheckCard({ sectionLetter, check }: Props) {
  const letter = sectionLetter.toLowerCase();
  const anchorId = `check-${letter}-${check.number}`;

  return (
    <article
      id={anchorId}
      tabIndex={-1}
      className="scroll-mt-[var(--nav-height)] rounded-xl border border-border bg-card p-5 md:p-6 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-labelledby={`${anchorId}-title`}
    >
      <div className="flex items-baseline gap-3 mb-2">
        <span className="inline-flex items-center justify-center min-w-8 h-7 px-2 rounded-md bg-primary/10 text-primary text-sm font-semibold">
          {sectionLetter}.{check.number}
        </span>
      </div>
      <h3
        id={`${anchorId}-title`}
        className="text-base md:text-lg font-semibold font-display leading-snug text-foreground"
      >
        {check.title}
      </h3>

      {check.why && (
        <div className="mt-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
            Why it matters
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-1">
            {check.why}
          </p>
        </div>
      )}

      <div className="mt-3">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Common issue to catch
        </p>
        <p className="text-sm text-foreground/90 leading-relaxed mt-1">
          {check.commonIssue}
        </p>
      </div>

    </article>
  );
}

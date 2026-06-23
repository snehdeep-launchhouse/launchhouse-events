import type { Check, SectionLetter } from "@/lib/pre-launch/content";

interface Props {
  sectionLetter: SectionLetter;
  check: Check;
}

export default function CheckCard({ sectionLetter, check }: Props) {
  const letter = sectionLetter.toLowerCase();
  const anchorId = `check-${letter}-${check.number}`;
  const label = `${sectionLetter}.${check.number}`;

  return (
    <article
      id={anchorId}
      tabIndex={-1}
      className="group relative scroll-mt-[var(--nav-height)] py-4 pl-3 pr-2 -mx-2 outline-none rounded-md border-l-2 border-transparent transition-colors duration-200 hover:bg-primary/[0.04] hover:border-primary/60 focus-within:bg-primary/[0.05] focus-within:border-primary/70 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none"
      aria-labelledby={`${anchorId}-title`}
    >
      <h3
        id={`${anchorId}-title`}
        className="text-[15px] md:text-base font-semibold leading-snug text-foreground transition-colors duration-200 group-hover:text-foreground group-focus-within:text-foreground motion-reduce:transition-none"
      >
        <span className="text-primary font-semibold mr-2 transition-colors duration-200 group-hover:text-primary group-focus-within:text-primary motion-reduce:transition-none">
          {label}
        </span>
        <span>{check.title}</span>
      </h3>

      {check.why && (
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground/80">Why: </span>
          {check.why}
        </p>
      )}

      <p className="mt-1.5 text-sm text-foreground/85 leading-relaxed">
        <span className="font-semibold text-foreground/80">Common issue: </span>
        {check.commonIssue}
      </p>
    </article>
  );
}

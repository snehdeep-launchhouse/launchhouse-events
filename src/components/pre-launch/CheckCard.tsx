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
      className="scroll-mt-[var(--nav-height)] py-4 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
      aria-labelledby={`${anchorId}-title`}
    >
      <h3
        id={`${anchorId}-title`}
        className="text-[15px] md:text-base font-semibold leading-snug text-foreground"
      >
        <span className="text-primary font-semibold mr-2">{label}</span>
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

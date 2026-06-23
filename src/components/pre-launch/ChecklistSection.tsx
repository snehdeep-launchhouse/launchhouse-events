import type { Section } from "@/lib/pre-launch/content";
import CheckCard from "./CheckCard";

export function sectionAnchorId(s: Section) {
  return `section-${s.letter.toLowerCase()}-${s.slug}`;
}

export default function ChecklistSection({ section }: { section: Section }) {
  const id = sectionAnchorId(section);
  return (
    <section
      id={id}
      tabIndex={-1}
      className="scroll-mt-[var(--nav-height)] py-12 md:py-16 outline-none"
      aria-labelledby={`${id}-title`}
    >
      <div className="container max-w-5xl">
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-primary font-bold text-lg">
            Section {section.letter}
          </span>
        </div>
        <h2
          id={`${id}-title`}
          className="text-2xl md:text-3xl font-bold font-display tracking-tight mb-5"
        >
          {section.title}
        </h2>

        <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-4 md:p-5 mb-8">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-primary mb-1">
            Why this section matters
          </p>
          <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
            {section.why}
          </p>
        </div>

        <ol className="space-y-4 list-none">
          {section.checks.map((c) => (
            <li key={c.number}>
              <CheckCard sectionLetter={section.letter} check={c} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

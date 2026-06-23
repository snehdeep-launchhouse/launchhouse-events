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
      className="scroll-mt-[var(--nav-height)] py-5 md:py-7 outline-none"
      aria-labelledby={`${id}-title`}
    >
      <div className="container max-w-5xl">
        <h2
          id={`${id}-title`}
          data-quick-index-heading
          className="text-xl md:text-2xl font-bold font-display tracking-tight mb-3"
        >
          <span className="text-primary">Section {section.letter}</span>
          <span className="text-foreground/70 font-normal mx-2">—</span>
          <span>{section.title}</span>
        </h2>

        <div className="border-l-2 border-primary/70 pl-3 mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/80 mb-0.5">
            Why this section matters
          </p>
          <p className="text-sm text-foreground/85 leading-relaxed">
            {section.why}
          </p>
        </div>

        <ol className="list-none divide-y divide-border/70 border-y border-border/70">
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

import {
  TIMING_GUIDE,
  TIMING_ROWS,
  AT_A_GLANCE,
  SECTIONS,
  type SectionLetter,
} from "@/lib/pre-launch/content";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowRight } from "lucide-react";

const SECTION_HREF: Record<SectionLetter, string> = SECTIONS.reduce(
  (acc, s) => {
    acc[s.letter] = `#section-${s.letter.toLowerCase()}-${s.slug}`;
    return acc;
  },
  {} as Record<SectionLetter, string>,
);

export default function TimingGuide() {
  return (
    <section
      id="timing-guide"
      tabIndex={-1}
      className="scroll-mt-[var(--nav-height)] py-16 md:py-24 bg-muted/30 outline-none"
      aria-labelledby="timing-heading"
    >
      <div className="container max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          {TIMING_GUIDE.eyebrow}
        </p>
        <h2
          id="timing-heading"
          className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-6"
        >
          {TIMING_GUIDE.heading}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-8">
          {TIMING_GUIDE.intro}
        </p>

        {/* Timing table — desktop */}
        <div className="hidden md:block rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">Moment</TableHead>
                <TableHead className="w-[28%]">When</TableHead>
                <TableHead>Sections</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TIMING_ROWS.map((r) => (
                <TableRow key={r.moment}>
                  <TableCell className="font-medium">{r.moment}</TableCell>
                  <TableCell>{r.when}</TableCell>
                  <TableCell>{r.sections}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Timing — mobile cards */}
        <ul className="md:hidden space-y-3">
          {TIMING_ROWS.map((r) => (
            <li
              key={r.moment}
              className="rounded-lg border border-border bg-card p-4"
            >
              <p className="font-semibold text-foreground">{r.moment}</p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium text-foreground">When: </span>
                {r.when}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium text-foreground">Sections: </span>
                {r.sections}
              </p>
            </li>
          ))}
        </ul>

        {/* Rule of thumb intentionally omitted from the webpage — it remains in the source PDF / content.ts. */}



        {/* At a glance */}
        <h3 className="text-xl font-bold font-display mt-12 mb-4">
          {TIMING_GUIDE.atAGlanceHeading}
        </h3>

        <div className="hidden md:block rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[10%]">Section</TableHead>
                <TableHead>Title</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {AT_A_GLANCE.map((r) => (
                <TableRow key={r.letter} className="group">
                  <TableCell className="font-semibold">{r.letter}</TableCell>
                  <TableCell className="p-0">
                    <a
                      href={SECTION_HREF[r.letter]}
                      className="flex items-center justify-between gap-2 px-4 py-3 text-foreground hover:text-primary hover:underline underline-offset-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                    >
                      <span>{r.title}</span>
                      <ArrowRight
                        className="h-4 w-4 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 text-primary"
                        aria-hidden="true"
                      />
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <ul className="md:hidden space-y-2">
          {AT_A_GLANCE.map((r) => (
            <li key={r.letter}>
              <a
                href={SECTION_HREF[r.letter]}
                className="rounded-lg border border-border bg-card p-3 flex gap-3 items-baseline hover:border-primary/50 hover:bg-primary/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
              >
                <span className="font-semibold text-primary w-6 shrink-0">
                  {r.letter}
                </span>
                <span className="text-sm text-foreground flex-1">{r.title}</span>
                <ArrowRight className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

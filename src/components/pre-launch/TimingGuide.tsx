import { TIMING_GUIDE, TIMING_ROWS } from "@/lib/pre-launch/content";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function TimingGuide() {
  return (
    <section
      id="timing-guide"
      tabIndex={-1}
      className="scroll-mt-[var(--nav-height)] py-16 md:py-24 bg-muted/30 outline-none"
      aria-labelledby="timing-heading"
    >
      <div className="container max-w-5xl">
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

        {/* Rule of thumb and "At a glance" subsection intentionally omitted
            from the webpage — they remain in the source PDF / content.ts. */}
      </div>
    </section>
  );
}

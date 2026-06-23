/**
 * Webpage-only orientation copy. Source PDF (content.ts ORIENTATION) is
 * intentionally NOT used here — the printable resource keeps the long
 * orientation; the web page uses this concise narrative instead.
 */

const BULLETS: { label: string; body: string }[] = [
  {
    label: "Attendee experience",
    body:
      "registration is your event's first digital touch; a broken confirmation or wrong time zone lands at the exact moment you have earned attention.",
  },
  {
    label: "Stakeholder confidence",
    body:
      "issues caught before launch stay operational; issues caught after launch become visible to executives, sponsors, and speakers.",
  },
  {
    label: "Reporting readiness",
    body:
      "most reporting headaches start as upstream setup decisions; pre-launch is the last good moment to catch them.",
  },
];

export default function OrientationBlock() {
  return (
    <section
      id="orientation"
      tabIndex={-1}
      className="scroll-mt-[var(--nav-height)] py-16 md:py-24 outline-none"
      aria-labelledby="orientation-heading"
    >
      <div className="container max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          ORIENTATION
        </p>
        <h2
          id="orientation-heading"
          data-quick-index-heading
          className="scroll-mt-[calc(var(--nav-height)+2.5rem)] text-3xl md:text-4xl font-bold font-display tracking-tight mb-6"
        >
          Why this checklist exists.
        </h2>

        <p className="text-muted-foreground leading-relaxed mb-8">
          Most registration issues that reach attendees were preventable in the
          QA pass before launch — teams know that, and still run out of time to
          do it cleanly. This checklist is that pass, written to be used, not
          read. Run it before you open registration, before invites send,
          before reminders, and again the week of the event. A clean pass
          protects three things at once:
        </p>

        <ul className="space-y-3 mb-8">
          {BULLETS.map((b) => (
            <li
              key={b.label}
              className="rounded-lg border border-border/60 bg-card p-4"
            >
              <span className="font-semibold text-foreground">{b.label}</span>{" "}
              <span className="text-muted-foreground">— {b.body}</span>
            </li>
          ))}
        </ul>

        <p className="text-sm text-muted-foreground italic">
          Built for Event Managers, Meetings &amp; Events leads, and Cvent
          Owners running mid-market enterprise programs.
        </p>
      </div>
    </section>
  );
}

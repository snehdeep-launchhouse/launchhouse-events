import { ORIENTATION } from "@/lib/pre-launch/content";

export default function OrientationBlock() {
  return (
    <section
      id="orientation"
      tabIndex={-1}
      className="scroll-mt-[var(--nav-height)] py-16 md:py-24 outline-none"
      aria-labelledby="orientation-heading"
    >
      <div className="container max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          {ORIENTATION.eyebrow}
        </p>
        <h2
          id="orientation-heading"
          className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-6"
        >
          {ORIENTATION.heading}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-10">
          {ORIENTATION.intro}
        </p>

        {[ORIENTATION.affects, ORIENTATION.audience, ORIENTATION.structure].map(
          (block, idx) => (
            <div key={block.heading} className="mb-10 last:mb-0">
              <h3 className="text-xl font-bold font-display mb-3">
                {block.heading}
              </h3>
              {idx === 2 && "intro" in block && (
                <p className="text-muted-foreground mb-4">{block.intro}</p>
              )}
              <ul className="space-y-3">
                {block.items.map((it) => (
                  <li
                    key={it.label}
                    className="rounded-lg border border-border/60 bg-card p-4"
                  >
                    <span className="font-semibold text-foreground">
                      {it.label}
                    </span>{" "}
                    <span className="text-muted-foreground">{it.body}</span>
                  </li>
                ))}
              </ul>
              {idx === 1 && "footnote" in block && (
                <p className="mt-4 text-sm text-muted-foreground italic">
                  {block.footnote}
                </p>
              )}
            </div>
          )
        )}
      </div>
    </section>
  );
}

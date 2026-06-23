import { PRE_LAUNCH_META } from "@/lib/pre-launch/content";

export default function HeroPreLaunch() {
  return (
    <section className="relative pt-[var(--nav-height)] overflow-hidden bg-gradient-to-br from-[hsl(220,90%,12%)] via-[hsl(212,100%,22%)] to-[hsl(212,100%,30%)]">
      <div className="container relative py-20 md:py-32 flex flex-col items-center text-center gap-6 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-white text-xs sm:text-sm font-medium tracking-widest uppercase backdrop-blur-sm">
          {PRE_LAUNCH_META.eyebrow}
        </div>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold font-display tracking-tight max-w-3xl leading-[1.1] text-white">
          {PRE_LAUNCH_META.title}
        </h1>
        <p className="text-lg md:text-xl text-white/85 max-w-2xl leading-relaxed">
          {PRE_LAUNCH_META.lede}
        </p>

        <dl
          aria-label="Resource details"
          className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-4xl text-left"
        >
          {[
            { label: "Audience", value: PRE_LAUNCH_META.audience },
            { label: "Format", value: PRE_LAUNCH_META.format },
            { label: "Use", value: PRE_LAUNCH_META.use },
          ].map((it) => (
            <div
              key={it.label}
              className="rounded-lg border border-white/15 bg-white/5 backdrop-blur-sm p-4"
            >
              <dt className="text-[11px] font-semibold uppercase tracking-widest text-white/70">
                {it.label}
              </dt>
              <dd className="mt-1 text-sm text-white leading-relaxed">{it.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

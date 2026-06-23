import { useId, useMemo, useRef, useState } from "react";
import {
  SECTIONS,
  ORIENTATION,
  TIMING_GUIDE,
  RED_FLAGS_META,
  LAUNCHHOUSE_LENS,
  SUGGESTED_USAGE,
  GUARDRAILS,
  type Section,
} from "@/lib/pre-launch/content";
import { Input } from "@/components/ui/input";
import { sectionAnchorId } from "./ChecklistSection";
import { X } from "lucide-react";

type Category =
  | "Orientation"
  | "Timing Guide"
  | "Red Flags"
  | "LaunchHouse Lens"
  | "Suggested Usage"
  | "Guardrails"
  | `Section ${Section["letter"]}`;

type IndexItem = {
  category: Category;
  /** Heading label shown in the result list */
  label: string;
  /** Optional sub-label / search-only body */
  sublabel?: string;
  haystack: string;
  href: string;
};

function buildItems(): IndexItem[] {
  const items: IndexItem[] = [];

  items.push({
    category: "Orientation",
    label: ORIENTATION.heading,
    sublabel: ORIENTATION.intro,
    haystack: [ORIENTATION.heading, ORIENTATION.intro].join(" "),
    href: "#orientation",
  });

  items.push({
    category: "Timing Guide",
    label: TIMING_GUIDE.heading,
    sublabel: TIMING_GUIDE.intro,
    haystack: [TIMING_GUIDE.heading, TIMING_GUIDE.intro, TIMING_GUIDE.ruleOfThumb].join(" "),
    href: "#timing-guide",
  });

  for (const s of SECTIONS) {
    const sectionHref = `#${sectionAnchorId(s)}`;
    items.push({
      category: `Section ${s.letter}` as Category,
      label: `Section ${s.letter}: ${s.title}`,
      sublabel: s.why,
      haystack: [s.letter, s.title, s.why].join(" "),
      href: sectionHref,
    });
    for (const c of s.checks) {
      items.push({
        category: `Section ${s.letter}` as Category,
        label: `${s.letter}.${c.number} — ${c.title}`,
        sublabel: c.commonIssue,
        haystack: [
          `Section ${s.letter}`,
          s.title,
          c.title,
          c.why ?? "",
          c.commonIssue,
        ].join(" "),
        href: `#check-${s.letter.toLowerCase()}-${c.number}`,
      });
    }
  }

  items.push({
    category: "Red Flags",
    label: RED_FLAGS_META.heading,
    sublabel: RED_FLAGS_META.intro,
    haystack: [RED_FLAGS_META.heading, RED_FLAGS_META.intro].join(" "),
    href: "#red-flags",
  });
  items.push({
    category: "LaunchHouse Lens",
    label: LAUNCHHOUSE_LENS.heading,
    sublabel: LAUNCHHOUSE_LENS.body[0],
    haystack: [LAUNCHHOUSE_LENS.heading, ...LAUNCHHOUSE_LENS.body].join(" "),
    href: "#launchhouse-lens",
  });
  items.push({
    category: "Suggested Usage",
    label: SUGGESTED_USAGE.heading,
    sublabel: SUGGESTED_USAGE.intro,
    haystack: [SUGGESTED_USAGE.heading, SUGGESTED_USAGE.intro].join(" "),
    href: "#suggested-usage",
  });
  items.push({
    category: "Guardrails",
    label: GUARDRAILS.heading,
    sublabel: GUARDRAILS.intro,
    haystack: [GUARDRAILS.heading, GUARDRAILS.intro].join(" "),
    href: "#guardrails",
  });

  return items;
}

const FILTERS: { value: "All" | Category; label: string }[] = [
  { value: "All", label: "All" },
  { value: "Orientation", label: "Orientation" },
  { value: "Timing Guide", label: "Timing Guide" },
  ...SECTIONS.map((s) => ({
    value: `Section ${s.letter}` as Category,
    label: `Section ${s.letter}`,
  })),
  { value: "Red Flags", label: "Red Flags" },
  { value: "LaunchHouse Lens", label: "LaunchHouse Lens" },
  { value: "Suggested Usage", label: "Suggested Usage" },
  { value: "Guardrails", label: "Guardrails" },
];

export default function ChecklistIndex() {
  const searchId = useId();
  const searchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | Category>("All");

  const items = useMemo(() => buildItems(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((it) => {
      if (filter !== "All" && it.category !== filter) return false;
      if (!q) return true;
      return it.haystack.toLowerCase().includes(q);
    });
  }, [items, query, filter]);

  const clearAll = () => {
    setQuery("");
    setFilter("All");
    // Restore focus to the search input after React commits the state update
    // (the Clear button itself unmounts on the next render).
    requestAnimationFrame(() => {
      searchRef.current?.focus();
    });
  };

  const isFiltered = query !== "" || filter !== "All";

  return (
    <section
      id="index"
      tabIndex={-1}
      className="scroll-mt-[var(--nav-height)] py-16 md:py-20 bg-card border-y border-border outline-none"
      aria-labelledby="index-heading"
    >
      <div className="container max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          Index
        </p>
        <h2
          id="index-heading"
          className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-6"
        >
          Find a check or section.
        </h2>

        <nav aria-label="Checklist index" className="space-y-5">
          {/* Search */}
          <div>
            <label
              htmlFor={searchId}
              className="block text-sm font-medium text-foreground mb-2"
            >
              Search checks and sections
            </label>
            <Input
              id={searchId}
              ref={searchRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by keyword (e.g., time zone, ICS, comp code)…"
              autoComplete="off"
            />
          </div>

          {/* Filters */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              Filter by area
            </p>
            <div className="-mx-4 px-4 overflow-x-auto sm:mx-0 sm:px-0 sm:overflow-visible">
              <div className="flex sm:flex-wrap gap-2 min-w-max sm:min-w-0">
                {FILTERS.map((f) => {
                  const active = filter === f.value;
                  return (
                    <button
                      key={f.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilter(f.value)}
                      className={[
                        "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors shrink-0",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground border-border hover:bg-accent",
                      ].join(" ")}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Result count + clear */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p
              aria-live="polite"
              className="text-sm text-muted-foreground"
            >
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
              {isFiltered && (
                <>
                  {" "}
                  · filtered{filter !== "All" ? ` to ${filter}` : ""}
                  {query ? ` matching "${query}"` : ""}
                </>
              )}
            </p>
            {isFiltered && (
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              >
                <X className="w-3.5 h-3.5" />
                Clear filters
              </button>
            )}
          </div>

          {/* Results list */}
          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6">
              No matches. Try a different keyword or clear filters.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {filtered.map((it) => (
                <li key={it.href + it.label}>
                  <a
                    href={it.href}
                    className="block rounded-lg border border-border bg-background p-3 hover:border-primary hover:bg-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <span className="block text-[11px] font-semibold uppercase tracking-widest text-primary">
                      {it.category}
                    </span>
                    <span className="block text-sm font-medium text-foreground mt-1 leading-snug">
                      {it.label}
                    </span>
                    {it.sublabel && (
                      <span className="block text-xs text-muted-foreground mt-1 line-clamp-2">
                        {it.sublabel}
                      </span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </nav>
      </div>
    </section>
  );
}

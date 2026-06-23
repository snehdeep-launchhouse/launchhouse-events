import { useEffect, useMemo } from "react";
import { setPageSeo } from "@/lib/seo-head";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BreadcrumbJsonLd from "@/components/BreadcrumbJsonLd";
import JsonLd from "@/components/JsonLd";
import { SECTIONS, PRE_LAUNCH_META } from "@/lib/pre-launch/content";
import HeroPreLaunch from "@/components/pre-launch/HeroPreLaunch";
import OrientationBlock from "@/components/pre-launch/OrientationBlock";
import TimingGuide from "@/components/pre-launch/TimingGuide";
import ChecklistIndex from "@/components/pre-launch/ChecklistIndex";
import ChecklistSection from "@/components/pre-launch/ChecklistSection";
import RedFlags from "@/components/pre-launch/RedFlags";
import LaunchHouseLens from "@/components/pre-launch/LaunchHouseLens";
import SuggestedUsage from "@/components/pre-launch/SuggestedUsage";
import Guardrails from "@/components/pre-launch/Guardrails";

const PATH = "/pre-launch-checks";
const SITE = "https://launchhouse.events";
const TITLE = "Cvent Pre-Launch QA Checklist | LaunchHouse Events";
const DESCRIPTION =
  "Free 14-section, 112-check Cvent pre-launch QA pass for event teams — run before launch, invites, reminders, and event week.";

/**
 * Move focus to the destination of the current hash without re-scrolling.
 * For #index, push focus to the index search field so Back to Index also
 * returns keyboard focus to the search.
 */
function focusHashTarget() {
  const hash = window.location.hash;
  if (!hash) return;
  const id = hash.slice(1);

  if (id === "index") {
    // The search input is the first focusable input inside #index.
    const indexEl = document.getElementById("index");
    const input =
      indexEl?.querySelector<HTMLInputElement>('input[type="search"]');
    if (input) {
      input.focus({ preventScroll: true });
      return;
    }
  }

  const el = document.getElementById(id);
  if (el && typeof (el as HTMLElement).focus === "function") {
    (el as HTMLElement).focus({ preventScroll: true });
  }
}

export default function PreLaunchChecks() {
  useEffect(() => {
    return setPageSeo({ title: TITLE, description: DESCRIPTION, path: PATH });
  }, []);

  useEffect(() => {
    // Initial hash on load.
    if (window.location.hash) {
      // Defer until after layout so the element exists.
      const t = window.setTimeout(focusHashTarget, 0);
      return () => window.clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    const handler = () => focusHashTarget();
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const articleSchema = useMemo(
    () => ({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: PRE_LAUNCH_META.title,
      description: DESCRIPTION,
      author: { "@type": "Organization", name: "LaunchHouse Events" },
      publisher: {
        "@type": "Organization",
        name: "LaunchHouse Events",
        url: SITE,
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE}${PATH}` },
      url: `${SITE}${PATH}`,
    }),
    []
  );

  return (
    <div className="min-h-screen bg-background">
      <BreadcrumbJsonLd
        items={[{ name: "Pre-Launch Checks", path: PATH }]}
      />
      <JsonLd id="pre-launch-article-jsonld" data={articleSchema} />

      {/* Skip link */}
      <a
        href="#index"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:shadow-btn"
      >
        Skip to checklist index
      </a>

      <Navbar />

      <main id="main">
        <HeroPreLaunch />
        <OrientationBlock />
        <TimingGuide />
        <ChecklistIndex />
        {SECTIONS.map((s) => (
          <ChecklistSection key={s.letter} section={s} />
        ))}
        <RedFlags />
        <LaunchHouseLens />
        <SuggestedUsage />
        <Guardrails />
      </main>

      <Footer />
    </div>
  );
}

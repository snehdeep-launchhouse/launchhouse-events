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
import ChecklistSection from "@/components/pre-launch/ChecklistSection";
import RedFlags from "@/components/pre-launch/RedFlags";
import LaunchHouseLens from "@/components/pre-launch/LaunchHouseLens";
import Guardrails from "@/components/pre-launch/Guardrails";
import FloatingResourceActions from "@/components/pre-launch/FloatingResourceActions";
import ReadingProgress from "@/components/pre-launch/ReadingProgress";
import { DownloadGateProvider } from "@/components/pre-launch/DownloadGateContext";
import DownloadGateDialog from "@/components/pre-launch/DownloadGateDialog";

const PATH = "/pre-launch-checks";
const SITE = "https://launchhouse.events";
const TITLE = "Cvent Pre-Launch QA Checklist | LaunchHouse Events";
const DESCRIPTION =
  "A free Cvent pre-launch QA checklist for event teams — test registration, payments, sessions, emails, and reporting before invites and go-live.";

/**
 * Move focus to the destination of the current hash without re-scrolling.
 * Generic deep-link helper for major-section anchors.
 */
function focusHashTarget() {
  const hash = window.location.hash;
  if (!hash) return;
  const id = hash.slice(1);
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
    <DownloadGateProvider>
      <div className="min-h-screen bg-background pre-launch-print">
        <BreadcrumbJsonLd
          items={[{ name: "Pre-Launch Checks", path: PATH }]}
        />
        <JsonLd id="pre-launch-article-jsonld" data={articleSchema} />

        {/* Skip link */}
        <a
          href="#orientation"
          className="pl-skip-link sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-md focus:bg-primary focus:text-primary-foreground focus:shadow-btn"
        >
          Skip to orientation
        </a>

        <Navbar />
        <ReadingProgress />

        <main id="main">
          <HeroPreLaunch />
          <OrientationBlock />
          <TimingGuide />
          {SECTIONS.map((s) => (
            <ChecklistSection key={s.letter} section={s} />
          ))}
          <RedFlags />
          <LaunchHouseLens />
          <Guardrails />
        </main>

        <FloatingResourceActions />
        <Footer />
        <DownloadGateDialog />
      </div>
    </DownloadGateProvider>
  );
}

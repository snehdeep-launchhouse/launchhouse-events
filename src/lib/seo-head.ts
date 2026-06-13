/**
 * Lightweight per-route head updater.
 * Sets <title>, <meta name="description">, <link rel="canonical">,
 * and the corresponding og:* and twitter:* tags by mutating document.head.
 *
 * Returns a cleanup function suitable for useEffect.
 */

const SITE = "https://launchhouse.events";
const DEFAULT_TITLE = "LaunchHouse Events | Cvent Event Build Support";
const DEFAULT_DESCRIPTION =
  "Hands-on Cvent registration builds, Attendee Hub support, mobile app readiness, and event tech QA for commercial event teams. Simple builds from $899.";
const DEFAULT_PATH = "/";

type SeoOptions = {
  title: string;
  description: string;
  /** Route path beginning with "/" (e.g. "/about"). */
  path: string;
};

function upsertMeta(selector: string, attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function setPageSeo({ title, description, path }: SeoOptions): () => void {
  const url = `${SITE}${path}`;
  const prevTitle = document.title;

  document.title = title;
  upsertMeta('meta[name="description"]', "name", "description", description);
  upsertCanonical(url);
  upsertMeta('meta[property="og:title"]', "property", "og:title", title);
  upsertMeta('meta[property="og:description"]', "property", "og:description", description);
  upsertMeta('meta[property="og:url"]', "property", "og:url", url);
  upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", title);
  upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", description);

  return () => {
    document.title = prevTitle;
    upsertMeta('meta[name="description"]', "name", "description", DEFAULT_DESCRIPTION);
    upsertCanonical(`${SITE}${DEFAULT_PATH}`);
    upsertMeta('meta[property="og:title"]', "property", "og:title", DEFAULT_TITLE);
    upsertMeta('meta[property="og:description"]', "property", "og:description", DEFAULT_DESCRIPTION);
    upsertMeta('meta[property="og:url"]', "property", "og:url", `${SITE}${DEFAULT_PATH}`);
    upsertMeta('meta[name="twitter:title"]', "name", "twitter:title", DEFAULT_TITLE);
    upsertMeta('meta[name="twitter:description"]', "name", "twitter:description", DEFAULT_DESCRIPTION);
  };
}

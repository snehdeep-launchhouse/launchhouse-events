// Shared abuse-mitigation helpers for public, unauthenticated edge functions.
// Defense-in-depth on top of CORS: strict Origin allow-list + instance-local
// per-IP cooldown. Not a durable / distributed rate limit — each edge instance
// has its own map, entries are lost on cold start, and a determined caller can
// rotate IPs. Goal: dampen rapid abuse from a single browser / IP.

const PROD_ORIGINS = new Set<string>([
  "https://launchhouse.events",
  "https://www.launchhouse.events",
  "https://launchhouse-events.lovable.app",
]);

// Lovable preview origins look like:
//   https://id-preview--<uuid>.lovable.app
//   https://<uuid>.lovable.app
//   https://<uuid>.sandbox.lovable.dev
const PREVIEW_ORIGIN_RE =
  /^https:\/\/([a-z0-9-]+\.)*lovable\.(app|dev)$/i;

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  if (PROD_ORIGINS.has(origin)) return true;
  return PREVIEW_ORIGIN_RE.test(origin);
}

export async function hashedIp(req: Request): Promise<string | null> {
  const fwd = req.headers.get("x-forwarded-for");
  const raw = (fwd ? fwd.split(",")[0] : req.headers.get("x-real-ip") || "").trim();
  if (!raw) return null;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function makeCooldown(windowMs: number, maxInWindow: number) {
  const hits = new Map<string, number[]>();

  function prune(now: number) {
    if (hits.size < 512) return;
    for (const [k, arr] of hits) {
      const kept = arr.filter((t) => now - t < windowMs);
      if (kept.length === 0) hits.delete(k);
      else hits.set(k, kept);
    }
  }

  return {
    /** Returns true when the caller is over the limit (request should be rejected). */
    isLimited(key: string): boolean {
      const now = Date.now();
      prune(now);
      const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (arr.length >= maxInWindow) {
        hits.set(key, arr);
        return true;
      }
      arr.push(now);
      hits.set(key, arr);
      return false;
    },
  };
}

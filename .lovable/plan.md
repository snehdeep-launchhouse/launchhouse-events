

## Performance Optimization & Stability Fix

### Root Cause of "Grey Screen"

The screenshot shows `DNS_PROBE_FINISHED_NXDOMAIN` for `launchhouse.events`. This is a **DNS configuration issue** — the custom domain is not resolving at the DNS level. No code change can fix this; the domain's DNS records need to be configured to point to the Lovable hosting infrastructure. However, we can add resilience so the app itself never crashes with a grey screen when it *does* load.

### Changes

#### 1. Fix App.css Breaking Layout

`src/App.css` contains default Vite boilerplate that sets `#root { max-width: 1280px; padding: 2rem; text-align: center }`. This constrains the entire app and should be removed — it's leftover scaffolding.

**File: `src/App.css`** — Clear all content (the file is imported but should be empty or removed).

#### 2. Global Error Boundary

Create a React Error Boundary that catches runtime crashes and shows a branded "Reload Dashboard" screen instead of a blank page.

**File: `src/components/ErrorBoundary.tsx`** — New component:
- Class component with `componentDidCatch` logging
- Renders an Ignition-branded error screen with a "Reload Dashboard" button that calls `window.location.reload()`
- Wrapped around `<Routes>` in `App.tsx`

**File: `src/App.tsx`** — Wrap the `<BrowserRouter>` contents with `<ErrorBoundary>`.

#### 3. Code Splitting with React.lazy

Convert heavy route components to lazy imports so the initial bundle only loads the landing page.

**File: `src/App.tsx`** — Change imports for `AdminReport`, `BuildRequest`, `GetAQuote`, `Pricing`, `About`, `Services`, `PrivacyPolicy`, `TermsOfService`, `ResetPassword` to use `React.lazy()` with a `<Suspense>` fallback showing the branded spinner already in `index.html`.

#### 4. Image Lazy Loading

Add `loading="lazy"` to banner images in `HeroSection`, `BuildRequest`, and `GetAQuote` pages. These are already using `<img>` tags — just add the attribute.

**Files: `src/components/HeroSection.tsx`, `src/pages/BuildRequest.tsx`, `src/pages/GetAQuote.tsx`** — Add `loading="lazy"` to `<img>` tags.

#### 5. Memoize Dashboard Cards

**File: `src/pages/AdminReport.tsx`**:
- Wrap the report picker card grid items with `React.memo` via a extracted `ReportCard` component
- Memoize `visibleCards` with `useMemo`
- Memoize `fetchReport` is already done with `useCallback` — no change needed

#### 6. React Query for Admin Data Fetching (Stale-While-Revalidate)

**File: `src/pages/AdminReport.tsx`**:
- Replace the manual `fetchReport` + `setRecords` pattern with `useQuery` from `@tanstack/react-query` (already installed)
- Configure `staleTime: 30_000` and `gcTime: 5 * 60_000` so refreshes show cached data instantly, then revalidate in background
- Keep the realtime subscription to `invalidateQueries` instead of calling fetch directly
- Replace `recordCounts` manual fetch with a separate `useQuery` for counts

#### 7. Console Cleanup

**File: `src/pages/AdminReport.tsx`** — The `console.error` in `NotFound.tsx` is intentional (404 logging). Remove any stray `console.log` calls if found. The `useEffect` dependency warning from the auth effect is silenced with the existing eslint-disable comment — no change needed.

### Files Summary

| File | Action |
|------|--------|
| `src/App.css` | Clear boilerplate content |
| `src/components/ErrorBoundary.tsx` | Create — global error boundary with branded UI |
| `src/App.tsx` | Edit — add ErrorBoundary wrapper, React.lazy imports, Suspense fallback |
| `src/pages/AdminReport.tsx` | Edit — React Query for data fetching, memoized ReportCard component |
| `src/pages/BuildRequest.tsx` | Edit — add `loading="lazy"` to banner image |
| `src/pages/GetAQuote.tsx` | Edit — add `loading="lazy"` to banner image |
| `src/components/HeroSection.tsx` | Edit — add `loading="lazy"` to hero image |

### Technical Details

**Error Boundary UI:**
- Navy gradient background matching Ignition branding
- Flame icon + "Something went wrong" heading
- "Reload Dashboard" button calling `window.location.reload()`
- Error details collapsed in a `<details>` tag for debugging

**React.lazy setup:**
```typescript
const AdminReport = lazy(() => import("./pages/AdminReport"));
// ... other lazy imports

// In JSX:
<Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>}>
  <Routes>...</Routes>
</Suspense>
```

**React Query migration for AdminReport:**
```typescript
const { data: records = [], isLoading } = useQuery({
  queryKey: ["report", activeReport],
  queryFn: async () => { /* existing fetch logic */ },
  enabled: !!activeReport && activeReport !== "manage_admins",
  staleTime: 30_000,
});
```

Realtime subscription calls `queryClient.invalidateQueries({ queryKey: ["report", activeReport] })` instead of `fetchReport()` directly, giving instant cache-first display on tab switches.


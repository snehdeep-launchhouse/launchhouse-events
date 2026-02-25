

## Fix: Refresh Button Appears Unresponsive

### Current State

The database contains exactly 11 partial records in `abandoned_eb_forms` — the frontend count is correct. No data is missing.

The "stuck" refresh button is a UX issue: `invalidateQueries` respects `staleTime` (30s), so rapid clicks do nothing. There's also no visual feedback when refresh completes instantly from cache.

### Changes

#### `src/pages/AdminReport.tsx`

1. **Force refetch on refresh click** — Replace `invalidateQueries` with `refetchQueries` which bypasses `staleTime` and always hits the server:

```typescript
// BEFORE:
const handleRefresh = useCallback(() => {
  queryClient.invalidateQueries({ queryKey: ["ignition", "report", activeReport] });
}, [queryClient, activeReport]);

// AFTER:
const handleRefresh = useCallback(() => {
  queryClient.refetchQueries({ queryKey: ["ignition", "report", activeReport] });
  queryClient.refetchQueries({ queryKey: ["ignition", "counts"] });
}, [queryClient, activeReport]);
```

This ensures clicking Refresh always fetches fresh data and also updates the record count. The `loading` state from React Query will briefly show the spinner on the RefreshCw icon, giving immediate visual feedback.

### Files Summary

| File | Change |
|------|--------|
| `src/pages/AdminReport.tsx` | Use `refetchQueries` instead of `invalidateQueries` for the refresh button; also refresh counts |




## Fix: Slow First Open of Contact/Demo Panels

### Problem
The panels use `React.lazy` which only starts downloading the JS chunk **after** the user clicks. This causes a visible delay on first open because the chunk must be fetched, parsed, and rendered before the panel appears.

### Solution: Prefetch chunks on idle
Instead of waiting for a click, **preload** both panel chunks during browser idle time (after initial page render). This way the JS is already cached when the user clicks, making the first open instant.

### Implementation

**File: `src/components/ContactPanelProvider.tsx`**

Add a `useEffect` that triggers dynamic `import()` calls via `requestIdleCallback` (with a setTimeout fallback) shortly after mount. This prefetches the chunks without blocking the initial render. The existing `React.lazy` references continue to work — they resolve instantly from the module cache.

```tsx
useEffect(() => {
  const prefetch = () => {
    import("./ContactUsPanel");
    import("./RequestDemoPanel");
  };
  if ("requestIdleCallback" in window) {
    const id = requestIdleCallback(prefetch);
    return () => cancelIdleCallback(id);
  } else {
    const id = setTimeout(prefetch, 2000);
    return () => clearTimeout(id);
  }
}, []);
```

One file change, no visual or functional impact. Panels will open instantly on first click.


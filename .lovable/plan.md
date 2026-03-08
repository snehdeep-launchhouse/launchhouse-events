

## Plan: Fix "Schedule Consultation" to Open Demo Panel Directly

**Problem**: The "Schedule Consultation" button in the chat widget currently navigates to `/?book-demo=true` with a full page reload fallback, which is clunky and breaks the user flow.

**Solution**: Use the existing `useContactPanel().openDemoPanel()` context method directly from the widget — no navigation needed.

### Change: `src/components/ReceptionistWidget.tsx`

1. Import `useContactPanel` from `ContactPanelProvider`
2. Replace the `handleConsultation` function body: instead of navigating/reloading, simply close the chat widget and call `openDemoPanel()`

```typescript
const { openDemoPanel } = useContactPanel();

const handleConsultation = () => {
  setOpen(false);
  openDemoPanel();
};
```

3. Remove the now-unused `useNavigate` and `useLocation` imports (if no longer needed by other handlers like `handleCalculator`). Since `handleCalculator` still uses `navigate` and `location`, those stay.

This is a single-file, ~5-line change. All existing functionality remains intact — the `ContactPanelProvider` context and `RequestDemoPanel` component are unchanged.


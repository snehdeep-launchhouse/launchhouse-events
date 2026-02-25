

## Enhance Ignition Report Tables

### Changes to `src/pages/AdminReport.tsx`

#### 1. Hide internal columns (ID, submitted_at, created_at, updated_at, etc.)

Define a set of hidden column keys per report type so they never render in the table or affect display, but remain available in CSV exports:

```text
HIDDEN_COLUMNS = {
  abandoned:      ["id", "created_at", "updated_at"],
  build_requests: ["id", "submitted_at", "email_sent_at"],
  quote_requests: ["id", "submitted_at", "email_sent_at"],
}
```

The `columns` array will be filtered to exclude these before rendering. Full data (including hidden columns) will still be included in bulk CSV downloads for completeness.

#### 2. Add search bar

Add a text `Input` with a search icon below the header toolbar. It filters rows client-side across all visible columns (case-insensitive substring match). The record count subtitle updates to reflect filtered results (e.g. "4 of 11 records").

#### 3. Add per-row CSV download button

Add a small download icon button as the last column in each table row. Clicking it downloads a single-row CSV file named `{report}-row-{index}-{date}.csv` containing all columns (including hidden ones like ID) for that record.

#### 4. State additions

Two new pieces of state:
- `searchQuery: string` — bound to the search input, reset when switching reports.

#### 5. Data flow

```text
records (from React Query)
  → filter out hidden columns for display
  → filter rows by searchQuery across visible fields
  → render table
  → per-row download uses full original row data (all columns)
  → bulk CSV download uses filtered rows (respects search)
```

### Files changed

| File | Change |
|------|--------|
| `src/pages/AdminReport.tsx` | Add hidden columns map, search input + filtering, per-row CSV download button, update record count to show filtered vs total |


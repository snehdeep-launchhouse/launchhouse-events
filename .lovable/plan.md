

# Audit Report & Plan: Connect Missing Tables to Ignition

## Audit Findings

### All Database Tables in the System

| Table | Connected to Ignition | RLS Policies | Status |
|---|---|---|---|
| `abandoned_eb_forms` | Yes | Correct | OK |
| `abandoned_contact_requests` | Yes | Correct | OK |
| `abandoned_demo_form` | Yes | Correct | OK |
| `build_requests` | Yes | Correct | OK |
| `quote_requests` | Yes | Correct | OK |
| `admin_users` | Yes (Manage Admins) | Correct | OK |
| **`demo_requests`** | **No** | Has admin SELECT via `is_active_admin()` | **Needs connection** |
| **`event_complexity_leads`** | **No** | Has admin SELECT via `is_active_admin()` | **Needs connection** |

### Security Assessment of Unconnected Tables

Both missing tables already have proper security policies:
- Public INSERT allowed (for form submissions)
- Anonymous SELECT denied
- Admin SELECT gated by `is_active_admin()` security definer function
- No UPDATE/DELETE policies exist (read-only for admins currently)

**No database migrations needed** — security is already correctly configured.

---

## Plan: Connect Both Tables to Ignition

All changes are in `src/pages/AdminReport.tsx`:

### 1. Add Report Cards
Add two new entries to `BASE_REPORT_CARDS`:
- **"Demo Requests"** — icon: `CalendarCheck` — "All scheduled demo requests"
- **"Event Builder Leads"** — icon: `Calculator` — "Leads from the Event Complexity Calculator"

### 2. Add Hidden Columns Config
- `demo_requests`: hide `id`, `created_at`, `google_event_id`
- `event_complexity_leads`: hide `id`, `created_at`

### 3. Add Fetch Logic
- In `fetchReportData`: add cases for `demo_requests` (ordered by `created_at` desc) and `event_complexity_leads` (ordered by `created_at` desc)
- In `fetchRecordCounts`: add count queries for both tables

### 4. Add Realtime Subscriptions
Add `.on("postgres_changes", ...)` listeners for both `demo_requests` and `event_complexity_leads` tables to the existing realtime channel.

### 5. Update Type
Add `"demo_requests"` and `"event_complexity_leads"` to the `ReportType` union type.

### 6. Validation Summary
- Both tables use the same `is_active_admin()` RLS pattern as all other Ignition tables
- No new RLS policies, auth changes, or migrations required
- Realtime will auto-update counts and data like existing tables
- CSV download will work automatically via the existing generic `downloadCSV` helper


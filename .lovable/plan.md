

## Redesign Admin Management: Clear Admin vs User Separation + Live Acceptance Status

### What Changes

**1. Split the user list into two clear sections**
- A prominent **"Admin (You)"** card at the top showing your account with a special "Owner" or "Master Admin" badge -- always visible, never removable
- A separate **"Invited Users"** section below listing everyone else

**2. Better status labels**
- Invited users who haven't accepted yet will show a **"Not Accepted"** badge (yellow/orange)
- Once they click the invite link and log in, their status automatically flips to **"Accepted"** (green badge)
- Your own card always shows **"Master Admin"**

**3. Auto-update status on first login**
- When an invited user logs into the admin dashboard for the first time, the system will automatically update their status from `invited` to `active` in the database
- Next time you refresh the Manage Admins page, their badge will show "Accepted"

### Files to Change

| File | Change |
|------|--------|
| `src/components/ManageAdmins.tsx` | Redesign layout: Master Admin card on top, invited users listed separately with "Not Accepted" / "Accepted" badges. Hide remove button for the master admin row. |
| `src/pages/AdminReport.tsx` | After successful login, update the logged-in user's `admin_users.status` to `active` so acceptance is tracked automatically. |

### Technical Details

- The master admin row (ID `b426c88b-...`) is filtered out of the regular users list and displayed in its own highlighted card
- Status mapping: `invited` displays as "Not Accepted", `active` displays as "Accepted"
- The status update on login uses a simple `supabase.from("admin_users").update({ status: "active" })` call, which runs after authentication is confirmed
- No database migration needed -- the existing `status` column already supports this


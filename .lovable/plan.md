

## Ignition + LaunchHouse Branding for Password Reset Flow

### Current State

- **ResetPassword page** (`src/pages/ResetPassword.tsx`): Generic styling — plain white background, blue Lock icon, no Ignition logo, no LaunchHouse branding. Inconsistent with the Ignition login screen which uses a navy gradient background, Flame icon, and orange accents.
- **Invite email** (`supabase/functions/invite-admin/index.ts`): Uses LaunchHouse blue (#006AE1) header and "You're Invited!" title. No mention of "Ignition" platform. No Flame/logo imagery. Doesn't match the dashboard's navy + orange palette.

### Changes

#### 1. ResetPassword Page — Match Ignition Login Screen

**File: `src/pages/ResetPassword.tsx`**

Restyle to match the Ignition login screen in `AdminReport.tsx` (lines 266-297):
- Background: navy gradient (`linear-gradient(135deg, hsl(220 50% 14%), hsl(220 40% 22%))`)
- Card: `rounded-2xl bg-card shadow-2xl` (matching login)
- Replace the Lock icon with the Flame icon in an orange gradient square (matching Ignition login)
- Title: "Ignition" with subtitle text adjusted per link type
- Add "© LaunchHouse Events" footer at bottom (matching login screen)
- Import `IgnitionLogo` or replicate the Flame icon pattern
- All functionality remains identical — only JSX/styles change

#### 2. Invite Email — Ignition + LaunchHouse Dual Branding

**File: `supabase/functions/invite-admin/index.ts`**

Restyle the HTML email template (lines 106-135):
- Header: Change from blue (#006AE1) to Ignition navy (#1a2744) with an orange (#f17a28) accent bar at top
- Title: Change "You're Invited!" to "You're Invited to Ignition"
- Body: Add "by LaunchHouse Events" subtitle below the main heading
- Button: Change from blue to Ignition orange (#f17a28) with white text
- Footer: Add "Powered by LaunchHouse Events" in muted text
- Subject line: Change to "You've been invited to Ignition — LaunchHouse Events"
- No changes to link generation, auth logic, or Resend API calls

### Files Summary

| File | Action |
|------|--------|
| `src/pages/ResetPassword.tsx` | Restyle to match Ignition login (navy bg, Flame icon, card style) |
| `supabase/functions/invite-admin/index.ts` | Restyle email template with Ignition navy/orange branding |

### Technical Details

**ResetPassword visual structure (matching Ignition login):**
```text
┌──────────────────────────────┐
│  Navy gradient background    │
│                              │
│   ┌──────────────────────┐   │
│   │  🔥 Flame icon       │   │
│   │  "Ignition"          │   │
│   │  subtitle text       │   │
│   │                      │   │
│   │  Email (readonly)    │   │
│   │  New Password        │   │
│   │  Confirm Password    │   │
│   │                      │   │
│   │  [Save Password]     │   │
│   └──────────────────────┘   │
│                              │
│  © 2026 LaunchHouse Events   │
└──────────────────────────────┘
```

**Email header color change:**
- Old: `background:#006AE1` (LaunchHouse blue)
- New: `background:#1a2744` (Ignition navy) with 4px orange top border
- Button: `background:#f17a28` (Ignition orange)


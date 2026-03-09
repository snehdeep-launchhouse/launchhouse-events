

## Security Analysis & Fix: `abandoned_contact_requests` RLS Policy

### Current Security Issue

**The Problem:** The UPDATE policy `Public can upsert by email` uses:
```sql
USING (status = 'partial')
WITH CHECK (status IN ('partial', 'completed'))
```

This allows **any anonymous user** to:
1. Update any row where `status = 'partial'` without proving ownership
2. Use `UPDATE ... RETURNING *` to read other users' data (first_name, last_name, business_email, captured_data)
3. Overwrite legitimate submissions with attacker-controlled data

### Solution: Token-Based Ownership Model

Add a `submission_token` column that:
- Auto-generates a UUID on INSERT
- Must match for UPDATE operations
- Never exposed via SELECT (anonymous users have no SELECT access)

### Implementation Plan

**1. Database Migration**
- Add `submission_token UUID DEFAULT gen_random_uuid()` column
- Drop the insecure UPDATE policy
- Create new UPDATE policy requiring token match:
  ```sql
  USING (status = 'partial' AND submission_token = current_setting('request.headers', true)::json->>'x-submission-token')
  ```

**2. Code Changes (ContactUsPanel.tsx & GetAQuote.tsx)**
- After INSERT, retrieve the generated token via `.select('submission_token').single()`
- Store token in component ref/state
- Include token in all UPDATE calls via header or filter

**3. Technical Details**
```
┌─────────────────────────────────────────────────────────────┐
│  Client (Browser)                                           │
│  ┌─────────────┐    ┌──────────────────┐                   │
│  │ INSERT row  │───>│ Get token back   │                   │
│  └─────────────┘    └──────────────────┘                   │
│         │                   │                               │
│         v                   v                               │
│  ┌─────────────────────────────────────┐                   │
│  │ Store token in sessionRef           │                   │
│  └─────────────────────────────────────┘                   │
│         │                                                   │
│         v                                                   │
│  ┌─────────────────────────────────────┐                   │
│  │ UPDATE with .eq('submission_token') │                   │
│  └─────────────────────────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
```

**Files to modify:**
- `src/components/ContactUsPanel.tsx` — track token, use in updates
- `src/pages/GetAQuote.tsx` — same pattern
- Database migration for column + policy


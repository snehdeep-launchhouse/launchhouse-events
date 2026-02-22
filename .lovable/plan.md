

## Add Google Drive Folder Creation to Build Request Edge Function

### Overview
When a build request form is submitted, a new Google Drive folder will be created automatically (named after the event), shared publicly for uploads, and the folder link will be injected into all three emails — all before the existing Resend email logic runs.

### Prerequisites — Two New Secrets Needed
Before implementing, you will need to add two secrets:

1. **GOOGLE_SERVICE_ACCOUNT_KEY** — The full JSON string of your Google Cloud Service Account credentials (the service account must have Google Drive API enabled)
2. **GOOGLE_DRIVE_PARENT_FOLDER_ID** — The ID of the master folder where event subfolders will be created (the service account email must be shared as an Editor on this folder)

### What Changes

**File: `supabase/functions/send-build-request/index.ts`**

The existing logic (payload parsing, DB insert, Resend emails) remains 100% intact. The only additions are:

1. **New helper: `getGoogleAccessToken()`** — Parses the service account JSON, creates a JWT signed with the service account's private key (using Web Crypto API available in Deno), exchanges it for an OAuth2 access token via Google's token endpoint. No external JWT library needed.

2. **New helper: `createDriveFolder()`** — Called after DB insert but before emails are sent:
   - Authenticates using the access token
   - Creates a folder via `POST https://www.googleapis.com/drive/v3/files` with the parent folder ID and event title as the name
   - Sets permissions via `POST https://www.googleapis.com/drive/v3/files/{folderId}/permissions` with `type: "anyone"`, `role: "writer"`
   - Retrieves the folder's `webViewLink` via `GET https://www.googleapis.com/drive/v3/files/{folderId}?fields=webViewLink`

3. **Email template updates** — A new row is added to the internal email table and the confirmation email:
   - Internal email: A new table row `["Google Drive Folder", "<a href='...'>Open Folder</a>"]`
   - Confirmation email: A paragraph added saying "Please use this Google Drive folder link to upload any additional information and supply us with all necessary documents for building your event." with a clickable link/button

4. **Graceful fallback** — If the Google Drive secrets are missing or the API call fails, the function logs the error but continues to send emails without the Drive link (so form submissions never break).

### Flow After the Change

```
Form Submitted
    |
    v
Parse payload + DB insert (unchanged)
    |
    v
[NEW] Create Google Drive folder
[NEW] Set folder to "anyone with link can upload"
[NEW] Get shareable link
    |
    v
Inject Drive link into email HTML (internal + confirmation)
    |
    v
Send 3 emails via Resend (unchanged routing)
    |
    v
Update DB status (unchanged)
```

### Config Update
**File: `supabase/config.toml`** — Add `verify_jwt = false` for the `send-build-request` function (it's currently missing from the config).

### No Other Files Changed
The frontend form, database schema, and all other edge functions remain untouched.

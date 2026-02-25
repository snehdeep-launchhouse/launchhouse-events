

## Mobile Optimization Plan

### Issues Identified

After reviewing all components, here are the mobile-specific problems and optimizations needed:

#### 1. DualListPicker is Unusable on Mobile
The `DualListPicker` uses `grid-cols-[1fr_auto_1fr]` which squeezes three columns on small screens, making the "Available" and "Chosen" lists and control buttons too narrow to use. On mobile, this should stack vertically.

#### 2. AdminReport Table Overflows on Mobile
The report table view has `p-6` padding and no horizontal scroll container on small screens. Column headers and data cells use `whitespace-nowrap` which causes horizontal overflow issues.

#### 3. ManageAdmins Action Buttons Overflow on Mobile
Each invited user row uses `flex items-center justify-between` with multiple buttons (Resend, Reset Password, Remove) that overflow on narrow screens. The user ID `font-mono` text also overflows.

#### 4. AdminReport Card Grid Needs Mobile Optimization
The report picker cards use `sm:grid-cols-2 lg:grid-cols-3` which means on phones they stack well, but the card padding `p-6` can be reduced for tighter mobile layouts.

#### 5. IgnitionHeader Email Hidden on Mobile
Already has `hidden sm:inline` for email — this is fine. But the header padding could be tighter.

#### 6. BuildRequest Step Navigation Buttons
The "Previous" / "Cancel" / "Next" button row in steps 2 and 3 uses `flex justify-between` which can wrap awkwardly on very small screens.

#### 7. GetAQuote Registration Options Grid
The radio group options use `flex-col sm:flex-row` which is already good. The checkbox grid `sm:grid-cols-2` also handles mobile. No changes needed here.

---

### Files to Edit

| File | Changes |
|------|---------|
| `src/components/DualListPicker.tsx` | Stack vertically on mobile with horizontal controls becoming vertical tap buttons |
| `src/pages/AdminReport.tsx` | Reduce padding on mobile (`p-4 md:p-6`), improve table scroll container |
| `src/components/ManageAdmins.tsx` | Stack user rows vertically on mobile — info on top, action buttons below |
| `src/pages/BuildRequest.tsx` | Improve step nav button wrapping on small screens |
| `src/index.css` | Add touch-action utilities for smoother mobile scrolling |

---

### Technical Details

**DualListPicker Mobile Layout:**
```text
Desktop (>=640px):     [Available] [◀ ▶] [Chosen]
Mobile (<640px):       [Available]
                       [▼ ▲ buttons]
                       [Chosen]
```
- Change `grid-cols-[1fr_auto_1fr]` to responsive: single column on mobile, 3-column on `sm:`
- Rotate the control buttons to horizontal on mobile (move down/up instead of left/right)

**ManageAdmins Mobile Layout:**
- Wrap each user card content in `flex-col` on mobile, `flex-row` on `sm:`
- Stack action buttons below user info
- Truncate the UUID display on mobile

**AdminReport Table:**
- Already has `overflow-auto` on the table container — this is actually fine
- Reduce outer padding from `p-6` to `p-3 sm:p-6`
- Make the report header flex column on mobile (title + buttons stack)

**BuildRequest Step Navigation:**
- Use `flex-col-reverse sm:flex-row` for the button group so "Previous" appears below "Next" on mobile, matching natural thumb reach




# End-to-End QA Review — Findings & Fix Plan

## Current State Assessment

After reviewing all relevant files, here is the status of every component:

---

## 1. ReceptionistWidget (Active: `src/components/ReceptionistWidget.tsx`)

**Status: Healthy — all recent fixes are in place**

- Typing indicator with 3 animated dots and 300ms minimum display ✅
- Unread badge counter ✅
- Calculator button navigates to `/calculator` (not `/pricing`) ✅
- Consultation button calls `openDemoPanel()` ✅
- Mobile positioning: `bottom-20 right-3` ✅
- 44px touch targets on close button and action buttons ✅
- `fontSize: "16px"` on textarea to prevent iOS zoom ✅
- `touch-manipulation` on interactive elements ✅
- `safe-area-inset-bottom` padding ✅
- SSE streaming with proper buffer handling ✅
- Session-based engagement tracking (auto-open, auto-close, dismiss) ✅

**All fixes carry over to mobile automatically** — the component uses `useIsMobile()` for conditional positioning but all logic (typing indicator, unread badge, navigation fixes) is shared code.

## 2. Dead File: `src/components/AiReceptionistWidget.tsx`

**Issue:** This is an old version of the widget that is never imported anywhere. It still uses the `Loader2` spinner, navigates to `#lead-form`, and lacks all recent improvements. It should be deleted to avoid confusion.

## 3. Calculator Logic (`src/lib/calculator-data.ts`)

**Status: Healthy** — 29 tests covering all override rules, edge cases, boundary scores, deduplication, and inferred products.

## 4. Calculator UI (`src/components/EventComplexityCalculator.tsx`)

**Status: Healthy**
- `openDemoPanel` consultation button on result page ✅
- Lead form integration ✅
- Inferred products preview ✅
- Back/restart navigation ✅

## 5. Lead Form (`src/components/LeadForm.tsx`)

**Status: Healthy** — writes to `event_complexity_leads` with all mapped columns, handles errors gracefully, shows confirmation.

## 6. Database Schema

**Status: Healthy** — `event_complexity_leads` table has all required columns matching the `answerToColumnMap`.

## 7. AI System Prompt (`receptionist-chat/index.ts`)

**Status: Healthy** — references `/calculator` correctly, mentions both action buttons, uses `google/gemini-3-flash-preview`, handles 429/402 errors.

---

## Issues Found

| # | Issue | Severity | Fix |
|---|-------|----------|-----|
| 1 | Dead file `AiReceptionistWidget.tsx` | Low | Delete it |

**That's the only issue.** Everything else is working correctly. The typing indicator, unread badge, calculator redirect, consultation CTA, mobile responsiveness — all verified through code review.

---

## Mobile Compatibility Confirmation

All recent fixes are **automatically mobile-compatible**:
- **Typing indicator**: Pure CSS animation, no viewport dependency
- **Unread badge**: Positioned relative to the pill, inherits mobile positioning
- **300ms minimum display**: JavaScript timer, platform-agnostic
- **Calculator redirect**: `navigate("/calculator")` works identically on mobile
- **Consultation button**: `openDemoPanel()` triggers the same drawer/sheet pattern

The widget already has explicit mobile handling:
- `bottom-20` positioning to clear sticky CTA bar
- `left-3 right-3` on mobile for full-width panel
- `28rem` height cap on mobile
- `touch-manipulation` on buttons
- `16px` font size to prevent iOS zoom

## Plan

1. **Delete `src/components/AiReceptionistWidget.tsx`** — dead code, never imported, outdated version
2. **Run the existing 29 calculator logic tests** to confirm all pass
3. **Verify via browser** that the widget opens, typing dots appear, streaming works, and calculator/consultation buttons function


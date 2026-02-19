
## Remove T&C from Simple Build Card on Pricing Page

### Change
Remove the "T&C Apply" tooltip from the Simple Build card under Registration Build Packages.

### Technical Details

**File: `src/pages/Pricing.tsx`**
- In the `eventBuilds` array, change the Simple Build object's `hasTnC` property from `true` to `false` (line 28)
- This will stop the `TnCTooltip` from rendering next to the "$899" price on that card
- No other cards are affected since they already have `hasTnC: false`

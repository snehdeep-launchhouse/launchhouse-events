

## Match Banner Sizes to Pricing Page

The hero banner padding differs across pages:

| Page | Current Padding | Target |
|------|----------------|--------|
| **Pricing** | `py-24 md:py-36` + `gap-8` | *(reference)* |
| **About** | `py-16 md:py-22` + `gap-6` | `py-24 md:py-36` + `gap-8` |
| **Services** | `py-16 md:py-22` + `gap-6` | `py-24 md:py-36` + `gap-8` |

### Changes

1. **About.tsx (line 85)**: Change `py-16 md:py-22` to `py-24 md:py-36` and `gap-6` to `gap-8`
2. **Services.tsx (line 86)**: Change `py-16 md:py-22` to `py-24 md:py-36` and `gap-6` to `gap-8`

Two single-line edits, no structural changes.




## Fix: Blank Page Flash on Initial Load

### Problem
When visiting the site fresh, there's a ~1 second blank white page before content appears. This happens because:
1. The `<div id="root"></div>` in the HTML is completely empty until React's JavaScript downloads, parses, and renders
2. Google Fonts are loaded via a blocking `@import` in CSS, which delays rendering further

### Solution

**1. Add inline styles and a lightweight loader to `index.html`**
- Set the page background color to match the site's dark hero area so there's no white flash
- Add a simple CSS spinner/logo placeholder inside the `#root` div that shows instantly and gets replaced when React mounts

**2. Move Google Fonts from CSS `@import` to HTML `<link>` tags**
- Change the font loading from a blocking `@import url(...)` in `src/index.css` to `<link rel="preconnect">` and `<link rel="stylesheet">` tags in `index.html`
- This allows fonts to load in parallel with other resources instead of blocking CSS rendering

### Files to Change

| File | Change |
|------|--------|
| `index.html` | Add inline background style, a lightweight spinner inside `#root`, and font `<link>` tags with `preconnect` |
| `src/index.css` | Remove the `@import url(...)` line for Google Fonts (line 5) |

### What the User Will See
Instead of a blank white page, visitors will see the site's dark background color immediately with a subtle loading spinner that smoothly transitions into the full page content.

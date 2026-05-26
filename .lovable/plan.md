# Replace Google search favicon

## Root cause
`public/favicon.ico` still exists — this is the original Lovable icon. Browsers (and Google's crawler) request `/favicon.ico` by default, and that file overrides the `<link rel="icon" href="/favicon.svg">` we already have in `index.html`. That's why Google's result still shows the Lovable logo even though our SVG favicon is correct.

## Fix
1. Generate a Launch House `favicon.png` (512×512) from the LH mark (blue `#006AE1` rounded square, white "LH" — matching `public/favicon.svg` and `src/components/Logo.tsx`) and save it to `public/favicon.png`.
2. Delete `public/favicon.ico` so it stops shadowing the new icon.
3. Update `index.html` `<head>` to add a PNG icon link alongside the existing SVG, and add an explicit Google-preferred sized icon:
   ```html
   <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
   <link rel="icon" type="image/png" sizes="512x512" href="/favicon.png" />
   <link rel="apple-touch-icon" href="/favicon.png" />
   ```
4. Keep `og-banner.svg` and all other meta unchanged.

## Note on Google
Google caches favicons for weeks. After publish, the new icon will appear on the live site immediately, but Google search results can take days to weeks to refresh on their next recrawl. Nothing further to do on our end.

No functional/code changes — assets and `<head>` tags only.
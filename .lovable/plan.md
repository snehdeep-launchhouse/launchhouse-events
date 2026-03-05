

## Fix: Remove Text Artifacts from Banner Images & Add Unique CTA Images

### Problem
1. **Hero banners** on About, Services, and Pricing pages contain AI-generated text baked into the images.
2. **CTA sections** on all three pages reuse the same `cta-banner.jpg`, and the user wants unique, page-relevant bottom images that don't repeat the hero banner.

### Solution
Regenerate **6 images** total using the higher-quality `google/gemini-3-pro-image-preview` model with strict "no text" instructions:

**Hero banners (3):**
- `about-banner.jpg` — Diverse team collaborating in a modern office, blue corporate tones, no text, left-side fade
- `services-banner.jpg` — Event technicians configuring registration systems at a conference, no text, left-side fade
- `pricing-banner.jpg` — Professional consultation with screens showing plans/proposals, no text, left-side fade

**CTA section images (3 new files):**
- `about-cta-banner.jpg` — Corporate networking event with attendees mingling, warm lighting, no text
- `services-cta-banner.jpg` — Live event stage with AV and tech crew operating equipment, no text
- `pricing-cta-banner.jpg` — Business handshake or deal-closing moment in a modern office, no text

### Files Changed
- `src/assets/banners/about-banner.jpg` (regenerated, no text)
- `src/assets/banners/services-banner.jpg` (regenerated, no text)
- `src/assets/banners/pricing-banner.jpg` (regenerated, no text)
- `src/assets/banners/about-cta-banner.jpg` (new)
- `src/assets/banners/services-cta-banner.jpg` (new)
- `src/assets/banners/pricing-cta-banner.jpg` (new)
- `src/pages/About.tsx` — Update CTA image import from `cta-banner.jpg` to `about-cta-banner.jpg`
- `src/pages/Services.tsx` — Update CTA image import to `services-cta-banner.jpg`
- `src/pages/Pricing.tsx` — Update CTA image import to `pricing-cta-banner.jpg`

No changes to text, layout, spacing, overlays, or component structure.


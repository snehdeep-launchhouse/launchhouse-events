

## Fix: Remove Text Artifacts from Two Banner Images

### Problem
Two AI-generated banner images contain unwanted embedded text:
1. **Get a Quote** (`src/assets/banners/get-quote-banner.jpg`) — has "Business ... Solutions" text baked into the image
2. **Build Request** (`src/assets/banners/build-request-banner.jpg`) — has distorted text artifacts

### Solution
Regenerate both images using the AI image model with explicit "no text" instructions, matching the existing style (corporate event tech, blue tones, subtle left-side fade).

**Get a Quote** — prompt: Business consultation scene, professionals discussing event solutions at a modern table with laptops, blue corporate tones, no text whatsoever, clean background suitable for text overlay, subtle left fade.

**Build Request** — prompt: Event preparation backstage, team setting up event technology and registration systems, conference environment, blue corporate tones, no text whatsoever, clean background suitable for text overlay, subtle left fade.

### Files Changed
- `src/assets/banners/get-quote-banner.jpg` (regenerated)
- `src/assets/banners/build-request-banner.jpg` (regenerated)

No code, layout, or text changes.


# Title Page redesign — install guide

A drop-in replacement for the Conference Simulator landing page (`app/page.tsx`),
restyled to match the 3D venue's palette (steel‑navy + carpet red + Amazon orange +
CVPR blue), with the CVPR logo, refreshed data, and the **Space Grotesk** display face.

## What changed

- **Theme:** dark steel‑navy with a receding perspective floor grid + ambient red /
  orange / blue glows, echoing the 3D hall.
- **Branding:** CVPR logo (top‑left) and an "Amazon Science @ CVPR 2026" lockup (top‑right).
- **Data updates:**
  - Poster Hall → **13 accepted papers** (was 5)
  - Oral Theater → **6 talks · Lafite Highlight** with a ★ HIGHLIGHT badge (was a single talk)
  - Industry Fair → Amazon CV booth
- **Type:** headings/UI in Space Grotesk via `next/font/google` (no install needed).
- **Controls:** real keycaps for W A S D / Mouse / E / ESC.

## Contents of this zip

```
app/page.tsx              ← replaces your existing app/page.tsx
app/globals-additions.css ← one @keyframes block to append to app/globals.css
public/cvpr-logo.svg      ← the logo (only needed if you don't already have it)
README.md
```

## Install

Requires your existing stack — no new dependencies (Next 16, React 19, Tailwind v4,
`next/font`). From your repo root:

1. **Replace the page**
   ```bash
   cp app/page.tsx /path/to/your-repo/app/page.tsx
   ```
   (Overwrites the current landing page.)

2. **Add the grid animation** — append the contents of `app/globals-additions.css`
   to the end of your existing `app/globals.css`:
   ```bash
   cat app/globals-additions.css >> /path/to/your-repo/app/globals.css
   ```
   Do **not** replace your whole `globals.css` — only append the `@keyframes tp-drift`
   block. Without it the page still works; the floor grid just won't drift.

3. **Logo** — you already ship `public/cvpr-logo.svg`, so you can skip this. The copy
   here is provided only as a fallback:
   ```bash
   cp public/cvpr-logo.svg /path/to/your-repo/public/cvpr-logo.svg
   ```

4. **Run it**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 — the CTA links to `/conference`, same as before.

## Notes

- **Fonts:** Space Grotesk is loaded with `next/font/google` inside `page.tsx`, so it's
  self‑hosted and optimized automatically — nothing to install. Your global Geist font
  is untouched.
- **Logo asset:** your `cvpr-logo.svg` is the **CVPR 2025 Denver** lockup (it reads
  "Denver Colorado · June 3–7, 2025"), which doesn't match the Nashville 2026 framing.
  Swap in a 2026 asset at `public/cvpr-logo.svg` when you have one, or ask and I can
  mask it down to just the "CVPR" mark + petal.
- **Viewport:** your `globals.css` sets `body { overflow: hidden }`. The page is built
  to fit one screen at typical desktop heights; on very short windows some content may
  be clipped (same behavior as the original landing).

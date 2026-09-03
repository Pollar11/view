# Branding assets

The UI logo is a **vector interpretation** of the View mark, drawn in
[`src/components/Logo.tsx`](../src/components/Logo.tsx) with `currentColor` so it
adapts to light/dark automatically. `public/icon.svg` (favicon / PWA) and
`public/mark.svg` (standalone) match it.

To use your **polished 3D render** where a raster is required, drop these files
into `public/` — they are picked up automatically, no code change:

| File | Size | Used for |
| --- | --- | --- |
| `icon-192.png` | 192×192 | PWA icon (Android) |
| `icon-512.png` | 512×512 | PWA icon, splash |
| `apple-touch-icon.png` | 180×180 | iOS home screen |
| `og.png` | 1200×630 | Link previews (OpenGraph / Twitter) |
| `maskable-512.png` | 512×512, safe-area padded | Android adaptive icon |

Then add the maskable + raster entries back to `icons` in
`src/app/layout.tsx` and the `icons` array in `manifest.webmanifest`.

**Generate them from your master file** (`logo.png` / `logo.svg`):

```bash
# ImageMagick
magick logo.png -resize 192x192 public/icon-192.png
magick logo.png -resize 512x512 public/icon-512.png
magick logo.png -resize 180x180 public/apple-touch-icon.png
magick logo.png -background none -gravity center -extent 1200x630 public/og.png
```

Or use https://realfavicongenerator.net with `logo.svg` and copy the PNGs here.

Keep the mark's aspect ratio; the wordmark ("view", lowercase) is set in the app
font — no image needed.

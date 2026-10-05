# Meesho ShadeMatch prototype

A beauty shopping concept built for the Meesho DICE BPC case competition. Browse lipstick variants, capture a colour reference, compare nearby shades, and preview selected colours on your face or skin.

[Open the website](https://dilatedtime.github.io/meesho-shadematch-prototype/)

## Features

- Shopping results with shade, finish, price, rating, product-type and Colour Passport filters.
- Camera capture and image upload with a magnified pixel picker, RGB, HEX and CIELAB values.
- Local 5 × 5 colour sampling that excludes unrelated neighbouring colours and rejects transparent pixels.
- Shade matching and product pages with variant details, creator examples and demo purchase feedback.
- Live lipstick, eyebrow tint and eye-shadow previews with finish and intensity controls.
- Skin comparison for up to four colours, using the camera or an uploaded photo.

The catalogue, creators and reviews are demonstration data. This is an independent case-competition prototype, not an official Meesho product. Colour readings describe the image; lighting, camera processing, skin tone and finish affect physical appearance.

## Run locally

The website uses plain HTML, CSS and JavaScript. No package installation or build is required.

```sh
git clone https://github.com/dilatedtime/meesho-shadematch-prototype.git
cd meesho-shadematch-prototype
python -m http.server 4173 --directory dist
```

Open `http://localhost:4173`. Camera access requires HTTPS or localhost and your browser permission. The face model downloads when you start face try-on; camera frames and uploaded photos are processed in your browser.

## Files

| Path | Purpose |
| --- | --- |
| `dist/index.html` | Shopping pages and feature dialogs |
| `dist/app.js` | Catalogue, picker, matching and skin comparison |
| `dist/tryon.js` | MediaPipe face tracking and makeup overlays |
| `dist/styles.css` | Main layout and visual design |
| `dist/responsive-fixes.css` | Small-screen layout adjustments |
| `dist/assets/` | Demo product and creator imagery |
| `ARCHITECTURE.md` | Product plan, architecture and pilot scope |
| `.github/workflows/pages.yml` | GitHub Pages deployment |
| `.openai/hosting.json` | Existing Sites hosting configuration |

## Publish updates

Push changes to `main`. The GitHub Actions workflow checks JavaScript syntax and publishes `dist/` to GitHub Pages. You can also run **Deploy website to GitHub Pages** from the repository's Actions tab.

## References

The virtual try-on feature was informed by [kgpgaurav/Meesho](https://github.com/kgpgaurav/Meesho). Face tracking uses [MediaPipe Face Landmarker](https://ai.google.dev/edge/mediapipe/solutions/vision/face_landmarker/web_js). Project details and prototype limits are documented in [ARCHITECTURE.md](ARCHITECTURE.md).

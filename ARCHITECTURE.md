# ShadeMatch prototype plan

## Product goal

Help a shopper turn a colour seen on a product, screen or physical reference into a useful starting point for lipstick discovery. The prototype keeps the submitted Round 2 proposal intact: a Shade Passport, a colour-assisted search path, creator evidence, Beauty Profile preferences and purchase feedback tied to the exact shade variant.

The colour reading is a comparison aid, not a promise of identical applied colour. Cameras apply automatic white balance, exposure, tone mapping and compression. Lip pigmentation, finish and lighting also change the result.

## Working prototype flow

1. The shopper starts the rear camera, uploads a photo or chooses a sample.
2. The browser samples a small region, rejects very dark or clipped pixels and calculates an average sRGB value.
3. The prototype converts sRGB to CIELAB under a D65 reference white.
4. A perceptual colour-distance function ranks the synthetic lipstick catalog.
5. The shopper can ask for a more muted, lighter, deeper, warmer or cooler direction.
6. Each result opens a Shade Passport with finish, coverage, seller capture status and creator evidence.
7. The shopper can save a shade, compare two products, complete a short Beauty Profile and add an item to the demo bag.

## Prototype architecture

| Layer | Current demo | Production path |
|---|---|---|
| Capture | Browser `getUserMedia`, file upload and Canvas pixel sampling | Native app camera module with device capability checks, exposure guidance and reference-card calibration |
| Colour processing | Local sRGB to CIELAB conversion and perceptual distance ranking | Versioned colour service with device correction, CIEDE2000, confidence scoring and observability |
| Catalog | Static synthetic JSON in the client | Product catalog service with one Shade Passport per exact variant |
| Seller input | Pre-filled demo fields | Guided capture workflow, reference target, automated QC and manual exception review |
| Creator proof | One synthetic creator card | Media service that checks exact SKU, declared lighting, filter policy and disclosure fields |
| Personalisation | Local Beauty Profile and saved shades | Consent-based profile service with preference controls and deletion |
| Feedback | Demo aggregate | Verified-purchase feedback tied to order item, shade, skin-depth band and expectation outcome |
| Storage | `localStorage`; no image upload | Encrypted account data; raw capture discarded unless the user explicitly submits it |

## Data objects

- `ShadePassport`: shade ID, display name, reference sRGB, CIELAB, finish, coverage, capture method, QC state and variant ID.
- `CreatorProof`: creator ID, exact variant ID, lighting declaration, coat count, filter declaration, skin-depth band and disclosure.
- `MatchResult`: captured reference, transformed target, colour distance, confidence band and active refinement.
- `BeautyProfile`: skin-depth band, undertone and preferred finish.
- `ShadeFeedback`: order item, expected-match response, optional contextual tags and timestamp.

## Seller capture and quality checks

1. Place the product swatch and a neutral grey or calibrated colour target in the same frame.
2. Use diffuse lighting and disable colour-altering filters.
3. Reject clipped highlights, deep shadows, heavy compression and mixed-colour lighting.
4. Apply the device and reference-card correction before storing a catalog reference.
5. Compare repeated captures. Send unstable readings for review.
6. Display a consumer-facing disclaimer for finish, substrate and lighting effects.

## Pilot scope

- 30 lipstick shades across 5 to 8 participating sellers.
- 15 micro creators using one fixed evidence checklist.
- Four test cells: current page, Shade Passport, creator proof, and combined experience.
- Primary measures: product-page conversion, shade-related cancellation or return reason, expectation-match response and 30-day repeat purchase.
- Guardrails: camera-permission denial, scan completion, page latency, creator-content complaints and seller QC failure rate.

## Privacy and safety

- Ask for camera access only after the shopper taps the camera button.
- Process the live preview on the device and stop all camera tracks when the user exits.
- Do not infer sensitive traits from the face or store raw images by default.
- Keep a photo-upload fallback and a manual shade search path.
- Use plain language: “closest catalog reference” instead of “exact match.”

## Prototype file map

- `dist/index.html`: shopping flow, dialogs and accessible page structure.
- `dist/styles.css`: responsive Meesho-inspired interface system.
- `dist/app.js`: capture, colour conversion, ranking, refinement, saved shades, profile and bag logic.
- `dist/assets/`: original generated demo imagery.

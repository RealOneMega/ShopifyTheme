# Theme Change History

This file records implementation notes for future troubleshooting. Add a dated entry whenever theme behavior, structure, or performance is changed so prior work is easy to audit before repeating it.

## 2026-07-13 — Risky Limits 2.0 production rebuild

- Rebuilt the global design system, header/footer groups, product, collection, search, cart, localization, accounts, content templates, flexible theme blocks, metadata, and storefront JavaScript lifecycle.
- Adopted Shopify's high-variant product option architecture and native product media, selling-plan, recommendation, filter, customer-form, and checkout surfaces.
- Replaced simulated reviews, purchases, loyalty, quantity pricing, SMS, and back-in-stock behavior with app-block hosts that render no fake live data.
- Added audit, setup, features, QA, README, and changelog documentation.
- Validated 153 files with Shopify Theme Check 4.4.0 at zero offenses and built `Risky Limits-2.0.0.zip`.
- Live Shopify rendering, real checkout, installed apps, Markets, and Lighthouse remain release gates documented in `THEME_QA.md`.

## 2026-05-10

### Hero slideshow media and content safety

- Reworked hero slides so the image/picture layer, overlay layer, and text layer are independently positioned inside the fixed-height hero. This prevents unusually wide or tall images from affecting text placement.
- Added a per-slide `image_fit` setting with `cover` and `contain` modes. `cover` keeps the traditional full-bleed crop; `contain` shows the entire asset and is useful for very wide banners.
- Set the current homepage `TerminalVelocityBanner.jpg` slide to `contain` and added explicit desktop/mobile hero heights in `templates/index.json`.
- Converted focal point values into a CSS custom property so image position is applied consistently with both `cover` and `contain`.
- Added responsive `srcset`/`sizes` output for hero images and eager loading for the first slide only.
- Added left, center, and right overlay treatments so text remains readable regardless of placement.
- Added mobile-safe content bounds so custom text positions cannot push hero copy outside the visible area.

### JavaScript behavior and safety

- Updated slideshow initialization to avoid duplicate event binding, respect reduced-motion preferences, pause autoplay on hover/focus, pause while the tab is hidden, and keep `aria-hidden`/`aria-current` state in sync.
- Added HTML escaping for client-rendered wishlist, predictive search, recently viewed, cart drawer, and shipping-rate markup before injecting API text through `innerHTML`.
- Routed AJAX cart, product JSON, predictive search, and shipping-rate fetches through Shopify's route root when available.

### Product card efficiency

- Added responsive image widths for product cards instead of always requesting a single 600px image.
- Updated quick add to use the selected or first available variant and disable itself for sold-out single-variant products.
- Marked wishlist card buttons as `type="button"` so they cannot accidentally submit a surrounding form.
- Replaced hardcoded `/cart/add` form actions in product card and main product forms with `routes.cart_add_url`.

### Theme Check cleanup

- Converted raw feature-section image tags to Shopify `image_tag` output so rendered images include width and height attributes and use better lazy-loading/responsive width hints.
- Removed an unused header `logo_alignment` assignment.

### Context notes

- The worktree already contained uncommitted product detail accordion changes and partial hero positioning changes before this pass. This pass preserved that direction and did not revert those edits.

## 2026-05-10 Product card competitiveness pass

### Compact product cards

- Moved card actions from the content area into an overlay dock on the product image so quick actions no longer increase card height.
- Changed mobile product grids to two columns and collection grids to four columns on desktop, scaling down to three/two columns responsively. This fixes the one-product-per-screen feel on smaller resolutions.
- Tightened card padding, title sizing, price display, hover movement, and badge spacing for a denser merchandising layout.
- Changed the default global `show_vendor` setting to `false` because the vendor row is redundant on a single-brand store and makes cards taller.

### Merchandising features

- Added sale percentage badges on product cards using compare-at price math.
- Added color swatches from product color/colour options, capped at five visible swatches with a `+N` overflow marker.
- Added a media-level wishlist icon so wishlist state is accessible without taking a full text row.
- Added an optional global `enable_quick_view` setting, enabled by default.

### Quick view drawer

- Added a global quick-view drawer in `layout/theme.liquid`.
- Added `initQuickView()` in `assets/theme.js` to fetch product JSON, render image/title/vendor/price/description, and show add-to-cart or choose-options actions.
- Updated AJAX cart submit handling to use delegated form submission so dynamically injected quick-view add-to-cart forms work.

### Collection merchandising

- Added a collection toolbar with product count and removable active filter chips above collection grids.

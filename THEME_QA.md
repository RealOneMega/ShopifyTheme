# Theme QA and release checklist

## Recorded static validation

Validation date: 2026-07-13.

| Check | Result |
| --- | --- |
| JavaScript syntax (`node --check assets/theme.js`) | Pass |
| JSON templates/settings parsing | Pass |
| Section and theme-block schema parsing | Pass |
| Shopify Theme Check 4.4.0 | Pass: 153 files, 0 offenses |
| Shopify theme package | Pass: `Risky Limits-2.0.1.zip` |
| Placeholder/fabricated commerce scan | Pass for active storefront defaults; provider features are app-backed |
| Live Shopify render | Pre-fix home/product diagnosis run at `dev.riskylimits.com`; post-fix upload and responsive matrix still required |
| Lighthouse / Core Web Vitals | Not run; deployable URL not supplied |
| Real checkout and payment authorization | Not run; store/admin configuration required |

## Required preview-store matrix

The 2.0.1 visual calibration specifically needs a post-upload pass for announcement-bar full width, hero copy bounds, product-page contrast, product buy-column width, footer contrast/type hierarchy, and the home-section transitions. The code package cannot prove those store-rendered results until it is uploaded to a Shopify preview theme.

Test at 320, 375, 768, 1024, 1440, and 1920 CSS pixels. Use current Chrome, Safari/WebKit, Firefox, and Edge where available.

- Home: hero crop/video fallback, announcement controls, navigation, section spacing, product card density, email success/error states, and footer localization.
- Collection: no-filter and multi-filter states, price ranges, sort preservation, pagination, zero products, grid density, mobile filter drawer, and 100+ products.
- Product: single variant, sold out, unavailable combination, 2–3 options, 250+ variants, combined listings, compare-at price, unit price, selling plans, required selling plan, app block, missing metafields, and all supported media types.
- Cart: empty, multiple lines, duplicate variants with different properties, selling plans, discounts, quantity zero, failures/offline response, note persistence, free-shipping threshold, additional checkout buttons, and checkout handoff.
- Search: empty query, no result, mixed result types, predictive keyboard selection, rapid typing/aborted requests, and localized routes.
- Accounts: login errors, recovery, registration, activation, account order list, order detail, address create/edit/delete, and logout. Confirm whether the store uses classic or new customer accounts.
- Content: page/contact form errors and success, blog pagination, article metadata, list collections, 404, password form, and gift-card QR/copy/print behavior.
- Markets: at least two countries and languages, currency changes, translated resources, right-to-left language if offered, and locale-prefixed navigation/forms.

## Accessibility checks

- Traverse every interactive control using keyboard only; confirm visible focus and logical order.
- Confirm Escape closes every modal/drawer and focus returns to its trigger.
- Confirm mobile/mega menus, tabs, accordions, media controls, predictive search, cart controls, and filters are operable with keyboard and screen reader output.
- Run axe or an equivalent automated scanner on home, collection, product, search, cart, contact, account, password, and gift-card pages.
- Check 200% zoom, reflow at 320px, error identification, meaningful alt text, heading order, landmarks, color contrast, reduced motion, and touch targets.

## Performance checks

Run Lighthouse against production-like preview pages with representative catalog/media and installed apps. Record mobile and desktop results rather than relying on theme-only estimates.

- Verify the first product/hero image is the intentional LCP element and is not lazy loaded.
- Confirm no app injects render-blocking scripts or duplicates analytics.
- Check responsive image request widths, video poster/fallback behavior, layout shifts, long tasks, unused third-party code, and cart/search request waterfalls.
- Test on a throttled mobile profile and a real mid-range phone.

## Production gate

Publish only after every applicable preview-store case passes, policies and shipping claims match Shopify Admin, an operational support email replaces the GitHub no-reply metadata, translations are reviewed, app blocks are configured, analytics consent is verified, and a rollback copy of the previous live theme exists.

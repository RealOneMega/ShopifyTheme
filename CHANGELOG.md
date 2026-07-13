# Changelog

## 2.0.0 — 2026-07-13

### Added

- Risky Limits design-token system and responsive production styles.
- Header/footer groups, localization form, predictive search, accessible drawers, breadcrumbs, metadata, and structured data.
- High-variant product selection, full product media support, selling plans, accelerated checkout, app blocks, recommendations, sticky add-to-cart, and metafield content.
- Native collection filters/sorting/pagination, full search, AJAX cart drawer, expanded cart page, wishlist page, and currency-aware thresholds.
- Blog, article, contact, list-collections, password, gift-card, customer account, and wishlist templates.
- Reusable theme blocks and flexible-content section.
- Merchant setup, feature, audit, QA, and release documentation.

### Changed

- Rebuilt product cards, pricing, homepage defaults, header, footer, promo bar, hero, collection, product, search, and cart systems.
- Made JavaScript controllers idempotent and Theme Editor lifecycle aware.
- Replaced hardcoded routes/currency assumptions with Shopify route and money data.
- Replaced manual purchase/review/reward/quantity/SMS/back-in-stock simulations with app-block integration surfaces.

### Removed from active storefront defaults

- Fabricated testimonials and customer activity.
- Fake rewards balances/redemptions and unenforced quantity pricing.
- Generic showcase imagery and unsupported shipping/returns claims.
- Non-submitting newsletter and SMS forms.

### Validation

- Shopify Theme Check: 153 files, zero offenses.
- JavaScript syntax and JSON/schema parsing: pass.
- Shopify CLI package: `Risky Limits-2.0.0.zip`.

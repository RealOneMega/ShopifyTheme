# Risky Limits Shopify Theme

Risky Limits 2.0 is a Shopify Online Store 2.0 theme built for an independent apparel retailer. Its visual system pairs warm, product-first commerce surfaces with black editorial moments, electric-blue brand accents, and compact athletic typography. The theme uses native Shopify objects and forms for commerce-critical behavior, supports app blocks for provider-owned functionality, and avoids simulated reviews, purchases, rewards, inventory, or discounts.

## Quick start

1. Upload `Risky Limits-2.0.3.zip` in Shopify Admin under **Online Store > Themes**.
2. Keep the uploaded theme unpublished while completing `THEME_SETUP.md`.
3. Add navigation menus, policies, product media, collections, Markets, shipping rates, and payment methods in Shopify Admin.
4. Complete the preview-store checklist in `THEME_QA.md` before publishing.

## Local validation

Run from the theme root:

```powershell
node --check assets/theme.js
shopify theme check --path .
shopify theme package --path .
```

The 2.0.3 package adds persistent wishlist coordination, wishlist-to-cart conversion, live address-aware shipping estimates, rebuilt cart/search drawers, bounded search results, and dedicated size/color filter controls. See `CHANGELOG.md` and `THEME_QA.md` for its current validation boundary.

## Architecture

- `layout/`: storefront and password layouts.
- `templates/`: JSON templates plus the Liquid gift-card template.
- `sections/`: section groups, commerce pages, content sections, and app-block hosts.
- `blocks/`: reusable theme blocks for flexible content.
- `snippets/`: cards, price, media, facets, localization, metadata, and utilities.
- `assets/theme.css`: base and storefront system styles.
- `assets/components.css`: focused component styles and the final storefront visual-calibration layer.
- `assets/theme.js`: idempotent storefront controllers and Theme Editor lifecycle handling.
- `config/`: global theme settings and saved store configuration.

Assignable page templates include `brand-story`, `lookbook`, `customer-care`, and `release`. Create a Shopify Page, assign the desired template, then replace default media, links, policy guidance, and copy in the Theme Editor before publishing.

## Documentation

- `THEME_AUDIT.md`: initial condition, findings, severity, and remediation map.
- `THEME_FEATURES.md`: implemented feature inventory and integration boundaries.
- `THEME_SETUP.md`: merchant and developer configuration.
- `THEME_QA.md`: static results and required live-store test matrix.
- `CHANGELOG.md`: release-level changes.
- `THEME_CHANGE_HISTORY.md`: detailed implementation history.

## Release boundary

The repository is statically validated and installable. Checkout, accelerated payments, Markets, customer authentication, app embeds, product data, and performance scores depend on a real Shopify store. Do not publish until the live preview matrix is complete.

The theme metadata currently uses the repository owner's GitHub no-reply address because no operational support mailbox was present in the repository. Replace `theme_support_email` in `config/settings_schema.json` with a monitored Risky Limits address before a public production launch.

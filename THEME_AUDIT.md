# Risky Limits Theme Audit

Audit date: 2026-07-13  
Repository branch: `main`  
Starting revision: `9e8fee3`  
Working tree at audit start: clean

## Executive finding

The repository is a valid-looking Shopify Online Store 2.0 theme scaffold with useful foundations: JSON templates, a header section group, native Liquid product and cart forms, responsive image filters, a product-card snippet, collection facets, predictive-search JavaScript, a local-storage wishlist, Ajax cart enhancement, and a substantial section library. Those foundations should be preserved and strengthened.

It is not production ready in its audited state. The biggest issue is a mismatch between the apparent feature count and real storefront behavior. The theme contains 80 Liquid sections, including 56 `feature-*` sections. Many of those sections render informational cards that describe a feature rather than implement it, or render forms without a Shopify form type, endpoint, consent model, or external integration. This violates the requirement that storefront controls be functional and creates a high risk of merchants enabling non-working UI.

The core storefront also needs a stronger design-token system, reusable dialog/drawer behavior, high-variant product handling, cart line updates in the drawer, mobile collection filters, complete standard templates, app blocks, localization controls, structured-data hardening, translation coverage, and robust Theme Editor re-initialization.

## Inventory

### Architecture

- Shopify-style directories present: `assets`, `config`, `layout`, `locales`, `sections`, `snippets`, and `templates`.
- Missing architecture called for by the brief: `blocks`, customer templates, blog/article templates, contact template, list-collections template, gift-card layout/template, password layout/template, and footer section group.
- Global layout: `layout/theme.liquid`.
- Header composition: `sections/header-group.json`, containing the promotional bar and header.
- Footer is statically included from the layout rather than managed as a section group.
- Global CSS and JavaScript are each monolithic: `assets/theme.css` (about 1,952 lines) and `assets/theme.js` (about 999 lines).
- No dependency manifest, automated test suite, or local theme-check configuration is present.

### Templates

Existing JSON templates:

- `templates/index.json`
- `templates/product.json`
- `templates/collection.json`
- `templates/search.json`
- `templates/cart.json`
- `templates/page.json`
- `templates/404.json`

Missing standard experiences:

- Blog and article templates.
- Contact-page alternate template.
- Customer account templates or explicit compatibility documentation for new customer accounts.
- List collections.
- Password page.
- Gift card.

The homepage template contains generic apparel copy, testimonial claims, hardcoded collection/page paths, and store-specific `shopify://shop_images/...` references. It does not yet express the Risky Limits brand strongly enough and some default claims could be misleading if published without merchant review.

### Sections and blocks

- 80 Liquid section files total.
- 56 files use the `feature-*` prefix.
- Core reusable sections include hero slideshow, featured collection/product, collection tabs, image with text, rich text, testimonials, logo list, blog posts, recently viewed, newsletter popup, rewards program, promo bar, USP row, header, footer, and main resource sections.
- All audited section schema JSON fragments parse locally.
- Section settings are heavily duplicated, especially the repeated background controls.
- No theme-block files are present.
- No `@app` blocks were found.
- Most block markup omits `block.shopify_attributes`, reducing Theme Editor selection fidelity.
- Many `feature-*` sections are visually similar cards with inline padding and repeated background schema rather than distinct production systems.
- `feature-extensions.liquid` is a catalog of feature descriptions, not an implementation and should not be exposed as storefront functionality.

### Snippets

Existing snippets:

- Product commerce: `product-card`, `price`.
- Shared section background: `section-background-media`, `section-background-style`.
- SVG icons: account, cart, close, Facebook, heart, Instagram, menu, search, shield, star, TikTok, truck, Twitter.

Missing shared primitives include breadcrumbs, localization, social icons, payment icons, pagination, facet controls, product media, product options, rating integration, inventory status, modal/drawer shell, SEO metadata, and JSON-LD fragments.

### Assets and CSS architecture

- `theme.css` provides a serviceable responsive base, component classes, focus styling, grids, drawers, cards, product layout, and hero styling.
- The audited default is primarily light and generic. The primary accent is `#0d6efd`, not the required `#0060FF`.
- The token set is incomplete: it lacks semantic surface, muted text, border, state, overlay, focus, elevation, container, spacing-scale, and motion tokens.
- Several sections rely on inline style declarations.
- Global selectors and a single stylesheet make app isolation and long-term maintenance harder.
- Wide-screen containment and 320px edge cases need explicit validation.
- Reduced-motion handling exists in places, but motion intensity is not merchant-configurable.

### JavaScript architecture

`theme.js` currently enhances:

- Drawers and overlay.
- Desktop dropdown/mega navigation.
- Mobile nested-menu toggles.
- Slideshow autoplay and controls.
- Promo dismissal.
- Local-storage wishlist.
- Newsletter popup triggers.
- Predictive search.
- Accordions and tabs.
- Countdown and before/after controls.
- Recently viewed products.
- Shipping-rate estimation.
- Quick view.
- Ajax add-to-cart.
- Product option selection and media switching.
- Sticky add to cart.
- Back to top.

Key defects and risks:

- Initialization runs only on `DOMContentLoaded`; sections re-rendered in the Theme Editor are not initialized.
- Most initializers attach direct listeners without a cleanup strategy or per-component guard, creating duplicate-listener risk after editor reloads.
- The drawer system does not trap focus, restore focus, synchronize trigger state, hide inert background content, or correctly manage stacked/nested drawers.
- Wishlist storage uses multiple parallel keys and lacks a global count update.
- Local-storage parsing is not guarded against malformed data or privacy/storage failures.
- Money formatting falls back to a hardcoded dollar sign.
- Cart drawer output is read-only: it cannot change quantities or remove lines.
- Cart and wishlist failures are sometimes swallowed without an accessible error.
- Predictive search needs full combobox/listbox keyboard semantics and status announcements.
- Product variant resolution serializes all variants into the document and assumes client-side variant arrays; that is unsuitable as the only architecture for products above Shopify's legacy variant thresholds.
- Product price, availability, unit price, URL, and submit state are not comprehensively synchronized on variant change.
- Generated HTML must be kept narrowly escaped and audited whenever expanded.

### Theme settings

`config/settings_schema.json` has one flat group of roughly 30 settings. It covers fonts, a few colors, spacing, a radius, basic product-card toggles, and social URLs.

Gaps:

- No `theme_info` metadata.
- Default brand accent is incorrect.
- No semantic color system or configurable container widths.
- No heading/body weights, body-size control, heading scale, input/button radius, card style, badge style, animation intensity, cart behavior, wishlist behavior, predictive-search behavior, logo variants, favicon, localization behavior, or payment-icon setting.
- Product-card ratio is free-form text instead of a constrained select.
- Social link settings use text fields instead of URL fields.
- Labels are not translated.

### Core storefront features

#### Header and navigation

Preserve:

- Server-rendered navigation.
- Configurable logo-left/logo-center layouts.
- Optional utility row.
- Sticky setting.
- Three navigation depths.
- Search, account, wishlist, and cart entry points.
- Country selector and mega-menu promo blocks.

Repair or add:

- Skip link belongs globally, not in an optional feature section.
- Utility header needs language support and reliable auto-submit localization.
- Mobile navigation is accordion-based rather than forward/back panels.
- Drawer accessibility is incomplete.
- Desktop menus intercept parent-link clicks, making parent destinations harder to reach.
- Mega-menu block matching is exact title text and fragile across localization/case changes.
- No featured product or collection mega-menu blocks.
- Cart and wishlist counts need consistent live status.
- Header logo is lazy-loaded even though it is above the fold.

#### Promotional bar

Preserve multiple announcements, links, rotation, color controls, and dismiss support. Verify live-region behavior, focus pause, reduced motion, storage failure handling, and layout-shift resistance.

#### Hero

Preserve separate desktop/mobile media, content positioning, three CTAs, overlay, controls, dots, and autoplay. Improve editor defaults, semantic slide state, LCP selection based on actual section position, video support, and Risky Limits visual defaults.

#### Product cards

Preserve responsive primary/secondary images, sale/sold-out/custom-tag badges, two visual arrangements, wishlist, quick add, quick view, vendor option, and swatch preview.

Repair or add unit price, real ratings integration, configurable badge/card styles, exact image alt text, unavailable swatch state, quick-add variant chooser, consistent focus visibility, and non-hover access to critical actions.

#### Product page

Preserve media thumbnails, color/size selection, native cart endpoint fallback, metafield-based content, wishlist, recommendations area, JSON-LD, and sticky add-to-cart.

Critical defects:

- Shopper-facing metafield setup instructions render when data is missing.
- Review area shows an install instruction plus a non-functional “Write a review” button.
- Inventory messaging exposes `product.inventory_quantity` directly and is not safely variant-specific.
- Native Shopify `{% form 'product' %}` is not used.
- No selling-plan UI.
- No `@app` blocks.
- Only image media is handled; video, external video, and model media are incomplete.
- IDs such as `SizeSelect` collide if more than one product section exists.
- Variant changes do not fully update price, compare price, unit price, URL, availability, SKU, or inventory.
- Recommendations use `recommendations.products` without the native recommendations endpoint/section-loading pattern, so they may be empty.
- JSON-LD is hand-built and vulnerable to invalid JSON escaping and incomplete offers.

#### Collection

Preserve native collection filters, sorting, active chips, product count, and product-card reuse. Add pagination, clear-all, collection image/description, boolean filters, mobile filter drawer, grid density, accessible price labels, empty states, URL-preserving sort/filter behavior, and configurable products per page/row.

#### Search

Preserve standard search form, result rendering, pagination where present, and predictive API use. Add typed result presentation, keyboard/listbox semantics, loading/error statuses, empty query guidance, suggested collections/products chosen by merchants, and consistent cards for non-product results.

#### Cart

Preserve native cart form fallback, quantity fields, note support, subtotal, checkout, and Ajax add enhancement. Add robust line updates/removal in the drawer, discount and selling-plan information, line properties, unit prices, cart errors, free-shipping progress based on configured money, upsells based on merchant-selected products, and section-rendering updates.

#### Wishlist

The local-browser persistence model is appropriate as a fallback and is honestly limited to one browser. It needs a count, storage hardening, consistent state, accessible errors, variant updates, a full-page option, and documented app hooks.

#### Footer

Preserve navigation blocks, native newsletter form, social settings, country selector, and payment icons. Move to a footer section group, add language selection, legal links, app insertion where useful, dynamic social icon rendering, and richer merchant controls.

## Functional defects and misleading UI

- Multiple email, SMS, back-in-stock, and referral sections use plain forms without a Shopify form handler or documented external app integration.
- Fake review UI is present on the product page.
- `feature-extensions` describes functionality instead of implementing it.
- Static “recently purchased” and “social proof” concepts risk fake activity claims and should not ship as defaults.
- Quantity-break, gift-wrap, rewards, referral, and loyalty UI cannot create platform behavior without corresponding Shopify Functions, products, apps, or customer data.
- Several empty states instruct shoppers to configure metafields instead of hiding absent content.
- Generic testimonials in the homepage defaults are unverified claims.
- Default shipping/returns statements and free-shipping thresholds are merchant claims, not platform-derived facts.
- Hardcoded routes exist in JSON defaults where Shopify objects/settings should be used.

## Accessibility concerns

- Global skip link is absent by default.
- Drawer focus trap/restoration and background isolation are missing.
- Predictive search lacks full combobox semantics.
- Accordion buttons omit explicit `type="button"` and robust control relationships in some components.
- Several form inputs use placeholder-only labeling.
- Mega-menu focus looping can trap Tab within a navigation dropdown.
- Hidden carousel slides need focusable descendants disabled or inert.
- Dynamic cart/wishlist/predictive-search statuses need dedicated live regions.
- Icon buttons are generally named, which should be preserved.
- Contrast, 200% zoom, 320px width, keyboard-only flows, and reduced motion need rendered verification.

## Performance concerns

- Primary CSS and JS bundles are manageable but monolithic and loaded globally regardless of page.
- Product pages serialize all variant JSON and all interactions globally.
- Dynamic product fetches are not cached or concurrency-limited.
- Primary hero image behavior is partially optimized; above-the-fold logo is incorrectly lazy-loaded.
- Hidden video/background systems may load unnecessarily depending on section implementation.
- Inline style duplication and repeated section schemas increase payload and maintenance cost.
- No Lighthouse run or live storefront URL is available at audit time, so no performance score can be claimed.

## SEO concerns

- Canonical, title, description, Open Graph, Twitter card, and Organization JSON-LD foundations exist.
- Organization JSON-LD can become invalid or semantically weak when logo/social values are blank.
- Product JSON-LD is incomplete and manually escaped.
- No breadcrumb snippet or BreadcrumbList JSON-LD is integrated globally.
- Blog/article structured data and templates are absent.
- Collection descriptions and editorial metadata are not rendered.
- Robots and pagination semantics rely entirely on platform defaults and need review.

## Localization and Markets concerns

- Locale file contains only five keys and most storefront/schema strings are hardcoded English.
- Country selection is present but language selection is absent.
- Localization forms do not have complete no-JavaScript submit behavior in all placements.
- JavaScript money fallback hardcodes USD formatting.
- Hardcoded dollar amounts appear in section defaults.
- Locale-aware `routes` objects are used in several important places and should be preserved.

## Shopify compatibility concerns

- JSON templates and a header section group align with Online Store 2.0.
- App blocks are absent.
- Theme Editor section lifecycle events are not handled.
- Block editor attributes are mostly absent.
- Customer, blog, article, contact, password, and gift-card experiences are incomplete.
- High-variant support is not production-safe as currently implemented.
- Selling plans are not represented.
- Product and newsletter forms should use Shopify Liquid form tags where applicable.
- Local Shopify CLI and Theme Check were not installed at audit time; live-store authentication was not available.

## Technical debt

- Excessive duplicated `feature-*` sections and repeated background schema.
- Monolithic CSS/JS with page-agnostic initialization.
- Inline styles in reusable markup.
- Storefront copy mixed with merchant setup instructions.
- Marketing features represented as static UI without backend truth.
- Minimal localization coverage.
- Missing shared primitives and automated validation.

## Recommended implementation approach

1. Keep the existing theme and core Liquid objects; do not replace it wholesale.
2. Add a complete semantic token/settings layer with Risky Limits defaults.
3. Harden the layout, metadata, skip link, global status region, script configuration, and section groups.
4. Replace the drawer implementation with one reusable accessible controller and make all initializers idempotent under Theme Editor lifecycle events.
5. Rebuild the header/mobile navigation, localization, predictive search, cart drawer, and wishlist count around that controller.
6. Refactor product cards and the product page into shared snippets, native forms, app blocks, selling-plan-compatible hooks, media-type support, server-rendered variant state, and honest empty states.
7. Complete collection filters/pagination and search result accessibility.
8. Add missing standard templates and a curated editorial section library rather than multiplying static `feature-*` cards.
9. Prevent misleading sections from rendering without a real integration or merchant data; document external dependencies precisely.
10. Validate JSON, schemas, static references, JavaScript syntax, CSS, accessibility patterns, and Shopify Theme Check/package when tooling is available.

## Audit validation performed

- Confirmed starting Git status and revision.
- Inventoried every repository file and line count.
- Parsed all standalone JSON files successfully with PowerShell `ConvertFrom-Json`.
- Extracted and parsed every section `{% schema %}` JSON object successfully.
- Searched forms, app blocks, editor attributes, placeholders, TODO/FIXME markers, console logging, hardcoded routes, and hardcoded currency-like copy.
- Read the global layout/settings, templates, core commerce sections, header/footer, JavaScript systems, product-card snippet, and representative feature sections.
- Confirmed Shopify CLI and Theme Check are not installed locally; Node.js 22.17.1 and npm are available.


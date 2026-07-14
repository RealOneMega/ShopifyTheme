# Theme feature inventory

## Global storefront

- Warm product-first design tokens, black editorial surfaces, responsive typography, configurable wide containers, button/input shapes, and restrained motion.
- Header and footer section groups with sticky navigation, menu drawers, mega-menu blocks, announcements, social links, payment icons, country/region selection, and language selection.
- Accessible skip link, focus management, drawer focus traps, keyboard tabs, accordion semantics, live status announcements, and reduced-motion behavior.
- Canonical metadata, social sharing metadata, Shopify structured product/article data, organization data, and breadcrumbs.
- Newsletter popup and inline email capture through Shopify customer forms.

## Product merchandising

- High-variant product picker built with `product.options_with_values` and `product_option_value` URLs rather than serializing the first 250 variants.
- Image, video, external video, and 3D model rendering with responsive image sizes and first-media loading priority.
- Native product forms, availability state, unit price, compare-at price, selling-plan selection, accelerated checkout, quantity, wishlist, and sticky add-to-cart.
- Product metafield content for subtitle, size/fit, size chart, details/materials, shipping/returns, and custom badges.
- Related product recommendations through Shopify's native recommendations endpoint.
- Product cards with responsive media, optional second image, honest tag/metafield badges, swatches, quick view, safe quick add, and optional reviews-app rating metafields.

## Discovery and conversion

- Collection hero, native storefront filters, sorting, active filter removal, pagination, responsive product grid, and persisted grid density.
- Search page with product/content result types and predictive search with abortable requests and keyboard navigation.
- AJAX cart drawer and full cart page with line properties, selling plans, discounts, quantity changes, remove actions, notes, additional checkout buttons, optional native recommendations, and currency-aware free-shipping progress.
- Browser-local wishlist drawer and page. It intentionally does not claim cross-device or account synchronization.
- Recently viewed products stored locally in the browser.

## Content and templates

- Home, product, collection, search, cart, page, contact, blog, article, list collections, 404, wishlist, password, and gift-card experiences.
- Classic customer login, registration, account, order, addresses, password reset, and account activation templates. Stores using new customer accounts will route to Shopify-hosted customer account pages.
- Reusable flexible-content section with heading, text, button, image, divider, and app blocks.
- Editorial sections for hero slides, featured products/collections, collection tabs, image-with-text, video, FAQ, lookbook/hotspots, comparison, countdown, and supporting content patterns.
- Assignable brand-story, lookbook, customer-care, and release page templates that demonstrate those content and commerce sections in complete flows.

## Native versus app-backed behavior

Native theme behavior: product purchase, selling plans exposed by Shopify, cart, checkout handoff, search, filters, recommendations, newsletter email capture, customer forms, localization, gift cards, and structured data.

Provider-owned features use app blocks and remain blank on the live storefront until configured: verified reviews, purchase activity, loyalty/rewards, quantity pricing or bundles, back-in-stock subscriptions, and SMS consent/capture. Referral links render only when a merchant supplies a provider URL. The theme never creates pretend provider data.

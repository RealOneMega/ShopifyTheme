# Risky Limits 2.0 setup guide

## 1. Install as an unpublished theme

Upload `Risky Limits-2.0.0.zip` in Shopify Admin. Keep it unpublished while completing this guide and `THEME_QA.md`.

## 2. Brand and global settings

- Upload desktop/mobile white logos for the dark header and a square favicon.
- Review all color, typography, layout, radius, button, input, product-card, cart, search, wishlist, social, and motion settings.
- Replace `theme_support_email` in `config/settings_schema.json` with a monitored business address before launch.
- Set the free-shipping goal only when it exactly matches the active Shopify shipping configuration for every relevant Market; otherwise leave it at 0.

## 3. Navigation and section groups

- Create the main, footer, policy, and optional utility menus in Shopify Admin.
- Assign those menus in the Header and Footer groups.
- Build mega-menu blocks by matching each block's menu item text exactly to the top-level link title.
- Configure announcement text and links. Do not publish discount, delivery, inventory, or urgency claims unless the underlying configuration makes them true.
- Enable country and language selectors after Shopify Markets and translated languages are configured.

## 4. Catalog and homepage

- Create intentional automated/manual collections and replace the default `all` collection assignments.
- Upload final hero, editorial, product, collection, and social-sharing media with useful alt text and focal points.
- Review every homepage section; remove unused sections and replace all default copy with approved brand content.
- Add policy pages, contact information, shipping details, returns details, privacy/terms, and accessibility information.

## 5. Product data

Supported custom metafields:

- `custom.product_subtitle`
- `custom.badge`
- `custom.size_fit` or `custom.size_and_fit`
- `custom.size_chart` or `custom.size_chart_image`
- `custom.details_materials` or `custom.details_and_materials`
- `custom.shipping_returns` or `custom.shipping_and_returns`

Populate product media, variants, prices, compare-at prices, inventory policies, unit pricing, and selling plans in Shopify Admin. The theme reads these values; it does not create them.

## 6. App integrations

Install and configure provider app blocks for reviews, purchase activity, loyalty/rewards, quantity pricing/bundles, back-in-stock, or SMS. Add the provider's app block to the matching theme section or Main product section. Empty app hosts show guidance only in the Theme Editor and do not simulate shopper-facing data.

Product-card ratings can be enabled globally when the reviews provider writes Shopify's `reviews.rating` and `reviews.rating_count` metafields.

Referral content renders only when its provider URL is configured. The wishlist and recently viewed lists are browser-local and should not be marketed as account-synchronized.

## 7. Accounts, Markets, checkout, and consent

- Choose classic or new customer accounts and test all routes applicable to that choice.
- Configure Markets, currencies, domains/subfolders, languages, duties/taxes, and market-specific shipping.
- Configure payment methods, accelerated checkout, gift cards, subscriptions, and store credit in Shopify Admin where applicable.
- Configure a consent-management solution before adding non-essential analytics, advertising, or tracking scripts.

## 8. Launch

Run Theme Check and package the release, then complete every applicable live-preview case in `THEME_QA.md`. Duplicate the current live theme for rollback immediately before publishing.

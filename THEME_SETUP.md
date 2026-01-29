# Theme setup guide

## Header layouts
1. Open **Header** section in the Theme Editor.
2. Choose **Layout**:
   - **Logo left**: choose **Menu position** center or right.
   - **Logo center**: logo centers with menu below.
3. Toggle **Sticky header** and optional **Utility row** + **country selector** as needed.

## Promo bar slideshow
1. Add multiple blocks in **Promo bar** section.
2. Enable **Autoplay** and adjust the autoplay speed.
3. Toggle **Dismissible** per promo to allow the customer to hide it.

## Marketing popup
1. Open **Newsletter popup** and enable it.
2. Select a trigger:
   - **Delay** (seconds), **Scroll** (%), **Exit intent**, or **Manual**.
3. Add copy, image, GDPR note, and button style.

## Rewards integration
- The **Rewards program** section reads `customer.metafields.rewards.points` when present.
- Redemption options are configured in Theme Editor.
- For a secure in-house rewards system, plan a private Shopify app + Functions to validate balances and issue codes.
- Use the data attributes for integration hooks: `data-reward-option`, `data-reward-redeem`, `data-rewards-ledger`.

## Reviews integration
- Reviews display only on the product page (inside **Main product** section).
- Install your preferred reviews app (Shopify Product Reviews, Judge.me, Yotpo) and target the `data-review-app` container.

## QA checklist
- Theme Editor:
  - Verify all sections render and settings update properly.
  - Check promo bar and header group order.
- Lighthouse:
  - Verify optimized images and no layout shift in hero.
  - Confirm JS is deferred and CSS is minimal.
- Mobile navigation:
  - Ensure menu drawer opens/closes and is keyboard accessible.
- Keyboard navigation:
  - Test mega menu open/close via Enter/Space and Escape.
  - Check focus states on buttons and links.
- Modals:
  - Newsletter popup closes on ESC or overlay click.

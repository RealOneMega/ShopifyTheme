const Theme = (() => {
  const body = document.body;
  const overlay = document.querySelector('[data-overlay]');
  const config = window.RiskyLimitsTheme || {};
  const drawerTriggers = new WeakMap();
  let activeDrawer = null;
  let globalListenersInitialized = false;

  const safeStorage = {
    get(key, fallback = null) {
      try {
        const value = window.localStorage.getItem(key);
        return value === null ? fallback : value;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // Storage can be unavailable in private browsing or strict privacy modes.
      }
    },
  };

  const announce = (message) => {
    const status = document.querySelector('[data-theme-status]');
    if (!status || !message) return;
    status.textContent = '';
    window.requestAnimationFrame(() => {
      status.textContent = message;
    });
  };

  const formatMoney = (cents) => {
    if (window.Shopify?.formatMoney && window.Shopify.money_format) {
      return window.Shopify.formatMoney(cents, window.Shopify.money_format);
    }
    try {
      return new Intl.NumberFormat(config.locale || document.documentElement.lang || 'en', {
        style: 'currency',
        currency: config.currency || 'USD',
      }).format(Number(cents || 0) / 100);
    } catch {
      return (Number(cents || 0) / 100).toFixed(2);
    }
  };

  const withWidth = (url, width) => {
    if (!url) return '';
    const joiner = url.includes('?') ? '&' : '?';
    return `${url}${joiner}width=${width}`;
  };

  const shopifyPath = (path) => {
    const root = config.routes?.root || window.Shopify?.routes?.root || '/';
    return `${root}${String(path).replace(/^\/+/, '')}`;
  };

  const escapeHTML = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));

  const stripHTML = (value) => {
    const container = document.createElement('div');
    container.innerHTML = String(value ?? '');
    return container.textContent || '';
  };

  const showToast = (message) => {
    if (!message) return;
    const existing = document.querySelector('[data-toast]');
    existing?.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('data-toast', 'true');
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    toast.textContent = message;
    document.body.appendChild(toast);
    announce(message);
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => toast.remove(), 250);
    }, 2400);
  };

  const focusableElements = (container) => Array.from(container?.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), details > summary, [tabindex]:not([tabindex="-1"])',
  ) || []).filter((element) => !element.closest('[hidden], [aria-hidden="true"]'));

  const openDrawer = (drawer, trigger = document.activeElement) => {
    if (!drawer) return;
    document.querySelectorAll('.drawer.is-open').forEach((openDrawerEl) => {
      if (openDrawerEl !== drawer) closeDrawer(openDrawerEl, false);
    });
    drawerTriggers.set(drawer, trigger instanceof HTMLElement ? trigger : null);
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.removeAttribute('inert');
    if (trigger instanceof HTMLElement) trigger.setAttribute('aria-expanded', 'true');
    overlay?.classList.add('is-visible');
    overlay?.setAttribute('aria-hidden', 'false');
    body.classList.add('no-scroll');
    activeDrawer = drawer;
    window.requestAnimationFrame(() => {
      const preferred = drawer.querySelector('[autofocus], [data-drawer-close]');
      (preferred || focusableElements(drawer)[0] || drawer).focus?.({ preventScroll: true });
    });
  };

  const closeDrawer = (drawer, restoreFocus = true) => {
    if (!drawer) return;
    const trigger = drawerTriggers.get(drawer);
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('inert', '');
    if (trigger instanceof HTMLElement) trigger.setAttribute('aria-expanded', 'false');
    if (!document.querySelector('.drawer.is-open')) {
      overlay?.classList.remove('is-visible');
      overlay?.setAttribute('aria-hidden', 'true');
      body.classList.remove('no-scroll');
      activeDrawer = null;
    }
    if (restoreFocus && trigger instanceof HTMLElement && trigger.isConnected) {
      trigger.focus({ preventScroll: true });
    }
  };

  const initDrawers = (root = document) => {
    root.querySelectorAll?.('.drawer').forEach((drawer) => {
      if (!drawer.classList.contains('is-open')) {
        drawer.setAttribute('aria-hidden', 'true');
        drawer.setAttribute('inert', '');
      }
    });
    if (globalListenersInitialized) return;
    globalListenersInitialized = true;

    document.addEventListener('click', (event) => {
      const opener = event.target.closest('[data-drawer-open]');
      if (opener) {
        const target = document.querySelector(opener.dataset.drawerOpen);
        if (target) {
          event.preventDefault();
          openDrawer(target, opener);
        }
        return;
      }
      const closer = event.target.closest('[data-drawer-close]');
      if (closer) {
        event.preventDefault();
        closeDrawer(closer.closest('.drawer'));
      }
    });

    overlay?.addEventListener('click', () => closeDrawer(activeDrawer));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && activeDrawer) {
        event.preventDefault();
        closeDrawer(activeDrawer);
      }
      if (event.key !== 'Tab' || !activeDrawer) return;
      const focusables = focusableElements(activeDrawer);
      if (!focusables.length) {
        event.preventDefault();
        activeDrawer.focus?.();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  };

  const initMegaMenu = (root = document) => {
    root.querySelectorAll?.('[data-mega-trigger]').forEach((trigger) => {
      if (trigger.dataset.themeInitialized === 'true') return;
      trigger.dataset.themeInitialized = 'true';
      const item = trigger.closest('.nav__item');
      const panel = trigger.nextElementSibling;
      if (!panel || !item) return;
      const open = () => {
        document.querySelectorAll('.nav__dropdown[aria-hidden="false"]').forEach((otherPanel) => {
          if (otherPanel === panel) return;
          otherPanel.setAttribute('aria-hidden', 'true');
          otherPanel.previousElementSibling?.setAttribute('aria-expanded', 'false');
        });
        panel.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
      };
      const close = () => {
        panel.setAttribute('aria-hidden', 'true');
        trigger.setAttribute('aria-expanded', 'false');
      };
      item.addEventListener('mouseenter', open);
      item.addEventListener('mouseleave', close);
      item.addEventListener('focusin', open);
      item.addEventListener('focusout', (event) => {
        const nextTarget = event.relatedTarget;
        if (!nextTarget || !item.contains(nextTarget)) {
          close();
        }
      });
      trigger.addEventListener('click', (event) => {
        if (panel.getAttribute('aria-hidden') === 'true') {
          event.preventDefault();
          open();
        }
      });
      trigger.addEventListener('keydown', (event) => {
        if ((event.key === 'Enter' || event.key === ' ') && panel.getAttribute('aria-hidden') === 'true') {
          event.preventDefault();
          open();
        }
        if (event.key === 'Escape') {
          close();
          trigger.focus();
        }
      });
      panel.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
          close();
          trigger.focus();
        }
      });
    });
  };

  const initMobileMenu = (root = document) => {
    root.querySelectorAll?.('[data-mobile-menu-toggle]').forEach((button) => {
      if (button.dataset.themeInitialized === 'true') return;
      button.dataset.themeInitialized = 'true';
      button.addEventListener('click', () => {
        const item = button.closest('.mobile-menu__item');
        const submenu = item?.querySelector(':scope > .mobile-menu__submenu');
        if (!item || !submenu) return;
        const isOpen = item.classList.toggle('is-open');
        button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        submenu.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      });
    });
  };

  const initSlideshow = (root = document) => {
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    root.querySelectorAll?.('[data-slideshow]').forEach((slideshow) => {
      if (slideshow.dataset.slideshowInitialized === 'true') return;
      slideshow.dataset.slideshowInitialized = 'true';

      const slides = Array.from(slideshow.querySelectorAll('[data-slide]'));
      if (!slides.length) return;

      const dots = Array.from(slideshow.querySelectorAll('[data-slide-dot]'));
      const prev = slideshow.querySelector('[data-slide-prev]');
      const next = slideshow.querySelector('[data-slide-next]');
      let index = Math.max(0, slides.findIndex((slide) => !slide.classList.contains('hidden')));
      let timer = null;
      const configuredInterval = Number(slideshow.dataset.autoplaySpeed || 6000);
      const interval = Number.isFinite(configuredInterval) ? Math.max(configuredInterval, 1000) : 6000;
      const autoplay = slideshow.dataset.autoplay === 'true' && slides.length > 1 && !prefersReducedMotion;

      const stop = () => {
        if (!timer) return;
        clearInterval(timer);
        timer = null;
      };
      slideshow.themeCleanup = stop;

      const start = () => {
        if (!autoplay || timer) return;
        timer = setInterval(() => {
          showSlide(index + 1);
        }, interval);
      };

      const showSlide = (nextIndex, resetTimer = false) => {
        const normalizedIndex = (nextIndex + slides.length) % slides.length;
        slides.forEach((slide, i) => {
          const isActive = i === normalizedIndex;
          slide.classList.toggle('hidden', !isActive);
          slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
          slide.querySelectorAll('video').forEach((video) => {
            if (!isActive) {
              video.pause();
            } else if (!prefersReducedMotion && slide.querySelector('[data-hero-video]')?.dataset.autoplay === 'true') {
              video.play().catch(() => {});
            }
          });
        });
        dots.forEach((dot, i) => {
          const isActive = i === normalizedIndex;
          dot.classList.toggle('is-active', isActive);
          dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
        index = normalizedIndex;

        if (resetTimer) {
          stop();
          start();
        }
      };

      const nextSlide = () => {
        showSlide(index + 1, true);
      };

      const prevSlide = () => {
        showSlide(index - 1, true);
      };

      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => showSlide(i, true));
      });

      prev?.addEventListener('click', prevSlide);
      next?.addEventListener('click', nextSlide);

      slideshow.addEventListener('mouseenter', stop);
      slideshow.addEventListener('mouseleave', start);
      slideshow.addEventListener('focusin', stop);
      slideshow.addEventListener('focusout', (event) => {
        if (!slideshow.contains(event.relatedTarget)) start();
      });

      if (slides.length > 1) {
        document.addEventListener('visibilitychange', () => {
          document.hidden ? stop() : start();
        });
      }

      showSlide(index);
      start();
    });
  };

  const initPromoDismiss = (root = document) => {
    root.querySelectorAll?.('[data-promo-dismiss]').forEach((button) => {
      if (button.dataset.themeInitialized === 'true') return;
      button.dataset.themeInitialized = 'true';
      const key = button.dataset.promoDismiss;
      if (safeStorage.get(key) === 'true') {
        button.closest('[data-promo-item]')?.remove();
        return;
      }
      button.addEventListener('click', () => {
        safeStorage.set(key, 'true');
        button.closest('[data-promo-item]')?.remove();
      });
    });
  };

  const initWishlist = (root = document) => {
    const storageKey = 'wishlist-items';
    const normalizeItems = (items) =>
      items
        .map((item) => {
          if (typeof item === 'string') {
            return { handle: item, variantId: null };
          }
          if (item && item.handle) {
            return { handle: item.handle, variantId: item.variantId || null };
          }
          return null;
        })
        .filter(Boolean);
    const getItems = () => {
      try {
        return normalizeItems(JSON.parse(safeStorage.get(storageKey, '[]')));
      } catch {
        return [];
      }
    };
    const updateCount = (items = getItems()) => {
      document.querySelectorAll('[data-wishlist-count]').forEach((badge) => {
        badge.textContent = String(items.length);
        badge.classList.toggle('hidden', items.length === 0);
      });
    };
    const setItems = (items) => {
      safeStorage.set(storageKey, JSON.stringify(items));
      updateCount(items);
    };
    const findItem = (items, handle) => items.find((item) => item.handle === handle);
    const upsertItem = (items, handle, variantId) => {
      const existing = findItem(items, handle);
      if (existing) {
        existing.variantId = variantId || existing.variantId;
        return items;
      }
      items.push({ handle, variantId: variantId || null });
      return items;
    };
    const renderWishlist = async () => {
      const container = document.querySelector('[data-wishlist-items]');
      if (!container) return;
      const items = getItems();
      if (!items.length) {
        container.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
      }
      container.innerHTML = '<p>Loading wishlist...</p>';
      const handles = [...new Set(items.map((item) => item.handle))];
      const products = await Promise.all(
        handles.map((handle) =>
          fetch(shopifyPath(`products/${handle}.js`))
            .then((response) => (response.ok ? response.json() : null))
            .catch(() => null),
        ),
      );
      const validProducts = products.filter(Boolean);
      if (!validProducts.length) {
        container.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
      }
      container.innerHTML = `
        <div class="stack">
          ${validProducts
            .map((product) => {
              const savedItem = findItem(items, product.handle);
              const variantId = savedItem?.variantId || product.variants?.[0]?.id;
              const price = formatMoney(product.price);
              const title = escapeHTML(product.title);
              const url = escapeHTML(product.url);
              const handle = escapeHTML(product.handle);
              const image = product.featured_image
                ? `<img src="${escapeHTML(withWidth(product.featured_image, 140))}" alt="${title}" loading="lazy">`
                : '';
              return `
                <div class="wishlist-item">
                  <a class="wishlist-item__media" href="${url}">${image}</a>
                  <div class="wishlist-item__details">
                    <a class="wishlist-item__title" href="${url}">${title}</a>
                    <div class="wishlist-item__price">${price}</div>
                    <div class="wishlist-item__actions">
                      <button class="button button--secondary" type="button" data-wishlist-move data-variant-id="${variantId}" data-handle="${handle}">Move to cart</button>
                      <button class="button button--tertiary" type="button" data-wishlist-remove data-handle="${handle}">Remove</button>
                    </div>
                  </div>
                </div>
              `;
            })
            .join('')}
        </div>
      `;
    };

    root.querySelectorAll?.('[data-wishlist-toggle]').forEach((button) => {
      if (button.dataset.themeInitialized === 'true') return;
      button.dataset.themeInitialized = 'true';
      const handle = button.dataset.wishlistToggle;
      const update = () => {
        const active = !!findItem(getItems(), handle);
        button.setAttribute('aria-pressed', active);
        button.classList.toggle('is-active', active);
      };
      button.addEventListener('click', () => {
        const items = getItems();
        const next = !findItem(items, handle);
        if (next) {
          upsertItem(items, handle, button.dataset.variantId ? Number(button.dataset.variantId) : null);
          setItems(items);
        } else {
          setItems(items.filter((item) => item.handle !== handle));
        }
        update();
        renderWishlist();
        showToast(next ? config.strings?.wishlistAdded : config.strings?.wishlistRemoved);
      });
      update();
    });
    root.querySelectorAll?.('[data-wishlist-add]').forEach((button) => {
      if (button.dataset.themeInitialized === 'true') return;
      button.dataset.themeInitialized = 'true';
      const form = button.closest('[data-product-form]');
      if (!form) return;
      const handle = form.dataset.productHandle;
      const variantInput = form.querySelector('[data-variant-id]');
      const updateButton = () => {
        const items = getItems();
        const active = !!findItem(items, handle);
        button.setAttribute('aria-pressed', active);
        button.classList.toggle('is-active', active);
        button.textContent = active ? 'Saved to wishlist' : 'Save to wishlist';
      };
      button.addEventListener('click', () => {
        const items = getItems();
        const existing = findItem(items, handle);
        if (existing) {
          const nextItems = items.filter((item) => item.handle !== handle);
          setItems(nextItems);
          renderWishlist();
          updateButton();
          showToast(config.strings?.wishlistRemoved || 'Removed from wishlist.');
          return;
        }
        const variantId = variantInput ? Number(variantInput.value) : null;
        upsertItem(items, handle, variantId);
        setItems(items);
        renderWishlist();
        updateButton();
        showToast(config.strings?.wishlistAdded || 'Added to wishlist.');
      });
      updateButton();
    });
    const container = document.querySelector('[data-wishlist-items]');
    if (container && container.dataset.themeInitialized !== 'true') {
      container.dataset.themeInitialized = 'true';
      container.addEventListener('click', (event) => {
        const removeButton = event.target.closest('[data-wishlist-remove]');
        if (removeButton) {
          const handle = removeButton.dataset.handle;
          const items = getItems().filter((item) => item.handle !== handle);
          setItems(items);
          renderWishlist();
          showToast(config.strings?.wishlistRemoved || 'Removed from wishlist.');
          return;
        }
        const moveButton = event.target.closest('[data-wishlist-move]');
        if (moveButton) {
          const variantId = Number(moveButton.dataset.variantId);
          const handle = moveButton.dataset.handle;
          if (!variantId) return;
          fetch(shopifyPath('cart/add.js'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: variantId, quantity: 1 }),
          })
            .then((response) => {
              if (!response.ok) throw new Error('Add to cart failed.');
              const items = getItems().filter((item) => item.handle !== handle);
              setItems(items);
              renderWishlist();
              showToast(config.strings?.addedToCart || 'Added to cart.');
            })
            .catch(() => showToast(config.strings?.cartError || 'Unable to add to cart.'));
        }
      });
    }
    updateCount();
    renderWishlist();
  };

  const initPopup = (root = document) => {
    root.querySelectorAll?.('[data-popup]').forEach((popup) => {
      if (popup.dataset.themeInitialized === 'true') return;
      popup.dataset.themeInitialized = 'true';
      let popupConfig = {};
      try {
        popupConfig = JSON.parse(popup.dataset.popup || '{}');
      } catch {
        return;
      }
      const key = `popup:${popupConfig.id}`;
      if (safeStorage.get(key) === 'true') return;
      const open = () => {
        popup.classList.add('is-visible');
        popup.setAttribute('aria-hidden', 'false');
        popup.querySelector('[data-popup-close]')?.focus();
      };
      const close = () => {
        popup.classList.remove('is-visible');
        popup.setAttribute('aria-hidden', 'true');
        safeStorage.set(key, 'true');
      };
      const closeButton = popup.querySelector('[data-popup-close]');
      closeButton?.addEventListener('click', close);
      popup.addEventListener('click', (event) => {
        if (event.target === popup) close();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') close();
      });
      if (popupConfig.trigger === 'delay') {
        popup.themeTimer = setTimeout(open, popupConfig.delay * 1000);
      }
      if (popupConfig.trigger === 'scroll') {
        const onScroll = () => {
          const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
          if (scrolled >= popupConfig.scroll) {
            open();
            window.removeEventListener('scroll', onScroll);
          }
        };
        window.addEventListener('scroll', onScroll);
      }
      if (popupConfig.trigger === 'exit') {
        document.addEventListener('mouseleave', (event) => {
          if (event.clientY <= 0) open();
        }, { once: true });
      }
      popup.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') return;
        const focusables = popup.querySelectorAll('a, button, input, select, textarea, [tabindex=\"0\"]');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
    });
  };

  const initPredictiveSearch = (root = document) => {
    if (config.settings?.predictiveSearch === false) return;
    root.querySelectorAll?.('[data-predictive-search]').forEach((form) => {
      if (form.dataset.themeInitialized === 'true') return;
      form.dataset.themeInitialized = 'true';
      const input = form.querySelector('input[type="search"]');
      const results = form.querySelector('[data-predictive-results]');
      if (!input || !results) return;
      let controller;
      let timer;
      let activeIndex = -1;

      if (!results.id) results.id = `PredictiveResults-${Math.random().toString(36).slice(2, 9)}`;
      input.setAttribute('role', 'combobox');
      input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-controls', results.id);
      input.setAttribute('aria-expanded', 'false');

      const close = () => {
        results.replaceChildren();
        results.hidden = true;
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
        activeIndex = -1;
      };

      const options = () => Array.from(results.querySelectorAll('[data-predictive-option]'));
      const setActive = (nextIndex) => {
        const items = options();
        if (!items.length) return;
        activeIndex = (nextIndex + items.length) % items.length;
        items.forEach((item, index) => item.classList.toggle('is-active', index === activeIndex));
        input.setAttribute('aria-activedescendant', items[activeIndex].id);
        items[activeIndex].scrollIntoView({ block: 'nearest' });
      };

      const renderGroup = (label, items, groupIndex) => {
        if (!Array.isArray(items) || !items.length) return '';
        return `
          <section class="predictive-search__group" aria-labelledby="PredictiveGroup-${groupIndex}-${results.id}">
            <h2 class="predictive-search__heading" id="PredictiveGroup-${groupIndex}-${results.id}">${escapeHTML(label)}</h2>
            <ul role="listbox">
              ${items.map((item, itemIndex) => `
                <li role="presentation">
                  <a id="PredictiveOption-${groupIndex}-${itemIndex}-${results.id}" role="option" data-predictive-option href="${escapeHTML(item.url)}">${escapeHTML(item.title)}</a>
                </li>
              `).join('')}
            </ul>
          </section>
        `;
      };

      const search = async () => {
        const query = input.value.trim();
        if (query.length < 2) {
          close();
          return;
        }
        controller?.abort();
        controller = new AbortController();
        results.hidden = false;
        results.innerHTML = `<p class="predictive-search__status">${escapeHTML(config.strings?.loading || 'Loading…')}</p>`;
        input.setAttribute('aria-expanded', 'true');
        const limit = Number(config.settings?.predictiveSearchLimit || 4);
        const endpoint = config.routes?.predictiveSearch || shopifyPath('search/suggest');
        try {
          const url = `${endpoint}.json?q=${encodeURIComponent(query)}&resources[type]=product,collection,page,article&resources[limit]=${limit}`;
          const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
          if (!response.ok) throw new Error('Predictive search failed.');
          const data = await response.json();
          const found = data.resources?.results || {};
          const markup = [
            renderGroup('Products', found.products, 0),
            renderGroup('Collections', found.collections, 1),
            renderGroup('Pages', found.pages, 2),
            renderGroup('Articles', found.articles, 3),
          ].join('');
          results.innerHTML = markup || '<p class="predictive-search__status">No results found.</p>';
          results.hidden = false;
          input.setAttribute('aria-expanded', 'true');
          announce(config.strings?.searchResults || 'Search results updated.');
        } catch (error) {
          if (error.name === 'AbortError') return;
          results.innerHTML = '<p class="predictive-search__status">Search is temporarily unavailable.</p>';
        }
      };

      input.addEventListener('input', () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(search, 180);
      });
      input.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setActive(activeIndex + 1);
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setActive(activeIndex - 1);
        } else if (event.key === 'Enter' && activeIndex >= 0) {
          event.preventDefault();
          options()[activeIndex]?.click();
        } else if (event.key === 'Escape') {
          close();
        }
      });
      form.addEventListener('focusout', (event) => {
        if (!form.contains(event.relatedTarget)) window.setTimeout(close, 100);
      });
    });
  };

  const initAccordion = (root = document) => {
    root.querySelectorAll?.('[data-accordion]').forEach((accordion, accordionIndex) => {
      accordion.querySelectorAll('[data-accordion-button]').forEach((button) => {
        if (button.dataset.themeInitialized === 'true') return;
        button.dataset.themeInitialized = 'true';
        button.type = 'button';
        const panel = button.nextElementSibling;
        if (panel) {
          if (!button.id) button.id = `AccordionButton-${accordionIndex}-${Math.random().toString(36).slice(2, 8)}`;
          if (!panel.id) panel.id = `AccordionPanel-${accordionIndex}-${Math.random().toString(36).slice(2, 8)}`;
          button.setAttribute('aria-controls', panel.id);
          panel.setAttribute('role', 'region');
          panel.setAttribute('aria-labelledby', button.id);
        }
        button.addEventListener('click', () => {
          const item = button.closest('.accordion__item');
          const icon = button.querySelector('.accordion__icon');
          const expanded = button.getAttribute('aria-expanded') === 'true';
          button.setAttribute('aria-expanded', String(!expanded));
          panel?.classList.toggle('hidden', expanded);
          item?.classList.toggle('is-open', !expanded);
          if (icon) {
            icon.textContent = expanded ? '+' : '–';
          }
        });
      });
    });
  };

  const initRecentlyViewed = (root = document) => {
    const productHandle = root.querySelector?.('[data-product-handle]')?.dataset.productHandle;
    if (productHandle) {
      const key = 'recently-viewed';
      let list = [];
      try {
        list = JSON.parse(safeStorage.get(key, '[]'));
      } catch {
        list = [];
      }
      if (!list.includes(productHandle)) list.unshift(productHandle);
      safeStorage.set(key, JSON.stringify(list.slice(0, 10)));
    }
  };

  const initAnimatedHeadlines = (root = document) => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.querySelectorAll?.('[data-animated-headline]').forEach((headline) => {
      if (headline.dataset.themeInitialized === 'true') return;
      headline.dataset.themeInitialized = 'true';
      let words = [];
      try {
        words = JSON.parse(headline.dataset.words || '[]').filter(Boolean);
      } catch {
        return;
      }
      if (words.length < 2 || prefersReduced) return;
      const wordEl = headline.querySelector('.animated-headline__word');
      let index = 0;
      headline.themeTimer = setInterval(() => {
        index = (index + 1) % words.length;
        wordEl.classList.remove('is-visible');
        setTimeout(() => {
          wordEl.textContent = words[index];
          wordEl.classList.add('is-visible');
        }, 200);
      }, 2500);
      wordEl.classList.add('is-visible');
    });
  };

  const initTabs = (root = document) => {
    root.querySelectorAll?.('[data-collection-tabs]').forEach((tabs) => {
      if (tabs.dataset.themeInitialized === 'true') return;
      tabs.dataset.themeInitialized = 'true';
      const triggers = tabs.querySelectorAll('[data-tab-trigger]');
      const panels = tabs.querySelectorAll('[data-tab-panel]');
      const activate = (trigger, focus = false) => {
        const id = trigger.dataset.tabId;
        panels.forEach((panel) => {
          const active = panel.id === id;
          panel.classList.toggle('hidden', !active);
          panel.hidden = !active;
        });
        triggers.forEach((item) => {
          const active = item === trigger;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-selected', active ? 'true' : 'false');
          item.tabIndex = active ? 0 : -1;
        });
        if (focus) trigger.focus();
      };
      triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => activate(trigger));
        trigger.addEventListener('keydown', (event) => {
          const items = Array.from(triggers);
          const index = items.indexOf(trigger);
          let next = null;
          if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = items[(index + 1) % items.length];
          if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = items[(index - 1 + items.length) % items.length];
          if (event.key === 'Home') next = items[0];
          if (event.key === 'End') next = items[items.length - 1];
          if (!next) return;
          event.preventDefault();
          activate(next, true);
        });
      });
      const selected = Array.from(triggers).find((trigger) => trigger.getAttribute('aria-selected') === 'true') || triggers[0];
      if (selected) activate(selected);
    });
  };

  const initCountdown = (root = document) => {
    root.querySelectorAll?.('[data-countdown]').forEach((countdown) => {
      if (countdown.dataset.themeInitialized === 'true') return;
      countdown.dataset.themeInitialized = 'true';
      const target = countdown.dataset.countdownTarget;
      const timer = countdown.querySelector('[data-countdown-timer]');
      if (!target || !timer) return;
      const targetDate = new Date(target);
      if (Number.isNaN(targetDate.getTime())) {
        countdown.hidden = true;
        return;
      }
      const update = () => {
        const now = new Date();
        const diff = Math.max(0, targetDate - now);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        timer.textContent = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      };
      update();
      countdown.themeTimer = setInterval(update, 1000);
    });
  };

  const initBeforeAfter = (root = document) => {
    root.querySelectorAll?.('[data-before-after]').forEach((wrapper) => {
      if (wrapper.dataset.themeInitialized === 'true') return;
      wrapper.dataset.themeInitialized = 'true';
      const range = wrapper.querySelector('[data-before-after-range]');
      const images = wrapper.querySelector('[data-before-after-images]');
      const after = wrapper.querySelector('.before-after__after');
      if (!range || !images || !after) return;
      images.style.position = 'relative';
      after.style.position = 'absolute';
      after.style.left = '0';
      after.style.top = '0';
      after.style.height = '100%';
      after.style.objectFit = 'cover';
      const update = () => {
        const value = range.value;
        after.style.width = `${value}%`;
      };
      range.addEventListener('input', update);
      update();
    });
  };

  const initProductPage = (root = document) => {
    const form = root.querySelector?.('[data-product-form]');
    const productSection = form?.closest('[data-product-section]') || form?.closest('.section') || document;
    if (form && productSection.matches?.('[data-product-section]')) {
      if (form.dataset.themeInitialized === 'true') return;
      form.dataset.themeInitialized = 'true';

      const gallery = productSection.querySelector('[data-product-gallery]');
      const galleryItems = Array.from(gallery?.querySelectorAll('[data-gallery-item]') || []);
      const galleryThumbs = Array.from(gallery?.querySelectorAll('[data-gallery-thumb]') || []);
      const prevButton = gallery?.querySelector('[data-gallery-prev]');
      const nextButton = gallery?.querySelector('[data-gallery-next]');
      let galleryIndex = Math.max(0, galleryItems.findIndex((item) => item.classList.contains('is-active')));

      const showGalleryIndex = (index) => {
        if (!galleryItems.length) return;
        galleryIndex = (index + galleryItems.length) % galleryItems.length;
        galleryItems.forEach((item, itemIndex) => {
          const active = itemIndex === galleryIndex;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-hidden', active ? 'false' : 'true');
          if (!active) item.querySelectorAll('video').forEach((video) => video.pause());
        });
        galleryThumbs.forEach((thumb, thumbIndex) => {
          const active = thumbIndex === galleryIndex;
          thumb.classList.toggle('is-selected', active);
          thumb.setAttribute('aria-current', active ? 'true' : 'false');
        });
      };

      galleryThumbs.forEach((thumb, index) => thumb.addEventListener('click', () => showGalleryIndex(index)));
      prevButton?.addEventListener('click', () => showGalleryIndex(galleryIndex - 1));
      nextButton?.addEventListener('click', () => showGalleryIndex(galleryIndex + 1));
      showGalleryIndex(galleryIndex);

      const stickyAtc = productSection.querySelector('[data-sticky-atc]');
      if (stickyAtc && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver(([entry]) => {
          const shouldShow = !entry.isIntersecting;
          stickyAtc.classList.toggle('is-visible', shouldShow);
          stickyAtc.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
        }, { rootMargin: '-120px 0px 0px 0px', threshold: 0 });
        observer.observe(form);
        productSection.themeObserver = observer;
      }

      const picker = form.querySelector('[data-variant-picker]');
      if (!picker) return;
      let variantController;
      picker.addEventListener('change', async (event) => {
        const changedInput = event.target.closest('[data-option-value-id]');
        if (!changedInput) return;
        const fieldset = changedInput.closest('[data-option-position]');
        const selectedLabel = fieldset?.querySelector('[data-selected-option]');
        if (selectedLabel) selectedLabel.textContent = changedInput.value;

        const selectedInputs = Array.from(picker.querySelectorAll('[data-option-value-id]:checked'));
        const optionValueIds = selectedInputs.map((input) => input.dataset.optionValueId).filter(Boolean);
        if (!optionValueIds.length) return;

        variantController?.abort();
        variantController = new AbortController();
        const publicUrl = new URL(changedInput.dataset.productUrl || productSection.dataset.productUrl || window.location.pathname, window.location.origin);
        publicUrl.searchParams.set('option_values', optionValueIds.join(','));
        const requestUrl = new URL(publicUrl);
        requestUrl.searchParams.set('section_id', productSection.dataset.sectionId);
        productSection.setAttribute('aria-busy', 'true');

        try {
          const response = await fetch(requestUrl, { signal: variantController.signal, headers: { Accept: 'text/html' } });
          if (!response.ok) throw new Error('Variant update failed.');
          const html = new DOMParser().parseFromString(await response.text(), 'text/html');
          const replacement = html.querySelector('[data-product-section]');
          if (!replacement) throw new Error('Product section missing from response.');
          productSection.themeObserver?.disconnect();
          productSection.replaceWith(replacement);
          window.history.replaceState({}, '', publicUrl);
          Theme.init(replacement);
          announce('Product options updated.');
        } catch (error) {
          if (error.name !== 'AbortError') showToast('Unable to update this product option. Please try again.');
          productSection.removeAttribute('aria-busy');
        }
      });
      return;
    }

    const variantsData = productSection.querySelector?.('[data-product-variants]');
    if (!form || !variantsData) return;
    if (form.dataset.themeInitialized === 'true') return;
    form.dataset.themeInitialized = 'true';
    let variants = [];
    try {
      variants = JSON.parse(variantsData.textContent || '[]');
    } catch {
      return;
    }
    if (!variants.length) return;

    const colorPosition = Number(form.dataset.colorPosition || 0);
    const sizePosition = Number(form.dataset.sizePosition || 0);
    const variantIdInput = form.querySelector('[data-variant-id]');
    const colorLabel = form.querySelector('[data-color-label]');
    const colorSwatches = Array.from(form.querySelectorAll('[data-color-swatches] .product-color-swatch'));
    const sizeSelect = form.querySelector('.product-size-select');
    const optionSelects = Array.from(form.querySelectorAll('.product-option-select'));
    const gallery = productSection.querySelector('[data-product-gallery]');
    const galleryItems = Array.from(gallery?.querySelectorAll('[data-gallery-item]') || []);
    const galleryThumbs = Array.from(gallery?.querySelectorAll('[data-gallery-thumb]') || []);
    const prevButton = gallery?.querySelector('[data-gallery-prev]');
    const nextButton = gallery?.querySelector('[data-gallery-next]');
    const stickyAtc = productSection.querySelector('[data-sticky-atc]');
    const stickyVariant = stickyAtc?.querySelector('[data-sticky-atc-variant]');
    let galleryIndex = 0;

    const showGalleryIndex = (index) => {
      if (!galleryItems.length) return;
      galleryIndex = (index + galleryItems.length) % galleryItems.length;
      galleryItems.forEach((item, idx) => {
        item.classList.toggle('is-active', idx === galleryIndex);
      });
      galleryThumbs.forEach((thumb, idx) => {
        thumb.classList.toggle('is-selected', idx === galleryIndex);
      });
    };

    const showGalleryByMediaId = (mediaId) => {
      if (!mediaId) return;
      const targetIndex = galleryItems.findIndex((item) => item.dataset.mediaId === String(mediaId));
      if (targetIndex >= 0) {
        showGalleryIndex(targetIndex);
      }
    };

    const getSelectedColor = () => {
      const selectedSwatch = form.querySelector('.product-color-swatch.is-selected');
      return selectedSwatch?.dataset.optionValue || null;
    };

    const getSelectedOptions = () => {
      const totalOptions = variants[0]?.options?.length || 0;
      const selected = new Array(totalOptions).fill(null);
      const colorValue = getSelectedColor();
      const sizeValue = sizeSelect?.value || null;
      if (colorPosition) selected[colorPosition - 1] = colorValue;
      if (sizePosition) selected[sizePosition - 1] = sizeValue;
      optionSelects.forEach((select) => {
        const position = Number(select.dataset.optionPosition || 0);
        if (position) selected[position - 1] = select.value;
      });
      return selected;
    };

    const updateSizeAvailability = () => {
      if (!sizeSelect || !sizePosition) return;
      const colorValue = colorPosition ? getSelectedColor() : null;
      const sizeOptions = Array.from(sizeSelect.options);
      sizeOptions.forEach((option) => {
        const hasVariant = variants.some((variant) => {
          const matchesColor = colorPosition ? variant.options[colorPosition - 1] === colorValue : true;
          return matchesColor && variant.options[sizePosition - 1] === option.value;
        });
        option.disabled = !hasVariant;
      });
      if (sizeSelect.selectedOptions[0]?.disabled) {
        const firstEnabled = sizeOptions.find((option) => !option.disabled);
        if (firstEnabled) sizeSelect.value = firstEnabled.value;
      }
    };

    const updateVariant = () => {
      const selectedOptions = getSelectedOptions();
      const match = variants.find((variant) =>
        selectedOptions.every((value, index) => !value || variant.options[index] === value),
      );
      if (match && variantIdInput) {
        variantIdInput.value = match.id;
        if (stickyVariant) stickyVariant.value = match.id;
        const mediaId = match.featured_media?.id || match.featured_media?.media_id;
        showGalleryByMediaId(mediaId);
      }
    };

    colorSwatches.forEach((swatch) => {
      swatch.addEventListener('click', () => {
        colorSwatches.forEach((item) => {
          item.classList.toggle('is-selected', item === swatch);
          item.setAttribute('aria-pressed', item === swatch ? 'true' : 'false');
        });
        if (colorLabel) colorLabel.textContent = swatch.dataset.optionValue || '';
        updateSizeAvailability();
        updateVariant();
      });
    });

    sizeSelect?.addEventListener('change', () => {
      updateVariant();
    });

    optionSelects.forEach((select) => {
      select.addEventListener('change', updateVariant);
    });

    galleryThumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => showGalleryIndex(index));
    });

    prevButton?.addEventListener('click', () => showGalleryIndex(galleryIndex - 1));
    nextButton?.addEventListener('click', () => showGalleryIndex(galleryIndex + 1));

    updateSizeAvailability();
    updateVariant();
    showGalleryIndex(galleryIndex);

    if (stickyAtc) {
      // Keep the sticky ATC hidden while the main product form is in view.
      const observer = new IntersectionObserver(
        ([entry]) => {
          const shouldShow = !entry.isIntersecting;
          stickyAtc.classList.toggle('is-visible', shouldShow);
          stickyAtc.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
        },
        { rootMargin: '-120px 0px 0px 0px', threshold: 0 },
      );
      observer.observe(form);
    }
  };

  const initShippingEstimator = (root = document) => {
    root.querySelectorAll?.('[data-shipping-estimator]').forEach((form) => {
      if (form.dataset.themeInitialized === 'true') return;
      form.dataset.themeInitialized = 'true';
      const results = form.querySelector('[data-shipping-results]');
      if (!results) return;
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const data = new FormData(form);
        const zip = data.get('zip');
        const country = data.get('country');
        results.textContent = 'Loading...';
        fetch(shopifyPath(`cart/shipping_rates.json?shipping_address%5Bzip%5D=${encodeURIComponent(zip)}&shipping_address%5Bcountry%5D=${encodeURIComponent(country)}`))
          .then((response) => response.json())
          .then((json) => {
            if (!json.shipping_rates || !json.shipping_rates.length) {
              results.textContent = 'No rates available.';
              return;
            }
            results.innerHTML = `<ul>${json.shipping_rates.map((rate) => `<li>${escapeHTML(rate.name)}: ${escapeHTML(rate.price)}</li>`).join('')}</ul>`;
          })
          .catch(() => {
            results.textContent = 'Unable to fetch rates.';
          });
      });
    });
  };

  const initRecentlyViewedSection = (root = document) => {
    root.querySelectorAll?.('[data-recently-viewed-items]').forEach(async (container) => {
      if (container.dataset.themeInitialized === 'true') return;
      container.dataset.themeInitialized = 'true';
      let handles = [];
      try {
        handles = JSON.parse(safeStorage.get('recently-viewed', '[]')).filter(Boolean);
      } catch {
        handles = [];
      }
      if (!handles.length) {
        container.innerHTML = '<p>No recently viewed products yet.</p>';
        return;
      }

      const uniqueHandles = [...new Set(handles)].slice(0, 6);
      container.innerHTML = '<p>Loading recently viewed...</p>';
      const products = await Promise.all(
        uniqueHandles.map((handle) =>
          fetch(shopifyPath(`products/${handle}.js`))
            .then((response) => (response.ok ? response.json() : null))
            .catch(() => null),
        ),
      );
      const valid = products.filter(Boolean);
      if (!valid.length) {
        container.innerHTML = '<p>No recently viewed products yet.</p>';
        return;
      }

      container.innerHTML = `
        <div class="product-grid">
          ${valid
            .map((product) => {
              const title = escapeHTML(product.title);
              const url = escapeHTML(product.url);
              const img = product.featured_image
                ? `<img src="${escapeHTML(withWidth(product.featured_image, 600))}" alt="${title}" loading="lazy">`
                : '';
              const price = formatMoney(product.price);
              return `
                <article class="product-card">
                  <div class="product-card__media">
                    <a href="${url}">${img}</a>
                  </div>
                  <div class="product-card__info">
                    <strong>${title}</strong>
                    <div>${price}</div>
                    <a class="button button--secondary" href="${url}">View</a>
                  </div>
                </article>
              `;
            })
            .join('')}
        </div>
      `;
    });
  };

  const initCopyButtons = (root = document) => {
    root.querySelectorAll?.('[data-copy-button]').forEach((button) => {
      if (button.dataset.themeInitialized === 'true') return;
      button.dataset.themeInitialized = 'true';
      const text = button.dataset.copyText || '';
      button.addEventListener('click', async () => {
        try {
          await navigator.clipboard?.writeText(text);
          announce('Copied to clipboard.');
        } catch {
          announce('Unable to copy.');
        }
      });
    });
  };

  const initPrintButtons = (root = document) => {
    root.querySelectorAll?.('[data-print-button]').forEach((button) => {
      if (button.dataset.themeInitialized === 'true') return;
      button.dataset.themeInitialized = 'true';
      button.addEventListener('click', () => window.print());
    });
  };

  const initGiftCardQrCode = (root = document) => {
    root.querySelectorAll?.('[data-gift-card-qr]').forEach((target) => {
      if (target.dataset.themeInitialized === 'true') return;
      if (!target.dataset.giftCardQr || typeof window.QRCode !== 'function') return;
      target.dataset.themeInitialized = 'true';
      new window.QRCode(target, {
        text: target.dataset.giftCardQr,
        width: 160,
        height: 160,
        correctLevel: window.QRCode.CorrectLevel?.H,
      });
    });
  };

  const initQuickView = () => {
    const drawer = document.querySelector('[data-quick-view-drawer]');
    const content = drawer?.querySelector('[data-quick-view-content]');
    if (!drawer || !content) return;
    if (drawer.dataset.themeInitialized === 'true') return;
    drawer.dataset.themeInitialized = 'true';

    const renderQuickView = (product, fallbackUrl = '#') => {
      const variant = product.variants?.find((item) => item.available) || product.variants?.[0];
      const productUrl = product.url || fallbackUrl;
      const image = product.featured_image || product.images?.[0];
      const description = stripHTML(product.description).trim();
      const hasSingleVariant = product.variants?.length === 1;
      const comparePrice = product.compare_at_price && product.compare_at_price > product.price
        ? `<span class="price__compare"><s>${formatMoney(product.compare_at_price)}</s></span>`
        : '';
      const imageMarkup = image
        ? `<img src="${escapeHTML(withWidth(image, 900))}" alt="${escapeHTML(product.title)}" loading="lazy">`
        : '';
      const actionMarkup = hasSingleVariant && variant
        ? `
          <form method="post" action="${escapeHTML(shopifyPath('cart/add'))}" data-ajax-cart>
            <input type="hidden" name="id" value="${variant.id}">
            <button class="button button--primary" type="submit" ${variant.available ? '' : 'disabled'}>
              ${variant.available ? 'Add to cart' : 'Sold out'}
            </button>
          </form>
        `
        : `<a class="button button--primary" href="${escapeHTML(productUrl)}">Choose options</a>`;

      content.innerHTML = `
        <div class="quick-view-product">
          <a class="quick-view-product__media" href="${escapeHTML(productUrl)}">${imageMarkup}</a>
          <div class="quick-view-product__details">
            <div class="quick-view-product__meta">
              ${product.vendor ? `<span class="quick-view-product__vendor">${escapeHTML(product.vendor)}</span>` : ''}
              <h2 class="heading">${escapeHTML(product.title)}</h2>
              <div class="product-card__price">${comparePrice}<span class="price__current">${formatMoney(product.price)}</span></div>
            </div>
            ${description ? `<p class="quick-view-product__description">${escapeHTML(description.slice(0, 220))}</p>` : ''}
            <div class="quick-view-product__actions">
              ${actionMarkup}
              <a class="button button--secondary" href="${escapeHTML(productUrl)}">View full details</a>
            </div>
          </div>
        </div>
      `;
    };

    document.addEventListener('click', async (event) => {
      const trigger = event.target.closest('[data-quick-view]');
      if (!trigger) return;
      event.preventDefault();

      const handle = trigger.dataset.quickView;
      if (!handle) return;

      content.innerHTML = '<p>Loading product...</p>';
      openDrawer(drawer, trigger);

      try {
        const response = await fetch(shopifyPath(`products/${handle}.js`), {
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('Quick view failed.');
        const product = await response.json();
        renderQuickView(product, trigger.dataset.productUrl);
      } catch {
        content.innerHTML = '<p>Unable to load this product right now.</p>';
      }
    });
  };

  const initAjaxCart = () => {
    if (document.documentElement.dataset.ajaxCartInitialized === 'true') return;
    document.documentElement.dataset.ajaxCartInitialized = 'true';
    const drawer = document.querySelector('[data-cart-drawer]') || document.querySelector('#cart-drawer');
    const itemsEl = document.querySelector('[data-cart-drawer-items]');
    const totalEl = document.querySelector('[data-cart-drawer-total]');
    const emptyEl = document.querySelector('[data-cart-drawer-empty]');
    const filledEl = document.querySelector('[data-cart-drawer-filled]');

    const updateCount = (count) => {
      document.querySelectorAll('[data-cart-count]').forEach((badge) => {
        badge.textContent = String(count || 0);
        badge.classList.toggle('hidden', !count);
      });
    };

    const renderCartDrawer = (cart) => {
      updateCount(cart?.item_count || 0);
      if (emptyEl && filledEl) {
        const isEmpty = !cart?.item_count;
        emptyEl.classList.toggle('hidden', !isEmpty);
        filledEl.classList.toggle('hidden', isEmpty);
      }

      if (itemsEl && Array.isArray(cart?.items)) {
        itemsEl.innerHTML = `
          ${cart.items
            .map((item) => {
              const title = escapeHTML(item.product_title || item.title || '');
              const variantTitle = item.variant_title && item.variant_title !== 'Default Title'
                ? `<span class="cart-drawer-item__variant">${escapeHTML(item.variant_title)}</span>`
                : '';
              const img = item.image
                ? `<img src="${escapeHTML(withWidth(item.image, 120))}" alt="${title}" loading="lazy">`
                : '';
              const linePrice = formatMoney(item.final_line_price ?? item.line_price);
              const properties = Object.entries(item.properties || {})
                .filter(([name, value]) => value && !name.startsWith('_'))
                .map(([name, value]) => `<span>${escapeHTML(name)}: ${escapeHTML(value)}</span>`)
                .join('');
              return `
                <div class="cart-drawer-item" data-cart-line-key="${escapeHTML(item.key)}">
                  <a href="${escapeHTML(item.url)}">${img}</a>
                  <div class="cart-drawer-item__details">
                    <a href="${escapeHTML(item.url)}"><strong>${title}</strong></a>
                    ${variantTitle}
                    ${item.selling_plan_allocation?.selling_plan?.name ? `<span>${escapeHTML(item.selling_plan_allocation.selling_plan.name)}</span>` : ''}
                    ${properties ? `<span class="cart-drawer-item__properties">${properties}</span>` : ''}
                    <div>${linePrice}</div>
                    <div class="quantity-control" aria-label="Quantity for ${title}">
                      <button type="button" data-cart-quantity="${Math.max(0, item.quantity - 1)}" aria-label="Decrease quantity">−</button>
                      <span aria-live="polite">${item.quantity || 0}</span>
                      <button type="button" data-cart-quantity="${item.quantity + 1}" aria-label="Increase quantity">+</button>
                    </div>
                    <button class="button button--tertiary" type="button" data-cart-remove>Remove</button>
                  </div>
                </div>
              `;
            })
            .join('')}
        `;
      }

      if (totalEl) {
        totalEl.textContent = formatMoney(cart?.total_price || 0);
      }
      document.querySelectorAll('[data-free-shipping-progress]').forEach((progress) => {
        const goal = Number(config.settings?.freeShippingThreshold || 0);
        if (!goal) {
          progress.hidden = true;
          return;
        }
        progress.hidden = false;
        const remaining = Math.max(0, goal - Number(cart?.total_price || 0));
        const percent = Math.min(100, Math.round((Number(cart?.total_price || 0) / goal) * 100));
        progress.querySelector('[data-free-shipping-message]').textContent = remaining > 0
          ? `Add ${formatMoney(remaining)} for free shipping.`
          : 'You reached the free-shipping goal.';
        const bar = progress.querySelector('[data-free-shipping-bar]');
        bar?.setAttribute('aria-valuenow', String(percent));
        if (bar) bar.style.setProperty('--progress', `${percent}%`);
      });
    };

    const fetchCart = () =>
      fetch(shopifyPath('cart.js'), { headers: { Accept: 'application/json' } })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);

    const changeLine = async (key, quantity) => {
      if (!key) return;
      itemsEl?.setAttribute('aria-busy', 'true');
      try {
        const endpoint = `${config.routes?.cartChange || shopifyPath('cart/change')}.js`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: key, quantity }),
        });
        if (!response.ok) throw new Error('Cart update failed.');
        renderCartDrawer(await response.json());
        announce('Cart updated.');
      } catch {
        showToast(config.strings?.cartError || 'We could not update your cart.');
      } finally {
        itemsEl?.removeAttribute('aria-busy');
      }
    };

    itemsEl?.addEventListener('click', (event) => {
      const line = event.target.closest('[data-cart-line-key]');
      if (!line) return;
      const quantityButton = event.target.closest('[data-cart-quantity]');
      const removeButton = event.target.closest('[data-cart-remove]');
      if (!quantityButton && !removeButton) return;
      changeLine(line.dataset.cartLineKey, removeButton ? 0 : Number(quantityButton.dataset.cartQuantity));
    });

    document.addEventListener('submit', async (event) => {
      const form = event.target.closest('form[data-ajax-cart]');
      if (!form) return;
      event.preventDefault();

      const submit = form.querySelector('button[type="submit"], input[type="submit"]');
      const originalText = submit?.textContent;
      if (submit) {
        submit.disabled = true;
        submit.classList.add('is-loading');
        if (submit.tagName === 'BUTTON') submit.textContent = config.strings?.adding || 'Adding…';
      }

      try {
        const response = await fetch(shopifyPath('cart/add.js'), {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: new FormData(form),
        });

        if (!response.ok) {
          const errorJson = await response.json().catch(() => null);
          showToast(errorJson?.description || config.strings?.cartError || 'Unable to add to cart.');
          return;
        }

        const cart = await fetchCart();
        if (cart) renderCartDrawer(cart);
        showToast(config.strings?.addedToCart || 'Added to cart.');
        const cartBehavior = document.body.dataset.cartBehavior || 'drawer';
        if (cartBehavior === 'page') {
          window.location.assign(config.routes?.cart || shopifyPath('cart'));
        } else if (cartBehavior === 'drawer' && drawer) {
          openDrawer(drawer, form.querySelector('[type="submit"]'));
        }
      } catch {
        showToast(config.strings?.cartError || 'Unable to add to cart.');
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.classList.remove('is-loading');
          if (submit.tagName === 'BUTTON') submit.textContent = originalText || config.strings?.addToCart || 'Add to cart';
        }
      }
    });

    fetchCart().then((cart) => {
      if (cart) renderCartDrawer(cart);
    });
  };

  const initBackToTop = () => {
    const button = document.querySelector('[data-back-to-top]');
    if (!button) return;
    if (button.dataset.themeInitialized === 'true') return;
    button.dataset.themeInitialized = 'true';
    const update = () => {
      const visible = window.scrollY > 700;
      button.classList.toggle('is-visible', visible);
      button.setAttribute('aria-hidden', visible ? 'false' : 'true');
      button.tabIndex = visible ? 0 : -1;
    };
    window.addEventListener('scroll', update, { passive: true });
    button.addEventListener('click', () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    });
    update();
  };

  const initGridDensity = (root = document) => {
    root.querySelectorAll?.('[data-collection-section]').forEach((section) => {
      if (section.dataset.gridInitialized === 'true') return;
      section.dataset.gridInitialized = 'true';
      const grid = section.querySelector('[data-product-grid]');
      const buttons = Array.from(section.querySelectorAll('[data-grid-columns]'));
      if (!grid || !buttons.length) return;
      const storageKey = 'riskylimits:grid-density';
      const apply = (value) => {
        const columns = Math.max(2, Math.min(5, Number(value) || 4));
        grid.style.setProperty('--desktop-columns', String(columns));
        if (columns <= 2) grid.style.setProperty('--mobile-columns', String(columns));
        buttons.forEach((button) => button.setAttribute('aria-pressed', button.dataset.gridColumns === String(columns) ? 'true' : 'false'));
        safeStorage.set(storageKey, String(columns));
      };
      buttons.forEach((button) => button.addEventListener('click', () => apply(button.dataset.gridColumns)));
      apply(safeStorage.get(storageKey, grid.style.getPropertyValue('--desktop-columns') || '4'));
    });
  };

  const initRecommendations = (root = document) => {
    root.querySelectorAll?.('[data-product-recommendations]').forEach(async (section) => {
      if (section.dataset.themeInitialized === 'true') return;
      section.dataset.themeInitialized = 'true';
      if (section.querySelector('.product-grid')) return;
      const productId = section.dataset.productId;
      const sectionId = section.dataset.sectionId;
      if (!productId || !sectionId) return;
      const endpoint = config.routes?.productRecommendations || shopifyPath('recommendations/products');
      const params = new URLSearchParams({
        section_id: sectionId,
        product_id: productId,
        limit: section.dataset.limit || '4',
        intent: section.dataset.intent || 'related',
      });
      try {
        const response = await fetch(`${endpoint}?${params}`, { headers: { Accept: 'text/html' } });
        if (!response.ok) return;
        const html = new DOMParser().parseFromString(await response.text(), 'text/html');
        const replacement = html.querySelector('[data-product-recommendations]');
        if (!replacement?.querySelector('.product-grid')) return;
        section.replaceWith(replacement);
        Theme.init(replacement);
      } catch {
        // Recommendations are optional and remain hidden when the endpoint is unavailable.
      }
    });
  };

  const init = (root = document) => {
    initDrawers(root);
    initMegaMenu(root);
    initMobileMenu(root);
    initSlideshow(root);
    initPromoDismiss(root);
    initWishlist(root);
    initPopup(root);
    initPredictiveSearch(root);
    initAccordion(root);
    initRecentlyViewed(root);
    initTabs(root);
    initAnimatedHeadlines(root);
    initCountdown(root);
    initBeforeAfter(root);
    initShippingEstimator(root);
    initRecentlyViewedSection(root);
    initCopyButtons(root);
    initGiftCardQrCode(root);
    initPrintButtons(root);
    initQuickView();
    initAjaxCart();
    initBackToTop();
    initGridDensity(root);
    initRecommendations(root);
    initProductPage(root);
  };

  const unload = (root) => {
    root.querySelectorAll?.('[data-slideshow], [data-countdown], [data-animated-headline]').forEach((element) => {
      element.themeCleanup?.();
      window.clearInterval(element.themeTimer);
      window.clearTimeout(element.themeTimer);
    });
    root.querySelectorAll?.('[data-popup]').forEach((element) => window.clearTimeout(element.themeTimer));
  };

  return { init, unload, openDrawer, closeDrawer, formatMoney, announce };
})();

document.addEventListener('DOMContentLoaded', () => Theme.init(document));
document.addEventListener('shopify:section:load', (event) => Theme.init(event.target));
document.addEventListener('shopify:section:unload', (event) => Theme.unload(event.target));

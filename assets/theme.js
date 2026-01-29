const Theme = (() => {
  const body = document.body;
  const overlay = document.querySelector('[data-overlay]');
  const openDrawer = (drawer) => {
    drawer?.classList.add('is-open');
    overlay?.classList.add('is-visible');
    body.classList.add('no-scroll');
  };

  const closeDrawer = (drawer) => {
    drawer?.classList.remove('is-open');
    overlay?.classList.remove('is-visible');
    body.classList.remove('no-scroll');
  };

  const initDrawers = () => {
    document.querySelectorAll('[data-drawer-open]').forEach((button) => {
      const target = document.querySelector(button.dataset.drawerOpen);
      button.addEventListener('click', () => openDrawer(target));
    });

    document.querySelectorAll('[data-drawer-close]').forEach((button) => {
      const target = button.closest('.drawer');
      button.addEventListener('click', () => closeDrawer(target));
    });

    overlay?.addEventListener('click', () => {
      document.querySelectorAll('.drawer.is-open').forEach(closeDrawer);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        document.querySelectorAll('.drawer.is-open').forEach(closeDrawer);
      }
    });
  };

  const initMegaMenu = () => {
    document.querySelectorAll('[data-mega-trigger]').forEach((trigger) => {
      const panel = trigger.nextElementSibling;
      if (!panel) return;
      const getFocusable = () =>
        panel.querySelectorAll('a, button, [tabindex=\"0\"], input, select, textarea');
      const open = () => {
        panel.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
        const focusables = getFocusable();
        focusables[0]?.focus();
      };
      const close = () => {
        panel.setAttribute('aria-hidden', 'true');
        trigger.setAttribute('aria-expanded', 'false');
      };
      trigger.addEventListener('mouseenter', open);
      trigger.addEventListener('mouseleave', close);
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        panel.getAttribute('aria-hidden') === 'true' ? open() : close();
      });
      trigger.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          panel.getAttribute('aria-hidden') === 'true' ? open() : close();
        }
        if (event.key === 'Escape') {
          close();
        }
      });
      panel.addEventListener('keydown', (event) => {
        if (event.key !== 'Tab') return;
        const focusables = Array.from(getFocusable());
        if (focusables.length === 0) return;
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
      panel.addEventListener('mouseleave', close);
    });
  };

  const initSlideshow = () => {
    document.querySelectorAll('[data-slideshow]').forEach((slideshow) => {
      const slides = Array.from(slideshow.querySelectorAll('[data-slide]'));
      if (slides.length < 2) return;
      const dots = slideshow.querySelectorAll('[data-slide-dot]');
      const prev = slideshow.querySelector('[data-slide-prev]');
      const next = slideshow.querySelector('[data-slide-next]');
      let index = 0;
      let timer;
      const interval = Number(slideshow.dataset.autoplaySpeed || 6000);
      const autoplay = slideshow.dataset.autoplay === 'true';

      const showSlide = (next) => {
        slides.forEach((slide, i) => {
          slide.classList.toggle('hidden', i !== next);
        });
        dots.forEach((dot, i) => {
          dot.classList.toggle('is-active', i === next);
        });
        index = next;
      };

      const nextSlide = () => {
        showSlide((index + 1) % slides.length);
      };

      const prevSlide = () => {
        showSlide((index - 1 + slides.length) % slides.length);
      };

      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => showSlide(i));
      });

      prev?.addEventListener('click', prevSlide);
      next?.addEventListener('click', nextSlide);

      if (autoplay) {
        timer = setInterval(nextSlide, interval);
        slideshow.addEventListener('mouseenter', () => clearInterval(timer));
        slideshow.addEventListener('mouseleave', () => {
          timer = setInterval(nextSlide, interval);
        });
      }

      showSlide(0);
    });
  };

  const initPromoDismiss = () => {
    document.querySelectorAll('[data-promo-dismiss]').forEach((button) => {
      const key = button.dataset.promoDismiss;
      if (localStorage.getItem(key) === 'true') {
        button.closest('[data-promo-item]')?.remove();
        return;
      }
      button.addEventListener('click', () => {
        localStorage.setItem(key, 'true');
        button.closest('[data-promo-item]')?.remove();
      });
    });
  };

  const initWishlist = () => {
    const storageKey = 'wishlist-items';
    const getItems = () => JSON.parse(localStorage.getItem(storageKey) || '[]');
    const setItems = (items) => localStorage.setItem(storageKey, JSON.stringify(items));
    const renderWishlist = () => {
      const container = document.querySelector('[data-wishlist-items]');
      if (!container) return;
      const items = getItems();
      if (!items.length) {
        container.innerHTML = '<p>Your wishlist is empty.</p>';
        return;
      }
      container.innerHTML = `
        <ul class="stack">
          ${items.map((handle) => `<li><a href="/products/${handle}">${handle.replace(/-/g, ' ')}</a></li>`).join('')}
        </ul>
      `;
    };

    document.querySelectorAll('[data-wishlist-toggle]').forEach((button) => {
      const handle = button.dataset.wishlistToggle;
      const key = `wishlist:${handle}`;
      const updateList = () => {
        const items = getItems();
        if (localStorage.getItem(key) === 'true') {
          if (!items.includes(handle)) items.push(handle);
        } else {
          const index = items.indexOf(handle);
          if (index >= 0) items.splice(index, 1);
        }
        setItems(items);
        renderWishlist();
      };
      const update = () => {
        const active = localStorage.getItem(key) === 'true';
        button.setAttribute('aria-pressed', active);
        button.classList.toggle('is-active', active);
      };
      button.addEventListener('click', () => {
        const next = localStorage.getItem(key) !== 'true';
        localStorage.setItem(key, next);
        update();
        updateList();
      });
      update();
    });
    renderWishlist();
  };

  const initPopup = () => {
    document.querySelectorAll('[data-popup]').forEach((popup) => {
      const config = JSON.parse(popup.dataset.popup || '{}');
      const key = `popup:${config.id}`;
      if (localStorage.getItem(key) === 'true') return;
      const open = () => {
        popup.classList.add('is-visible');
        popup.querySelector('[data-popup-close]')?.focus();
      };
      const close = () => {
        popup.classList.remove('is-visible');
        localStorage.setItem(key, 'true');
      };
      const closeButton = popup.querySelector('[data-popup-close]');
      closeButton?.addEventListener('click', close);
      popup.addEventListener('click', (event) => {
        if (event.target === popup) close();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') close();
      });
      if (config.trigger === 'delay') {
        setTimeout(open, config.delay * 1000);
      }
      if (config.trigger === 'scroll') {
        const onScroll = () => {
          const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
          if (scrolled >= config.scroll) {
            open();
            window.removeEventListener('scroll', onScroll);
          }
        };
        window.addEventListener('scroll', onScroll);
      }
      if (config.trigger === 'exit') {
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

  const initPredictiveSearch = () => {
    document.querySelectorAll('[data-predictive-search]').forEach((form) => {
      const input = form.querySelector('input[type="search"]');
      const results = form.querySelector('[data-predictive-results]');
      if (!input || !results) return;
      let controller;
      input.addEventListener('input', () => {
        const query = input.value.trim();
        if (query.length < 2) {
          results.innerHTML = '';
          return;
        }
        controller?.abort();
        controller = new AbortController();
        fetch(`/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product,collection,page&resources[limit]=4`, {
          signal: controller.signal
        })
          .then((response) => response.json())
          .then((data) => {
            const renderList = (items) =>
              items.map((item) => `<li><a href="${item.url}">${item.title}</a></li>`).join('');
            const products = data.resources.results.products;
            const collections = data.resources.results.collections;
            const pages = data.resources.results.pages;
            results.innerHTML = `
              <div class="stack">
                <div>
                  <strong>Products</strong>
                  <ul>${renderList(products)}</ul>
                </div>
                <div>
                  <strong>Collections</strong>
                  <ul>${renderList(collections)}</ul>
                </div>
                <div>
                  <strong>Pages</strong>
                  <ul>${renderList(pages)}</ul>
                </div>
              </div>
            `;
          })
          .catch(() => {});
      });
    });
  };

  const initAccordion = () => {
    document.querySelectorAll('[data-accordion]').forEach((accordion) => {
      accordion.querySelectorAll('[data-accordion-button]').forEach((button) => {
        button.addEventListener('click', () => {
          const panel = button.nextElementSibling;
          const expanded = button.getAttribute('aria-expanded') === 'true';
          button.setAttribute('aria-expanded', String(!expanded));
          panel?.classList.toggle('hidden', expanded);
        });
      });
    });
  };

  const initRecentlyViewed = () => {
    const productHandle = document.querySelector('[data-product-handle]')?.dataset.productHandle;
    if (productHandle) {
      const key = 'recently-viewed';
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      if (!list.includes(productHandle)) list.unshift(productHandle);
      localStorage.setItem(key, JSON.stringify(list.slice(0, 10)));
    }
  };

  const initTabs = () => {
    document.querySelectorAll('[data-collection-tabs]').forEach((tabs) => {
      const triggers = tabs.querySelectorAll('[data-tab-trigger]');
      const panels = tabs.querySelectorAll('[data-tab-panel]');
      triggers.forEach((trigger) => {
        trigger.addEventListener('click', () => {
          const id = trigger.dataset.tabId;
          panels.forEach((panel) => {
            panel.classList.toggle('hidden', panel.id !== id);
          });
          triggers.forEach((item) => {
            item.classList.toggle('is-active', item === trigger);
          });
        });
      });
    });
  };

  const init = () => {
    initDrawers();
    initMegaMenu();
    initSlideshow();
    initPromoDismiss();
    initWishlist();
    initPopup();
    initPredictiveSearch();
    initAccordion();
    initRecentlyViewed();
    initTabs();
  };

  return { init };
})();

document.addEventListener('DOMContentLoaded', Theme.init);

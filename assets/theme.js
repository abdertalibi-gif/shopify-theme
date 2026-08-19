/**
 * Atlas Premium — Theme JavaScript
 * Vanilla JS: mobile menu, search, accordions, reveal animations,
 * quick-add to cart, product gallery, quantity selector.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initSearchDrawer();
    initAnnouncementBar();
    initRevealAnimations();
    initQuickAdd();
    initProductGallery();
    initQuantitySelectors();
    initCartCount();
  });

  function initCartCount() {
    var link = document.querySelector('[data-cart-count]');
    if (!link) return;

    function update() {
      fetch(window.Shopify.routes.root + 'cart.js', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
      })
        .then(function (res) {
          if (!res.ok) throw new Error('cart fetch failed');
          return res.json();
        })
        .then(function (cart) {
          var count = cart.item_count || 0;
          link.textContent = count;
          link.classList.toggle('is-empty', count === 0);
        })
        .catch(function () {});
    }

    window.addEventListener('cart-updated', update);
  }

  function initMobileMenu() {
    var menu = document.getElementById('MobileMenu');
    var openBtn = document.getElementById('MobileMenuOpen');
    var closeBtn = document.getElementById('MobileMenuClose');
    if (!menu || !openBtn) return;

    var overlay = menu.querySelector('[data-menu-overlay]');

    function open() {
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      openBtn.setAttribute('aria-expanded', 'true');
    }

    function close() {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      openBtn.setAttribute('aria-expanded', 'false');
    }

    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);
    if (overlay) overlay.addEventListener('click', close);

    menu.addEventListener('click', function (e) {
      if (e.target.closest('.mobile-menu__nav a')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) close();
    });
  }

  function initSearchDrawer() {
    var drawer = document.getElementById('SearchDrawer');
    var openBtn = document.getElementById('SearchOpen');
    var closeBtn = document.getElementById('SearchClose');
    var input = drawer ? drawer.querySelector('input[type="search"]') : null;
    if (!drawer || !openBtn) return;

    function open() {
      drawer.classList.add('is-open');
      drawer.setAttribute('aria-hidden', 'false');
      openBtn.setAttribute('aria-expanded', 'true');
      if (input) setTimeout(function () { input.focus(); }, 200);
    }

    function close() {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
      openBtn.setAttribute('aria-expanded', 'false');
    }

    openBtn.addEventListener('click', open);
    if (closeBtn) closeBtn.addEventListener('click', close);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('is-open')) close();
    });
  }

  function initAnnouncementBar() {
    var bar = document.querySelector('[data-announcement-bar]');
    var closeBtn = document.getElementById('AnnouncementClose');
    if (!bar) return;

    try {
      if (sessionStorage.getItem('atlas-announcement-closed') === 'true') {
        bar.classList.add('is-hidden');
        return;
      }
    } catch (e) {}

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        bar.classList.add('is-hidden');
        try {
          sessionStorage.setItem('atlas-announcement-closed', 'true');
        } catch (e) {}
      });
    }
  }

  function initRevealAnimations() {
    var elements = document.querySelectorAll('.reveal');
    if (!elements.length) return;

    if (!('IntersectionObserver' in window)) {
      elements.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) { observer.observe(el); });
  }

  function initQuickAdd() {
    var buttons = document.querySelectorAll('[data-quick-add]');
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var url = btn.dataset.quickAdd;
        btn.classList.add('btn--loading');
        btn.setAttribute('aria-busy', 'true');

        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({ quantity: 1 })
        })
          .then(function (res) {
            if (!res.ok) throw new Error('add failed');
            return res.json();
          })
          .then(function () {
            showToast('<a href="/cart">Voir le panier</a> &middot; Ajouté au panier');
            window.dispatchEvent(new CustomEvent('cart-updated'));
          })
          .catch(function () {
            showToast('Erreur lors de l\'ajout au panier');
          })
          .finally(function () {
            btn.classList.remove('btn--loading');
            btn.removeAttribute('aria-busy');
          });
      });
    });
  }

  function initProductGallery() {
    var main = document.getElementById('ProductGalleryMain');
    var thumbs = document.querySelectorAll('[data-gallery-thumb]');
    if (!main || !thumbs.length) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        var src = thumb.dataset.galleryThumb;
        if (!src) return;
        main.querySelector('img').src = src;
        thumbs.forEach(function (t) { t.classList.remove('is-active'); });
        thumb.classList.add('is-active');
      });
    });
  }

  function initQuantitySelectors() {
    document.querySelectorAll('[data-quantity-selector]').forEach(function (wrapper) {
      var input = wrapper.querySelector('input[type="number"]');
      if (!input) return;
      var min = parseInt(input.min, 10) || 1;
      var max = input.max ? parseInt(input.max, 10) : Infinity;

      wrapper.querySelector('[data-quantity-minus]').addEventListener('click', function () {
        var val = parseInt(input.value, 10) || min;
        input.value = Math.max(min, val - 1);
      });

      wrapper.querySelector('[data-quantity-plus]').addEventListener('click', function () {
        var val = parseInt(input.value, 10) || min;
        input.value = Math.min(max, val + 1);
      });
    });
  }

  var toastTimer = null;

  function showToast(message) {
    var toast = document.getElementById('Toast');
    if (!toast) return;

    toast.innerHTML = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 3200);
  }
})();
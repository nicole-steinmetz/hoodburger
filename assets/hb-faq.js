/**
 * hb-faq.js — FAQ accordion + menu-tabs category nav (yellow slider).
 *
 * Rules (Hoodburger theme):
 *  - JS for visibility toggles only — no content injected.
 *  - Single-open accordion per category (matches Rewards T&C).
 *  - Nav behaviour matches hb-menu.liquid (menu-tabs).
 *  - Listens for shopify:section:load for theme editor compat.
 *  - Deferred via <script defer>.
 */

(function () {
  'use strict';

  function initAccordion(root) {
    root.querySelectorAll('.faq-item__toggle').forEach(function (btn) {
      if (btn.dataset.hbBound) return;
      btn.dataset.hbBound = '1';

      btn.addEventListener('click', function () {
        var isExpanded = btn.getAttribute('aria-expanded') === 'true';
        var list = btn.closest('.faq-list');
        var bodyId = btn.getAttribute('aria-controls');
        var body = document.getElementById(bodyId);
        if (!body) return;

        if (list) {
          list.querySelectorAll('.faq-item__toggle').forEach(function (other) {
            if (other === btn) return;
            other.setAttribute('aria-expanded', 'false');
            var otherBody = document.getElementById(other.getAttribute('aria-controls'));
            if (otherBody) otherBody.hidden = true;
          });
        }

        btn.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
        body.hidden = isExpanded;
      });
    });
  }

  function initNav(root) {
    var nav = root.querySelector('.menu-tabs');
    if (!nav || nav.dataset.hbBound) return;
    nav.dataset.hbBound = '1';

    var tabLinks = Array.prototype.slice.call(root.querySelectorAll('.menu-tabs__link'));
    var indicator = root.querySelector('.menu-tabs__indicator');
    var tabTrack = root.querySelector('.menu-tabs__track');
    var tabList = root.querySelector('.menu-tabs__list');
    var tabNav = root.querySelector('.menu-tabs__nav');
    var targets = tabLinks
      .map(function (link) {
        return document.querySelector(link.getAttribute('href'));
      })
      .filter(Boolean);

    if (!tabLinks.length || !targets.length) return;

    var INDICATOR_MS = 350;
    var scrollSyncPaused = false;
    var lastActiveIndex = 0;
    var scrollSyncFrame = 0;

    function headerH() {
      var header = document.querySelector('.site-header');
      return header ? header.offsetHeight : 0;
    }

    function updateIndicator(index, animate) {
      var li = tabLinks[index] && tabLinks[index].closest('li');
      if (!li || !tabTrack || !indicator) return;

      indicator.style.transition = animate === false ? 'none' : '';
      var trackRect = tabTrack.getBoundingClientRect();
      var liRect = li.getBoundingClientRect();
      indicator.style.width = liRect.width + 'px';
      indicator.style.transform = 'translateX(' + (liRect.left - trackRect.left) + 'px)';

      if (animate === false) {
        void indicator.offsetWidth;
        indicator.style.transition = '';
      }
    }

    function setActiveStates(index) {
      tabLinks.forEach(function (link, i) {
        link.classList.toggle('is-active', i === index);
      });
    }

    function scrollTabIntoView(index, smooth) {
      if (!tabList || !window.matchMedia('(max-width: 767px)').matches) return;
      var li = tabLinks[index] && tabLinks[index].closest('li');
      if (!li) return;
      li.scrollIntoView({
        behavior: smooth ? 'smooth' : 'auto',
        inline: 'center',
        block: 'nearest',
      });
    }

    function setActive(index, options) {
      options = options || {};
      setActiveStates(index);
      updateIndicator(index, options.animate !== false);
      if (options.syncTab) scrollTabIntoView(index, options.animate !== false);
    }

    function scrollToTarget(target) {
      var scroller = document.scrollingElement || document.documentElement;
      var top = target.getBoundingClientRect().top + window.scrollY - headerH() - 24;

      try {
        scroller.scrollTo({ top: top, behavior: 'smooth' });
      } catch (_) {
        scroller.scrollTop = top;
      }

      window.setTimeout(function () {
        if (Math.abs(scroller.scrollTop - top) > 8) {
          scroller.scrollTop = top;
        }
      }, 80);
    }

    function waitForIndicator() {
      return new Promise(function (resolve) {
        if (!indicator) {
          resolve();
          return;
        }
        var settled = false;
        var done = function () {
          if (settled) return;
          settled = true;
          indicator.removeEventListener('transitionend', onEnd);
          resolve();
        };
        var onEnd = function (event) {
          if (
            event.target === indicator &&
            (event.propertyName === 'transform' || event.propertyName === 'width')
          ) {
            done();
          }
        };
        indicator.addEventListener('transitionend', onEnd);
        window.setTimeout(done, INDICATOR_MS + 50);
      });
    }

    function navigateTo(index) {
      if (index < 0 || !targets[index]) return;

      scrollSyncPaused = true;
      lastActiveIndex = index;
      setActiveStates(index);
      updateIndicator(index, true);
      scrollTabIntoView(index, true);

      waitForIndicator().then(function () {
        scrollToTarget(targets[index]);
        window.setTimeout(function () {
          scrollSyncPaused = false;
        }, 450);
      });
    }

    function syncFromScroll() {
      if (scrollSyncPaused) return;
      if (scrollSyncFrame) return;
      scrollSyncFrame = window.requestAnimationFrame(function () {
        scrollSyncFrame = 0;
        var offset = headerH() + 80;
        var active = 0;
        targets.forEach(function (target, i) {
          if (target.getBoundingClientRect().top - offset <= 0) active = i;
        });
        if (active === lastActiveIndex) return;
        lastActiveIndex = active;
        setActiveStates(active);
        updateIndicator(active, false);
      });
    }

    tabLinks.forEach(function (link, i) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        navigateTo(i);
      });
    });

    setActive(0, { animate: false });
    window.addEventListener('scroll', syncFromScroll, { passive: true });
    window.addEventListener('resize', function () {
      var active = tabLinks.findIndex(function (l) {
        return l.classList.contains('is-active');
      });
      updateIndicator(active >= 0 ? active : 0, false);
    });
    if (tabNav) {
      tabNav.addEventListener(
        'scroll',
        function () {
          var active = tabLinks.findIndex(function (l) {
            return l.classList.contains('is-active');
          });
          updateIndicator(active >= 0 ? active : 0, false);
        },
        { passive: true }
      );
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        var active = tabLinks.findIndex(function (l) {
          return l.classList.contains('is-active');
        });
        updateIndicator(active >= 0 ? active : 0, false);
      });
    }
  }

  function initSection(root) {
    if (!root || root.dataset.hbFaqInit) return;
    root.dataset.hbFaqInit = '1';
    initAccordion(root);
    initNav(root);
  }

  function initAll() {
    document.querySelectorAll('.faq').forEach(initSection);
  }

  document.addEventListener('DOMContentLoaded', initAll);
  document.addEventListener('shopify:section:load', function (event) {
    var section = event.target.querySelector('.faq');
    if (section) {
      delete section.dataset.hbFaqInit;
      section.querySelectorAll('[data-hb-bound]').forEach(function (el) {
        delete el.dataset.hbBound;
      });
      var nav = section.querySelector('.menu-tabs');
      if (nav) delete nav.dataset.hbBound;
      initSection(section);
    }
  });
})();

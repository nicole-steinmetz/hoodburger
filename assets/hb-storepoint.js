/**
 * hb-storepoint.js — Storepoint widget for Locations + Order Now pages.
 * Listens for shopify:section:load (theme editor compat).
 */

(function () {
  'use strict';

  var EMBED_SRC = 'https://widget.storepoint.co/embed.js';
  var SCRIPT_ATTR = 'data-hb-storepoint';

  function ensureStorepointStub() {
    window.Storepoint = window.Storepoint || {
      _q: [],
      on: function (e, c) {
        this._q.push([e, c]);
      }
    };
  }

  function loadEmbedScript(onReady) {
    if (typeof window.StorepointWidget === 'function') {
      onReady();
      return;
    }

    var existing = document.querySelector('script[' + SCRIPT_ATTR + ']');
    if (existing) {
      existing.addEventListener('load', onReady, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    script.src = EMBED_SRC;
    script.setAttribute(SCRIPT_ATTR, '1');
    script.addEventListener('load', onReady, { once: true });
    document.head.appendChild(script);
  }

  function mountStorepoint(container) {
    var mapId = container.dataset.storepointMapId;
    if (!mapId) return;

    var selector = '#' + container.id;
    container.innerHTML = '';
    new window.StorepointWidget(mapId, selector, {});
  }

  function initSection(section) {
    var container = section.querySelector('[data-storepoint-widget]');
    if (!container) return;

    ensureStorepointStub();

    loadEmbedScript(function () {
      if (typeof window.StorepointWidget !== 'function') return;
      mountStorepoint(container);
    });
  }

  function initStorepointPages(root) {
    var sections = [];

    if (root && root.classList && root.classList.contains('hb-storepoint-page-section')) {
      sections = [root];
    } else {
      var scope = root && root.querySelectorAll ? root : document;
      sections = Array.prototype.slice.call(scope.querySelectorAll('.hb-storepoint-page-section'));
    }

    sections.forEach(initSection);
  }

  document.addEventListener('shopify:section:load', function (event) {
    if (event.target.classList.contains('hb-storepoint-page-section')) {
      initStorepointPages(event.target);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initStorepointPages(document);
    });
  } else {
    initStorepointPages(document);
  }
})();

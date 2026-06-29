/**
 * hb-careers.js
 *
 * Loads the JotForm embed handler, which auto-resizes the careers form iframe
 * to match the form's content height (no internal scrollbars, no fixed height).
 *
 * The iframe itself is hard-coded server-side in hb-careers.liquid. This script
 * only initialises the resize handler — it never injects form content, and does
 * nothing if no form iframe is present (e.g. before a form ID is set).
 *
 * All custom JS listens for shopify:section:load (theme editor compat).
 */

(function () {
  'use strict';

  var EMBED_SRC = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
  var FORM_ORIGIN = 'https://form.jotform.com/';
  var SCRIPT_ATTR = 'data-hb-jotform';

  function loadHandlerScript(onReady) {
    if (typeof window.jotformEmbedHandler === 'function') {
      onReady();
      return;
    }

    var existing = document.querySelector('script[' + SCRIPT_ATTR + ']');
    if (existing) {
      existing.addEventListener('load', onReady, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.async = true;
    script.src = EMBED_SRC;
    script.setAttribute(SCRIPT_ATTR, '1');
    script.addEventListener('load', onReady, { once: true });
    document.head.appendChild(script);
  }

  function initSection(section) {
    var iframe = section.querySelector('iframe[data-jotform-id]');
    if (!iframe || iframe.dataset.hbBound === '1') return;

    loadHandlerScript(function () {
      if (typeof window.jotformEmbedHandler !== 'function') return;
      iframe.dataset.hbBound = '1';
      window.jotformEmbedHandler("iframe[id='" + iframe.id + "']", FORM_ORIGIN);
    });
  }

  function initCareers(root) {
    var sections;

    if (root && root.classList && root.classList.contains('hb-careers-section')) {
      sections = [root];
    } else {
      var scope = root && root.querySelectorAll ? root : document;
      sections = Array.prototype.slice.call(scope.querySelectorAll('.hb-careers-section'));
    }

    sections.forEach(initSection);
  }

  document.addEventListener('shopify:section:load', function (event) {
    if (event.target.classList.contains('hb-careers-section')) {
      initCareers(event.target);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initCareers(document);
    });
  } else {
    initCareers(document);
  }
})();

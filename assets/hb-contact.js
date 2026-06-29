/**
 * hb-contact.js — JotForm iframe auto-resize for the Contact page.
 * Mirrors hb-careers.js / hb-catering.js.
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

  function initContact(root) {
    var sections;

    if (root && root.classList && root.classList.contains('hb-contact-section')) {
      sections = [root];
    } else {
      var scope = root && root.querySelectorAll ? root : document;
      sections = Array.prototype.slice.call(scope.querySelectorAll('.hb-contact-section'));
    }

    sections.forEach(initSection);
  }

  document.addEventListener('shopify:section:load', function (event) {
    if (event.target.classList.contains('hb-contact-section')) {
      initContact(event.target);
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initContact(document);
    });
  } else {
    initContact(document);
  }
})();

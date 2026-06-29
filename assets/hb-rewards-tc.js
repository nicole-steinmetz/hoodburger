/**
 * hb-rewards-tc.js — T&C accordion for the Rewards page.
 *
 * Rules (Hoodburger theme):
 *  - JS for visibility toggles only — no content injected.
 *  - Listens for shopify:section:load for theme editor compat.
 *  - Deferred via <script defer>.
 */

(function () {
  'use strict';

  function initAccordion() {
    document.querySelectorAll('.tc-item__toggle').forEach(function (btn) {
      if (btn.dataset.hbBound) return; // prevent double-binding on section reload
      btn.dataset.hbBound = '1';

      btn.addEventListener('click', function () {
        var isExpanded = btn.getAttribute('aria-expanded') === 'true';
        var list = btn.closest('.tc-list');
        var bodyId = btn.getAttribute('aria-controls');
        var body = document.getElementById(bodyId);
        if (!body) return;

        if (list) {
          list.querySelectorAll('.tc-item__toggle').forEach(function (other) {
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

  document.addEventListener('DOMContentLoaded', initAccordion);
  document.addEventListener('shopify:section:load', initAccordion);
})();

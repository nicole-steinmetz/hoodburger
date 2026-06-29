(function () {
  const navState = {
    scrollY: 0,
    menuOnHistoryStack: false,
    drawer: null,
    toggle: null,
    openLabel: null,
  };

  function setOpen(open) {
    const { drawer, toggle, openLabel } = navState;
    if (!drawer || !toggle) return;

    toggle.checked = open;
    drawer.setAttribute('aria-hidden', open ? 'false' : 'true');
    openLabel?.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.classList.toggle('nav-drawer-open', open);
  }

  function restoreView() {
    window.scrollTo(0, navState.scrollY);
  }

  function clearMenuHistory() {
    if (!navState.menuOnHistoryStack) return;
    navState.menuOnHistoryStack = false;
    history.replaceState(null, '', window.location.href);
  }

  function closeDrawer({ useHistoryBack = false } = {}) {
    if (!navState.toggle?.checked && !navState.menuOnHistoryStack) return;

    if (useHistoryBack && navState.menuOnHistoryStack) {
      history.back();
      return;
    }

    clearMenuHistory();
    setOpen(false);
    restoreView();
  }

  function handlePopstate() {
    if (!navState.menuOnHistoryStack && !navState.toggle?.checked) return;

    navState.menuOnHistoryStack = false;
    setOpen(false);
    restoreView();
    navState.openLabel?.focus();
  }

  function initMobileNav(scope) {
    const root = scope && scope.querySelector ? scope : document;
    const drawer = root.querySelector?.('.nav__drawer') || document.querySelector('.nav__drawer');
    const toggle = root.querySelector?.('.nav__toggle-input') || document.querySelector('.nav__toggle-input');
    if (!drawer || !toggle || drawer.dataset.navInit === 'true') return;
    drawer.dataset.navInit = 'true';

    navState.drawer = drawer;
    navState.toggle = toggle;
    navState.openLabel = document.querySelector('.nav__toggle');

    const closeBtn = drawer.querySelector('.nav__close');

    toggle.addEventListener('change', () => {
      if (!toggle.checked) return;

      navState.scrollY = window.scrollY;
      setOpen(true);
      history.pushState({ navDrawer: true }, '', window.location.href);
      navState.menuOnHistoryStack = true;
    });

    closeBtn?.addEventListener('click', (event) => {
      event.preventDefault();
      closeDrawer({ useHistoryBack: true });
    });

    drawer.addEventListener('click', (event) => {
      const link = event.target.closest('.nav-drawer__link, .nav__drawer-logo');
      if (!link) return;
      clearMenuHistory();
      setOpen(false);
    });

    setOpen(false);
  }

  if (!window.__hbNavPopstateBound) {
    window.__hbNavPopstateBound = true;
    window.addEventListener('popstate', handlePopstate);
  }

  if (!window.__hbNavKeydownBound) {
    window.__hbNavKeydownBound = true;
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape' || !navState.toggle?.checked) return;
      event.preventDefault();
      closeDrawer({ useHistoryBack: true });
      navState.openLabel?.focus();
    });
  }

  initMobileNav();
  document.addEventListener('shopify:section:load', (event) => {
    if (event.target.querySelector?.('.nav__drawer')) {
      initMobileNav(event.target);
    }
  });
})();

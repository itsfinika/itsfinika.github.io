(() => {
  'use strict';
  const storageKey = 'polina-portfolio-theme';
  const root = document.documentElement;
  const valid = theme => theme === 'light' || theme === 'dark';

  function apply(theme) {
    root.dataset.theme = valid(theme) ? theme : 'light';
    const dark = root.dataset.theme === 'dark';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#14141c' : '#fafafd';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      const label = dark ? 'Switch to light theme' : 'Switch to dark theme';
      button.setAttribute('aria-label', label);
      button.title = label;
      const symbol = button.querySelector('[data-theme-symbol] use');
      const sprite = symbol.getAttribute('href').split('#')[0];
      symbol.setAttribute('href', `${sprite}#${dark ? 'sun' : 'moon'}`);
      button.querySelector('[data-theme-name]').textContent = dark ? 'Light' : 'Dark';
      button.hidden = false;
    });
  }

  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  let preference = null;
  const preferredTheme = () => preference || (systemTheme.matches ? 'dark' : 'light');
  try {
    const saved = localStorage.getItem(storageKey);
    if (valid(saved)) preference = saved;
  } catch { /* The theme still works when browser storage is unavailable. */ }
  apply(preferredTheme());
  systemTheme.addEventListener('change', () => {
    if (!preference) apply(preferredTheme());
  });

  const pageMotionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pageScroll = null;

  function stopPageScroll(finish = false) {
    if (!pageScroll) return;
    const motion = pageScroll;
    pageScroll = null;
    cancelAnimationFrame(motion.frame);
    if (finish) {
      window.scrollTo(0, motion.end);
      if (motion.focus) motion.target.focus({ preventScroll: true });
    }
    delete root.dataset.pageScrolling;
    window.dispatchEvent(new Event('portfolio-scroll-state'));
  }

  function scrollToSection(target, { focus = true, instant = false } = {}) {
    stopPageScroll();
    if (focus && !target.hasAttribute('tabindex') && !target.matches('a,button,input,select,textarea,summary')) target.setAttribute('tabindex', '-1');
    const start = window.scrollY;
    const padding = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
    const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    const end = Math.max(0, Math.min(root.scrollHeight - innerHeight, start + target.getBoundingClientRect().top - padding - margin));
    const distance = end - start;
    const duration = Math.min(1000, Math.max(440, 400 + Math.sqrt(Math.abs(distance)) * 8));
    const motion = { target, start, end, focus, frame: null, started: null };
    pageScroll = motion;
    root.dataset.pageScrolling = '';
    window.dispatchEvent(new Event('portfolio-scroll-state'));
    if (instant || pageMotionPreference.matches || Math.abs(distance) < 1) {
      stopPageScroll(true);
      return;
    }
    function step(now) {
      if (pageScroll !== motion) return;
      motion.started ??= now;
      const progress = Math.min((now - motion.started) / duration, 1);
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
      window.scrollTo(0, start + distance * eased);
      if (progress < 1) motion.frame = requestAnimationFrame(step);
      else stopPageScroll(true);
    }
    motion.frame = requestAnimationFrame(step);
  }

  function setupSmoothNavigation() {
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self') || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const url = new URL(link.href, location.href);
      const normalPath = path => path.replace(/\/index\.html$/, '/');
      if (!url.hash || url.origin !== location.origin || normalPath(url.pathname) !== normalPath(location.pathname) || url.search !== location.search) return;
      let target;
      try { target = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
      if (!target) return;
      event.preventDefault();
      if (location.hash !== url.hash) history.pushState(null, '', url.hash);
      scrollToSection(target);
    });
    // Keep normal wheel, touch and keyboard scrolling in the browser's control.
    for (const event of ['wheel', 'touchstart', 'pointerdown']) window.addEventListener(event, () => stopPageScroll(), { passive: true });
    window.addEventListener('keydown', event => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', 'Escape', ' '].includes(event.key)) stopPageScroll();
    });
    window.addEventListener('resize', () => stopPageScroll());
    window.addEventListener('pagehide', () => stopPageScroll());
    window.addEventListener('popstate', () => stopPageScroll());
    pageMotionPreference.addEventListener('change', () => { if (pageMotionPreference.matches) stopPageScroll(true); });
  }

  function setupSectionNavigation() {
    const nav = document.querySelector('.section-jump');
    if (!nav) return;
    const header = document.querySelector('.site-header');
    const menu = nav.querySelector('details');
    const summary = nav.querySelector('summary');
    const links = [...nav.querySelectorAll('.jump-links a')];
    const linkList = nav.querySelector('.jump-links');
    const entries = links.map(link => ({ link, section: document.getElementById(link.hash.slice(1)) })).filter(entry => entry.section);
    const narrow = window.matchMedia('(max-width: 1000px)');
    const bar = header.querySelector('.header');
    let compact = null;
    let layoutKey = '';
    let scheduled = false;

    entries.forEach(({ section }) => section.setAttribute('tabindex', '-1'));

    function positionIndicator(link) {
      if (!link || (compact && !menu.open)) {
        delete linkList.dataset.indicator;
        return;
      }
      const item = link.getBoundingClientRect();
      const list = linkList.getBoundingClientRect();
      for (const [property, value] of Object.entries({ x: item.left - list.left, y: item.top - list.top, width: item.width, height: item.height })) {
        linkList.style.setProperty(`--jump-${property}`, `${value}px`);
      }
      linkList.dataset.indicator = '';
    }

    function updateCurrent() {
      scheduled = false;
      const offset = parseFloat(getComputedStyle(root).scrollPaddingTop) + 8;
      let current = null;
      entries.forEach(entry => {
        if (entry.section.getBoundingClientRect().top <= offset) current = entry;
      });
      if (entries.length && window.scrollY + window.innerHeight >= root.scrollHeight - 2) current = entries[entries.length - 1];
      current = entries.find(entry => entry.section === pageScroll?.target) || current;
      entries.forEach(entry => {
        if (entry === current) entry.link.setAttribute('aria-current', 'location');
        else entry.link.removeAttribute('aria-current');
      });
      positionIndicator(current?.link);
    }

    function scheduleUpdate() {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(updateCurrent);
      }
    }

    function updateLayout() {
      const key = `${bar.clientWidth}:${getComputedStyle(root).fontSize}:${header.querySelector('[data-theme-name]').textContent}`;
      if (key === layoutKey) return;
      layoutKey = key;
      const wasOpen = menu.open;
      // Measure the actual full navigation before choosing the compact layout.
      // This also covers enlarged text, rather than relying only on viewport width.
      header.removeAttribute('data-compact');
      delete linkList.dataset.indicator;
      menu.open = true;
      const nextCompact = narrow.matches || nav.querySelector('.jump-links').scrollWidth > nav.clientWidth + 1;
      header.toggleAttribute('data-compact', nextCompact);
      if (nextCompact && compact !== nextCompact && menu.contains(document.activeElement) && !summary.contains(document.activeElement)) summary.focus({ preventScroll: true });
      menu.open = nextCompact ? (compact === nextCompact && wasOpen) : true;
      compact = nextCompact;
      updateHeaderOffset();
      scheduleUpdate();
    }

    function updateHeaderOffset() {
      root.style.setProperty('--site-header-offset', `${Math.ceil(header.getBoundingClientRect().height) + 24}px`);
      scheduleUpdate();
    }

    nav.addEventListener('click', event => {
      if (compact && event.target.closest('a')) menu.open = false;
    });
    document.addEventListener('keydown', event => {
      if (compact && menu.open && event.key === 'Escape') {
        const focusWasInside = nav.contains(document.activeElement);
        menu.open = false;
        if (focusWasInside) summary.focus({ preventScroll: true });
        event.preventDefault();
      }
    });
    document.addEventListener('focusin', event => {
      if (compact && menu.open && !nav.contains(event.target)) menu.open = false;
    });
    document.addEventListener('click', event => {
      if (compact && menu.open && !nav.contains(event.target)) menu.open = false;
    });
    narrow.addEventListener('change', updateLayout);
    menu.addEventListener('toggle', scheduleUpdate);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', () => { updateLayout(); updateHeaderOffset(); });
    window.addEventListener('hashchange', scheduleUpdate);
    window.addEventListener('portfolio-scroll-state', scheduleUpdate);
    window.addEventListener('load', scheduleUpdate);
    header.dataset.ready = '';
    updateLayout();
    updateHeaderOffset();
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(() => { updateLayout(); updateHeaderOffset(); });
      observer.observe(header);
      observer.observe(header.querySelector('.brand'));
      observer.observe(header.querySelector('.header-actions'));
    }
  }

  function setupEvidenceReading() {
    const content = document.querySelector('.document-content');
    if (!content) return;
    const contents = document.querySelector('.document-contents');
    const navigation = contents.closest('.document-nav');
    const summary = contents.querySelector('summary');
    const currentLabel = contents.querySelector('.contents-current');
    const compact = window.matchMedia('(max-width: 800px)');
    const entries = [...contents.querySelectorAll('nav a')].map(link => ({ link, target: document.getElementById(link.hash.slice(1)) }));
    const details = [...content.querySelectorAll('.document-details')];
    let readingScheduled = false;
    details.forEach(detail => { detail.open = false; });
    content.querySelectorAll('[id]').forEach(target => {
      if (!target.matches('a[href],button,input,select,textarea,summary')) target.setAttribute('tabindex', '-1');
    });

    function updateLayout() {
      if (compact.matches && contents.contains(document.activeElement)) summary.focus({ preventScroll: true });
      contents.open = !compact.matches;
      updateReadingOffset();
      updateTables();
    }
    function updateReadingOffset() {
      root.style.setProperty('--reading-nav-offset', compact.matches ? `${Math.ceil(summary.getBoundingClientRect().height) + 16}px` : '0px');
      scheduleReadingUpdate();
    }
    function updateTables() {
      content.querySelectorAll('.table-scroll').forEach(table => {
        if (table.scrollWidth > table.clientWidth + 1) table.setAttribute('tabindex', '0');
        else table.removeAttribute('tabindex');
      });
    }
    function updateCurrent() {
      readingScheduled = false;
      const offset = parseFloat(getComputedStyle(root).scrollPaddingTop) + 12;
      let current = null;
      let closestTop = -Infinity;
      entries.forEach(entry => {
        const top = entry.target.getBoundingClientRect().top;
        if (entry.target.getClientRects().length && top <= offset && top > closestTop) {
          current = entry;
          closestTop = top;
        }
      });
      entries.forEach(entry => {
        if (entry === current) entry.link.setAttribute('aria-current', 'location');
        else entry.link.removeAttribute('aria-current');
      });
      const label = current?.link.textContent.trim() || '';
      currentLabel.textContent = label.match(/^TC-SP-\d+/)?.[0] || ({'Course regression inventory': 'Regression', 'Smoke test pack': 'Smoke', 'Plan setup & scope': 'Plan setup'}[label] || label);
    }
    function scheduleReadingUpdate() {
      if (!readingScheduled) {
        readingScheduled = true;
        requestAnimationFrame(updateCurrent);
      }
    }
    function reveal(target) {
      let parent = target;
      while (parent && parent !== content) {
        if (parent.matches('details')) parent.open = true;
        parent = parent.parentElement;
      }
      updateTables();
    }
    function followHash(focus) {
      let id;
      try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
      const target = id && document.getElementById(id);
      if (!target || !content.contains(target)) return;
      reveal(target);
      requestAnimationFrame(() => {
        scrollToSection(target, { focus, instant: !focus });
      });
    }
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      let target;
      try { target = document.getElementById(decodeURIComponent(link.hash.slice(1))); } catch { return; }
      if (!target || !content.contains(target)) return;
      event.preventDefault();
      if (compact.matches) contents.open = false;
      if (location.hash !== link.hash) history.pushState(null, '', link.hash);
      followHash(true);
    });
    contents.addEventListener('toggle', () => {
      if (compact.matches && contents.open) {
        const header = document.querySelector('.site-header[data-compact]');
        if (header) header.querySelector('details').open = false;
      }
    });
    document.querySelector('.section-jump-menu').addEventListener('toggle', event => {
      if (compact.matches && event.target.open && event.target.closest('[data-compact]')) contents.open = false;
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && compact.matches && contents.open) {
        const focusedInside = contents.contains(document.activeElement);
        contents.open = false;
        if (focusedInside) summary.focus({ preventScroll: true });
        event.preventDefault();
      }
    });
    for (const type of ['click', 'focusin']) document.addEventListener(type, event => {
      if (compact.matches && contents.open && !contents.contains(event.target)) contents.open = false;
    });
    compact.addEventListener('change', updateLayout);
    // Height-only resizes must preserve the reader's open/closed contents menu.
    window.addEventListener('resize', () => { updateReadingOffset(); updateTables(); });
    window.addEventListener('scroll', scheduleReadingUpdate, { passive: true });
    window.addEventListener('hashchange', () => followHash(true));
    navigation.dataset.ready = '';
    updateLayout();
    if ('ResizeObserver' in window) {
      new ResizeObserver(updateReadingOffset).observe(summary);
      new ResizeObserver(() => { updateTables(); scheduleReadingUpdate(); }).observe(content);
    }
    followHash(false);
  }

  function setupDocumentPrint() {
    const details = [...document.querySelectorAll('.document-content .document-details')];
    if (!details.length) return;
    let savedState = null;
    window.addEventListener('beforeprint', () => {
      if (savedState) return;
      savedState = details.map(detail => detail.open);
      details.forEach(detail => { detail.open = true; });
    });
    window.addEventListener('afterprint', () => {
      if (!savedState) return;
      details.forEach((detail, i) => { detail.open = savedState[i]; });
      savedState = null;
    });
  }

  function setupProjectRows() {
    const grid = document.querySelector('.project-grid');
    if (!grid) return;
    const wide = window.matchMedia('(min-width: 1101px)');
    const rows = [
      ['meta', '.project-meta'], ['title', 'h3'],
      ['description', '.project-body > h3 + p'], ['tags', '.tags']
    ].map(([name, selector]) => ({ name, elements: [...grid.querySelectorAll(selector)] }));
    let layoutKey = '';
    function alignRows() {
      const key = `${grid.clientWidth}:${getComputedStyle(root).fontSize}:${wide.matches}`;
      if (key === layoutKey) return;
      layoutKey = key;
      rows.forEach(({ name }) => grid.style.removeProperty(`--work-${name}-height`));
      if (!wide.matches) return;
      // Measure natural text wrapping once, then share each row's tallest item.
      const heights = rows.map(({ elements }) => Math.ceil(Math.max(...elements.map(element => element.getBoundingClientRect().height))));
      rows.forEach(({ name }, i) => grid.style.setProperty(`--work-${name}-height`, `${heights[i]}px`));
    }
    alignRows();
    if ('ResizeObserver' in window) new ResizeObserver(alignRows).observe(grid);
    window.addEventListener('resize', alignRows);
    wide.addEventListener('change', alignRows);
  }

  function setupNoteCarousel() {
    const carousel = document.querySelector('.note-carousel');
    if (!carousel) return;
    const slides = [...carousel.querySelectorAll('.note-slide')];
    const controls = carousel.querySelector('.note-actions');
    const announcement = carousel.querySelector('.note-announcement');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let index = 0;
    let hovered = carousel.matches(':hover');
    let keyboardFocus = false;
    let inView = true;
    let timer;
    let transition;
    let pendingSlide;

    slides.forEach((slide, i) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'slide');
      slide.setAttribute('aria-label', `${i + 1} of ${slides.length}: ${slide.dataset.exampleName}`);
    });

    function syncPlayback() {
      clearTimeout(timer);
      if (!hovered && !keyboardFocus && inView && !document.hidden && !reducedMotion.matches) {
        timer = setTimeout(() => show(index + 1, false), 7000);
      }
    }

    function finishTransition() {
      if (!transition) return;
      const finished = transition;
      transition = null;
      clearTimeout(finished.timeout);
      finished.animations.forEach(animation => animation.cancel());
      delete finished.outgoing.dataset.leaving;
      const pending = pendingSlide;
      pendingSlide = null;
      if (pending) show(pending.index, pending.announce, pending.direction);
    }

    function show(next, announce, direction = 1) {
      const nextIndex = (next + slides.length) % slides.length;
      // Finish the visible movement before applying the latest requested card.
      // Repeated clicks accumulate without cancelling a half-visible transition.
      if (transition) {
        pendingSlide = { index: nextIndex, announce, direction };
        return;
      }
      const outgoing = slides[index];
      const changed = nextIndex !== index;
      index = nextIndex;
      slides.forEach((slide, i) => {
        slide.hidden = i !== index;
        slide.inert = i !== index;
        slide.setAttribute('aria-hidden', String(i !== index));
      });
      if (changed && !reducedMotion.matches && typeof slides[index].animate === 'function') {
        // The outgoing card stays visually present but hidden from keyboard and
        // assistive technology. Both cards keep their existing shared grid size.
        outgoing.dataset.leaving = '';
        const animations = [];
        try {
        const exit = outgoing.animate([
          { transform: 'translateX(0) scale(1)' },
          { transform: `translateX(${-direction * 100}%) scale(.98)` }
        ], { duration: 680, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'forwards' });
        animations.push(exit);
        const enter = slides[index].animate([
          { transform: `translateX(${direction * 100}%) scale(.985)` },
          { transform: 'translateX(0) scale(1)' }
        ], { duration: 680, easing: 'cubic-bezier(.22,.61,.36,1)', fill: 'both' });
        animations.push(enter);
        const running = { outgoing, animations, timeout: null };
        transition = running;
        const finish = () => { if (transition === running) finishTransition(); };
        enter.onfinish = finish;
        enter.oncancel = finish;
        // Never lock the arrows if an engine omits an animation completion event.
        running.timeout = setTimeout(finish, 900);
        } catch {
          animations.forEach(animation => animation.cancel());
          delete outgoing.dataset.leaving;
        }
      }
      if (announce) announcement.textContent = `Example ${index + 1} of ${slides.length}. ${slides[index].querySelector('h2').textContent}`;
      syncPlayback();
    }

    carousel.setAttribute('role', 'region');
    carousel.setAttribute('aria-roledescription', 'carousel');
    carousel.querySelector('.note-previous').addEventListener('click', () => show((pendingSlide?.index ?? index) - 1, true, -1));
    carousel.querySelector('.note-next').addEventListener('click', () => show((pendingSlide?.index ?? index) + 1, true, 1));
    carousel.addEventListener('pointerenter', event => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') { hovered = true; syncPlayback(); }
    });
    carousel.addEventListener('pointerleave', () => { hovered = false; syncPlayback(); });
    // Keyboard readers can hold a card while following its controls or link.
    // Pointer focus alone must not leave autoplay stopped after the mouse exits.
    carousel.addEventListener('pointerdown', () => { keyboardFocus = false; syncPlayback(); });
    carousel.addEventListener('focusin', event => {
      keyboardFocus = event.target.matches(':focus-visible');
      syncPlayback();
    });
    carousel.addEventListener('keydown', () => { keyboardFocus = true; syncPlayback(); });
    carousel.addEventListener('focusout', event => {
      if (!carousel.contains(event.relatedTarget)) { keyboardFocus = false; syncPlayback(); }
    });
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) finishTransition();
      syncPlayback();
    });
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('pagehide', () => clearTimeout(timer));
    window.addEventListener('pageshow', syncPlayback);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(entries => {
        inView = entries[0].isIntersecting;
        syncPlayback();
      }, { threshold: 0 }).observe(carousel);
    }
    controls.hidden = false;
    carousel.dataset.ready = '';
    show(0, false);
  }

  function setupInventoryFilters() {
    const form = document.querySelector('.inventory-tools');
    if (!form) return;
    const search = form.querySelector('input');
    const area = form.querySelector('#inventory-area');
    const priority = form.querySelector('#inventory-priority');
    const results = document.getElementById('regression-results');
    const table = results.querySelector('.table-scroll');
    const empty = results.querySelector('.inventory-empty');
    const rows = [...table.querySelectorAll('tbody tr')].map(row => {
      const values = [...row.querySelectorAll('.cell-value')].map(cell => cell.textContent);
      return { row, area: values[1], priority: values[3], search: `${values[0]} ${values[2]}`.toLocaleLowerCase() };
    });
    function update() {
      const terms = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
      let count = 0;
      rows.forEach(entry => {
        const match = (!area.value || entry.area === area.value) && (!priority.value || entry.priority === priority.value) && terms.every(term => entry.search.includes(term));
        entry.row.hidden = !match;
        if (match) count++;
      });
      form.querySelector('[data-inventory-count]').textContent = `${count} of ${rows.length} checks`;
      form.querySelector('button[type="reset"]').disabled = !search.value && !area.value && !priority.value;
      table.hidden = count === 0;
      empty.hidden = count !== 0;
    }
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    // History can restore form controls after pageshow/popstate, without input
    // events. Refilter after that restoration, including back/forward cache.
    for (const type of ['pageshow', 'popstate']) {
      window.addEventListener(type, () => setTimeout(update, 0));
    }
    form.addEventListener('reset', event => {
      event.preventDefault();
      search.value = area.value = priority.value = '';
      update();
    });
    form.hidden = false;
    update();
  }

  document.addEventListener('DOMContentLoaded', () => {
    apply(root.dataset.theme);
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
        preference = next;
        apply(next);
        try { localStorage.setItem(storageKey, next); } catch { /* Optional preference only. */ }
      });
    });
    setupSectionNavigation();
    setupEvidenceReading();
    setupSmoothNavigation();
    setupInventoryFilters();
    setupNoteCarousel();
    setupProjectRows();
    setupDocumentPrint();
  });

  window.addEventListener('storage', event => {
    if (event.key === storageKey || event.key === null) {
      preference = valid(event.newValue) ? event.newValue : null;
      apply(preferredTheme());
    }
  });
})();

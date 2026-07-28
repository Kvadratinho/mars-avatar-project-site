/* ============================================================================
   Mars Avatar Project — script.js
   ----------------------------------------------------------------------------
   No dependencies, no build step. Every behaviour below is progressive: the
   page is fully readable and navigable with JavaScript disabled.

     01  Helpers
     02  Navigation drawer (small screens)
     03  Reading progress
     04  Document-index scroll spy
     05  Back to top
     06  Copy to clipboard
   ========================================================================== */

(function () {
  'use strict';

  /* ── 01 · HELPERS ─────────────────────────────────────────────────────── */

  var $  = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Run a callback at most once per animation frame. */
  function onFrame(fn) {
    var queued = false;
    return function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        fn();
      });
    };
  }

  /* Polite live region, created once, for non-visual confirmation messages. */
  var announcer = null;
  function announce(message) {
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.setAttribute('role', 'status');
      announcer.setAttribute('aria-live', 'polite');
      announcer.className = 'visually-hidden';
      document.body.appendChild(announcer);
    }
    announcer.textContent = '';
    window.setTimeout(function () { announcer.textContent = message; }, 60);
  }


  /* ── 02 · NAVIGATION DRAWER ───────────────────────────────────────────── */

  var toggle = $('[data-navtoggle]');
  var drawer = $('[data-sitenav]');

  if (toggle && drawer) {
    var setDrawer = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      drawer.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', function () {
      setDrawer(toggle.getAttribute('aria-expanded') !== 'true');
    });

    /* Close after choosing a section, so the target is not hidden behind it. */
    drawer.addEventListener('click', function (event) {
      if (event.target.closest('a')) setDrawer(false);
    });

    /* Escape closes the drawer and returns focus to the control that opened it. */
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setDrawer(false);
        toggle.focus();
      }
    });

    /* A click outside the header dismisses the drawer. */
    document.addEventListener('click', function (event) {
      if (toggle.getAttribute('aria-expanded') !== 'true') return;
      if (event.target.closest('.masthead')) return;
      setDrawer(false);
    });

    /* Widening past the desktop breakpoint retires the drawer entirely. */
    var wide = window.matchMedia('(min-width: 1080px)');
    var syncBreakpoint = function () { if (wide.matches) setDrawer(false); };
    if (wide.addEventListener) wide.addEventListener('change', syncBreakpoint);
    else if (wide.addListener) wide.addListener(syncBreakpoint);
  }


  /* ── 03 · READING PROGRESS ────────────────────────────────────────────── */

  var progressBar = $('[data-progress]');

  function updateProgress() {
    if (!progressBar) return;
    var doc = document.documentElement;
    var scrollable = doc.scrollHeight - window.innerHeight;
    var ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    progressBar.style.width = Math.min(Math.max(ratio, 0), 1) * 100 + '%';
  }


  /* ── 04 · DOCUMENT-INDEX SCROLL SPY ───────────────────────────────────── */

  var spy = $('[data-spy]');
  var spyLinks = spy ? $$('a[href^="#"]', spy) : [];

  var targets = spyLinks
    .map(function (link) {
      return { link: link, section: document.getElementById(link.hash.slice(1)) };
    })
    .filter(function (entry) { return entry.section; });

  var currentLink = null;

  function updateSpy() {
    if (!targets.length) return;

    /* Anchor the test line just below the sticky masthead. */
    var line = window.scrollY + 140;
    var active = targets[0];

    for (var i = 0; i < targets.length; i++) {
      if (targets[i].section.offsetTop <= line) active = targets[i];
    }

    /* At the very bottom, mark the last section regardless of offsets. */
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
      active = targets[targets.length - 1];
    }

    if (active.link === currentLink) return;
    if (currentLink) currentLink.removeAttribute('aria-current');
    active.link.setAttribute('aria-current', 'true');
    currentLink = active.link;
  }


  /* ── 05 · BACK TO TOP ─────────────────────────────────────────────────── */

  var toTop = $('#to-top');

  function updateToTop() {
    if (toTop) toTop.classList.toggle('show', window.scrollY > 600);
  }


  /* One scroll listener drives the progress rule, the index and the control. */
  var onScroll = onFrame(function () {
    updateProgress();
    updateSpy();
    updateToTop();
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  window.addEventListener('load', onScroll);
  updateProgress();
  updateSpy();
  updateToTop();
  updateToTop();


  /* ── 06 · COPY TO CLIPBOARD ───────────────────────────────────────────── */

  /* Falls back to a hidden textarea where the async Clipboard API is absent
     or blocked (for example on non-secure origins). */
  function writeToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var field = document.createElement('textarea');
      field.value = text;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.top = '-1000px';
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand('copy') ? resolve() : reject();
      } catch (error) {
        reject(error);
      } finally {
        document.body.removeChild(field);
      }
    });
  }

  $$('.copy').forEach(function (button) {
    var label = button.textContent;

    button.addEventListener('click', function () {
      var sourceId = button.getAttribute('data-copy-from');
      var text = sourceId
        ? (document.getElementById(sourceId) || {}).textContent
        : button.getAttribute('data-copy');

      if (!text) return;
      text = text.replace(/\s+/g, ' ').trim();

      writeToClipboard(text).then(
        function () {
          button.textContent = 'Copied';
          button.setAttribute('data-copied', 'true');
          announce('Copied to clipboard.');
        },
        function () {
          button.textContent = 'Copy failed';
          announce('Copy failed. Select the text and copy it manually.');
        }
      );

      window.setTimeout(function () {
        button.textContent = label;
        button.removeAttribute('data-copied');
      }, reduceMotion ? 3000 : 2200);
    });
  });

}());

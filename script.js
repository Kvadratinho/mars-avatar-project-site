// ============================================================
// MARS AVATAR PROJECT — SCRIPT
// 1. Mobile navigation menu
// 2. Scroll reveal for sections
// 3. Active nav link highlighting
// 4. Back-to-top button
//
// Everything degrades safely: if IntersectionObserver is missing,
// the page stays fully readable and only the effects are skipped.
// ============================================================

(function () {
  "use strict";

  var supportsIO = "IntersectionObserver" in window;
  var reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- 1. Mobile menu ----------
  var navToggle = document.getElementById("nav-toggle");
  var navLinks = document.getElementById("nav-links");

  function closeMenu() {
    if (!navLinks || !navToggle) return;
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && navLinks) {
    navToggle.setAttribute("aria-controls", "nav-links");

    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("open");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close after a link is tapped
    Array.prototype.forEach.call(navLinks.querySelectorAll("a"), function (link) {
      link.addEventListener("click", closeMenu);
    });

    // Close on Escape and return focus to the toggle
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("open")) {
        closeMenu();
        navToggle.focus();
      }
    });

    // Close when tapping anywhere outside the menu
    document.addEventListener("click", function (e) {
      if (!navLinks.classList.contains("open")) return;
      if (navLinks.contains(e.target) || navToggle.contains(e.target)) return;
      closeMenu();
    });

    // If the viewport grows back to desktop width, drop the open state
    if (window.matchMedia) {
      var desktop = window.matchMedia("(min-width: 901px)");
      var onChange = function (e) { if (e.matches) closeMenu(); };
      if (desktop.addEventListener) desktop.addEventListener("change", onChange);
      else if (desktop.addListener) desktop.addListener(onChange);
    }
  }

  // ---------- 2. Scroll reveal ----------
  // .reveal is added by script, so with JS disabled nothing is ever hidden.
  var sections = document.querySelectorAll("main .section");

  if (supportsIO && !reduceMotion && sections.length) {
    Array.prototype.forEach.call(sections, function (s) { s.classList.add("reveal"); });

    // rootMargin instead of a percentage threshold: a section taller than the
    // viewport could never reach `threshold: 0.12` and would stay invisible.
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target); // animate once, then leave it
        });
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" }
    );

    Array.prototype.forEach.call(sections, function (s) { revealObserver.observe(s); });
  }

  // ---------- 3. Active nav link ----------
  var navAnchors = document.querySelectorAll("#nav-links a");
  var watched = document.querySelectorAll("main .section, header#home");

  if (supportsIO && navAnchors.length && watched.length) {
    var current = null;

    function setActive(id) {
      if (id === current) return;
      current = id;
      Array.prototype.forEach.call(navAnchors, function (a) {
        var match = a.getAttribute("href") === "#" + id;
        a.classList.toggle("active", match);
        // aria-current exposes the state to screen readers, not just to sighted users
        if (match) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }

    // "Окно" по центру экрана: раздел считается активным,
    // когда пересекает середину видимой области.
    var navObserver = new IntersectionObserver(
      function (entries) {
        // Pick the entry closest to the middle instead of trusting callback order
        var best = null;
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
        });
        if (best && best.target.id) setActive(best.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    Array.prototype.forEach.call(watched, function (s) { navObserver.observe(s); });
  }

  // ---------- 4. Back to top ----------
  var toTop = document.getElementById("to-top");

  if (toTop) {
    var ticking = false;

    var update = function () {
      toTop.classList.toggle("show", window.scrollY > 600);
      ticking = false;
    };

    // requestAnimationFrame keeps the class toggle off the scroll hot path
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
      },
      { passive: true }
    );

    update();
  }
})();

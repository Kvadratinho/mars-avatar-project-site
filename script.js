// ============================================================
// MARS AVATAR PROJECT — SCRIPT
// 1. Mobile navigation menu toggle
// 2. Scroll reveal animation for sections
// 3. Active nav link highlighting while scrolling
// ============================================================

// ---------- 1. Mobile menu ----------
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  // Close the mobile menu automatically after a link is tapped
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// ---------- 2. Scroll reveal ----------
// Add the .reveal class to every section, then flip on .visible
// the first time the section enters the viewport.
const sections = document.querySelectorAll("main .section");

sections.forEach((s) => s.classList.add("reveal"));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target); // animate once, then leave it
      }
    });
  },
  { threshold: 0.12 }
);

sections.forEach((s) => revealObserver.observe(s));

// ---------- 3. Active nav link ----------
// Watch which section occupies the middle of the screen
// and highlight the matching menu link.
const navAnchors = document.querySelectorAll("#nav-links a");
const watched = document.querySelectorAll("main .section, header#home");

function setActive(id) {
  navAnchors.forEach((a) => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + id);
  });
}

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  },
  // "Окно" по центру экрана: раздел считается активным,
  // когда пересекает середину видимой области
  { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
);

watched.forEach((s) => navObserver.observe(s));

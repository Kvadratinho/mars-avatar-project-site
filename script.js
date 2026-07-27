/**
 * MARS AVATAR PROJECT — OFFICIAL WEBSITE SCRIPT (v3.6)
 * Standards: NASA / JPL / ETH Zürich Academic Presentation
 * Clean, minimal Vanilla JS for accessibility, interaction, & performance.
 */

document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initActiveNavHighlight();
  initCopyCitation();
  initAccessibilityEnhancements();
});

/**
 * 1. Smooth Scrolling with Offset Compensation for Fixed Header
 */
function initSmoothScroll() {
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"], .skip-link');
  const headerHeight = document.querySelector('.site-header')?.offsetHeight || 70;

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId === '#') return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerHeight - 20;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Move focus to target element for accessibility / screen readers
        targetElement.setAttribute('tabindex', '-1');
        targetElement.focus({ preventScroll: true });
      }
    });
  });
}

/**
 * 2. IntersectionObserver for Active Nav Highlighting
 */
function initActiveNavHighlight() {
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.site-nav a');

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'location');
          } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));
}

/**
 * 3. One-Click Copy Citation Handler
 */
function initCopyCitation() {
  const copyBtn = document.getElementById('copy-citation-btn');
  const citationTextEl = document.getElementById('academic-citation-text');

  if (!copyBtn || !citationTextEl) return;

  copyBtn.addEventListener('click', async () => {
    const textToCopy = citationTextEl.innerText.trim();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for non-HTTPS or older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      // Visual feedback
      const originalText = copyBtn.innerText;
      copyBtn.innerText = '✓ Citation Copied';
      copyBtn.classList.add('copied');
      copyBtn.setAttribute('aria-label', 'Citation text copied to clipboard');

      setTimeout(() => {
        copyBtn.innerText = originalText;
        copyBtn.classList.remove('copied');
        copyBtn.setAttribute('aria-label', 'Copy formal academic citation');
      }, 3000);

    } catch (err) {
      console.error('Failed to copy citation: ', err);
      copyBtn.innerText = 'Copy Failed';
      setTimeout(() => {
        copyBtn.innerText = 'Copy Citation';
      }, 2000);
    }
  });
}

/**
 * 4. Accessibility & ARIA Keyboard Helpers
 */
function initAccessibilityEnhancements() {
  // Detect keyboard focus vs mouse focus to optimize focus ring visibility
  document.body.addEventListener('mousedown', () => {
    document.body.classList.add('using-mouse');
  });

  document.body.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.remove('using-mouse');
    }
  });

  // Ensure external links have appropriate security and accessible attributes
  const externalLinks = document.querySelectorAll('a[target="_blank"]');
  externalLinks.forEach(link => {
    if (!link.getAttribute('rel')) {
      link.setAttribute('rel', 'noopener noreferrer');
    }
    // Append screen-reader indication for opening in new tab
    if (!link.querySelector('.sr-only-tab')) {
      const srSpan = document.createElement('span');
      srSpan.className = 'sr-only';
      srSpan.innerText = ' (opens in new tab)';
      link.appendChild(srSpan);
    }
  });
}

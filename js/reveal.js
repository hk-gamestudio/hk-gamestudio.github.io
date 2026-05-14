/**
 * Scroll-reveal using Intersection Observer.
 * Elements with class "reveal" animate in when they enter the viewport.
 * Supports stagger via data-reveal-delay="ms".
 */

export function initReveal() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Show everything immediately
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.revealDelay ?? '0', 10);

        if (delay > 0) {
          setTimeout(() => el.classList.add('visible'), delay);
        } else {
          el.classList.add('visible');
        }

        observer.unobserve(el);
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -48px 0px',
    }
  );

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/**
 * Re-observe any newly added .reveal elements (e.g., after dynamic card load).
 */
export function observeNew(container) {
  if (!container) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    container.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.dataset.revealDelay ?? '0', 10);
        if (delay > 0) {
          setTimeout(() => el.classList.add('visible'), delay);
        } else {
          el.classList.add('visible');
        }
        observer.unobserve(el);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -48px 0px' }
  );

  container.querySelectorAll('.reveal:not(.visible)').forEach(el => observer.observe(el));
}

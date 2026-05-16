/**
 * Reveal-on-scroll. Adds .in to anything with .reveal once it
 * crosses ~12% of the viewport. One-shot per element.
 */
export function init() {
  const els = document.querySelectorAll('.reveal:not(.in)');
  if (!els.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  els.forEach(el => io.observe(el));
}

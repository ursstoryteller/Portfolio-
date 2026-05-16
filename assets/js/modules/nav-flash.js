/**
 * Quick black flash on in-page anchor clicks — sells the "cut to
 * next reel" feeling without blocking the smooth scroll.
 */
export function init() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', () => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      if (!document.querySelector(id)) return;

      const flash = document.createElement('div');
      flash.style.cssText =
        'position:fixed;inset:0;background:#000;z-index:150;' +
        'opacity:0;transition:opacity 0.28s;pointer-events:none;';
      document.body.appendChild(flash);

      requestAnimationFrame(() => { flash.style.opacity = '0.85'; });
      setTimeout(() => { flash.style.opacity = '0'; }, 320);
      setTimeout(() => flash.remove(), 800);
    });
  });
}

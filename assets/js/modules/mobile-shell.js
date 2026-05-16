/**
 * Mobile-only behaviour. Loaded lazily by main.js when
 * matchMedia('(max-width: 720px)') is true at boot.
 *
 * Responsibilities:
 *   1. Horizontal-deck dot indicators (Skills, Filmography)
 *   2. Cut-flash overlay on outer reel-to-reel snap change
 *   3. Gallery: horizontal swipe gesture switches category
 *   4. Tap-pulse helper for buttons / cards
 */

const isCoarse = () => matchMedia('(hover: none), (pointer: coarse)').matches;
const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ----- 1. Deck dots ------------------------------------------------- */
function wireDecks() {
  document.querySelectorAll('.deck').forEach(deck => {
    const track = deck.querySelector('.deck-track');
    const dots  = deck.querySelectorAll('.deck-dots span');
    if (!track || !dots.length) return;

    const shots = [...track.children];
    if (shots.length !== dots.length) return;

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.intersectionRatio > 0.55) {
          const idx = shots.indexOf(e.target);
          dots.forEach((d, i) => d.classList.toggle('active', i === idx));
        }
      });
    }, { root: track, threshold: [0.55, 0.9] });

    shots.forEach(s => io.observe(s));
    /* initial */
    if (dots[0]) dots[0].classList.add('active');
  });
}

/* ----- 2. Cut flash on outer snap change --------------------------- */
function wireCutFlash() {
  const main = document.querySelector('main');
  const sections = [...document.querySelectorAll('[data-reel-id]')];
  if (!main || !sections.length) return;
  if (reducedMotion()) return;

  let lastIdx = -1;
  let pending = false;

  const flashEl = document.createElement('div');
  flashEl.className = 'reel-cut-flash';
  flashEl.setAttribute('aria-hidden', 'true');
  document.body.appendChild(flashEl);

  const onScroll = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      const y = main.scrollTop + window.innerHeight * 0.35;
      let idx = 0;
      sections.forEach((s, i) => { if (s.offsetTop <= y) idx = i; });
      if (idx !== lastIdx && lastIdx !== -1) {
        flashEl.classList.add('on');
        setTimeout(() => flashEl.classList.remove('on'), 160);
      }
      lastIdx = idx;
      pending = false;
    });
  };

  main.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ----- 3. Gallery horizontal swipe switches category -------------- */
function wireGallerySwipe() {
  const grid = document.getElementById('galleryGrid');
  const tabs = [...document.querySelectorAll('.tabs .tab')];
  if (!grid || tabs.length < 2 || !isCoarse()) return;

  let startX = 0, startY = 0, swiped = false;

  grid.addEventListener('touchstart', e => {
    if (e.touches.length !== 1) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    swiped = false;
  }, { passive: true });

  grid.addEventListener('touchmove', e => {
    if (swiped) return;
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    if (Math.abs(dx) > 50 && Math.abs(dy) < 30) {
      const activeIdx = tabs.findIndex(t => t.classList.contains('active'));
      const nextIdx   = (dx < 0)
        ? Math.min(tabs.length - 1, activeIdx + 1)
        : Math.max(0, activeIdx - 1);
      if (nextIdx !== activeIdx) {
        tabs[nextIdx].click();
        swiped = true;
      }
    }
  }, { passive: true });
}

/* ----- 4. Tap-pulse helper ---------------------------------------- */
function wireTapPulse() {
  if (!isCoarse()) return;
  const targets = 'a, button, .dept, .svc, .stat, .film, .tile';
  document.addEventListener('touchstart', e => {
    const t = e.target.closest(targets);
    if (t) t.classList.add('tap');
  }, { passive: true });
  document.addEventListener('touchend', e => {
    const t = e.target.closest(targets);
    if (t) setTimeout(() => t.classList.remove('tap'), 120);
  }, { passive: true });
  document.addEventListener('touchcancel', e => {
    const t = e.target.closest(targets);
    if (t) t.classList.remove('tap');
  }, { passive: true });
}

export function init() {
  wireDecks();
  wireCutFlash();
  wireGallerySwipe();
  wireTapPulse();
}

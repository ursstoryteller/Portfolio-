/**
 * Side reel rail (desktop), bottom dock indicator + progress bar
 * (mobile), the scroll-driven 24fps timecode in the HUD, and the new
 * R/0X OF 07 reel counter with a gate-jitter animation on change.
 *
 * Mapped to a fictional 2h18m runtime so the timecode finishes
 * exactly at the bottom of the page.
 */
const pad = (n, l = 2) => String(n).padStart(l, '0');

export function init() {
  const rail     = document.querySelectorAll('.reel-rail a');
  const sections = [...document.querySelectorAll('[data-reel-id]')];
  const tc       = document.getElementById('tc');
  const dock     = document.querySelector('.dock');
  const dockReel = document.getElementById('dockReel');
  const dockTitle= document.getElementById('dockTitle');
  const dockTicks= document.querySelectorAll('.dock-ticks a');
  const counter  = document.getElementById('reelCounter');
  if (!sections.length) return;

  let lastActiveIdx = -1;
  const totalReels = sections.length;

  /* On mobile the scroller is `main` (overflow-y:auto). On desktop it's
   * the window. Pick whichever has scroll. */
  const isMobile = () => matchMedia('(max-width: 720px)').matches;
  const getScrollY  = () => isMobile() ? document.querySelector('main').scrollTop : window.scrollY;
  const getViewport = () => window.innerHeight;
  const getMax      = () => {
    if (isMobile()) {
      const m = document.querySelector('main');
      return Math.max(1, m.scrollHeight - m.clientHeight);
    }
    return Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  };

  const sectionTop = (s) => {
    /* Robust against arbitrary offsetParent chains: convert each
     * section's viewport-top into scroller-relative coordinates. */
    if (isMobile()) {
      const main = document.querySelector('main');
      return s.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop;
    }
    return s.getBoundingClientRect().top + window.scrollY;
  };

  const update = () => {
    const y = getScrollY() + getViewport() * 0.35;

    /* active section ↔ rail / dock label / counter */
    let activeIdx = 0;
    sections.forEach((s, i) => {
      if (sectionTop(s) <= y) activeIdx = i;
    });

    rail.forEach((a, i) => a.classList.toggle('active', i === activeIdx));

    if (dockReel && sections[activeIdx]) {
      const label = sections[activeIdx].dataset.reelLabel || `R/${pad(activeIdx + 1)}`;
      if (dockReel.textContent !== label) dockReel.textContent = label;
    }
    if (dockTitle && sections[activeIdx]) {
      const title = sections[activeIdx].dataset.reelTitle || '';
      if (dockTitle.textContent !== title) dockTitle.textContent = title;
    }
    if (dockTicks.length) {
      dockTicks.forEach((t, i) => t.classList.toggle('active', i === activeIdx));
    }
    if (sections[activeIdx]) {
      const id = sections[activeIdx].dataset.reelId || pad(activeIdx + 1);
      if (document.body.dataset.activeReel !== id) {
        document.body.dataset.activeReel = id;
      }
    }
    if (counter) {
      const text = `· R/${pad(activeIdx + 1)} OF ${pad(totalReels)}`;
      if (counter.textContent !== text) {
        counter.textContent = text;
        if (activeIdx !== lastActiveIdx && lastActiveIdx !== -1) {
          counter.classList.remove('jitter');
          void counter.offsetWidth;
          counter.classList.add('jitter');
        }
      }
    }
    lastActiveIdx = activeIdx;

    /* scroll progress (0–1) */
    const p = Math.min(1, getScrollY() / getMax());

    if (dock) {
      dock.style.setProperty('--progress', `${(p * 100).toFixed(2)}%`);
    }

    /* 24fps timecode → 2h 18m runtime */
    if (tc) {
      const totalFrames = Math.floor(p * (2 * 3600 + 18 * 60) * 24);
      const frames   = totalFrames % 24;
      const totalSec = Math.floor(totalFrames / 24);
      const sec = totalSec % 60;
      const min = Math.floor(totalSec / 60) % 60;
      const hr  = Math.floor(totalSec / 3600);
      tc.textContent = `${pad(hr)}:${pad(min)}:${pad(sec)}:${pad(frames)}`;
    }
  };

  /* Re-binds the scroll listener on the right element. Handles
   * breakpoint crossings (mobile↔desktop) when the user rotates. */
  let currentTarget = null;
  const bindScroll = () => {
    const next = isMobile() ? document.querySelector('main') : window;
    if (next === currentTarget) return;
    if (currentTarget) currentTarget.removeEventListener('scroll', update);
    if (next) next.addEventListener('scroll', update, { passive: true });
    currentTarget = next;
  };

  bindScroll();
  update();
  window.addEventListener('resize', () => { bindScroll(); update(); });
}

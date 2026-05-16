/**
 * AI gallery — pulls image lists from the GitHub Contents API at
 * runtime so new files dropped into Pages/image/{Characters,
 * Cinematic,Landscapes} appear automatically.
 *
 * Falls back gracefully if the API is rate-limited.
 * Click any tile → fullscreen lightbox (Esc / click-out to close).
 */
const REPO_OWNER = 'ursstoryteller';
const REPO_NAME  = 'Portfolio-';
const REPO_REF   = 'main';
const BASE_PATH  = 'Pages/image';
const IMG_RE     = /\.(jpe?g|png|webp|gif|avif)$/i;

const apiUrl   = cat => `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${BASE_PATH}/${encodeURIComponent(cat)}?ref=${REPO_REF}`;
const localUrl = (cat, name) => `${BASE_PATH}/${encodeURIComponent(cat)}/${encodeURIComponent(name)}`;

function buildLightbox() {
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.innerHTML =
    '<button class="close" data-hover aria-label="Close">CLOSE ✕</button>' +
    '<img alt="" />';
  document.body.appendChild(lb);

  const lbImg = lb.querySelector('img');
  const close = () => lb.classList.remove('open');

  lb.querySelector('.close').addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  return src => { lbImg.src = src; lb.classList.add('open'); };
}

function render(grid, countEl, openLb, cat, items) {
  grid.innerHTML = '';
  if (!items.length) {
    grid.innerHTML =
      `<div class="gallery-state">No images yet in /${BASE_PATH}/${cat} — ` +
      `drop new files into the folder, push to GitHub, and they'll appear automatically.</div>`;
    countEl.textContent = '— 0 frames —';
    return;
  }

  countEl.textContent = `— ${items.length} frame${items.length === 1 ? '' : 's'} —`;

  items.forEach((it, i) => {
    const a = document.createElement('a');
    a.className = 'tile';
    a.href = '#';
    a.dataset.hover = '';
    const num = String(i + 1).padStart(3, '0');
    a.innerHTML =
      `<span class="meta-tag">${cat.toUpperCase()} · ${num}</span>` +
      `<img loading="lazy" alt="${cat} ${num}" />`;

    const imgEl = a.querySelector('img');
    imgEl.src = it.local;
    imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = it.remote; };

    a.addEventListener('click', e => {
      e.preventDefault();
      openLb(it.remote || it.local);
    });

    grid.appendChild(a);
  });
}

export function init() {
  const grid    = document.getElementById('galleryGrid');
  const tabs    = document.querySelectorAll('.tabs .tab');
  const countEl = document.getElementById('tabCount');
  if (!grid || !tabs.length) return;

  const openLb = buildLightbox();
  const cache  = {};

  const load = async cat => {
    if (cache[cat]) {
      render(grid, countEl, openLb, cat, cache[cat]);
      return;
    }

    grid.innerHTML = `<div class="gallery-state">Loading reels from /${BASE_PATH}/${cat} …</div>`;
    countEl.textContent = '— loading —';

    try {
      const r = await fetch(apiUrl(cat), {
        headers: { 'Accept': 'application/vnd.github+json' }
      });
      if (!r.ok) throw new Error('GitHub API ' + r.status);

      const arr = await r.json();
      const items = arr
        .filter(x => x.type === 'file' && IMG_RE.test(x.name))
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
        .map(x => ({
          name:   x.name,
          local:  localUrl(cat, x.name),
          remote: x.download_url
        }));

      cache[cat] = items;
      render(grid, countEl, openLb, cat, items);
    } catch (err) {
      grid.innerHTML =
        `<div class="gallery-state">Couldn't reach the GitHub API right now. ` +
        `Files in /${BASE_PATH}/${cat} should still appear once served from GitHub Pages.</div>`;
      countEl.textContent = '— offline —';
      console.warn(err);
    }
  };

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      load(btn.dataset.cat);
    });
  });

  load('Characters');
}

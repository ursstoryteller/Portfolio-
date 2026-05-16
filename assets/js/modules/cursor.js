/**
 * Aperture cursor — eased-follow ring + instant gold dot.
 * Disabled on touch / coarse pointers.
 */
export function init() {
  const c = document.querySelector('.cursor');
  const d = document.querySelector('.cursor-dot');
  if (!c || !d) return;
  if (matchMedia('(hover: none), (pointer: coarse)').matches) return;

  let x = 0, y = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    tx = e.clientX;
    ty = e.clientY;
    d.style.transform = `translate(${tx}px, ${ty}px) translate(-50%, -50%)`;
  });

  const tick = () => {
    x += (tx - x) * 0.18;
    y += (ty - y) * 0.18;
    c.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    requestAnimationFrame(tick);
  };
  tick();

  const hovers = 'a, button, [data-hover]';
  document.addEventListener('mouseover', e => {
    if (e.target.closest(hovers)) c.classList.add('hover');
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest(hovers)) c.classList.remove('hover');
  });
}

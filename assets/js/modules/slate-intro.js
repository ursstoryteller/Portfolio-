/**
 * Slate-clap intro — shown for one beat on first paint, then fades.
 */
export function init() {
  window.addEventListener('load', () => {
    setTimeout(() => {
      const slate = document.getElementById('slate');
      if (slate) slate.classList.add('gone');
    }, 1300);
  });
}

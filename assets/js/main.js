/**
 * Entry point — boots every behaviour module.
 *
 * Each module exposes a single `init()` and is responsible for its
 * own event wiring + cleanup. Order doesn't matter; modules are
 * defensive and bail out if their target nodes are missing.
 */
import { init as slateIntro } from './modules/slate-intro.js';
import { init as cursor }     from './modules/cursor.js';
import { init as reveal }     from './modules/reveal.js';
import { init as reelRail }   from './modules/reel-rail.js';
import { init as navFlash }   from './modules/nav-flash.js';
import { init as gallery }    from './modules/gallery.js';

slateIntro();
cursor();
reveal();
reelRail();
navFlash();
gallery();

/* Mobile-only behaviour. Lazy-loaded so desktop pays nothing. */
if (matchMedia('(max-width: 720px)').matches) {
  import('./modules/mobile-shell.js').then(m => m.init());
}

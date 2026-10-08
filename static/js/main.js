/**
 * For You — Love Letters
 * Entry point. Each feature lives in its own small module; no framework,
 * no third-party libraries — the whole interactive layer is a few KB.
 */
import { AvatarScene } from './modules/avatars.js';
import { initChrome } from './modules/chrome.js';
import { initMotion } from './modules/motion.js';
import { initMoments } from './modules/moments.js';
import { initLetterDialog } from './modules/letter-dialog.js';

const dataEl = document.getElementById('site-data');
const data = dataEl ? JSON.parse(dataEl.textContent) : { letters: [], moods: [], ui: {} };
const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

const ctx = {
  data,
  reduced: () => reducedQuery.matches,
};

document.documentElement.classList.add('motion-ok');

const scenes = {};
for (const id of ['av-hero', 'av-moment', 'av-final']) {
  const svg = document.getElementById(id);
  if (svg) scenes[id] = new AvatarScene(svg, ctx);
}

initChrome(ctx);
initMotion(ctx, scenes);
initMoments(ctx, scenes['av-moment']);
initLetterDialog(ctx);

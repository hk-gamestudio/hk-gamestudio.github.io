/**
 * Entry point — bootstraps all modules based on current page.
 * All imports are ES Modules; no bundler required.
 */

import { initI18n } from './i18n.js';
import { initNav }  from './nav.js';
import { initReveal } from './reveal.js';

// Determine section from path: /assets/ → 'assets', / → ''
const segs    = location.pathname.split('/').filter(Boolean);
const section = segs[0] ?? '';

async function boot() {
  await initI18n();
  initNav();
  initReveal();

  switch (section) {
    case '':
      await bootHome(); break;
    case 'assets':
      await bootAssets(); break;
    case 'games':
      await bootGames(); break;
    case 'apps':
      await bootApps(); break;
    case 'docs':
      await bootDocs(); break;
  }
}

async function bootHome() {
  const { initCanvas }   = await import('./canvas.js');
  const { loadShowcase } = await import('./cards.js');
  initCanvas('hero-canvas');
  await loadShowcase('showcase-grid');
}

async function bootAssets() {
  const { loadAssets, initFilter } = await import('./cards.js');
  await loadAssets('assets-grid');
  initFilter('assets-filter', 'assets-grid');
}

async function bootGames() {
  const { loadGames, loadStandaloneGames } = await import('./cards.js');
  await Promise.all([
    loadGames('lighted-grid', 'shadowed-grid'),
    loadStandaloneGames('standalone-grid'),
  ]);
}

async function bootApps() {
  const { loadApps } = await import('./cards.js');
  await loadApps('apps-grid');
}

async function bootDocs() {
  const { initDocs } = await import('./docs.js');
  await initDocs();
}

boot();

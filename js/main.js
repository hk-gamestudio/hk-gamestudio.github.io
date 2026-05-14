/**
 * Entry point — bootstraps all modules based on current page.
 * All imports are ES Modules; no bundler required.
 */

import { initI18n } from './i18n.js';
import { initNav }  from './nav.js';
import { initReveal } from './reveal.js';

const page = location.pathname.split('/').pop() || 'index.html';

async function boot() {
  // 1. Language must resolve before any content renders
  await initI18n();

  // 2. Nav is on every page
  initNav();

  // 3. Scroll-reveal for static elements
  initReveal();

  // 4. Page-specific init
  switch (page) {
    case 'index.html':
    case '':
      await bootHome();
      break;
    case 'assets.html':
      await bootAssets();
      break;
    case 'games.html':
      await bootGames();
      break;
    case 'apps.html':
      await bootApps();
      break;
    case 'docs.html':
      await bootDocs();
      break;
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

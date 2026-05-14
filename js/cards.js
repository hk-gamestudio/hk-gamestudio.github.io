/**
 * Dynamic card rendering via Web Components + fetch().
 * ProductCard, GameCard, AppCard — all use light DOM so global CSS applies.
 */

import { t, getLang } from './i18n.js';
import { observeNew } from './reveal.js';

/* ── Helpers ─────────────────────────────────────────────────────────────── */

function statusBadge(status, lang) {
  const map = {
    Published:        { cls: 'badge--published', key: 'badges.published'       },
    Veröffentlicht:   { cls: 'badge--published', key: 'badges.published'       },
    'In Planning':    { cls: 'badge--planned',   key: 'badges.in_planning'     },
    'In Planung':     { cls: 'badge--planned',   key: 'badges.in_planning'     },
    coming_soon:      { cls: 'badge--coming',    key: 'badges.coming_soon'     },
    'In Pending':     { cls: 'badge--coming',    key: 'badges.coming_soon'     },
    'in Pending':     { cls: 'badge--coming',    key: 'badges.coming_soon'     },
    'In Warteschlange': { cls: 'badge--coming',  key: 'badges.coming_soon'     },
    'In Umsetzung':   { cls: 'badge--dev',       key: 'badges.in_development'  },
    'In Entwicklung': { cls: 'badge--dev',       key: 'badges.in_development'  },
    'In Development': { cls: 'badge--dev',       key: 'badges.in_development'  },
    'in Development': { cls: 'badge--dev',       key: 'badges.in_development'  },
  };
  const entry = map[status] ?? { cls: 'badge--planned', key: 'badges.in_planning' };
  return `<span class="badge ${entry.cls}" data-i18n="${entry.key}">${t(entry.key)}</span>`;
}

function skeletonCards(n = 3, cls = '') {
  return Array.from({ length: n })
    .map(() => `<div class="skeleton skeleton-card ${cls}"></div>`)
    .join('');
}

/* ── ProductCard Web Component ───────────────────────────────────────────── */

class ProductCard extends HTMLElement {
  static get observedAttributes() { return ['data-lang']; }

  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const isRerender = this.children.length > 0;
    const raw = this.getAttribute('data-info');
    const meta = this.getAttribute('data-meta');
    if (!raw) return;

    let info, metaObj;
    try {
      info    = JSON.parse(raw);
      metaObj = meta ? JSON.parse(meta) : {};
    } catch { return; }

    const lang = getLang();
    const d    = info[lang] ?? info.en ?? {};
    const status = d.status ?? 'In Planning';

    const existing = (d.existing_features ?? []).slice(0, 6);
    const planned  = (d.features ?? []).slice(0, 3);

    const featureItems = (list, max = 6) =>
      list.slice(0, max)
        .map(f => `<li class="card__feature-item">${f}</li>`)
        .join('');

    const coverPath = metaObj.coverDir
      ? `${metaObj.coverDir}/${metaObj.cover}`
      : '';

    const storeBtn = info.link && info.link !== 'coming soon...'
      ? `<a href="${info.link}" target="_blank" rel="noopener noreferrer"
           class="btn btn--ghost btn--sm" data-i18n="assets.view_store">${t('assets.view_store')}</a>`
      : '';

    const docsBtn = metaObj.hasDocs
      ? `<a href="docs.html?type=asset&id=${metaObj.id}"
           class="btn btn--surface btn--sm">Docs</a>`
      : '';

    this.innerHTML = `
      <article class="card reveal" role="article">
        ${coverPath
          ? `<img class="card__cover" src="${coverPath}" alt="${metaObj.id ?? ''} cover" loading="lazy">`
          : `<div class="card__cover-placeholder"><img src="${metaObj.coverDir ?? 'icons/assets'}/${metaObj.icon ?? ''}" alt="" loading="lazy" style="width:4rem;height:4rem;object-fit:contain;opacity:.7"></div>`
        }
        <div class="card__body">
          <div class="card__header">
            <div>
              <h3 class="card__title">${metaObj.id?.replace(/([A-Z])/g, ' $1').trim() ?? ''}</h3>
            </div>
            ${statusBadge(status, lang)}
          </div>

          ${existing.length ? `
            <div class="card__features">
              <p class="card__features-label" data-i18n="assets.features_label">${t('assets.features_label')}</p>
              <ul class="card__features-list">${featureItems(existing)}</ul>
            </div>` : ''}

          ${planned.length ? `
            <div class="card__features">
              <p class="card__features-label" data-i18n="assets.upcoming_label">${t('assets.upcoming_label')}</p>
              <ul class="card__features-list">${featureItems(planned)}</ul>
            </div>` : ''}

          <div class="card__footer">
            ${info.version
              ? `<span class="card__version"><span data-i18n="assets.version_label">${t('assets.version_label')}</span> ${info.version}</span>`
              : '<span></span>'}
            <div style="display:flex;gap:var(--space-2);flex-wrap:wrap">
              ${docsBtn}
              ${storeBtn}
            </div>
          </div>
        </div>
      </article>`;
    if (isRerender) this.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }
}

/* ── GameCard Web Component ──────────────────────────────────────────────── */

class GameCard extends HTMLElement {
  static get observedAttributes() { return ['data-lang']; }
  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const isRerender = this.children.length > 0;
    const raw  = this.getAttribute('data-info');
    const meta = this.getAttribute('data-meta');
    if (!raw) return;

    let info, metaObj;
    try {
      info    = JSON.parse(raw);
      metaObj = meta ? JSON.parse(meta) : {};
    } catch { return; }

    const lang  = getLang();
    const d     = info[lang] ?? info.en ?? {};
    const status   = d.status ?? d.Umsetzung ?? 'In Planning';
    const genre    = d.genre ?? '';
    const features = d.features ?? [];

    const coverPath = metaObj.iconDir && metaObj.cover ? `${metaObj.iconDir}/${metaObj.cover}` : '';
    const name = metaObj.id ?? '';
    const displayName = metaObj.displayName ?? `Tooniom – ${name}`;

    const gameDocsBtn = metaObj.hasDocs
      ? `<a href="docs.html?type=game&id=${metaObj.id}&variant=${metaObj.variant ?? 'shadowed'}"
           class="btn btn--surface btn--sm">Docs</a>`
      : `<span class="btn btn--surface btn--sm btn--muted">Docs – <span data-i18n="games.coming_soon">${t('games.coming_soon')}</span></span>`;

    this.innerHTML = `
      <article class="game-card reveal" role="article">
        <div class="game-card__cover">
          ${coverPath
            ? `<img src="${coverPath}" alt="${displayName} cover" loading="lazy">`
            : `<div class="game-card__cover-placeholder">// no cover yet</div>`}
          <div class="game-card__overlay"></div>
        </div>
        <div class="game-card__body">
          <div class="card__header">
            <h3 class="game-card__title">${displayName}</h3>
            ${statusBadge(status, lang)}
          </div>
          <div class="game-card__meta">
            ${genre ? `
              <span class="game-card__meta-item">
                <span class="game-card__meta-label" data-i18n="games.genre_label">${t('games.genre_label')}</span>
                &nbsp;${genre}
              </span>` : ''}
          </div>
          ${features.length ? `
            <ul class="game-card__features">
              ${features.map(f => `<li class="game-card__feature-item">${f}</li>`).join('')}
            </ul>` : ''}
          <div style="margin-top:var(--space-4)">${gameDocsBtn}</div>
        </div>
      </article>`;
    if (isRerender) this.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }
}

/* ── AppCard Web Component ───────────────────────────────────────────────── */

class AppCard extends HTMLElement {
  static get observedAttributes() { return ['data-lang']; }
  connectedCallback() { this._render(); }
  attributeChangedCallback() { this._render(); }

  _render() {
    const isRerender = this.children.length > 0;
    const raw = this.getAttribute('data-app');
    if (!raw) return;

    let app;
    try { app = JSON.parse(raw); } catch { return; }

    const lang = getLang();
    const name    = app.name?.[lang]        ?? app.name?.en        ?? '';
    const tagline = app.tagline?.[lang]     ?? app.tagline?.en     ?? '';
    const desc    = app.description?.[lang] ?? app.description?.en ?? '';

    const docsBtn = app.hasDocs
      ? `<a href="docs.html?type=app&id=${app.id}&docsId=${app.docsId ?? app.id}&name=${encodeURIComponent(name)}"
           class="btn btn--surface btn--sm">Docs</a>`
      : `<span class="btn btn--surface btn--sm btn--muted">Docs – <span data-i18n="games.coming_soon">${t('games.coming_soon')}</span></span>`;

    this.innerHTML = `
      <article class="app-card app-card--coming reveal" role="article">
        <div class="app-card__header">
          <div class="app-card__icon-wrap">
            <div class="app-card__icon">${app.icon ?? '📱'}</div>
          </div>
          <div class="app-card__header-text">
            <h3 class="app-card__name">${name}</h3>
            <p class="app-card__tagline">${tagline}</p>
          </div>
        </div>
        <div class="app-card__body">
          <p class="app-card__desc">${desc}</p>
          <div class="app-card__footer">
            <span class="app-card__platform">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
                <line x1="12" y1="18" x2="12.01" y2="18"/>
              </svg>
              <span data-i18n="apps.platform">${t('apps.platform')}</span>
            </span>
            ${statusBadge('coming_soon', lang)}
          </div>
          <div style="margin-top:var(--space-4)">${docsBtn}</div>
        </div>
      </article>`;
    if (isRerender) this.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
  }
}

/* ── Register ────────────────────────────────────────────────────────────── */

customElements.define('product-card', ProductCard);
customElements.define('game-card',    GameCard);
customElements.define('app-card',     AppCard);

/* ── Loaders ─────────────────────────────────────────────────────────────── */

export async function loadAssets(gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  grid.innerHTML = skeletonCards(6);

  let manifest;
  try {
    const res = await fetch('manifest.json', { cache: 'no-store' });
    manifest  = await res.json();
  } catch { grid.innerHTML = '<p class="empty-state">Failed to load assets.</p>'; return; }

  const lang = getLang();
  const cards = await Promise.all(
    manifest.assets.map(async meta => {
      try {
        const res  = await fetch(`infos/assets/${meta.id}/info.json`, { cache: 'no-store' });
        if (!res.ok) return null;
        const info = await res.json();
        return { meta, info };
      } catch { return null; }
    })
  );

  grid.innerHTML = '';
  const valid = cards.filter(Boolean);

  valid.forEach(({ meta, info }, i) => {
    const el = document.createElement('product-card');
    el.setAttribute('data-info', JSON.stringify(info));
    el.setAttribute('data-meta', JSON.stringify(meta));
    el.setAttribute('data-lang', lang);
    grid.appendChild(el);

    // Stagger reveal
    const inner = el.querySelector('.reveal');
    if (inner) inner.dataset.revealDelay = String(i * 80);
  });

  observeNew(grid);

  // Re-render on lang change
  document.addEventListener('langchange', ({ detail: { lang: newLang } }) => {
    grid.querySelectorAll('product-card').forEach(c => c.setAttribute('data-lang', newLang));
  });

  return valid.map(v => v.info);
}

export async function loadGames(lightedId, shadowedId) {
  const lightedGrid  = document.getElementById(lightedId);
  const shadowedGrid = document.getElementById(shadowedId);
  if (!lightedGrid && !shadowedGrid) return;

  if (lightedGrid)  lightedGrid.innerHTML  = skeletonCards(3, 'skeleton-card--game');
  if (shadowedGrid) shadowedGrid.innerHTML = skeletonCards(3, 'skeleton-card--game');

  let manifest;
  try {
    const res = await fetch('manifest.json', { cache: 'no-store' });
    manifest  = await res.json();
  } catch { return; }

  const lang = getLang();

  async function loadGroup(entries, grid) {
    if (!grid) return;
    grid.innerHTML = '';
    let idx = 0;
    for (const meta of entries) {
      try {
        const res  = await fetch(`${meta.infoDir}/info.json`, { cache: 'no-store' });
        if (!res.ok) continue;
        const info = await res.json();
        const el   = document.createElement('game-card');
        el.setAttribute('data-info', JSON.stringify(info));
        el.setAttribute('data-meta', JSON.stringify(meta));
        el.setAttribute('data-lang', lang);
        grid.appendChild(el);
        const inner = el.querySelector('.reveal');
        if (inner) inner.dataset.revealDelay = String(idx * 100);
        idx++;
      } catch { /* skip broken entry, keep order intact */ }
    }
    observeNew(grid);
  }

  await Promise.all([
    loadGroup(manifest.games.lighted,  lightedGrid),
    loadGroup(manifest.games.shadowed, shadowedGrid),
  ]);

  document.addEventListener('langchange', ({ detail: { lang: newLang } }) => {
    [lightedGrid, shadowedGrid].filter(Boolean).forEach(grid => {
      grid.querySelectorAll('game-card').forEach(c => c.setAttribute('data-lang', newLang));
    });
  });
}

export async function loadApps(gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  let manifest;
  try {
    const res = await fetch('manifest.json', { cache: 'no-store' });
    manifest  = await res.json();
  } catch { return; }

  const lang = getLang();
  grid.innerHTML = '';

  manifest.apps.forEach((app, i) => {
    const el = document.createElement('app-card');
    el.setAttribute('data-app', JSON.stringify(app));
    el.setAttribute('data-lang', lang);
    grid.appendChild(el);

    const inner = el.querySelector('.reveal');
    if (inner) inner.dataset.revealDelay = String(i * 120);
  });

  observeNew(grid);

  document.addEventListener('langchange', ({ detail: { lang: newLang } }) => {
    grid.querySelectorAll('app-card').forEach(c => c.setAttribute('data-lang', newLang));
  });
}

export async function loadShowcase(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const tabBtns = document.querySelectorAll('.showcase__tab');

  let manifest;
  try {
    const res = await fetch('manifest.json', { cache: 'no-store' });
    manifest  = await res.json();
  } catch { return; }

  // Lookup helpers
  const allGameMeta = [
    ...(manifest.games?.standalone ?? []),
    ...(manifest.games?.lighted   ?? []),
    ...(manifest.games?.shadowed  ?? []),
  ];
  const findAsset = id => manifest.assets.find(m => m.id === id) ?? null;
  const findGame  = id => allGameMeta.find(m => m.id === id) ?? null;
  const findApp   = id => manifest.apps.find(a => a.id === id) ?? null;

  // Showcase order per tab — explicit, in the required sequence
  const ASSETS = ['AssetCreator', 'PlayerUtils', 'DayTimer'];
  const GAMES  = ['TheOcean', 'MinerTycoon', 'Storylands'];
  const APPS   = ['adhd-plan-a', 'hive-memories'];

  container.innerHTML = skeletonCards(3);

  // Fetch asset + game info in parallel; apps live in manifest already
  const [assetResults, gameResults] = await Promise.all([
    Promise.all(ASSETS.map(async id => {
      const meta = findAsset(id);
      if (!meta) return null;
      try {
        const res = await fetch(`infos/assets/${id}/info.json`, { cache: 'no-store' });
        if (!res.ok) return null;
        return { id, meta, info: await res.json() };
      } catch { return null; }
    })),
    Promise.all(GAMES.map(async id => {
      const meta = findGame(id);
      if (!meta?.infoDir) return null;
      try {
        const res = await fetch(`${meta.infoDir}/info.json`, { cache: 'no-store' });
        if (!res.ok) return null;
        return { id, meta, info: await res.json() };
      } catch { return null; }
    })),
  ]);

  const appResults = APPS.map(id => {
    const app = findApp(id);
    return app ? { id, app } : null;
  });

  // Keyed maps for O(1) lookup while rendering in config-array order
  const assetMap = Object.fromEntries(assetResults.filter(Boolean).map(d => [d.id, d]));
  const gameMap  = Object.fromEntries(gameResults.filter(Boolean).map(d => [d.id, d]));
  const appMap   = Object.fromEntries(appResults.filter(Boolean).map(d => [d.id, d]));

  function renderTab(tab) {
    container.innerHTML = '';
    const curLang = getLang();

    if (tab === 'assets') {
      ASSETS.forEach((id, i) => {
        const d = assetMap[id];
        if (!d) return;
        const el = document.createElement('product-card');
        el.setAttribute('data-info', JSON.stringify(d.info));
        el.setAttribute('data-meta', JSON.stringify(d.meta));
        el.setAttribute('data-lang', curLang);
        container.appendChild(el);
        const inner = el.querySelector('.reveal');
        if (inner) inner.dataset.revealDelay = String(i * 80);
      });
    } else if (tab === 'games') {
      GAMES.forEach((id, i) => {
        const d = gameMap[id];
        if (!d) return;
        const el = document.createElement('game-card');
        el.setAttribute('data-info', JSON.stringify(d.info));
        el.setAttribute('data-meta', JSON.stringify(d.meta));
        el.setAttribute('data-lang', curLang);
        container.appendChild(el);
        const inner = el.querySelector('.reveal');
        if (inner) inner.dataset.revealDelay = String(i * 80);
      });
    } else if (tab === 'apps') {
      APPS.forEach((id, i) => {
        const d = appMap[id];
        if (!d) return;
        const el = document.createElement('app-card');
        el.setAttribute('data-app', JSON.stringify(d.app));
        el.setAttribute('data-lang', curLang);
        container.appendChild(el);
        const inner = el.querySelector('.reveal');
        if (inner) inner.dataset.revealDelay = String(i * 80);
      });
    }

    observeNew(container);
  }

  let activeTab = 'assets';
  renderTab(activeTab);

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.tab === activeTab) return;
      activeTab = btn.dataset.tab;
      tabBtns.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      renderTab(activeTab);
    });
  });

  document.addEventListener('langchange', ({ detail: { lang: newLang } }) => {
    container.querySelectorAll('[data-lang]').forEach(c => c.setAttribute('data-lang', newLang));
  });
}

export async function loadStandaloneGames(gridId) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  let manifest;
  try {
    const res = await fetch('manifest.json', { cache: 'no-store' });
    manifest  = await res.json();
  } catch { return; }

  const entries = manifest.games?.standalone;
  if (!entries?.length) { grid.innerHTML = ''; return; }

  grid.innerHTML = skeletonCards(entries.length, 'skeleton-card--game');

  const lang = getLang();
  grid.innerHTML = '';
  let idx = 0;
  for (const meta of entries) {
    try {
      const res  = await fetch(`${meta.infoDir}/info.json`, { cache: 'no-store' });
      if (!res.ok) continue;
      const info = await res.json();
      const el   = document.createElement('game-card');
      el.setAttribute('data-info', JSON.stringify(info));
      el.setAttribute('data-meta', JSON.stringify(meta));
      el.setAttribute('data-lang', lang);
      grid.appendChild(el);
      const inner = el.querySelector('.reveal');
      if (inner) inner.dataset.revealDelay = String(idx * 100);
      idx++;
    } catch { /* skip broken entry */ }
  }
  observeNew(grid);

  document.addEventListener('langchange', ({ detail: { lang: newLang } }) => {
    grid.querySelectorAll('game-card').forEach(c => c.setAttribute('data-lang', newLang));
  });
}

/* ── Filter helper (assets page) ─────────────────────────────────────────── */

export function initFilter(filterId, gridId) {
  const filterBar = document.getElementById(filterId);
  const grid      = document.getElementById(gridId);
  if (!filterBar || !grid) return;

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    grid.querySelectorAll('product-card').forEach(card => {
      const badge = card.querySelector('.badge');
      const isPublished = badge?.classList.contains('badge--published');
      const isPlanned   = badge?.classList.contains('badge--planned');

      let show = true;
      if (filter === 'published') show = isPublished;
      if (filter === 'planned')   show = isPlanned;

      card.style.display = show ? '' : 'none';
    });
  });
}

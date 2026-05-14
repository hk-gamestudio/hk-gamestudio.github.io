/**
 * Documentation page logic.
 * Reads ?type=asset|game &id=AssetCreator &variant=shadowed (games only)
 * Fetches the Markdown file, renders it, builds TOC, handles lang changes.
 */

import { renderMarkdown, extractToc } from './markdown.js';
import { getLang, t }                  from './i18n.js';

export async function initDocs() {
  const params  = new URLSearchParams(location.search);
  const type    = params.get('type')   ?? 'asset';
  const id      = params.get('id')     ?? '';
  const variant = params.get('variant') ?? '';
  const docsId  = params.get('docsId') ?? id;
  const name    = params.get('name')   ?? '';

  if (!id) {
    showNotFound();
    return;
  }

  try { await render(type, id, variant, docsId, name); } catch { /* render errors non-critical for listener */ }

  document.addEventListener('langchange', () => location.reload());
}

async function render(type, id, variant, docsId = id, urlName = '', forceLang = null) {
  const lang = forceLang ?? getLang();
  const layout = document.getElementById('docs-layout');
  if (!layout) return;

  layout.innerHTML = `
    <div class="docs-loading">
      <div class="docs-loading__spinner"></div>
      <span>${t('loading')}</span>
    </div>`;

  const { mdPath, infoPath, backHref, backLabel } = resolvePaths(type, id, variant, docsId, lang);

  const [mdResult, infoResult] = await Promise.allSettled([
    fetchText(mdPath),
    infoPath ? fetchJson(infoPath) : Promise.resolve(null),
  ]);

  if (mdResult.status === 'rejected' || !mdResult.value) {
    showNotFound(layout, backHref, backLabel);
    return;
  }

  const mdText = mdResult.value;
  const info   = infoResult.status === 'fulfilled' ? infoResult.value : null;
  const d      = info?.[lang] ?? info?.en ?? {};
  const status = d.status ?? null;

  // Display name: URL param → camelCase split → kebab-case split
  const displayName = urlName
    || id.replace(/([A-Z])/g, ' $1').trim()
    || id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  document.title = `${displayName} – Docs | HK Productions`;

  // Build TOC
  const tocItems = extractToc(mdText);
  const tocHtml  = tocItems.length
    ? `<nav class="docs-toc" id="docs-toc" aria-label="Inhaltsverzeichnis">
        <p class="docs-toc__title">// contents</p>
        <div class="docs-toc__list">
          ${tocItems.map(h => `
            <a class="docs-toc__item"
               data-level="${h.level}"
               href="#${h.id}">${h.text}</a>`).join('')}
        </div>
      </nav>`
    : '';

  // Render content
  const contentHtml = renderMarkdown(mdText);

  layout.innerHTML = `
    ${tocHtml}
    <article class="docs-article">
      <header class="docs-header">
        <nav class="docs-breadcrumb" aria-label="Breadcrumb">
          <a href="index.html" data-i18n="nav.home">${t('nav.home')}</a>
          <span class="docs-breadcrumb__sep" aria-hidden="true">/</span>
          <a href="${backHref}">${backLabel}</a>
          <span class="docs-breadcrumb__sep" aria-hidden="true">/</span>
          <span aria-current="page">${displayName}</span>
        </nav>
        <h1 class="docs-title">${displayName}</h1>
        <div class="docs-meta">
          ${status ? statusBadge(status) : ''}
          ${info?.version ? `<span class="badge badge--coming" style="border-color:var(--clr-border);color:var(--clr-text-muted)">v${info.version}</span>` : ''}
          ${info?.link && info.link !== 'coming soon...'
            ? `<a href="${info.link}" target="_blank" rel="noopener noreferrer"
                 class="btn btn--ghost btn--sm" style="margin-left:auto">${t('assets.view_store')}</a>`
            : ''}
        </div>
      </header>
      <div class="docs-body" id="docs-body">${contentHtml}</div>
    </article>`;

  // Active TOC highlighting via IntersectionObserver
  try { initTocHighlight(); } catch { /* non-critical */ }
}

function resolvePaths(type, id, variant, docsId, lang) {
  const LANG = lang.toUpperCase();

  if (type === 'asset') {
    return {
      mdPath:    `infos/assets/${id}/Documentation_${LANG}.md`,
      infoPath:  `infos/assets/${id}/info.json`,
      backHref:  'assets.html',
      backLabel: t('nav.assets'),
    };
  }

  if (type === 'app') {
    return {
      mdPath:    `infos/apps/${docsId}/documentation_${LANG}.md`,
      infoPath:  null,
      backHref:  'apps.html',
      backLabel: t('nav.apps'),
    };
  }

  // Game — variant determines subfolder (lighted | shadowed)
  const gameVariant = variant || 'shadowed';
  return {
    mdPath:    `infos/games/tooniom/${gameVariant}/${id}/documentation_${LANG}.md`,
    infoPath:  `infos/games/tooniom/${gameVariant}/${id}/info.json`,
    backHref:  'games.html',
    backLabel: t('nav.games'),
  };
}

function initTocHighlight() {
  const toc      = document.getElementById('docs-toc');
  const body     = document.getElementById('docs-body');
  if (!toc || !body) return;

  const headings = body.querySelectorAll('h1, h2, h3');
  if (!headings.length) return;

  const links = toc.querySelectorAll('.docs-toc__item');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
    });
  }, {
    rootMargin: '-72px 0px -70% 0px',
    threshold: 0,
  });

  headings.forEach(h => { if (h.id) observer.observe(h); });
}

function statusBadge(status) {
  const map = {
    Published:      'badge--published',
    Veröffentlicht: 'badge--published',
    'In Planning':  'badge--planned',
    'In Planung':   'badge--planned',
  };
  const cls = map[status] ?? 'badge--planned';
  const key = cls === 'badge--published' ? 'badges.published' : 'badges.in_planning';
  return `<span class="badge ${cls}">${t(key)}</span>`;
}

function showNotFound(layout, backHref = 'assets.html', backLabel = 'Assets') {
  const el = layout ?? document.getElementById('docs-layout');
  if (!el) return;
  el.innerHTML = `
    <div class="docs-not-found">
      <p style="font-family:var(--font-mono);font-size:var(--text-3xl);color:var(--clr-border)">404</p>
      <p style="margin-top:1rem;color:var(--clr-text-muted)">Dokumentation nicht gefunden.</p>
      <a href="${backHref}" class="btn btn--ghost" style="margin-top:2rem">${backLabel}</a>
    </div>`;
}

async function fetchText(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.text();
  } catch { return null; }
}

async function fetchJson(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

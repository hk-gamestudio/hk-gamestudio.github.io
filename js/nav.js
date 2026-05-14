/**
 * Navigation: active link, scroll class, mobile hamburger, lang toggle wiring.
 */

import { setLang, getLang } from './i18n.js';

export function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;

  markActiveLink();
  initScrollClass(nav);
  initHamburger(nav);
  initLangToggle();
}

function markActiveLink() {
  // Extract first path segment: /assets/asset-creator → 'assets', / → ''
  const segs    = location.pathname.split('/').filter(Boolean);
  const section = segs[0] ?? '';

  document.querySelectorAll('.nav__link[data-page]').forEach(link => {
    link.classList.toggle('active', link.dataset.page === section);
  });
}

function initScrollClass(nav) {
  const threshold = 40;
  const update = () => nav.classList.toggle('scrolled', window.scrollY > threshold);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initHamburger(nav) {
  const burger = nav.querySelector('.nav__hamburger');
  const links  = nav.querySelector('.nav__links');
  if (!burger || !links) return;

  burger.addEventListener('click', () => {
    const isOpen = burger.classList.toggle('open');
    links.classList.toggle('open', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  links.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      links.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  document.addEventListener('click', e => {
    if (!nav.contains(e.target) && links.classList.contains('open')) {
      burger.classList.remove('open');
      links.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });
}

function initLangToggle() {
  document.querySelectorAll('.lang-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const next = getLang() === 'de' ? 'en' : 'de';
      setLang(next);
    });
  });
}

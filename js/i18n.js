/**
 * Lightweight i18n module.
 * Loads /i18n/{lang}.json, stores in module cache, translates DOM via data-i18n.
 */

const cache = {};
let currentLang = 'de';

export async function initI18n() {
  const stored  = localStorage.getItem('hk-lang');
  const browser = navigator.language?.slice(0, 2) ?? 'de';
  currentLang   = stored ?? (['de', 'en'].includes(browser) ? browser : 'de');

  document.documentElement.lang = currentLang;
  await loadLang(currentLang);
  applyTranslations();
  updateLangToggle();
}

export async function setLang(lang) {
  if (lang === currentLang) return;
  currentLang = lang;
  localStorage.setItem('hk-lang', lang);
  document.documentElement.lang = lang;
  await loadLang(lang);
  applyTranslations();
  updateLangToggle();

  document.dispatchEvent(new CustomEvent('langchange', { detail: { lang } }));
}

export function getLang() { return currentLang; }

export function t(keyPath) {
  const strings = cache[currentLang];
  if (!strings) return keyPath;
  return keyPath.split('.').reduce((obj, key) => obj?.[key], strings) ?? keyPath;
}

export function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (val !== key) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    const val = t(key);
    if (val !== key) el.innerHTML = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    const val = t(key);
    if (val !== key) el.placeholder = val;
  });

  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.dataset.i18nTitle;
    const val = t(key);
    if (val !== key) el.title = val;
  });
}

async function loadLang(lang) {
  if (cache[lang]) return;
  try {
    const res = await fetch(`/i18n/${lang}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    cache[lang] = await res.json();
  } catch (err) {
    console.warn(`[i18n] Failed to load ${lang}.json:`, err);
    cache[lang] = {};
  }
}

function updateLangToggle() {
  document.querySelectorAll('.lang-toggle__opt').forEach(opt => {
    opt.classList.toggle('active', opt.dataset.lang === currentLang);
  });
}

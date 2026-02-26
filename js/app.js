const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

const yearEl = qs("#year");
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

// -------------------- Theme --------------------
const themeBtn = qs("#themeBtn");
const THEME_KEY = "hs_theme";

function setTheme(mode) {
  document.body.classList.toggle("light", mode === "light");
  localStorage.setItem(THEME_KEY, mode);
  if (themeBtn) themeBtn.textContent = mode === "light" ? "☀️" : "🌙";
}

setTheme(localStorage.getItem(THEME_KEY) === "light" ? "light" : "dark");

themeBtn?.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  setTheme(isLight ? "dark" : "light");
});

// -------------------- Language --------------------
const LANG_KEY = "hs_lang";
const langBtn = qs("#langBtn");
const langMenu = qs("#langMenu");
const langLabel = qs("#langLabel");

let dictionary = {};

function getLang() {
  const saved = localStorage.getItem(LANG_KEY);
  return saved === "en" ? "en" : "hu";
}

async function loadLang(lang) {
  const safeLang = lang === "en" ? "en" : "hu";
  try {
    const res = await fetch(`i18n/${safeLang}.json`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Failed to load i18n/${safeLang}.json`);
    dictionary = await res.json();
    localStorage.setItem(LANG_KEY, safeLang);

    document.documentElement.lang = safeLang;
    if (langLabel) langLabel.textContent = safeLang.toUpperCase();

    applyTranslations();
  } catch (e) {
    console.error(e);
  }
}

function t(key) {
  return dictionary?.[key] ?? key;
}

function applyTranslations() {
  qsa("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    el.textContent = t(key);
  });

  // Optional: page title could be localized too
  document.title = t("siteTitle") || "Horvath-Systems";
}

// Language dropdown UX
function setLangMenuOpen(open) {
  if (!langMenu || !langBtn) return;
  langMenu.classList.toggle("open", open);
  langBtn.setAttribute("aria-expanded", open ? "true" : "false");
}

langBtn?.addEventListener("click", (e) => {
  e.preventDefault();
  const isOpen = langMenu?.classList.contains("open");
  setLangMenuOpen(!isOpen);
});

document.addEventListener("click", (e) => {
  const target = e.target;
  if (!langMenu || !langBtn) return;
  if (langMenu.contains(target) || langBtn.contains(target)) return;
  setLangMenuOpen(false);
});

qsa("[data-lang]").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const lang = btn.getAttribute("data-lang");
    setLangMenuOpen(false);
    await loadLang(lang);
  });
});

// -------------------- Routing (single HTML) --------------------
const pages = qsa(".page");
const navLinks = qsa(".nav__link");

function getRoute() {
  const hash = (location.hash || "#home").replace("#", "").trim();
  if (hash === "privacy" || hash === "terms" || hash === "home") return hash;
  return "home";
}

function showPage(route) {
  pages.forEach((p) => {
    const isActive = p.getAttribute("data-page") === route;
    p.hidden = !isActive;
  });

  navLinks.forEach((a) => {
    const isActive = a.getAttribute("data-route") === route;
    a.classList.toggle("active", isActive);
  });
}

window.addEventListener("hashchange", () => showPage(getRoute()));
showPage(getRoute());

// Boot language
loadLang(getLang());
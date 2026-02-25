const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

const THEME_KEY = "hs_theme";
const LANG_KEY = "hs_lang";

let I18N = {};
let currentLang = "hu";

function t(key, fallback = "") {
  return (I18N && I18N[key] != null) ? I18N[key] : fallback;
}

function updateYear() {
  qsa("#year").forEach((el) => (el.textContent = String(new Date().getFullYear())));
}

// -----------------------
// Mobile menu
// -----------------------
const burger = qs("#burger");
const mobileNav = qs("#mobileNav");

function closeMobileNav() {
  mobileNav?.classList.remove("open");
  burger?.classList.remove("open");
  document.body.classList.remove("menu-open");
}

burger?.addEventListener("click", () => {
  mobileNav?.classList.toggle("open");
  burger?.classList.toggle("open");
  const isOpen = mobileNav?.classList.contains("open");
  document.body.classList.toggle("menu-open", !!isOpen);
});

qsa(".mobile-nav a").forEach((a) => a.addEventListener("click", closeMobileNav));


// -----------------------
// Theme (dark/light)
// -----------------------
const themeBtn = qs("#themeBtn");

function setTheme(mode) {
  document.body.classList.toggle("light", mode === "light");
  localStorage.setItem(THEME_KEY, mode);
  if (themeBtn) themeBtn.textContent = mode === "light" ? "☀️" : "🌙";
}

const savedTheme = localStorage.getItem(THEME_KEY);
setTheme(savedTheme === "light" ? "light" : "dark");

themeBtn?.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  setTheme(isLight ? "dark" : "light");
});

// -----------------------
// i18n (JSON) loader + applier
// -----------------------
function applyLang(lang) {
  // textContent nodes
  qsa("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    const val = t(key);
    if (val != null && val !== "") el.textContent = val;
  });

  // innerHTML nodes (formatted)
  qsa("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (!key) return;
    const val = t(key);
    if (val != null && val !== "") el.innerHTML = val;
  });

  // attributes (e.g. meta content, href, aria-label)
  qsa("[data-i18n-attr]").forEach((el) => {
    const spec = el.getAttribute("data-i18n-attr") || "";
    // format: "attr:key;attr2:key2"
    spec.split(";").map(s => s.trim()).filter(Boolean).forEach(pair => {
      const [attr, key] = pair.split(":").map(s => (s || "").trim());
      if (!attr || !key) return;
      const val = t(key);
      if (val != null && val !== "") el.setAttribute(attr, val);
    });
  });

  // highlight active language buttons
  qsa("[data-lang]").forEach((b) => {
    b.classList.toggle("active", b.getAttribute("data-lang") === lang);
  });

  // set html lang
  document.documentElement.setAttribute("lang", lang);

  // year (might be inside translated HTML)
  updateYear();
}

async function loadLang(lang) {
  const safe = (lang === "en" || lang === "hu") ? lang : "en";
  currentLang = safe;

  try {
    const base = new URL('.', window.location.href);
    const url = new URL(`i18n/${safe}.json`, base);
    url.searchParams.set('v','1');
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load i18n/${safe}.json`);
    I18N = await res.json();
  } catch (e) {
    // Fallback: keep UI usable even if fetch fails
    console.warn(e);
    I18N = {};
  }

  localStorage.setItem(LANG_KEY, safe);
  applyLang(safe);
}

function initLangSwitcher() {
  const saved = localStorage.getItem(LANG_KEY);
  const initial = (saved === "en" || saved === "hu") ? saved : "hu";

  qsa("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (lang) loadLang(lang);
    });
  });

  loadLang(initial);
}

initLangSwitcher();

// -----------------------
// Email copy + toast
// -----------------------
const copyBtn = qs("#copyBtn");
const toast = qs("#toast");

function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.style.opacity = "1";
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => {
    toast.style.opacity = "0.9";
    toast.textContent = "";
  }, 1600);
}

copyBtn?.addEventListener("click", async () => {
  const text = copyBtn.getAttribute("data-copy") || "";
  try {
    await navigator.clipboard.writeText(text);
    showToast(t("toast.copied", "Copied ✅"));
  } catch {
    showToast(t("toast.copyfail", "Copy failed 😅"));
  }
});

// -----------------------
// Count-up stats
// -----------------------
const statNums = qsa(".stat-num");
const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

function animateCount(el) {
  const target = Number(el.getAttribute("data-count") || "0");
  if (!Number.isFinite(target)) return;

  if (prefersReduced) {
    el.textContent = String(target);
    return;
  }

  const duration = 900;
  const start = performance.now();
  const from = 0;

  const tick = (tNow) => {
    const p = Math.min(1, (tNow - start) / duration);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(from + (target - from) * eased);
    el.textContent = String(val);
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      if (e.isIntersecting) {
        animateCount(e.target);
        io.unobserve(e.target);
      }
    }
  },
  { threshold: 0.45 }
);

statNums.forEach((el) => io.observe(el));

const closeBtn = document.querySelector("#closeMobileNav");
closeBtn?.addEventListener("click", closeMobileNav);

// close when clicking outside the sheet
mobileNav?.addEventListener("click", (e) => {
  if (e.target === mobileNav) closeMobileNav();
});

// theme button inside mobile drawer
const themeBtnMobile = document.querySelector("#themeBtnMobile");
themeBtnMobile?.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  setTheme(isLight ? "dark" : "light");
});
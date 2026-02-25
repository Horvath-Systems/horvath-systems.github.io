const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

const yearEl = qs("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Theme (dark/light) with localStorage
const themeBtn = qs("#themeBtn");
const THEME_KEY = "hs_theme";

function setTheme(mode) {
  document.body.classList.toggle("light", mode === "light");
  localStorage.setItem(THEME_KEY, mode);
  if (themeBtn) themeBtn.textContent = mode === "light" ? "☀️" : "🌙";
}

const saved = localStorage.getItem(THEME_KEY);
setTheme(saved === "light" ? "light" : "dark");

themeBtn?.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  setTheme(isLight ? "dark" : "light");
});

// Email copy + toast
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
    showToast("Kimásolva ✅");
  } catch {
    showToast("Nem sikerült másolni 😅");
  }
});

// Count-up stats (simple + smooth)
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

  const tick = (t) => {
    const p = Math.min(1, (t - start) / duration);
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

// Mobile nav open style
const style = document.createElement("style");
style.textContent = `
  .mobile-nav.open{ display:block; animation: drop .18s ease-out; }
  @keyframes drop { from{ opacity:0; transform: translateY(-6px);} to{ opacity:1; transform: translateY(0);} }
`;
document.head.appendChild(style);

// =======================
// i18n (HU/EN) switcher
// =======================
const LANG_KEY = "hs_lang";

const I18N = {
  hu: {
    "menu.title": "Menü",
    "menu.site": "Oldal",
    "menu.legal": "Jogi",
    "nav.terms": "Felhasználási feltételek",
    "nav.support": "Támogatás",

    // NAV + CTAs
    "nav.services": "Szolgáltatások",
    "nav.projects": "Projektek",
    "nav.about": "Rólam",
    "nav.contact": "Kapcsolat",
    "nav.privacy": "Adatkezelési tájékoztató",
    "cta.quote": "Kérj ajánlatot",
    "cta.work": "Nézd a munkáim",
    "cta.what": "Mit csinálok?",

    // HERO
    "hero.pill": "Modern web • app • automatizálás",
    "hero.h1a": "Buildeljünk",
    "hero.h1b": "menő",
    "hero.h1c": "rendszereket.",
    "hero.lead":
      "Horvath Systems — gyors, tiszta és skálázható megoldások. Weboldalak, admin felületek, mobil appok, integrációk, automatizálás.",

    // SECTION TITLES
    "services.title": "Szolgáltatások",
    "projects.title": "Projektek",
    "about.title": "Rólam",
    "contact.title": "Kapcsolat",

    // FOOTER
    "footer.top": "Top",
    "footer.services": "Szolgáltatások",
    "footer.projects": "Projektek",
    "footer.contact": "Kapcsolat",

    // PRIVACY PAGE
    "privacy.pill": "Adatvédelem",
    "privacy.h1a": "Adatkezelési tájékoztató",
    "privacy.h1b": "Book Manager",
    "privacy.back": "Vissza a főoldalra",
    "privacy.contact": "Kapcsolat",
    "privacy.body": `
      <p><strong>Privacy Policy – Book Manager</strong></p>

      <p>Ez az alkalmazás nem gyűjt, nem tárol, és nem oszt meg személyes adatot.</p>

      <p>
        A felhasználó által megadott adatok (pl. könyvcím, szerző, ISBN)
        kizárólag a felhasználó eszközén, helyben kerülnek tárolásra.
      </p>

      <p>
        Az alkalmazás nem használ analitikát, trackinget, hirdetést, vagy
        harmadik féltől származó adatgyűjtő szolgáltatásokat.
      </p>

      <p>Felhasználói fiók vagy regisztráció nem szükséges.</p>

      <p>
        <strong>Kapcsolat:</strong><br />
        Kérdés esetén írj ide:
        <a href="mailto:Horvath-Systems@proton.me">Horvath-Systems@proton.me</a>
      </p>
    `,
  },

  en: {
    // NAV + CTAs
    "nav.services": "Services",
    "nav.projects": "Projects",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.privacy": "Privacy Policy",
    "cta.quote": "Request a quote",
    "cta.work": "View my work",
    "cta.what": "What I do",

    // HERO
    "hero.pill": "Modern web • apps • automation",
    "hero.h1a": "Let’s build",
    "hero.h1b": "modern",
    "hero.h1c": "systems.",
    "hero.lead":
      "Horvath Systems — fast, clean, scalable solutions. Websites, admin dashboards, mobile apps, integrations, automation.",

    // SECTION TITLES
    "services.title": "Services",
    "projects.title": "Projects",
    "about.title": "About",
    "contact.title": "Contact",

    // FOOTER
    "footer.top": "Top",
    "footer.services": "Services",
    "footer.projects": "Projects",
    "footer.contact": "Contact",

    // PRIVACY PAGE
    "privacy.pill": "Privacy",
    "privacy.h1a": "Privacy Policy",
    "privacy.h1b": "Book Manager",
    "privacy.back": "Back to Home",
    "privacy.contact": "Contact",
    "privacy.body": `
      <p><strong>Privacy Policy – Book Manager</strong></p>

      <p>This application does not collect, store, or share any personal data.</p>

      <p>
        All data entered by the user (such as book titles, authors, ISBN numbers)
        is stored locally on the user's device only.
      </p>

      <p>
        The app does not use analytics, tracking, advertising, or third-party
        data collection services.
      </p>

      <p>No user account or registration is required.</p>

      <p>
        <strong>Contact:</strong><br />
        If you have any questions, please contact:
        <a href="mailto:Horvath-Systems@proton.me">Horvath-Systems@proton.me</a>
      </p>
    `,
  },
};

function applyLang(lang) {
  const dict = I18N[lang] || I18N.en;

  // textContent nodes
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;
    if (dict[key] != null) el.textContent = dict[key];
  });

  // innerHTML nodes (for formatted blocks)
  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    if (!key) return;
    if (dict[key] != null) el.innerHTML = dict[key];
  });

  // highlight active buttons
  document.querySelectorAll("[data-lang]").forEach((b) => {
    b.classList.toggle("active", b.getAttribute("data-lang") === lang);
  });

  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.setAttribute("lang", lang);
}

function initLangSwitcher() {
  const saved = localStorage.getItem(LANG_KEY) || "hu";

  document.querySelectorAll("[data-lang]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lang = btn.getAttribute("data-lang");
      if (lang) applyLang(lang);
    });
  });

  applyLang(saved);
}

initLangSwitcher();

// ===== Mobile menu (bulletproof) =====
const burger = document.querySelector("#burger");
const mobileNav = document.querySelector("#mobileNav");
const closeBtn = document.querySelector("#closeMobileNav");

function openMobileNav() {
  if (!mobileNav) return;
  mobileNav.classList.add("open");
  document.body.classList.add("menu-open");
  burger?.setAttribute("aria-expanded", "true");
  mobileNav.setAttribute("aria-hidden", "false");
}

function closeMobileNav() {
  if (!mobileNav) return;
  mobileNav.classList.remove("open");
  document.body.classList.remove("menu-open");
  burger?.setAttribute("aria-expanded", "false");
  mobileNav.setAttribute("aria-hidden", "true");
}

burger?.addEventListener("click", (e) => {
  e.preventDefault();
  if (!mobileNav) return;
  mobileNav.classList.contains("open") ? closeMobileNav() : openMobileNav();
});

closeBtn?.addEventListener("click", closeMobileNav);

// close on overlay click (only if clicked outside the sheet)
mobileNav?.addEventListener("click", (e) => {
  if (e.target === mobileNav) closeMobileNav();
});

// close on ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMobileNav();
});

// close when clicking any menu link
document.querySelectorAll("#mobileNav a").forEach((a) => {
  a.addEventListener("click", () => closeMobileNav());
});

// mobile theme button
const themeBtnMobile = document.querySelector("#themeBtnMobile");
themeBtnMobile?.addEventListener("click", () => {
  const isLight = document.body.classList.contains("light");
  setTheme(isLight ? "dark" : "light");
});

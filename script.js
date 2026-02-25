const qs = (s, p = document) => p.querySelector(s);
const qsa = (s, p = document) => [...p.querySelectorAll(s)];

const yearEl = qs("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Mobile menu
const burger = qs("#burger");
const mobileNav = qs("#mobileNav");

function closeMobileNav() {
  mobileNav?.classList.remove("open");
  burger?.classList.remove("open");
}
burger?.addEventListener("click", () => {
  mobileNav?.classList.toggle("open");
  burger?.classList.toggle("open");
});

qsa(".mobile-nav a").forEach((a) =>
  a.addEventListener("click", () => closeMobileNav())
);

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
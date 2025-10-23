/* ---------- DARK MODE ---------- */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const storedTheme = localStorage.getItem('theme') ||
  (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

html.setAttribute('data-theme', storedTheme);

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

/* ---------- NAVIGATION ---------- */
class NavigationManager {
  constructor(navToggleId, navMenuId) {
    this.navToggle = document.getElementById(navToggleId);
    this.navMenu = document.getElementById(navMenuId);
    this.bindEvents();
  }
  bindEvents() {
    if (!this.navToggle || !this.navMenu) return;
    this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
          // ensure focus after scroll for accessibility
          targetEl.setAttribute('tabindex', '-1');
          targetEl.focus({ preventScroll: true });
          this.closeMobileMenu();
        }
      });
    });
  }
  toggleMobileMenu() {
    const isActive = this.navMenu.classList.toggle('active');
    this.navToggle.classList.toggle('active');
    this.navToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    document.body.style.overflow = isActive ? 'hidden' : '';
  }
  closeMobileMenu() {
    this.navMenu.classList.remove('active');
    this.navToggle.classList.remove('active');
    this.navToggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
}

/* ---------- CARD ACCESSIBILITY ---------- */
function enhanceCards() {
  document.querySelectorAll('.feature-card, .agent-card').forEach(card => {
    if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

/* ---------- SCROLL ANIMATIONS ---------- */
function animateOnScroll() {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.animate-on-scroll').forEach(el => el.classList.add('show'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
}

/* ---------- PWA SERVICE WORKER ---------- */
async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch (err) {
      console.warn('Service Worker registration failed:', err);
    }
  }
}

/* ---------- INIT ---------- */
document.addEventListener('DOMContentLoaded', () => {
  new NavigationManager('navToggle', 'navMenu');
  enhanceCards();
  animateOnScroll();
  registerSW();
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

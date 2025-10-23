/* THEME */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const initTheme = savedTheme || (prefersDark ? 'dark' : 'light');
html.setAttribute('data-theme', initTheme);
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
}

/* NAVIGATION */
class NavigationManager {
  constructor(navToggleId='navToggle', navMenuId='navMenu'){
    this.navToggle = document.getElementById(navToggleId);
    this.navMenu = document.getElementById(navMenuId);
    this.init();
  }
  init(){
    if (!this.navToggle || !this.navMenu) return;
    this.navToggle.addEventListener('click', ()=>this.toggle());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.close(); });
    document.querySelectorAll('.nav-link').forEach(link=>{
      link.addEventListener('click', e=>{
        e.preventDefault();
        const id = link.getAttribute('href').slice(1);
        const el = document.getElementById(id);
        if (el){
          el.scrollIntoView({behavior:'smooth'});
          el.setAttribute('tabindex','-1');
          el.focus({preventScroll:true});
        }
        this.close();
      });
    });
  }
  toggle(){
    const isActive = this.navMenu.classList.toggle('active');
    this.navToggle.classList.toggle('active');
    this.navToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    document.body.style.overflow = isActive ? 'hidden' : '';
  }
  close(){
    this.navMenu.classList.remove('active');
    this.navToggle.classList.remove('active');
    this.navToggle.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  }
}

/* CARD ACCESSIBILITY */
function enhanceCards(){
  document.querySelectorAll('.feature-card, .agent-card, .tool-mini-card').forEach(card=>{
    if (!card.hasAttribute('role')) card.setAttribute('role','button');
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex','0');
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
    });
  });
}

/* SCROLL ANIMATIONS */
function animateOnScroll(){
  const prefersReduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduce) { document.querySelectorAll('.animate-on-scroll').forEach(el=>el.classList.add('show')); return; }
  const obs = new IntersectionObserver((entries, o) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('show'); o.unobserve(entry.target); }
    });
  }, {threshold:0.12});
  document.querySelectorAll('.animate-on-scroll').forEach(el => obs.observe(el));
}

/* FETCH MONITOR (frontend) */
async function fetchMonitor(){
  try {
    const res = await fetch('https://trini-monitor.your-subdomain.workers.dev');
    if (!res.ok) {
      // if problem+json, show detail
      const ct = res.headers.get('Content-Type') || '';
      if (ct.includes('problem+json')) {
        const p = await res.json();
        appendMonitorStatus(`Monitor: ${p.title} — ${p.detail}`);
      }
      return;
    }
    const data = await res.json();
    appendMonitorStatus(`Threats: ${data.threats ?? 0} | Bill: ${data.bill ?? '$0.00'}`);
  } catch (err) {
    console.warn('Monitor fetch failed', err);
  }
}
function appendMonitorStatus(text){
  const container = document.querySelector('.diagram');
  if (!container) return;
  const p = document.createElement('p');
  p.textContent = text;
  p.style.marginTop = '0.6rem';
  container.appendChild(p);
}

/* SERVICE WORKER REGISTRATION */
async function registerSW(){
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch (err) {
      console.warn('SW register failed', err);
    }
  }
}

/* TOGGLE CARD (tool drawer etc) */
function toggleCard(id){ const c = document.getElementById(id); c?.classList.toggle('open'); }

/* INIT */
document.addEventListener('DOMContentLoaded', () => {
  new NavigationManager('navToggle','navMenu');
  enhanceCards();
  animateOnScroll();
  fetchMonitor();
  registerSW();
  const yearEl = document.getElementById('year'); if (yearEl) yearEl.textContent = new Date().getFullYear();
});

/* ══════════════════════════════════════════
   SITELAB · script.js
   ══════════════════════════════════════════ */

// ── DARK MODE ──
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;
const saved = localStorage.getItem('sitelab-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
html.setAttribute('data-theme', saved || (prefersDark ? 'dark' : 'light'));

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('sitelab-theme', next);
  });
}

// ── NAVBAR SCROLL ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });
}

// ── SCROLL REVEAL ──
const reveals = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); }
  }),
  { threshold: 0.1, rootMargin: '0px 0px -48px 0px' }
);
reveals.forEach(el => revealObserver.observe(el));

// ── ACTIVE NAV LINK ──
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const activeObserver = new IntersectionObserver(
  (entries) => entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => {
        a.style.fontWeight = '';
        if (a.getAttribute('href') === `#${e.target.id}`) a.style.fontWeight = '800';
      });
    }
  }),
  { threshold: 0.45 }
);
sections.forEach(s => activeObserver.observe(s));

// ── FORM → EmailJS ──
emailjs.init('4nQ9itKFdfB-fenXS');

const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const textoOriginal = btn.textContent;

    btn.textContent = 'Enviando...';
    btn.disabled = true;

    try {
      await emailjs.sendForm('service_bsp6hhf', 'template_ppkkehs', form);

      btn.textContent = '¡Mensaje enviado! ✓';
      btn.style.background = 'var(--teal)';
      btn.style.borderColor = 'var(--teal)';
      form.reset();

      setTimeout(() => {
        btn.textContent = textoOriginal;
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.disabled = false;
      }, 4000);

    } catch (error) {
      btn.textContent = 'Error — escríbenos por WhatsApp';
      btn.style.background = 'var(--coral)';
      btn.style.borderColor = 'var(--coral)';

      setTimeout(() => {
        btn.textContent = textoOriginal;
        btn.style.background = '';
        btn.style.borderColor = '';
        btn.disabled = false;
      }, 4000);
    }
  });
}

// ── SMOOTH SCROLL ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 72, behavior: 'smooth' });
    }
  });
});

// ── TEXT TO SPEECH (accesibilidad) ──
const ttsBtn = document.getElementById('ttsToggle');

if (ttsBtn && 'speechSynthesis' in window) {
  let speaking = false;

  // Extrae el texto legible de la página, excluyendo nav, footer y scripts
  function getPageText() {
    const skipSelectors = ['nav', 'footer', 'script', 'style', '.tts-toggle', '.theme-toggle', '.wsp-float'];
    const clone = document.body.cloneNode(true);
    skipSelectors.forEach(sel => clone.querySelectorAll(sel).forEach(el => el.remove()));
    // Obtener texto limpio
    return clone.innerText
      .replace(/\n{3,}/g, '\n\n')   // reducir saltos múltiples
      .replace(/[→←↑↓]/g, '')       // quitar flechas decorativas
      .trim();
  }

  function startTTS() {
    window.speechSynthesis.cancel();
    const text  = getPageText();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang  = 'es-CL';
    utterance.rate  = 0.92;   // un poco más lento que lo normal — más fácil de seguir
    utterance.pitch = 1.05;

    // Intentar voz en español si existe
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es')) || null;
    if (esVoice) utterance.voice = esVoice;

    utterance.onend = () => stopTTS();
    utterance.onerror = () => stopTTS();

    window.speechSynthesis.speak(utterance);
    speaking = true;

    // Actualizar ícono
    ttsBtn.querySelector('.icon-tts-play').style.display = 'none';
    ttsBtn.querySelector('.icon-tts-stop').style.display = 'block';
    ttsBtn.classList.add('tts-active');
    ttsBtn.setAttribute('aria-label', 'Detener lectura');
    ttsBtn.title = 'Detener lectura';
  }

  function stopTTS() {
    window.speechSynthesis.cancel();
    speaking = false;
    ttsBtn.querySelector('.icon-tts-play').style.display = 'block';
    ttsBtn.querySelector('.icon-tts-stop').style.display = 'none';
    ttsBtn.classList.remove('tts-active');
    ttsBtn.setAttribute('aria-label', 'Leer página en voz alta');
    ttsBtn.title = 'Leer en voz alta';
  }

  // Las voces pueden cargarse de forma asíncrona en algunos navegadores
  window.speechSynthesis.onvoiceschanged = () => {};

  ttsBtn.addEventListener('click', () => speaking ? stopTTS() : startTTS());

  // Detener si se sale de la página
  window.addEventListener('beforeunload', () => window.speechSynthesis.cancel());

} else if (ttsBtn) {
  // Navegador sin soporte — ocultar el botón
  ttsBtn.style.display = 'none';
}

// ── FAQ accordion ──
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    // Cierra todos
    document.querySelectorAll('.faq-item.open').forEach(i => {
      i.classList.remove('open');
      i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
    });
    // Abre el clickeado si estaba cerrado
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
});

// ── Menú hamburguesa ──
const hamburger = document.getElementById('navHamburger');
const mobileMenu = document.getElementById('navMobileMenu');
const overlay = document.getElementById('navOverlay');
const mobileClose = document.getElementById('navMobileClose');

function openMenu() {
  hamburger.classList.add('open');
  mobileMenu.classList.add('open');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeMenu() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger?.addEventListener('click', openMenu);
mobileClose?.addEventListener('click', closeMenu);
overlay?.addEventListener('click', closeMenu);

// Cierra al hacer click en cualquier link del menú
document.querySelectorAll('.nav-mobile-links a').forEach(a => {
  a.addEventListener('click', closeMenu);
});
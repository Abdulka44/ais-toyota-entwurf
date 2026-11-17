// AIS Toyota – kleine, abhängigkeitsfreie Interaktionen
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mega-Menü (Desktop) */
  const megaButtons = [...document.querySelectorAll('[data-mega]')];
  const closeAllMega = (except) => megaButtons.forEach((b) => {
    if (b === except) return;
    b.setAttribute('aria-expanded', 'false');
    document.getElementById(b.getAttribute('aria-controls'))?.classList.add('hidden');
  });
  megaButtons.forEach((btn) => {
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      closeAllMega(btn);
      btn.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('hidden', !open);
    });
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('[data-header]')) closeAllMega(); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const openBtn = megaButtons.find((b) => b.getAttribute('aria-expanded') === 'true');
    closeAllMega();
    openBtn?.focus();
    closeMenu();
  });

  /* Mobiles Menü */
  const menu = document.getElementById('mobile-menu');
  const openBtn = document.querySelector('[data-menu-open]');
  const closeBtn = document.querySelector('[data-menu-close]');
  // Alles außer dem Dialog unbedienbar machen, damit der Fokus im Menü bleibt
  const setBackgroundInert = (on) => {
    [...document.body.children].forEach((el) => {
      if (el === menu || el.tagName === 'SCRIPT') return;
      el.inert = on;
    });
  };
  function openMenu() {
    menu.classList.remove('hidden');
    openBtn.setAttribute('aria-expanded', 'true');
    setBackgroundInert(true);
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }
  function closeMenu() {
    if (!menu || menu.classList.contains('hidden')) return;
    menu.classList.add('hidden');
    openBtn.setAttribute('aria-expanded', 'false');
    setBackgroundInert(false);
    document.body.style.overflow = '';
    openBtn.focus();
  }
  openBtn?.addEventListener('click', openMenu);
  closeBtn?.addEventListener('click', closeMenu);

  /* Hero-Slider: Autoplay mit Pause/Play-Button (WCAG 2.2.2) */
  document.querySelectorAll('[data-slider]').forEach((root) => {
    const slides = [...root.querySelectorAll('[data-slide]')];
    const dots = [...root.querySelectorAll('[data-dot]')];
    const track = root.querySelector('[data-track]');
    const toggle = root.querySelector('[data-toggle]');
    let i = 0, timer = null;
    let playing = !reduceMotion;   // vom Nutzer gesteuert
    let hold = false;              // vorübergehend bei Hover/Fokus
    const show = (n, manual) => {
      i = (n + slides.length) % slides.length;
      track.setAttribute('aria-live', manual ? 'polite' : 'off');
      slides.forEach((s, k) => s.hidden = k !== i);
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    };
    const stop = () => { clearInterval(timer); timer = null; };
    const start = () => { stop(); if (playing && !hold) timer = setInterval(() => show(i + 1, false), 6000); };
    const renderToggle = () => {
      toggle.setAttribute('aria-label', playing ? 'Automatischen Bildwechsel anhalten' : 'Automatischen Bildwechsel starten');
      toggle.querySelector('[data-icon-pause]').classList.toggle('hidden', !playing);
      toggle.querySelector('[data-icon-play]').classList.toggle('hidden', playing);
    };
    toggle?.addEventListener('click', () => { playing = !playing; renderToggle(); start(); });
    const manual = (n) => { show(n, true); start(); };
    root.querySelector('[data-prev]')?.addEventListener('click', () => manual(i - 1));
    root.querySelector('[data-next]')?.addEventListener('click', () => manual(i + 1));
    dots.forEach((d, k) => d.addEventListener('click', () => manual(k)));
    root.addEventListener('mouseenter', () => { hold = true; stop(); });
    root.addEventListener('mouseleave', () => { hold = false; start(); });
    root.addEventListener('focusin', () => { hold = true; stop(); });
    root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) { hold = false; start(); } });
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') manual(i - 1);
      if (e.key === 'ArrowRight') manual(i + 1);
    });
    let x0 = null;
    root.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    root.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) manual(dx < 0 ? i + 1 : i - 1);
      x0 = null;
    });
    renderToggle();
    start();
  });

  /* YouTube erst nach Klick laden (Datenschutz) */
  document.querySelectorAll('[data-video]').forEach((box) => {
    box.querySelector('[data-video-play]')?.addEventListener('click', () => {
      const f = document.createElement('iframe');
      f.src = box.dataset.video;
      f.title = 'AIS Dresden App – Video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      f.className = 'absolute inset-0 h-full w-full';
      box.replaceChildren(f);
      f.focus();
    });
  });
})();

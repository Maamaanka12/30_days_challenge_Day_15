/* ==========================================================================
   WELLKEPT — interactions
   ========================================================================== */
(function () {
  'use strict';

  /* --- Footer year ------------------------------------------------------ */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* --- Header shadow on scroll ------------------------------------------ */
  const header = document.getElementById('siteHeader');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* --- Mobile navigation ------------------------------------------------ */
  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');

  const closeMenu = () => {
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open menu');
  };

  navToggle.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => {
    if (!header.contains(e.target)) closeMenu();
  });

  /* --- Highlight the section currently in view -------------------------- */
  const navLinks = Array.from(nav.querySelectorAll('a[href^="#"]'));
  const sections = navLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(section => navObserver.observe(section));
  }

  /* --- Scroll reveal ---------------------------------------------------- */
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('reveal-in');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach(item => revealObserver.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('reveal-in'));
  }

  /* --- Before / after comparison slider -------------------------------- */
  const compare = document.getElementById('compare');
  const handle = document.getElementById('compareHandle');

  if (compare && handle) {
    let dragging = false;

    const setPosition = clientX => {
      const rect = compare.getBoundingClientRect();
      if (!rect.width) return;
      let pos = ((clientX - rect.left) / rect.width) * 100;
      pos = Math.min(100, Math.max(0, pos));
      compare.style.setProperty('--pos', pos + '%');
      handle.setAttribute('aria-valuenow', String(Math.round(pos)));
    };

    compare.addEventListener('pointerdown', e => {
      dragging = true;
      compare.setPointerCapture(e.pointerId);
      setPosition(e.clientX);
    });
    compare.addEventListener('pointermove', e => { if (dragging) setPosition(e.clientX); });
    const stopDrag = () => { dragging = false; };
    compare.addEventListener('pointerup', stopDrag);
    compare.addEventListener('pointercancel', stopDrag);
    compare.addEventListener('lostpointercapture', stopDrag);

    handle.addEventListener('keydown', e => {
      const current = Number(handle.getAttribute('aria-valuenow')) || 50;
      let next = null;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = current - 3;
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = current + 3;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = 100;
      if (next === null) return;
      e.preventDefault();
      next = Math.min(100, Math.max(0, next));
      compare.style.setProperty('--pos', next + '%');
      handle.setAttribute('aria-valuenow', String(Math.round(next)));
    });
  }

  /* --- Pricing frequency toggle ---------------------------------------- */
  const freqButtons = document.querySelectorAll('.frequency-btn');
  const priceAmounts = document.querySelectorAll('.price .amount');

  freqButtons.forEach(button => {
    button.addEventListener('click', () => {
      const freq = button.dataset.freq;
      freqButtons.forEach(btn => {
        const active = btn === button;
        btn.classList.toggle('is-active', active);
        btn.setAttribute('aria-pressed', String(active));
      });
      priceAmounts.forEach(amount => {
        const value = amount.dataset[freq];
        if (!value) return;
        amount.textContent = value;
        amount.classList.remove('is-changing');
        void amount.offsetWidth;
        amount.classList.add('is-changing');
      });
    });
  });

  /* --- Booking form ----------------------------------------------------- */
  const form = document.getElementById('bookingForm');
  const status = document.getElementById('formStatus');
  const dateInput = document.getElementById('date');

  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

  if (form && status) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const fields = form.querySelectorAll('input[required], select[required]');
      fields.forEach(field => {
        field.closest('.field').classList.toggle('is-invalid', !field.checkValidity());
      });

      if (!form.checkValidity()) {
        status.textContent = 'Please complete the highlighted fields.';
        const firstInvalid = form.querySelector('.is-invalid input, .is-invalid select');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      status.textContent = "Thanks! Your request is in — we'll confirm within one business day.";
      form.reset();
      fields.forEach(field => field.closest('.field').classList.remove('is-invalid'));
    });

    form.querySelectorAll('input, select').forEach(field => {
      field.addEventListener('input', () => field.closest('.field').classList.remove('is-invalid'));
      field.addEventListener('change', () => field.closest('.field').classList.remove('is-invalid'));
    });
  }
})();

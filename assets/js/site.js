/* ==========================================================================
   site.js — progressive enhancement voor de hele site.
   Alles is optioneel: zonder JS blijft de pagina volledig leesbaar.
   Elk blok controleert zelf of zijn element bestaat, dus dit bestand kan
   ongewijzigd op elke pagina geladen worden.
   ========================================================================== */
(function () {
  document.documentElement.classList.add('js');
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fade/settle-in on scroll (content itself is never opacity:0 — see .reveal CSS)
  var els = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && els.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  // Header: waas-achtergrond zodra er voorbij de hero gescrold wordt.
  var hdr = document.getElementById('hdr');
  if (hdr) {
    var onHdrScroll = function () { hdr.classList.toggle('is-stuck', window.scrollY > 40); };
    onHdrScroll();
    window.addEventListener('scroll', onHdrScroll, { passive: true });
  }

  // Hoofdmenu. Boven 920px is dit een balk met een megamenu-overlay; daaronder
  // klapt dezelfde markup open als paneel onder de hamburger, met het megamenu
  // als inline submenu. Vandaar dat hover enkel op de desktopbreedte geldt.
  var isDesktopNav = function () { return window.matchMedia('(min-width: 920px)').matches; };

  var hdrEl = document.getElementById('hdr');
  var burgerBtn = document.getElementById('burgerBtn');
  var megaItem = document.getElementById('megaItem');
  var megaTrigger = megaItem ? megaItem.querySelector('.nav__trigger') : null;

  var setMegaOpen = function (on) {
    if (!megaItem || !megaTrigger) return;
    megaItem.classList.toggle('is-open', on);
    megaTrigger.setAttribute('aria-expanded', on ? 'true' : 'false');
  };

  var setNavOpen = function (on) {
    if (!hdrEl || !burgerBtn) return;
    hdrEl.classList.toggle('is-nav-open', on);
    burgerBtn.classList.toggle('is-open', on);
    burgerBtn.setAttribute('aria-expanded', on ? 'true' : 'false');
    burgerBtn.setAttribute('aria-label', on ? 'Menu sluiten' : 'Menu openen');
    document.body.classList.toggle('nav-locked', on);
    if (!on) setMegaOpen(false);
  };

  if (burgerBtn && hdrEl) {
    burgerBtn.addEventListener('click', function () {
      setNavOpen(!hdrEl.classList.contains('is-nav-open'));
    });
    window.addEventListener('resize', function () {
      if (isDesktopNav()) setNavOpen(false);
    });
  }

  if (megaItem && megaTrigger) {
    var closeTimer;
    megaItem.addEventListener('mouseenter', function () {
      if (!isDesktopNav()) return;
      clearTimeout(closeTimer);
      setMegaOpen(true);
    });
    megaItem.addEventListener('mouseleave', function () {
      if (!isDesktopNav()) return;
      closeTimer = setTimeout(function () { setMegaOpen(false); }, 140);
    });
    megaTrigger.addEventListener('click', function (e) {
      e.preventDefault();
      setMegaOpen(!megaItem.classList.contains('is-open'));
    });
  }

  // Een link in het menu sluit alles: op mobiel scrol je anders achter een
  // opengeklapt paneel naar je sectie.
  document.querySelectorAll('.nav a').forEach(function (a) {
    a.addEventListener('click', function () { setMegaOpen(false); setNavOpen(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (hdrEl && hdrEl.classList.contains('is-nav-open')) {
      setNavOpen(false);
      if (burgerBtn) burgerBtn.focus();
    } else if (megaItem && megaItem.classList.contains('is-open')) {
      setMegaOpen(false);
      if (megaTrigger) megaTrigger.blur();
    }
  });

  document.addEventListener('click', function (e) {
    if (megaItem && !megaItem.contains(e.target)) setMegaOpen(false);
    if (hdrEl && !hdrEl.contains(e.target)) setNavOpen(false);
  });

  // Accordion (diensten): één item tegelijk open.
  document.querySelectorAll('.acc-item').forEach(function (item) {
    var btn = item.querySelector('.acc-btn');
    btn.addEventListener('click', function () {
      var open = item.dataset.open === 'true';
      item.closest('.acc').querySelectorAll('.acc-item').forEach(function (o) {
        o.dataset.open = 'false';
        o.querySelector('.acc-btn').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.dataset.open = 'true';
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // Footer-jaartal.
  var jaarEl = document.getElementById('jaar');
  if (jaarEl) jaarEl.textContent = new Date().getFullYear();

  // Count-up numbers (stat row), once each, while visible
  var counters = document.querySelectorAll('[data-count-to]');
  if ('IntersectionObserver' in window && counters.length) {
    var countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        countIo.unobserve(entry.target);
        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count-to'), 10) || 0;
        var suffix = el.getAttribute('data-suffix') || '';
        if (reducedMotion) { el.textContent = target + suffix; return; }
        var start = null;
        var duration = 1100;
        function step(ts) {
          if (start === null) start = ts;
          var progress = Math.min((ts - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { countIo.observe(el); });
  }
})();

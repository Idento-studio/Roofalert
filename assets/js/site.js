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

  // Megamenu (Diensten): open op hover/click, sluit op Escape of klik buiten.
  var megaItem = document.getElementById('megaItem');
  if (megaItem) {
    var trig = megaItem.querySelector('.nav__trigger');
    var closeTimer;
    var setMegaOpen = function (on) {
      megaItem.classList.toggle('is-open', on);
      trig.setAttribute('aria-expanded', on ? 'true' : 'false');
    };
    megaItem.addEventListener('mouseenter', function () { clearTimeout(closeTimer); setMegaOpen(true); });
    megaItem.addEventListener('mouseleave', function () { closeTimer = setTimeout(function () { setMegaOpen(false); }, 140); });
    trig.addEventListener('click', function (e) { e.preventDefault(); setMegaOpen(!megaItem.classList.contains('is-open')); });
    megaItem.querySelectorAll('.mega a').forEach(function (a) {
      a.addEventListener('click', function () { setMegaOpen(false); });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { setMegaOpen(false); trig.blur(); } });
    document.addEventListener('click', function (e) { if (!megaItem.contains(e.target)) { setMegaOpen(false); } });
  }

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

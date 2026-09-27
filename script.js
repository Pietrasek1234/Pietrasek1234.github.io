/* Limonte Cocktail Bar – skrypty strony */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menu mobilne ---------- */
  var header = document.querySelector('.site-header');
  var navToggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('mainNav');

  function setMenu(open) {
    if (!nav || !navToggle) return;
    nav.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    var txt = navToggle.querySelector('.nav-toggle-text');
    if (txt) txt.textContent = open ? 'Zamknij' : 'Menu';
  }

  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      setMenu(!nav.classList.contains('open'));
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && header && !header.contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); navToggle.focus(); }
    });
    var desktopMq = window.matchMedia('(min-width: 1101px)');
    var onMq = function (e) { if (e.matches) setMenu(false); };
    if (desktopMq.addEventListener) desktopMq.addEventListener('change', onMq);
    else if (desktopMq.addListener) desktopMq.addListener(onMq);
  }

  /* ---------- Animacja pojawiania się ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- Pływające przyciski (ukryte na starcie i przy kontakcie) ---------- */
  var floating = document.querySelector('.floating-cta');
  var hero = document.getElementById('start');
  var contact = document.getElementById('kontakt');
  if (floating && 'IntersectionObserver' in window) {
    var visibleSections = new Set();
    var floatObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) visibleSections.add(entry.target);
        else visibleSections.delete(entry.target);
      });
      floating.classList.toggle('is-shown', visibleSections.size === 0);
    }, { threshold: 0.15 });
    if (hero) floatObserver.observe(hero);
    if (contact) floatObserver.observe(contact);
  } else if (floating) {
    floating.classList.add('is-shown');
  }

  /* ---------- Galeria – powiększanie zdjęć ---------- */
  var dlg = document.getElementById('lightbox');
  if (dlg) {
    var im = dlg.querySelector('img');
    var countEl = dlg.querySelector('.lightbox-count');
    var closeBtn = dlg.querySelector('.lightbox-close');
    var prevBtn = dlg.querySelector('.lightbox-prev');
    var nextBtn = dlg.querySelector('.lightbox-next');
    var tiles = Array.prototype.slice.call(document.querySelectorAll('.gallery-tile'));
    var current = 0;
    var lastFocus = null;

    var openDialog = function () {
      if (dlg.open) return;
      lastFocus = document.activeElement;
      document.documentElement.classList.add('lb-open');
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else dlg.setAttribute('open', '');
    };
    var closeDialog = function () {
      if (typeof dlg.close === 'function' && dlg.open) dlg.close();
      else { dlg.removeAttribute('open'); onClosed(); }
    };
    var onClosed = function () {
      document.documentElement.classList.remove('lb-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    dlg.addEventListener('close', onClosed);

    var openAt = function (i) {
      if (!tiles.length) return;
      current = (i + tiles.length) % tiles.length;
      var t = tiles[current];
      var thumb = t.querySelector('img');
      im.src = t.getAttribute('data-full') || (thumb && thumb.src) || '';
      im.alt = (thumb && thumb.alt) || 'Powiększone zdjęcie';
      if (countEl) countEl.textContent = (current + 1) + ' / ' + tiles.length;
      openDialog();
    };

    tiles.forEach(function (t, i) {
      t.addEventListener('click', function (e) { e.preventDefault(); openAt(i); });
    });
    if (closeBtn) closeBtn.addEventListener('click', function (e) { e.stopPropagation(); closeDialog(); });
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.stopPropagation(); openAt(current - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.stopPropagation(); openAt(current + 1); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) closeDialog(); });
    document.addEventListener('keydown', function (e) {
      if (!dlg.open) return;
      if (e.key === 'ArrowLeft') openAt(current - 1);
      else if (e.key === 'ArrowRight') openAt(current + 1);
      else if (e.key === 'Escape' && typeof dlg.showModal !== 'function') closeDialog();
    });

    // Przesuwanie palcem na telefonie
    var sx = 0, sy = 0, tracking = false;
    dlg.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) { tracking = false; return; }
      tracking = true; sx = e.touches[0].clientX; sy = e.touches[0].clientY;
    }, { passive: true });
    dlg.addEventListener('touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) openAt(current + (dx < 0 ? 1 : -1));
      else if (dy > 90 && Math.abs(dy) > Math.abs(dx) * 1.5) closeDialog();
    }, { passive: true });
  }

  /* ---------- Bąbelki w tle ---------- */
  (function bubbles() {
    var c = document.getElementById('bubbleCanvas');
    if (!c || reduceMotion || !c.getContext) return;
    var ctx = c.getContext('2d');
    var W = 0, H = 0, D = 1, list = [], running = true;

    // Jedna gotowa "poświata" rysowana wielokrotnie – dużo lżejsze dla telefonów
    var SPR = 64;
    var sprite = document.createElement('canvas');
    sprite.width = sprite.height = SPR * 2;
    (function () {
      var s = sprite.getContext('2d');
      var r = SPR / 2.1;
      var cx = SPR - r * 0.3, cy = SPR - r * 0.3;
      var g = s.createRadialGradient(cx, cy, 0, SPR, SPR, r * 2.3);
      g.addColorStop(0, 'rgba(236,255,223,0.9)');
      g.addColorStop(0.32, 'rgba(109,255,92,0.48)');
      g.addColorStop(0.72, 'rgba(25,220,106,0.18)');
      g.addColorStop(1, 'rgba(25,220,106,0)');
      s.fillStyle = g;
      s.beginPath(); s.arc(SPR, SPR, SPR, 0, Math.PI * 2); s.fill();
    })();

    function bubble(init) {
      var r = 2 + Math.random() * 10;
      return {
        x: Math.random() * W,
        y: init ? Math.random() * H : H + r * 4,
        r: r,
        vy: 0.12 + Math.random() * 0.45,
        vx: (Math.random() - 0.5) * 0.18,
        a: 0.22 + Math.random() * 0.56,
        phase: Math.random() * Math.PI * 2
      };
    }

    function targetCount() {
      var n = Math.floor(W * H / 20000);
      if (W < 760) return Math.max(30, Math.min(40, n * 2));
      return Math.max(55, Math.min(120, n));
    }

    function resize() {
      var nw = c.clientWidth || window.innerWidth;
      var nh = c.clientHeight || window.innerHeight;
      var widthChanged = nw !== W;
      if (!widthChanged && Math.abs(nh - H) < 2) return;
      D = Math.min(window.devicePixelRatio || 1, 2);
      W = nw; H = nh;
      c.width = Math.round(W * D); c.height = Math.round(H * D);
      ctx.setTransform(D, 0, 0, D, 0, 0);
      var n = targetCount();
      if (widthChanged || !list.length) {
        list = [];
        for (var i = 0; i < n; i++) list.push(bubble(true));
      }
    }

    function draw() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        p.y -= p.vy;
        p.x += p.vx + Math.sin(p.phase + p.y * 0.015) * 0.22;
        if (p.y < -p.r * 3 || p.x < -50 || p.x > W + 50) { list[i] = p = bubble(false); }
        var size = p.r * 2.1;
        ctx.globalAlpha = p.a;
        ctx.drawImage(sprite, p.x - size, p.y - size, size * 2, size * 2);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(149,255,136,' + (p.a * 0.36) + ')';
        ctx.lineWidth = 0.7;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.stroke();
      }
      requestAnimationFrame(draw);
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    }, { passive: true });
    document.addEventListener('visibilitychange', function () {
      var wasRunning = running;
      running = !document.hidden;
      if (running && !wasRunning) requestAnimationFrame(draw);
    });
    resize();
    requestAnimationFrame(draw);
  })();

  /* ---------- Formularz rezerwacji ---------- */
  var form = document.getElementById('reserveForm');
  if (form) {
    var statusEl = document.getElementById('formStatus');
    var submitBtn = form.querySelector('.btn-submit');
    var submitLabel = submitBtn ? submitBtn.querySelector('.btn-label') : null;
    var defaultLabel = submitLabel ? submitLabel.textContent : '';
    var phoneInput = form.querySelector('#f-phone');
    var sending = false;

    // Telefon: min. 9 cyfr, dozwolone spacje, +, -, nawiasy
    if (phoneInput) {
      var checkPhone = function () {
        var v = phoneInput.value.trim();
        var digits = v.replace(/\D/g, '').length;
        var ok = !v || (/^[0-9+()\s-]+$/.test(v) && digits >= 9 && digits <= 15);
        phoneInput.setCustomValidity(ok ? '' : 'Podaj poprawny numer telefonu (min. 9 cyfr).');
      };
      phoneInput.addEventListener('input', checkPhone);
      checkPhone();
    }

    form.addEventListener('invalid', function () { form.classList.add('was-validated'); }, true);

    var val = function (name) {
      var el = form.elements[name];
      return el ? String(el.value || '').trim() : '';
    };

    var showStatus = function (type, html) {
      if (!statusEl) return;
      statusEl.className = 'form-status ' + (type === 'success' ? 'is-success' : 'is-error');
      statusEl.innerHTML = html;
      statusEl.hidden = false;
    };

    var esc = function (s) {
      return String(s).replace(/[&<>"']/g, function (ch) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
      });
    };

    var buildMailto = function () {
      var to = (form.getAttribute('action') || '').split('/').pop() || 'kontakt@limonte.pl';
      var lines = [
        'Imię i nazwisko / para: ' + val('Imię i nazwisko'),
        'Telefon: ' + val('Telefon'),
        'E-mail: ' + val('email'),
        'Termin wesela: ' + val('Termin wesela'),
        'Miejsce / sala: ' + val('Miejsce (sala)'),
        'Liczba gości: ' + val('Liczba gości'),
        '',
        'Dodatkowe informacje:',
        val('Wiadomość')
      ];
      return 'mailto:' + to +
        '?subject=' + encodeURIComponent('Rezerwacja Limonte – ' + val('Termin wesela')) +
        '&body=' + encodeURIComponent(lines.join('\n'));
    };

    var setSending = function (on) {
      sending = on;
      if (!submitBtn) return;
      submitBtn.disabled = on;
      submitBtn.classList.toggle('is-loading', on);
      if (submitLabel) submitLabel.textContent = on ? 'Wysyłanie…' : defaultLabel;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;
      if (typeof form.checkValidity === 'function' && !form.checkValidity()) {
        form.classList.add('was-validated');
        if (form.reportValidity) form.reportValidity();
        return;
      }
      if (statusEl) statusEl.hidden = true;

      // Pole-pułapka na boty – człowiek go nie widzi
      if (val('_honey')) { form.reset(); return; }

      var data = new URLSearchParams();
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.disabled || el.type === 'submit' || el.name === '_honey') return;
        data.append(el.name, String(el.value || '').trim());
      });
      data.set('_subject', 'Rezerwacja: ' + val('Imię i nazwisko') + ' – ' + val('Termin wesela') + ' (Limonte)');
      data.set('_replyto', val('email'));
      data.set('_template', 'table');
      data.set('_captcha', 'false');

      var endpoint = (form.getAttribute('action') || '').replace('formsubmit.co/', 'formsubmit.co/ajax/');
      var controller = ('AbortController' in window) ? new AbortController() : null;
      var timer = setTimeout(function () { if (controller) controller.abort(); }, 20000);

      setSending(true);
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data,
        signal: controller ? controller.signal : undefined
      })
        .then(function (res) {
          return res.json().catch(function () { return {}; }).then(function (json) {
            if (!res.ok || String(json.success) !== 'true') {
              var err = new Error(json.message || ('HTTP ' + res.status));
              throw err;
            }
            return json;
          });
        })
        .then(function () {
          form.reset();
          form.classList.remove('was-validated');
          showStatus('success', '<strong>Dziękujemy! Wiadomość została wysłana.</strong>Odezwiemy się najszybciej, jak to możliwe – zwykle mailowo lub telefonicznie.');
        })
        .catch(function (err) {
          var msg = (err && err.message) || '';
          if (window.console) console.warn('Formularz – błąd wysyłki:', msg);
          if (/activat/i.test(msg)) {
            showStatus('error', '<strong>Formularz czeka na aktywację.</strong>Na adres ' + esc((form.getAttribute('action') || '').split('/').pop()) + ' wysłaliśmy e-mail od FormSubmit – kliknij w nim „Activate Form”, a kolejne wiadomości będą dochodzić normalnie.');
            return;
          }
          showStatus('error', '<strong>Nie udało się wysłać wiadomości.</strong>Spróbuj ponownie za chwilę, zadzwoń: <a href="tel:+48661386978">661&nbsp;386&nbsp;978</a> albo <a href="' + esc(buildMailto()) + '">wyślij tę wiadomość ze swojej poczty</a>.');
        })
        .then(function () {
          clearTimeout(timer);
          setSending(false);
          if (statusEl && statusEl.scrollIntoView) {
            var r = statusEl.getBoundingClientRect();
            if (r.bottom > window.innerHeight || r.top < 0) statusEl.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
          }
        });
    });
  }

  /* ---------- Rok w stopce ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();

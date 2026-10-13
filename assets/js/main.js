(function () {
  'use strict';
  var doc = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || doc).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };

  /* Sticky header state */
  var header = $('.header');
  var onScroll = function () { if (header) header.classList.toggle('is-stuck', window.scrollY > 8); };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  var toggle = $('.menu-toggle');
  var nav = $('#nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menu sluiten' : 'Menu openen');
      nav.classList.toggle('is-open', open);
      doc.body.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', function () { setOpen(toggle.getAttribute('aria-expanded') !== 'true'); });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
      if (e.key === 'Tab' && toggle.getAttribute('aria-expanded') === 'true') {
        var items = [toggle].concat($$('a, button', nav));
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    window.matchMedia('(min-width: 1100px)').addEventListener('change', function (e) { if (e.matches) setOpen(false); });
  }

  /* Scroll reveal */
  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
    /* Safety net: never leave content hidden if the observer does not fire */
    var sweep = function () {
      revealEls.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) { el.classList.add('is-in'); io.unobserve(el); }
      });
    };
    setTimeout(sweep, 1200);
    window.addEventListener('scroll', function () { setTimeout(sweep, 350); }, { passive: true });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Hero parallax */
  var heroImg = $('.hero-photo img');
  if (heroImg && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        heroImg.style.transform = 'translate3d(0,' + Math.min(window.scrollY * -0.06, 0) + 'px,0)';
        ticking = false;
      });
    }, { passive: true });
  }

  /* Week strip: highlight today (1 = maandag … 7 = zondag) */
  var today = new Date();
  var dow = today.getDay() === 0 ? 7 : today.getDay();
  $$('.day[data-day="' + dow + '"]').forEach(function (el) {
    el.classList.add('is-today');
    if (el.scrollIntoView && window.innerWidth < 980) {
      var list = el.parentElement;
      list.scrollLeft = el.offsetLeft - list.offsetLeft - 16;
    }
  });

  /* Sub navigation: active section */
  var subLinks = $$('.subnav a[href^="#"]');
  if (subLinks.length && 'IntersectionObserver' in window) {
    var map = {};
    subLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          subLinks.forEach(function (a) { a.classList.remove('is-active'); });
          var a = map[en.target.id];
          if (a) { a.classList.add('is-active'); }
        }
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { var t = doc.getElementById(id); if (t) so.observe(t); });
  }

  /* Calendar filters */
  var cal = $('#kalender-tabel');
  if (cal) {
    var rows = $$('tbody tr', cal);
    var state = { m: 'all', c: 'all' };
    var count = $('#kalender-count');
    var iso = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2) + '-' + ('0' + today.getDate()).slice(-2);
    var nextMarked = false;
    rows.forEach(function (r) {
      if (r.dataset.date < iso) r.classList.add('is-past');
      else if (!nextMarked) { r.classList.add('is-next'); nextMarked = true; }
    });
    var apply = function () {
      var n = 0;
      rows.forEach(function (r) {
        var show = (state.m === 'all' || r.dataset.m === state.m) && (state.c === 'all' || r.dataset.c === state.c);
        r.hidden = !show;
        if (show) n++;
      });
      if (count) count.textContent = n + (n === 1 ? ' wedstrijd' : ' wedstrijden');
    };
    $$('[data-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = b.dataset.filter;
        state[k] = b.dataset.value;
        $$('[data-filter="' + k + '"]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        apply();
      });
    });
    var cur = ('0' + (today.getMonth() + 1)).slice(-2);
    var curBtn = $('[data-filter="m"][data-value="' + cur + '"]');
    if (curBtn && today.getFullYear() === 2026) curBtn.click(); else apply();
  }

  /* Hole videos */
  var player = $('#hole-player');
  if (player) {
    $$('.hole').forEach(function (b) {
      b.addEventListener('click', function (e) {
        e.preventDefault();
        $$('.hole').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        player.classList.add('has-video');
        player.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + b.dataset.yt + '?autoplay=1&rel=0" title="Dronevideo ' + b.textContent.trim() + ' van golfbaan Sluispolder" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
        player.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' });
      });
    });
  }
  $$('[data-yt-embed]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var box = btn.closest('.player');
      box.classList.add('has-video');
      box.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + btn.dataset.ytEmbed + '?autoplay=1&rel=0" title="' + btn.dataset.title + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>';
    });
  });

  /* Lightbox */
  var lb = $('dialog.lightbox');
  if (lb && lb.showModal) {
    var thumbs = $$('.gallery button');
    var lbImg = $('img', lb), lbCap = $('.lb-count', lb), idx = 0;
    var show = function (i) {
      idx = (i + thumbs.length) % thumbs.length;
      lbImg.src = thumbs[idx].dataset.full;
      lbImg.alt = $('img', thumbs[idx]).alt;
      lbCap.textContent = (idx + 1) + ' / ' + thumbs.length;
    };
    thumbs.forEach(function (t, i) { t.addEventListener('click', function () { show(i); lb.showModal(); }); });
    $('.lb-prev', lb).addEventListener('click', function () { show(idx - 1); });
    $('.lb-next', lb).addEventListener('click', function () { show(idx + 1); });
    $('.lb-close', lb).addEventListener('click', function () { lb.close(); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Forms: validate, then open the visitor's mail program with the message filled in */
  $$('form[data-mailto]').forEach(function (form) {
    form.setAttribute('novalidate', '');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true, firstBad = null;
      $$('input, textarea', form).forEach(function (f) {
        var err = doc.getElementById(f.id + '-error');
        var msg = '';
        if (f.required && !f.value.trim()) msg = 'Dit veld is verplicht. / This field is required.';
        else if (f.type === 'email' && f.value && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value)) msg = 'Vul een geldig e-mailadres in. / Please enter a valid e-mail address.';
        f.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (err) err.textContent = msg;
        if (msg) { ok = false; firstBad = firstBad || f; }
      });
      var status = $('.form-status', form);
      if (!ok) { firstBad.focus(); if (status) status.textContent = ''; return; }
      var v = function (n) { var el = form.elements[n]; return el ? el.value.trim() : ''; };
      var subject = v('onderwerp') || form.dataset.subject;
      var body = v('bericht') + '\n\n' + v('voornaam') + ' ' + v('achternaam') + '\n' + v('email');
      window.location.href = 'mailto:' + form.dataset.mailto + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
      if (status) status.textContent = form.dataset.done;
    });
  });

  /* Footer year */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();

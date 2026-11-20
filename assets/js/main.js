(function () {
  var root = document.documentElement;

  // ---- theme toggle ----
  var toggle = document.getElementById('themeToggle');
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  if (toggle) toggle.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  // ---- mobile menu ----
  var burger = document.getElementById('burger');
  var links = document.getElementById('navlinks');
  if (burger) burger.addEventListener('click', function () {
    var open = links.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { links.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); });
  });

  // ---- nav border + active section ----
  var nav = document.querySelector('.nav');
  window.addEventListener('scroll', function () { nav.classList.toggle('is-scrolled', window.scrollY > 10); }, { passive: true });
  var navMap = {};
  links.querySelectorAll('a').forEach(function (a) { navMap[a.getAttribute('href').slice(1)] = a; });
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && navMap[e.target.id]) {
          Object.keys(navMap).forEach(function (k) { navMap[k].classList.remove('is-active'); });
          navMap[e.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (s) { secObs.observe(s); });
  }

  // ---- bars: scale value into width ----
  function fillBars(scope) {
    scope.querySelectorAll('.bars').forEach(function (b) {
      var min = parseFloat(b.dataset.min || 0), max = parseFloat(b.dataset.max || 100);
      b.querySelectorAll('.bar__track i').forEach(function (i) {
        var v = parseFloat(getComputedStyle(i).getPropertyValue('--v'));
        var pct = Math.max(4, Math.min(100, (v - min) / (max - min) * 100));
        i.style.width = pct + '%';
      });
    });
  }

  // ---- count-up ----
  function countUp(el) {
    var target = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || 0, 10);
    var start = null, dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min(1, (ts - start) / dur), e = 1 - Math.pow(1 - p, 3);
      var val = target * e;
      el.textContent = dec ? val.toFixed(dec) : Math.round(val).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---- reveal on scroll ----
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        e.target.querySelectorAll('[data-count]').forEach(countUp);
        fillBars(e.target);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (r) { obs.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add('is-in'); });
    fillBars(document);
  }

  // ---- tabs ----
  document.querySelectorAll('[data-tabs]').forEach(function (card) {
    var tabs = card.querySelectorAll('[role="tab"]');
    var panels = card.querySelectorAll('[role="tabpanel"]');
    tabs.forEach(function (t, idx) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.setAttribute('aria-selected', 'false'); });
        panels.forEach(function (p) { p.hidden = true; });
        t.setAttribute('aria-selected', 'true');
        panels[idx].hidden = false;
        fillBars(panels[idx]);
      });
      t.addEventListener('keydown', function (ev) {
        if (ev.key !== 'ArrowRight' && ev.key !== 'ArrowLeft') return;
        var n = (idx + (ev.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length;
        tabs[n].focus(); tabs[n].click();
      });
    });
  });

  // ---- tiny "heart rate" that drifts like real HRV ----
  var bpm = document.getElementById('bpm');
  if (bpm && !reduce) {
    var b = 72;
    setInterval(function () { b += (Math.random() - 0.5) * 4; b = Math.max(64, Math.min(84, b)); bpm.textContent = Math.round(b); }, 1100);
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();

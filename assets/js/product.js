(function () {
  var root = document.querySelector('.nk');
  if (!root) return;

  // Quantity, total and Stripe link
  var price = parseFloat(root.dataset.price) || 0;
  var maxQty = parseInt(root.dataset.maxQty, 10) || 4;
  var links = [];
  try { links = JSON.parse(root.dataset.links || '[]') || []; } catch (e) {}
  var configs = ['A single sitting stool', 'Stack two for a standing table', 'Stack three as a sculptural piece', 'Two standing tables'];
  var qty = 1;
  var all = function (sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };
  var fmt = function (n) { return 'AED ' + n.toLocaleString('en-US'); };

  function renderQty() {
    all('[data-qty-val]').forEach(function (el) { el.textContent = qty; });
    all('[data-config]').forEach(function (el) { el.textContent = configs[qty - 1] || qty + ' stools'; });
    all('[data-dec]').forEach(function (b) { b.disabled = qty <= 1; });
    all('[data-inc]').forEach(function (b) { b.disabled = qty >= maxQty; });
    all('[data-total]').forEach(function (el) { el.textContent = fmt(price * qty); });
    all('[data-buy]').forEach(function (a) { if (links[qty - 1]) a.href = links[qty - 1]; });
    all('[data-qty-input]').forEach(function (i) { if (document.activeElement !== i) i.value = qty; });
  }
  all('[data-dec]').forEach(function (b) { b.addEventListener('click', function () { qty = Math.max(1, qty - 1); renderQty(); }); });
  all('[data-inc]').forEach(function (b) { b.addEventListener('click', function () { qty = Math.min(maxQty, qty + 1); renderQty(); }); });
  // Typing a quantity in the reservation form updates the steppers and total
  all('[data-qty-input]').forEach(function (i) {
    i.addEventListener('input', function () {
      var n = parseInt(i.value, 10);
      if (n >= 1 && n <= maxQty) { qty = n; renderQty(); }
    });
    i.addEventListener('blur', function () { renderQty(); });
  });
  renderQty();

  // Reserve button opens the reservation form in the buy panel
  var reserve = root.querySelector('[data-reserve]');
  all('[data-reserve-open]').forEach(function (b) {
    b.addEventListener('click', function () {
      reserve.hidden = false;
      all('[data-reserve-open][aria-expanded]').forEach(function (x) { x.setAttribute('aria-expanded', 'true'); });
      reserve.scrollIntoView({ behavior: 'smooth', block: 'start' });
      var first = reserve.querySelector('input[name=name]');
      if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 400);
    });
  });

  // Product gallery
  var main = root.querySelector('[data-main]');
  all('[data-thumb]').forEach(function (t) {
    t.addEventListener('click', function () {
      main.src = t.dataset.thumb; main.alt = t.dataset.alt || '';
      all('[data-thumb]').forEach(function (x) { x.classList.toggle('is-active', x === t); });
    });
  });

  // Buy bar appears once the buy panel scrolls out of view
  var panel = document.getElementById('nk-panel');
  var bar = root.querySelector('[data-bar]');
  if (panel && bar) {
    var barOn = null, ticking = false;
    function checkBar() {
      ticking = false;
      var on = panel.getBoundingClientRect().bottom < 60;
      if (on === barOn) return;
      barOn = on;
      bar.classList.toggle('is-on', on);
      bar.setAttribute('aria-hidden', on ? 'false' : 'true');
      document.body.classList.toggle('nk-bar-on', on);
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(checkBar); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    checkBar();
  }

  // Exhibition gallery: one rotation across every exhibition's photos
  var gal = root.querySelector('[data-exh-gallery]');
  if (gal) {
    var imgs = all('[data-exh-img]'), thumbs = all('[data-exh-thumb]'), rows = all('[data-exh-row]');
    var caption = root.querySelector('[data-exh-caption]');
    var cur = 0, timer = null, paused = false;
    function show(i) {
      cur = (i + imgs.length) % imgs.length;
      var ex = imgs[cur].dataset.exh;
      imgs.forEach(function (im, k) { im.classList.toggle('is-active', k === cur); });
      thumbs.forEach(function (t, k) { t.classList.toggle('is-active', k === cur); });
      rows.forEach(function (r) { r.classList.toggle('is-active', r.dataset.exhRow === ex); });
      var same = imgs.filter(function (im) { return im.dataset.exh === ex; });
      caption.textContent = imgs[cur].dataset.caption + ' · ' + (same.indexOf(imgs[cur]) + 1) + ' / ' + same.length;
      var t = thumbs[cur], strip = t.parentNode;
      strip.scrollTo({ left: t.offsetLeft - strip.offsetLeft - strip.clientWidth / 2 + t.clientWidth / 2, behavior: 'smooth' });
    }
    function restart() { clearInterval(timer); timer = setInterval(function () { if (!paused && imgs.length > 1) show(cur + 1); }, 5000); }
    thumbs.forEach(function (t, k) { t.addEventListener('click', function () { show(k); restart(); }); });
    gal.querySelector('[data-exh-prev]').addEventListener('click', function () { show(cur - 1); restart(); });
    gal.querySelector('[data-exh-next]').addEventListener('click', function () { show(cur + 1); restart(); });
    all('[data-exh-jump]').forEach(function (b) {
      b.addEventListener('click', function () {
        var k = imgs.findIndex(function (im) { return im.dataset.exh === b.dataset.exhJump; });
        if (k >= 0) { show(k); restart(); }
      });
    });
    gal.addEventListener('mouseenter', function () { paused = true; });
    gal.addEventListener('mouseleave', function () { paused = false; });
    show(0); restart();
  }

  // Reservation and bulk forms (Formspree) with inline confirmation
  all('[data-fs]').forEach(function (box) {
    var form = box.querySelector('form');
    if (!form || !window.fetch) return;
    var sent = box.querySelector('[data-fs-sent]'), err = box.querySelector('[data-fs-error]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = form.querySelector('[type=submit]'); btn.disabled = true;
      err.hidden = true;
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error();
          form.hidden = true; sent.hidden = false;
        })
        .catch(function () { btn.disabled = false; err.hidden = false; });
    });
  });
})();

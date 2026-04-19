/* ================================================================
   index.js — EduPortfolio
   PENDEKATAN AMAN:
   - Tidak menimpa konten HTML yang sudah ada
   - Hanya menjalankan interaktivitas (nav, scroll, fade, skill bar)
   - JSON render hanya untuk grid yang memang dinamis
   - Jika fetch JSON gagal → halaman tetap tampil normal dari HTML
================================================================ */

/* ══════════════════════════════════════════════════════
   1. NAV — HAMBURGER & ACTIVE HIGHLIGHT
══════════════════════════════════════════════════════ */
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

document.querySelectorAll('.nav-links a').forEach(function (a) {
  a.addEventListener('click', function () {
    document.getElementById('navLinks').classList.remove('open');
  });
});

var sections = document.querySelectorAll('section[id]');
var navLinks  = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', function () {
  var current = '';
  sections.forEach(function (s) {
    if (window.scrollY >= s.offsetTop - 100) current = s.getAttribute('id');
  });
  navLinks.forEach(function (a) {
    a.classList.remove('active');
    if (a.getAttribute('href') === '#' + current) a.classList.add('active');
  });
});


/* ══════════════════════════════════════════════════════
   2. FADE-UP OBSERVER
══════════════════════════════════════════════════════ */
function initFadeObserver() {
  var obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-up').forEach(function (el) { obs.observe(el); });
}


/* ══════════════════════════════════════════════════════
   3. SKILL BAR ANIMATE
══════════════════════════════════════════════════════ */
function initSkillBars() {
  var skillObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-fill').forEach(function (f) {
          var w = f.style.width;
          f.style.width = '0';
          setTimeout(function () { f.style.width = w; }, 80);
        });
      }
    });
  }, { threshold: 0.3 });
  document.querySelectorAll('.about-skills').forEach(function (el) { skillObs.observe(el); });
}


/* ══════════════════════════════════════════════════════
   4. UTILITAS JSON LOADER
   Jika fetch gagal (buka via file://) -> kembalikan null,
   halaman tetap pakai konten HTML statis
══════════════════════════════════════════════════════ */
async function loadJSON(path) {
  try {
    var res = await fetch(path);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}


/* ══════════════════════════════════════════════════════
   5. RENDER BLOG GRID
══════════════════════════════════════════════════════ */
async function tryRenderBlog() {
  var grid = document.querySelector('.blog-grid');
  if (!grid) return;
  var data = await loadJSON('content/pages/blog.json');
  if (!data || !data.items) return;
  grid.innerHTML = data.items.map(function (item) {
    return '<div class="blog-card">' +
      '<div class="blog-date">' + item.date + '</div>' +
      '<h4>' + item.title + '</h4>' +
      '<p>' + item.excerpt + '</p>' +
      '<a href="' + item.link + '" class="read-more">Baca selengkapnya →</a>' +
      '</div>';
  }).join('');
}


/* ══════════════════════════════════════════════════════
   6. RENDER JURNAL LIST
══════════════════════════════════════════════════════ */
async function tryRenderJurnal() {
  var list = document.querySelector('.jurnal-list');
  if (!list) return;
  var data = await loadJSON('content/pages/jurnal-preview.json');
  if (!data || !data.items) return;
  list.innerHTML = data.items.map(function (item) {
    return '<div class="jurnal-item">' +
      '<div class="jurnal-date-block">' +
        '<div class="month">' + item.month + '</div>' +
        '<div class="day">' + item.day + '</div>' +
      '</div>' +
      '<div class="jurnal-content">' +
        '<h4>' + item.title + '</h4>' +
        '<p>' + item.content + '</p>' +
        '<span class="jurnal-tag">' + item.tag + '</span>' +
      '</div>' +
      '</div>';
  }).join('');
}


/* ══════════════════════════════════════════════════════
   7. RENDER PORTFOLIO GRID
══════════════════════════════════════════════════════ */
async function tryRenderPortfolio() {
  var grid = document.querySelector('.portfolio-grid');
  if (!grid) return;
  var data = await loadJSON('content/pages/portfolio.json');
  if (!data || !data.items) return;
  grid.innerHTML = data.items.map(function (item) {
    var clickAttr = (item.link && item.link !== '#')
      ? ' onclick="window.location.href=\'' + item.link + '\'" style="cursor:pointer;"'
      : '';
    return '<div class="portfolio-card"' + clickAttr + '>' +
      '<div class="portfolio-thumb">' + item.icon + '<div class="overlay"></div></div>' +
      '<div class="portfolio-info">' +
        '<div class="cat">' + item.category + '</div>' +
        '<h4>' + item.title + '</h4>' +
        '<p>' + item.description + '</p>' +
      '</div>' +
      '</div>';
  }).join('');
}


/* ══════════════════════════════════════════════════════
   8. RENDER ARTEFAK PREVIEW
══════════════════════════════════════════════════════ */
async function tryRenderArtefakPreview() {
  var section = document.getElementById('artefak');
  if (!section) return;
  var grid = section.querySelector('.artefak-grid');
  if (!grid) return;
  var data = await loadJSON('content/pages/artefak-preview.json');
  if (!data || !data.items) return;
  grid.innerHTML = data.items.map(function (item) {
    var targetAttr = (item.link && item.link.startsWith('http')) ? ' target="_blank"' : '';
    return '<div class="artefak-card">' +
      '<div class="artefak-icon">' + item.icon + '</div>' +
      '<h4>' + item.title + '</h4>' +
      '<p>' + item.description + '</p>' +
      '<a href="' + item.link + '"' + targetAttr + ' class="artefak-btn">' + item.btn_text + '</a>' +
      '</div>';
  }).join('');
}


/* ══════════════════════════════════════════════════════
   9. RENDER PENILAIAN PREVIEW
══════════════════════════════════════════════════════ */
async function tryRenderPenilaianPreview() {
  var section = document.getElementById('penilaian');
  if (!section) return;
  var grid = section.querySelector('.penilaian-grid');
  if (!grid) return;
  var data = await loadJSON('content/pages/penilaian-preview.json');
  if (!data || !data.items) return;
  grid.innerHTML = data.items.map(function (item) {
    return '<div class="penilaian-card">' +
      '<div class="label">' + item.label + '</div>' +
      '<h4>' + item.title + '</h4>' +
      '<p>' + item.description + '</p>' +
      '<a href="' + item.link + '" class="download-link">' + item.download_text + '</a>' +
      '</div>';
  }).join('');
}


/* ══════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async function () {
  initFadeObserver();
  initSkillBars();

  await Promise.all([
    tryRenderBlog(),
    tryRenderJurnal(),
    tryRenderPortfolio(),
    tryRenderArtefakPreview(),
    tryRenderPenilaianPreview()
  ]);

  /* Re-init fade setelah konten dinamis dirender */
  initFadeObserver();
});

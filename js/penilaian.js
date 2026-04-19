/* ================================================================
   penilaian.js — Content loader + existing functionality
   Loads JSON and renders content into existing layout.
================================================================ */

/* ── UTILITY ── */
async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Failed: ' + path);
  return res.json();
}

/* ── MAIN INIT ── */
document.addEventListener('DOMContentLoaded', async function () {
  try {
    const [pageData, aspekData, dokData, jurnalData] = await Promise.all([
      loadJSON('../content/penilaian/penilaian-page.json'),
      loadJSON('../content/penilaian/aspek-items.json'),
      loadJSON('../content/penilaian/dokumen-items.json'),
      loadJSON('../content/jurnal/jurnal-items.json')
    ]);
    renderPageHero(pageData.page);
    renderGuruPamong(pageData.infografis);
    renderAspek(aspekData.items);
    renderCatatan(pageData.infografis.catatan_umum);
    renderDokumen(dokData);
    renderJurnal(jurnalData);
    initAll();
  } catch (e) {
    console.warn('CMS content load error:', e);
    initAll();
  }
});

/* ── PAGE HERO ── */
function renderPageHero(p) {
  const titleEl = document.querySelector('title');
  if (titleEl) titleEl.textContent = p.title;

  const tag = document.querySelector('.page-tag');
  if (tag) tag.innerHTML = p.tag;

  const h1 = document.querySelector('.page-hero h1');
  if (h1) h1.innerHTML = p.heading_line1 + '<br>' + p.heading_line2 + '<em>' + p.heading_em + '</em>';

  const desc = document.querySelector('.page-hero p');
  if (desc) desc.textContent = p.description;

  const chips = document.querySelectorAll('.hero-stat-chip');
  p.stats.forEach(function (s, i) {
    if (chips[i]) chips[i].innerHTML = s.icon + ' <strong>' + s.value + '</strong> ' + s.label;
  });
}

/* ── GURU PAMONG SUMMARY CARD ── */
function renderGuruPamong(inf) {
  const gp = inf.guru_pamong;

  const avatar = document.querySelector('.summary-avatar');
  if (avatar) avatar.textContent = gp.avatar;

  const lbl = document.querySelector('.summary-label');
  if (lbl) lbl.textContent = gp.label;

  const name = document.querySelector('.summary-name');
  if (name) name.textContent = gp.name;

  const role = document.querySelector('.summary-role');
  if (role) role.textContent = gp.role;

  const school = document.querySelector('.summary-school');
  if (school) school.textContent = gp.school;

  const na = inf.nilai_akhir;
  const scoreNum = document.querySelector('.score-number');
  if (scoreNum) scoreNum.textContent = na.score;

  const scoreMax = document.querySelector('.score-max');
  if (scoreMax) scoreMax.textContent = 'dari ' + na.max;

  const predikat = document.querySelector('.final-score-predikat');
  if (predikat) predikat.textContent = na.predikat;

  const period = document.querySelector('.final-score-period');
  if (period) period.textContent = na.period;
}

/* ── ASPEK PENILAIAN GRID ── */
function renderAspek(items) {
  const grid = document.querySelector('.aspek-grid');
  if (!grid) return;

  grid.innerHTML = items.map(function (item) {
    /* Calculate bar width and badge from score */
    const pct = Math.round(Math.min((item.score / item.max) * 100, 100));
    const nilai = Math.floor(item.score);
    let grade = 'A', badgeClass = 'badge-a';
    if (nilai <= 1)      { grade = 'D'; badgeClass = 'badge-d'; }
    else if (nilai === 2) { grade = 'C'; badgeClass = 'badge-c'; }
    else if (nilai === 3) { grade = 'B'; badgeClass = 'badge-b'; }

    return '<div class="aspek-item">' +
      '<div class="aspek-header">' +
        '<div class="aspek-icon">' + item.icon + '</div>' +
        '<div class="aspek-info">' +
          '<div class="aspek-label">' + item.label + '</div>' +
          '<div class="aspek-skor">' + item.score + ' <span>/ ' + item.max + '</span></div>' +
        '</div>' +
        '<div class="aspek-badge ' + badgeClass + '">' + grade + '</div>' +
      '</div>' +
      '<div class="aspek-bar"><div class="aspek-fill" data-nilai="' + pct + '"></div></div>' +
      '<div class="aspek-komentar">"' + item.komentar + '"</div>' +
      '</div>';
  }).join('');
}

/* ── CATATAN UMUM GURU PAMONG ── */
function renderCatatan(c) {
  const titleEl = document.querySelector('.catatan-title');
  if (titleEl) titleEl.textContent = c.title;

  const sub = document.querySelector('.catatan-sub');
  if (sub) sub.textContent = c.sub;

  const isi = document.querySelector('.catatan-isi');
  if (isi) isi.textContent = '\u201c' + c.isi + '\u201d';

  const ttdName = document.querySelector('.ttd-name');
  if (ttdName) ttdName.textContent = c.ttd_name;

  const ttdDate = document.querySelector('.ttd-date');
  if (ttdDate) ttdDate.textContent = c.ttd_date;
}

/* ── DOKUMEN PENILAIAN GRID ── */
function renderDokumen(data) {
  const secTag = document.querySelector('#dokumen-nilai + .section-divider .section-divider-text h2');
  if (secTag) secTag.innerHTML = data.heading_line1 + ' <em>' + data.heading_em + '</em>';

  const secDesc = document.querySelector('#dokumen-nilai + .section-divider .section-divider-text p');
  if (secDesc) secDesc.textContent = data.description;

  const grid = document.querySelector('.dokumen-grid');
  if (!grid) return;

  grid.innerHTML = data.items.map(function (item) {
    return '<div class="dokumen-card fade-up" data-pdf="' + item.pdf_preview + '" data-title="' + item.title.replace(/"/g, '&quot;') + '">' +
      '<div class="dokumen-card-top">' +
        '<div class="dokumen-icon">' + item.icon + '</div>' +
        '<div class="dokumen-meta">' +
          '<span class="dok-label">' + item.label + '</span>' +
          '<span class="dok-sub">' + item.sub + '</span>' +
        '</div>' +
        '<div class="dok-badge">PDF</div>' +
      '</div>' +
      '<h3 class="dokumen-title">' + item.title + '</h3>' +
      '<p class="dokumen-desc">' + item.description + '</p>' +
      '<div class="dokumen-footer">' +
        '<span class="dok-date">📅 ' + item.date + '</span>' +
        '<div class="dok-actions">' +
          '<button class="btn-preview-dok" onclick="openPreview(this.closest(\'.dokumen-card\'))">👁 Preview</button>' +
          '<a href="' + item.download_href + '" target="_blank" class="btn-download-dok">⬇ Unduh</a>' +
        '</div>' +
      '</div>' +
      '</div>';
  }).join('');
}

/* ── JURNAL REFLEKSI ── */
function renderJurnal(data) {
  /* Section heading */
  const secH2 = document.querySelector('#jurnal + .section-divider .section-divider-text h2');
  if (secH2) secH2.innerHTML = data.heading_line1 + ' <em>' + data.heading_em + '</em>';

  const secP = document.querySelector('#jurnal + .section-divider .section-divider-text p');
  if (secP) secP.textContent = data.description;

  /* Filter buttons */
  const filterBar = document.querySelector('.jurnal-filter');
  if (filterBar) {
    filterBar.innerHTML = '<span class="filter-label">Tampilkan:</span>' +
      data.filter_buttons.map(function (btn, i) {
        return '<button class="filter-btn' + (i === 0 ? ' active' : '') +
          '" data-filter="' + btn.value + '">' + btn.label + '</button>';
      }).join('');
  }

  /* Timeline entries */
  const timeline = document.querySelector('.jurnal-timeline');
  if (!timeline) return;

  timeline.innerHTML = data.items.map(function (item) {
    return '<div class="jurnal-entry fade-up" data-tag="' + item.tag + '">' +
      '<div class="jurnal-tanggal-col">' +
        '<div class="jurnal-tanggal-box">' +
          '<div class="jurnal-bulan">' + item.bulan + '</div>' +
          '<div class="jurnal-tgl">' + item.tgl + '</div>' +
        '</div>' +
        '<div class="jurnal-line"></div>' +
      '</div>' +
      '<div class="jurnal-konten">' +
        '<span class="jurnal-entry-tag tag-' + item.tag + '">' + item.tag_display + '</span>' +
        '<h3>' + item.title + '</h3>' +
        '<p class="jurnal-isi">' + item.isi + '</p>' +
        '<div class="jurnal-takeaway">' +
          '<span class="takeaway-label">📌 Pelajaran Hari Ini</span>' +
          '<span class="takeaway-isi">' + item.takeaway + '</span>' +
        '</div>' +
        '<div class="jurnal-entry-footer">' +
          '<span class="jurnal-mood">' + item.mood + '</span>' +
          '<div class="jurnal-pdf-actions">' +
            '<button class="btn-preview-jurnal"' +
              ' data-pdf="' + item.pdf_preview + '"' +
              ' data-title="' + item.pdf_title.replace(/"/g, '&quot;') + '"' +
              ' onclick="openJurnalPreview(this)">👁 Preview PDF</button>' +
            '<a href="' + item.download_href + '" target="_blank" class="btn-dl-jurnal">⬇ Unduh</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '</div>';
  }).join('');
}


/* ══════════════════════════════════════════════════════════════
   ORIGINAL FUNCTIONALITY — ALL LOGIC PRESERVED INTACT
══════════════════════════════════════════════════════════════ */

function initAll() {
  initNav();
  initScrollHighlight();
  initBarObserver();
  initJurnalFilter();
  initModal();
  initFadeObserver();
  initStagger();
  initScoreRings();
}

/* ── 1. NAV HAMBURGER ── */
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

function initNav() {
  document.querySelectorAll('.nav-links a').forEach(function (link) {
    link.addEventListener('click', function () {
      document.getElementById('navLinks').classList.remove('open');
    });
  });
}

/* ── 2. SCROLL HIGHLIGHT ── */
function initScrollHighlight() {
  var scrollAnchors = document.querySelectorAll('.section-anchor');
  var navLinks      = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', function () {
    var currentId = '';
    scrollAnchors.forEach(function (anchor) {
      if (window.scrollY >= anchor.offsetTop - 120) currentId = anchor.id;
    });
    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentId) link.classList.add('active');
    });
  });
}

/* ── 3. BAR ANIMASI ASPEK ── */
function initBarObserver() {
  var barObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll('.aspek-fill').forEach(function (fill) {
          var targetVal = fill.getAttribute('data-nilai') || '0';
          setTimeout(function () { fill.style.width = targetVal + '%'; }, 120);
        });
        barObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  var aspekGrid = document.querySelector('.aspek-grid');
  if (aspekGrid) barObserver.observe(aspekGrid);
}

/* ── 4. FILTER JURNAL ── */
function initJurnalFilter() {
  /* Delegate — works even after dynamic render */
  document.addEventListener('click', function (e) {
    if (!e.target.matches('.jurnal-filter .filter-btn')) return;
    var btn = e.target;
    document.querySelectorAll('.jurnal-filter .filter-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    var selected = btn.getAttribute('data-filter');
    document.querySelectorAll('.jurnal-entry').forEach(function (entry) {
      var entryTag = entry.getAttribute('data-tag');
      if (selected === 'semua' || entryTag === selected) {
        entry.classList.remove('hidden');
        entry.style.animation = 'fadeUp 0.35s ease both';
      } else {
        entry.classList.add('hidden');
        entry.style.animation = '';
      }
    });
  });
}

/* ── 5. MODAL PDF ── */
var PLACEHOLDER_PATTERN = 'GANTI_ID';

function initModal() {
  var modal = document.getElementById('pdf-modal');
  if (!modal) return;

  var modalCloseBtn = document.getElementById('modal-close-btn');
  var modalIframe   = document.getElementById('pdf-iframe');

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', function (e) {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  if (modalIframe) {
    modalIframe.addEventListener('load', function () {
      if (modalIframe.src && modalIframe.src !== 'about:blank' && modalIframe.src !== '') {
        modalIframe.classList.add('loaded');
        var loading = document.getElementById('modal-loading');
        if (loading) loading.classList.add('hide');
      }
    });
  }
}

function openPreview(card) {
  var modal       = document.getElementById('pdf-modal');
  var modalIframe = document.getElementById('pdf-iframe');
  var loading     = document.getElementById('modal-loading');

  var pdfSrc   = card.getAttribute('data-pdf')   || '';
  var pdfTitle = card.getAttribute('data-title') || 'Preview Dokumen';

  var downloadHref = '#';
  var dlBtn = card.querySelector('.btn-download-dok');
  if (dlBtn) downloadHref = dlBtn.getAttribute('href') || '#';

  document.getElementById('modal-title').textContent    = pdfTitle;
  document.getElementById('modal-subtitle').textContent = 'Google Drive · PDF';
  document.getElementById('modal-download-btn').href    = downloadHref;

  loading.classList.remove('hide');
  loading.innerHTML =
    '<div class="loading-spinner"></div>' +
    '<p>Memuat dokumen\u2026</p>' +
    '<small>Pastikan file Google Drive sudah disetel \u201cSiapa saja dengan link\u201d</small>';
  modalIframe.classList.remove('loaded');
  modalIframe.src = '';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  setTimeout(function () {
    if (pdfSrc && pdfSrc.indexOf(PLACEHOLDER_PATTERN) === -1) {
      modalIframe.src = pdfSrc;
    } else {
      loading.innerHTML =
        '<span style="font-size:2rem">\u26a0\ufe0f</span>' +
        '<p style="font-weight:600;color:var(--text-dark)">Link PDF belum diisi</p>' +
        '<small>Ganti ID file Google Drive di <strong>dokumen-items.json</strong></small>';
    }
  }, 80);
}

function openJurnalPreview(btn) {
  var modal       = document.getElementById('pdf-modal');
  var modalIframe = document.getElementById('pdf-iframe');
  var loading     = document.getElementById('modal-loading');

  var pdfSrc   = btn.getAttribute('data-pdf')   || '';
  var pdfTitle = btn.getAttribute('data-title') || 'Jurnal Refleksi';

  var downloadHref = '#';
  var dlBtn = btn.parentElement.querySelector('.btn-dl-jurnal');
  if (dlBtn) downloadHref = dlBtn.getAttribute('href') || '#';

  document.getElementById('modal-title').textContent    = pdfTitle;
  document.getElementById('modal-subtitle').textContent = 'Jurnal Refleksi \u00b7 PDF';
  document.getElementById('modal-download-btn').href    = downloadHref;

  loading.classList.remove('hide');
  loading.innerHTML =
    '<div class="loading-spinner"></div>' +
    '<p>Memuat jurnal\u2026</p>' +
    '<small>Pastikan file Google Drive sudah disetel \u201cSiapa saja dengan link\u201d</small>';
  modalIframe.classList.remove('loaded');
  modalIframe.src = '';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  setTimeout(function () {
    if (pdfSrc && pdfSrc.indexOf(PLACEHOLDER_PATTERN) === -1) {
      modalIframe.src = pdfSrc;
    } else {
      loading.innerHTML =
        '<span style="font-size:2rem">\u26a0\ufe0f</span>' +
        '<p style="font-weight:600;color:var(--text-dark)">Link PDF belum diisi</p>' +
        '<small>Ganti ID file Google Drive di <strong>jurnal-items.json</strong></small>';
    }
  }, 80);
}

function closeModal() {
  var modal       = document.getElementById('pdf-modal');
  var modalIframe = document.getElementById('pdf-iframe');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(function () { modalIframe.src = ''; }, 200);
}

/* ── 6. FADE-UP OBSERVER ── */
function initFadeObserver() {
  var fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.fade-up').forEach(function (el) {
    fadeObserver.observe(el);
  });
}

/* ── 7. STAGGER ANIMASI ── */
function initStagger() {
  document.querySelectorAll('.dokumen-grid .dokumen-card').forEach(function (card, i) {
    card.style.transitionDelay = (i * 0.08) + 's';
  });
  document.querySelectorAll('.aspek-grid .aspek-item').forEach(function (item, i) {
    item.style.transitionDelay = (i * 0.06) + 's';
  });
}

/* ── 8. SCORE RING ── */
function initScoreRings() {
  document.querySelectorAll('.final-score-ring').forEach(function (el) {
    var scoreEl = el.querySelector('.score-number');
    if (!scoreEl) return;
    var score   = parseFloat(scoreEl.textContent);
    var percent = (score / 4) * 100;
    el.style.setProperty('--progress', percent + '%');
    var color;
    if (score <= 1.5)    color = '#e74c3c';
    else if (score <= 2) color = '#f9d403';
    else                 color = '#27ae60';
    el.style.setProperty('--dynamic-color', color);
  });
}

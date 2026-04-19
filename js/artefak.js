/* ================================================================
   artefak.js — Content loader + existing functionality for artefak.html
   Loads JSON and renders cards. All original filter/modal logic preserved.
================================================================ */

/* ── UTILITY ── */
async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Failed to load: ' + path);
  return res.json();
}

/* ── MAIN INIT ── */
document.addEventListener('DOMContentLoaded', async function () {
  try {
    const [pageData, itemsData] = await Promise.all([
      loadJSON('../content/artefak/artefak-page.json'),
      loadJSON('../content/artefak/artefak-items.json')
    ]);
    renderPageHero(pageData.page);
    renderSections(pageData.sections);
    renderFilterBar(pageData.filter_buttons);
    renderArtefakCards(itemsData.items, pageData.sections);
    initAll();
  } catch (e) {
    console.warn('CMS content load error:', e);
    initAll(); /* still init JS even if fetch fails */
  }
});

/* ── PAGE HERO ── */
function renderPageHero(p) {
  const titleEl = document.querySelector('title');
  if (titleEl) titleEl.textContent = p.title;

  const tag = document.querySelector('.page-tag');
  if (tag) tag.textContent = p.tag;

  const h1 = document.querySelector('.page-hero h1');
  if (h1) h1.innerHTML = p.heading_line1 + ' <em>' + p.heading_em + '</em><br>' + p.heading_line2;

  const desc = document.querySelector('.page-hero > .page-hero-inner > p');
  if (desc) desc.textContent = p.description;

  const chips = document.querySelectorAll('.hero-stat-chip');
  p.stats.forEach(function (s, i) {
    if (chips[i]) chips[i].innerHTML = s.icon + ' <strong>' + s.count + '</strong> ' + s.label;
  });
}

/* ── FILTER BAR ── */
function renderFilterBar(buttons) {
  const bar = document.querySelector('.filter-bar');
  if (!bar) return;
  const label = bar.querySelector('.filter-label');
  bar.innerHTML = '';
  if (label) bar.appendChild(label);
  else { const l = document.createElement('span'); l.className = 'filter-label'; l.textContent = 'Filter:'; bar.appendChild(l); }

  buttons.forEach(function (btn, i) {
    const b = document.createElement('button');
    b.className = 'filter-btn' + (i === 0 ? ' active' : '');
    b.setAttribute('data-filter', btn.value);
    b.textContent = btn.label;
    bar.appendChild(b);
  });
}

/* ── SECTIONS (dividers) ── */
function renderSections(sections) {
  /* Section dividers are rendered alongside cards — handled in renderArtefakCards */
}

/* ── ARTEFAK CARDS ── */
function renderArtefakCards(items, sections) {
  const main = document.getElementById('main-content');
  if (!main) return;

  /* Clear existing grids and dividers but keep back-section */
  const backSection = main.querySelector('.back-section');
  main.innerHTML = '';

  /* Group items by category order from sections */
  const sectionOrder = sections.map(function (s) { return s.id; });

  /* Also handle 'presentasi' and 'lainnya' under the last section */
  const grouped = {};
  sectionOrder.forEach(function (id) { grouped[id] = []; });
  /* presentasi maps to lainnya section visually */
  grouped['presentasi'] = [];

  items.forEach(function (item) {
    if (grouped[item.category] !== undefined) {
      grouped[item.category].push(item);
    }
  });

  sections.forEach(function (sec) {
    /* Collect items for this section — presentasi goes under lainnya */
    let sectionItems = grouped[sec.id] || [];
    if (sec.id === 'lainnya') {
      sectionItems = sectionItems.concat(grouped['presentasi'] || []);
    }
    if (sectionItems.length === 0) return;

    /* Anchor */
    const anchor = document.createElement('div');
    anchor.id = sec.id;
    anchor.className = 'section-anchor';
    main.appendChild(anchor);

    /* Divider */
    const divider = document.createElement('div');
    divider.className = 'section-divider fade-up';
    divider.innerHTML =
      '<div class="section-icon">' + sec.icon + '</div>' +
      '<div class="section-divider-text">' +
        '<h2>' + sec.heading_line1 + ' <em>' + sec.heading_em + '</em></h2>' +
        '<p>' + sec.description + '</p>' +
      '</div>' +
      '<div class="section-line"></div>';
    main.appendChild(divider);

    /* Grid */
    const grid = document.createElement('div');
    grid.className = 'artefak-grid fade-up';

    sectionItems.forEach(function (item) {
      const card = document.createElement('div');
      card.className = 'artefak-card fade-up';
      card.setAttribute('data-cat', item.category);
      card.setAttribute('data-pdf', item.pdf_preview);
      card.setAttribute('data-title', item.title);

      card.innerHTML =
        '<div class="artefak-card-top">' +
          '<div class="artefak-card-icon">' + item.icon + '</div>' +
          '<div class="artefak-card-meta">' +
            '<span class="card-label">' + item.label + '</span>' +
            '<span class="card-sub">' + item.sub + '</span>' +
          '</div>' +
          '<div class="card-type-badge badge-' + item.badge_type + '">' + item.badge_text + '</div>' +
        '</div>' +
        '<h3 class="artefak-card-title">' + item.title + '</h3>' +
        '<p class="artefak-card-desc">' + item.description + '</p>' +
        '<div class="artefak-card-footer">' +
          '<div class="card-info-row">' +
            '<span class="card-date">📅 ' + item.date + '</span>' +
            '<span class="card-format">' + item.format_icon + ' ' + item.format + '</span>' +
          '</div>' +
          '<div class="card-actions">' +
            '<button class="btn-preview" onclick="openPreview(this.closest(\'.artefak-card\'))">👁 Preview</button>' +
            '<a href="' + item.download_href + '" target="_blank" class="btn-download">⬇ Unduh PDF</a>' +
          '</div>' +
        '</div>';

      grid.appendChild(card);
    });

    main.appendChild(grid);
  });

  /* Re-append back section */
  if (backSection) main.appendChild(backSection);
}


/* ══════════════════════════════════════════════════════════════
   ORIGINAL FUNCTIONALITY — UNCHANGED LOGIC
══════════════════════════════════════════════════════════════ */

function initAll() {
  initNav();
  initScrollHighlight();
  initFilter();
  initModal();
  initFadeObserver();
  initStagger();
}

/* 1. NAV */
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

/* 2. SCROLL HIGHLIGHT */
function initScrollHighlight() {
  var scrollSections = document.querySelectorAll('.section-anchor');
  var navLinks = document.querySelectorAll('.nav-links a');
  window.addEventListener('scroll', function () {
    var currentId = '';
    scrollSections.forEach(function (anchor) {
      if (window.scrollY >= anchor.offsetTop - 120) currentId = anchor.id;
    });
    navLinks.forEach(function (link) {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + currentId) link.classList.add('active');
    });
  });
}

/* 3. FILTER */
function initFilter() {
  var filterButtons = document.querySelectorAll('.filter-btn');
  var artefakCards = document.querySelectorAll('.artefak-card');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var selectedFilter = btn.getAttribute('data-filter');
      document.querySelectorAll('.artefak-card').forEach(function (card) {
        var cardCat = card.getAttribute('data-cat');
        if (selectedFilter === 'semua' || cardCat === selectedFilter) {
          card.classList.remove('hidden');
          card.style.animation = 'slideUp 0.3s ease both';
        } else {
          card.classList.add('hidden');
          card.style.animation = '';
        }
      });
      updateSectionVisibility();
    });
  });
}

function updateSectionVisibility() {
  document.querySelectorAll('.artefak-grid').forEach(function (grid) {
    var divider = grid.previousElementSibling;
    while (divider && !divider.classList.contains('section-divider')) {
      divider = divider.previousElementSibling;
    }
    if (!divider) return;
    var visibleCards = grid.querySelectorAll('.artefak-card:not(.hidden)');
    divider.style.display = visibleCards.length === 0 ? 'none' : 'flex';
  });
}

/* 4. MODAL */
function initModal() {
  var modal = document.getElementById('pdf-modal');
  var modalCloseBtn = document.getElementById('modal-close-btn');
  var modalIframe = document.getElementById('pdf-iframe');
  if (!modal) return;

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  if (modalIframe) {
    modalIframe.addEventListener('load', function () {
      modalIframe.classList.add('loaded');
      document.getElementById('modal-loading').classList.add('hide');
    });
  }
}

function openPreview(card) {
  var modal = document.getElementById('pdf-modal');
  var modalIframe = document.getElementById('pdf-iframe');
  var modalTitle = document.getElementById('modal-title');
  var modalSubtitle = document.getElementById('modal-subtitle');
  var modalDlBtn = document.getElementById('modal-download-btn');
  var modalLoading = document.getElementById('modal-loading');

  var pdfSrc = card.getAttribute('data-pdf') || '';
  var pdfTitle = card.getAttribute('data-title') || 'Preview Dokumen';
  var downloadHref = '#';
  var dlBtn = card.querySelector('.btn-download');
  if (dlBtn) downloadHref = dlBtn.getAttribute('href') || '#';

  modalTitle.textContent = pdfTitle;
  modalSubtitle.textContent = 'Google Drive · PDF';
  modalDlBtn.href = downloadHref;
  modalLoading.classList.remove('hide');
  modalIframe.classList.remove('loaded');
  modalIframe.src = '';
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  setTimeout(function () {
    if (pdfSrc && pdfSrc.indexOf('GANTI_ID') === -1) {
      modalIframe.src = pdfSrc;
    } else {
      modalLoading.innerHTML =
        '<span style="font-size:2rem">⚠️</span>' +
        '<p style="font-weight:600;color:var(--text-dark)">Link PDF belum diisi</p>' +
        '<small>Ganti ID file Google Drive di artefak-items.json</small>';
    }
  }, 80);
}

function closeModal() {
  var modal = document.getElementById('pdf-modal');
  var modalIframe = document.getElementById('pdf-iframe');
  modal.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(function () { modalIframe.src = ''; }, 200);
}

/* 5. FADE OBSERVER */
function initFadeObserver() {
  var fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fade-up').forEach(function (el) { fadeObserver.observe(el); });
}

/* 6. STAGGER */
function initStagger() {
  document.querySelectorAll('.artefak-grid').forEach(function (grid) {
    grid.querySelectorAll('.artefak-card').forEach(function (card, index) {
      card.style.transitionDelay = (index * 0.07) + 's';
    });
  });
}

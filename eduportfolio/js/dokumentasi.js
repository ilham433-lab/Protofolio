/* ================================================================
   dokumentasi.js — Content loader + existing functionality
   Loads JSON and renders content into existing layout.
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
    const [pageData, fotoData, videoData] = await Promise.all([
      loadJSON('../content/dokumentasi/dokumentasi-page.json'),
      loadJSON('../content/dokumentasi/foto-items.json'),
      loadJSON('../content/dokumentasi/video-items.json')
    ]);
    renderPageHero(pageData.page);
    renderStats(pageData.stats);
    renderFilterBar(pageData.filter_buttons);
    renderFotoSection(fotoData);
    renderVideoSection(videoData);
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
  if (tag) tag.textContent = p.tag;

  const h1 = document.querySelector('.page-hero h1');
  if (h1) h1.innerHTML = p.heading_line1 + '<br><em>' + p.heading_em + '</em>';

  const desc = document.querySelector('.page-hero p');
  if (desc) desc.textContent = p.description;
}

/* ── STATS ── */
function renderStats(stats) {
  const row = document.querySelector('.stats-row');
  if (!row) return;
  row.innerHTML = stats.map(function (s) {
    return '<div class="stat-chip"><div class="dot"></div> <strong>' + s.count + '</strong> ' + s.label + '</div>';
  }).join('');
}

/* ── FILTER BAR ── */
function renderFilterBar(buttons) {
  const bar = document.querySelector('.filter-bar');
  if (!bar) return;
  bar.innerHTML = '<span class="filter-label">Filter:</span>' +
    buttons.map(function (btn, i) {
      return '<button class="filter-btn' + (i === 0 ? ' active' : '') + '" onclick="setFilter(this,\'' + btn.value + '\')">' + btn.label + '</button>';
    }).join('');
}

/* ── FOTO SECTION ── */
function renderFotoSection(data) {
  const section = document.getElementById('foto-kegiatan');
  if (!section) return;

  const divider = section.querySelector('.section-divider');
  if (divider) {
    divider.querySelector('.section-divider-text h2').innerHTML =
      data.heading_line1 + ' <em>' + data.heading_em + '</em>';
    divider.querySelector('.section-divider-text p').textContent = data.description;
  }

  const grid = section.querySelector('.gallery-grid');
  if (!grid) return;

  grid.innerHTML = data.items.map(function (item) {
    const featuredClass = item.featured ? ' featured' : '';
    return '<div class="doc-card' + featuredClass + '" onclick="openLightbox(\'' + item.image_src + '\', \'' + item.lightbox_caption.replace(/'/g, "\\'") + '\')">' +
      '<div class="doc-thumb">' +
        '<img src="' + item.image_src + '" alt="' + item.image_alt + '" style="width:100%;height:100%;object-fit:cover;">' +
        '<div class="thumb-overlay"><div class="open-ico">🔍</div></div>' +
        '<div class="doc-type-badge">' + item.badge + '</div>' +
      '</div>' +
      '<div class="doc-info">' +
        '<div class="doc-category">' + item.doc_category + '</div>' +
        '<h3>' + item.title + '</h3>' +
        '<p>' + item.description + '</p>' +
        '<div class="doc-footer">' +
          '<span class="doc-date">📅 ' + item.date + '</span>' +
          '<a href="' + item.link + '" class="doc-link">' + item.link_text + '</a>' +
        '</div>' +
      '</div>' +
      '</div>';
  }).join('');
}

/* ── VIDEO SECTION ── */
function renderVideoSection(data) {
  /* Find the first valid video section (id="video-kegiatan") */
  const section = document.getElementById('video-kegiatan');
  if (!section) return;

  const divider = section.querySelector('.section-divider');
  if (divider) {
    divider.querySelector('.section-divider-text h2').innerHTML =
      data.heading_line1 + ' <em>' + data.heading_em + '</em>';
    divider.querySelector('.section-divider-text p').textContent = data.description;
  }

  const grid = section.querySelector('.gallery-grid');
  if (!grid) return;

  grid.innerHTML = data.items.map(function (item) {
    let thumbHtml;
    if (item.type === 'thumbnail') {
      thumbHtml =
        '<div onclick="window.open(\'' + item.youtube_url + '\', \'_blank\')" style="cursor:pointer;width:100%;height:100%;">' +
          '<img src="https://img.youtube.com/vi/' + item.youtube_id + '/hqdefault.jpg" style="width:100%;height:100%;object-fit:cover;">' +
        '</div>';
    } else {
      thumbHtml =
        '<iframe style="width:100%;height:100%;border:none;" src="' + item.embed_src + '" title="' + item.title + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
    }

    return '<div class="doc-card" style="cursor:default;">' +
      '<div class="doc-thumb" style="height:200px;padding:0;background:#000;">' + thumbHtml + '</div>' +
      '<div class="doc-info">' +
        '<div class="doc-category">' + item.category + '</div>' +
        '<h3>' + item.title + '</h3>' +
        '<p>' + item.description + '</p>' +
        '<div class="doc-footer">' +
          '<span class="doc-date">📅 ' + item.date + '</span>' +
          '<a href="' + item.watch_href + '" target="_blank" class="doc-link">▶ Tonton</a>' +
        '</div>' +
      '</div>' +
      '</div>';
  }).join('');
}


/* ══════════════════════════════════════════════════════════════
   ORIGINAL FUNCTIONALITY — UNCHANGED LOGIC
══════════════════════════════════════════════════════════════ */

function initAll() {
  initNav();
  initLightbox();
  initFadeObserver();
}

/* NAV */
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('open');
  if (navLinks.classList.contains('open')) {
    navLinks.style.display = 'flex';
    navLinks.style.flexDirection = 'column';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '68px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.background = 'rgba(250,252,255,0.97)';
    navLinks.style.padding = '16px 5%';
  } else {
    navLinks.style.display = '';
  }
}

function initNav() {
  document.querySelectorAll('.nav-links a').forEach(function (a) {
    a.addEventListener('click', function () {
      const navLinks = document.getElementById('navLinks');
      navLinks.classList.remove('open');
      if (window.innerWidth <= 600) navLinks.style.display = 'none';
    });
  });
}

/* LIGHTBOX */
function openLightbox(src, caption) {
  if (!src || src === '') return;
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  lightboxImg.src = src;
  lightboxCaption.textContent = caption || '';
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  lightbox.classList.remove('open');
  document.getElementById('lightbox-img').src = '';
  document.body.style.overflow = '';
}

function initLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  lightbox.addEventListener('click', function (e) { if (e.target === this) closeLightbox(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
}

/* FILTER — now functional with data-cat */
function setFilter(btn, cat) {
  document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.doc-card[data-cat]').forEach(function (card) {
    if (cat === 'semua' || card.getAttribute('data-cat') === cat) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

/* FADE OBSERVER */
function initFadeObserver() {
  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.10 });
  document.querySelectorAll('.fade-up').forEach(function (el) { observer.observe(el); });
}

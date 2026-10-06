// Emily Root · Desktop — draggable windows, project browser, taskbar, theme.
(() => {
  const PROJECTS = window.PROJECTS;
  const FILTERS = [['all', 'All projects'], ['software', 'Software'], ['games', 'Games'], ['jams', 'Game jams']];
  const match = (p, f) => f === 'all' || (f === 'software' ? p.kind === 'Software' : f === 'games' ? p.kind === 'Game' && !p.jam : !!p.jam);
  const DEFS = { projects: { title: 'Projects', w: 800, h: 540 }, about: { title: 'About.txt', w: 470, h: 430 }, resume: { title: 'Resume.pdf', w: 500, h: 620 }, contact: { title: 'New message', w: 500, h: 500 } };
  const ORDER = ['projects', 'about', 'resume', 'contact'];
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  // Browser zoom: pages can't read the zoom level, but it shows up as a change in devicePixelRatio
  // from the first visit's. The UI layer is counter-scaled by 1/zoom so windows, icons and the taskbar keep
  // their size on screen, and text sizes are multiplied by --z, so only the text gets bigger.
  // Positions below are in these unzoomed layout units, so the viewport and pointer are scaled by zoom.
  let baseDpr = devicePixelRatio;
  try {
    const saved = parseFloat(localStorage.getItem('er-base-dpr'));
    if (saved > 0) baseDpr = saved; else localStorage.setItem('er-base-dpr', String(baseDpr));
  } catch (e) {}
  let zoom = 1, TASKBAR = 48, TITLEBAR = 38;
  const applyZoom = () => {
    zoom = Math.min(3, Math.max(1, devicePixelRatio / baseDpr));
    TASKBAR = 48 + 16 * (zoom - 1);
    TITLEBAR = 38 + 10 * (zoom - 1);
    document.documentElement.style.setProperty('--z', zoom);
    $('#ui').style.zoom = 1 / zoom;
  };
  applyZoom();

  const q = new URLSearchParams(location.search);
  const embedded = q.get('embed') === '1';
  const vw0 = innerWidth * zoom, vh0 = innerHeight * zoom, narrow0 = vw0 < 700;
  const pw0 = Math.min(DEFS.projects.w, vw0 - 16), ph0 = Math.min(DEFS.projects.h, vh0 - TASKBAR - 16);
  const s = {
    vw: vw0, vh: vh0, top: 2, filter: 'all', sel: null, start: false,
    wins: {
      projects: { open: true, min: false, z: 2, x: narrow0 ? 8 : Math.max(8, Math.min(Math.max(150, vw0 - pw0 - 40), vw0 - pw0 - 8)), y: narrow0 ? 24 : Math.max(16, Math.round((vh0 - TASKBAR - ph0) / 2) + 16) },
      about: { open: true, min: false, z: 1, x: narrow0 ? 8 : 116, y: narrow0 ? 8 : 28 },
      resume: { open: false, min: false, x: 0, y: 0, z: 0, placed: false },
      contact: { open: false, min: false, x: 0, y: 0, z: 0, placed: false },
    },
  };

  // √Emily marks
  const markTpl = $('#rootmark');
  $$('[data-rootmark]').forEach((el) => el.appendChild(markTpl.content.cloneNode(true)));

  // Theme
  const setTheme = (t) => {
    if (t !== 'light' && t !== 'dark') return;
    document.documentElement.dataset.theme = t;
    $$('.mode button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.theme === t)));
  };
  setTheme(q.get('theme') || 'dark');
  $$('.mode button').forEach((b) => b.addEventListener('click', () => setTheme(b.dataset.theme)));
  addEventListener('message', (e) => { if (e.data && e.data.type === 'er-theme') setTheme(e.data.theme); });

  // Clock
  const tick = () => { $('#clock').textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }); };
  tick(); setInterval(tick, 15000);

  // Leaving: back to the 3D desk (parent frame when embedded, the desk page otherwise)
  const exit = () => {
    s.start = false; render();
    if (embedded) { try { parent.postMessage({ type: 'er-exit' }, '*'); } catch (e) {} } else location.href = './';
  };
  $$('[data-exit]').forEach((b) => b.addEventListener('click', exit));
  addEventListener('keydown', (e) => { if (e.key !== 'Escape') return; if (s.start) { s.start = false; render(); } else exit(); });

  // Window geometry
  const geo = (id) => {
    const d = DEFS[id], narrow = s.vw < 700;
    const w = Math.min(d.w, s.vw - 16), h = Math.min(d.h, s.vh - TASKBAR - 16);
    return { w, h, x: narrow ? 8 : Math.max(-(w - 90), Math.min(s.wins[id].x, s.vw - 90)), y: Math.min(s.wins[id].y, Math.max(0, s.vh - TASKBAR - TITLEBAR)) };
  };
  const open = (id) => {
    const w = s.wins[id];
    s.top += 1;
    Object.assign(w, { open: true, min: false, z: s.top });
    if (!w.placed && id !== 'projects' && id !== 'about') {
      const ww = Math.min(DEFS[id].w, s.vw - 16), hh = Math.min(DEFS[id].h, s.vh - TASKBAR - 16), off = id === 'contact' ? 30 : 0;
      w.x = Math.max(8, Math.round((s.vw - ww) / 2) + off); w.y = Math.max(8, Math.round((s.vh - TASKBAR - hh) / 2) + off); w.placed = true;
    }
    s.start = false;
    render();
  };
  const focus = (id) => { if (s.wins[id].z === s.top) return; s.top += 1; s.wins[id].z = s.top; render(); };
  const activeId = () => ORDER.filter((id) => s.wins[id].open && !s.wins[id].min).sort((a, b) => s.wins[b].z - s.wins[a].z)[0];

  let drag = null;
  for (const el of $$('.win')) {
    const id = el.dataset.win;
    el.addEventListener('pointerdown', () => focus(id));
    $('.win-bar', el).addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      e.preventDefault();
      const g = geo(id);
      drag = { id, dx: e.clientX * zoom - g.x, dy: e.clientY * zoom - g.y };
    });
    $('[data-act="min"]', el).addEventListener('click', () => { s.wins[id].min = true; render(); });
    $('[data-act="close"]', el).addEventListener('click', () => { Object.assign(s.wins[id], { open: false, min: false }); render(); });
  }
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    const { id, dx, dy } = drag, w = geo(id).w;
    s.wins[id].x = Math.max(-(w - 90), Math.min(s.vw - 90, e.clientX * zoom - dx));
    s.wins[id].y = Math.max(0, Math.min(s.vh - TASKBAR - TITLEBAR, e.clientY * zoom - dy));
    placeWindows();
  });
  addEventListener('pointerup', () => { drag = null; });
  addEventListener('resize', () => { applyZoom(); s.vw = innerWidth * zoom; s.vh = innerHeight * zoom; render(); });

  $$('[data-open]').forEach((b) => b.addEventListener('click', () => open(b.dataset.open)));

  // Start menu
  const startEl = $('#start'), startBtn = $('#startBtn');
  startBtn.addEventListener('click', () => { s.start = !s.start; render(); });
  startBtn.addEventListener('pointerdown', (e) => e.stopPropagation());
  startEl.addEventListener('pointerdown', (e) => e.stopPropagation());
  $('#desk').addEventListener('pointerdown', () => { if (s.start) { s.start = false; render(); } });

  // Projects window content
  const pMain = $('#pMain'), foldersEl = $('#folders');
  const thumbStyle = (p) => `background-image:url('${esc(p.img)}');background-size:${p.contain ? 'contain' : 'cover'};image-rendering:${p.pixel ? 'pixelated' : 'auto'}`;
  const kindColor = (p) => (p.kind === 'Software' ? 'var(--a2)' : 'var(--a1)');
  const renderProjects = () => {
    const sel = s.sel ? PROJECTS.find((p) => p.id === s.sel) : null;
    foldersEl.innerHTML = FILTERS.map(([id, label]) =>
      `<button class="folder${s.filter === id ? ' on' : ''}${s.filter === id && !sel ? ' hl' : ''}" data-filter="${id}"><span>${esc(label)}</span><span class="mono">${PROJECTS.filter((p) => match(p, id)).length}</span></button>`).join('');
    const label = FILTERS.find((f) => f[0] === s.filter)[1];
    let html = `<div class="crumbs">${sel ? '<button class="back" data-back>‹ Back</button>' : ''}<span>Projects / ${esc(sel ? sel.title : label)}</span></div>`;
    if (!sel) {
      html += '<div class="grid">' + PROJECTS.filter((p) => match(p, s.filter)).map((p) =>
        `<button class="tile" data-project="${p.id}">` +
          (p.img ? `<span class="thumb" style="background:${p.contain ? 'var(--a1t)' : 'var(--phA)'}"><span style="${thumbStyle(p)}"></span></span>` : '<span class="thumb ph"></span>') +
          `<span class="tile-title">${esc(p.title)}</span>` +
          `<span class="tile-meta"><span style="color:${kindColor(p)}">${p.kind}</span> · ${p.year}</span>` +
        '</button>').join('') + '</div>';
    } else {
      const sw = sel.kind === 'Software';
      html += '<div class="detail">' +
        (sel.img ? `<div class="hero" style="background:${sel.contain ? 'var(--a1t)' : 'var(--phA)'}"><div role="img" aria-label="${esc(sel.title)}" style="${thumbStyle(sel)};background-position:center"></div></div>`
                 : `<div class="hero ph">${esc(sel.phLabel)}</div>`) +
        `<div style="display:flex;flex-direction:column;gap:4px"><h2>${esc(sel.title)}</h2><span class="detail-meta"><b style="color:${kindColor(sel)}">${sel.kind}</b> · ${esc(sel.meta)} · ${sel.year}</span></div>` +
        `<p>${esc(sel.desc)}</p>` +
        `<div class="tags">${sel.tags.map((t) => `<span class="tag" style="background:${sw ? 'var(--a2t)' : 'var(--a1t)'};color:${kindColor(sel)}">${esc(t)}</span>`).join('')}</div>` +
        (sel.link ? `<a class="btn-primary" href="${esc(sel.link)}" target="_blank" rel="noopener">Play on itch.io ↗</a>` : '<button class="btn-ghost" data-open-contact>Ask me about it →</button>') +
        '</div>';
    }
    pMain.innerHTML = html;
    pMain.scrollTop = 0;
  };
  foldersEl.addEventListener('click', (e) => { const b = e.target.closest('[data-filter]'); if (b) { s.filter = b.dataset.filter; s.sel = null; renderProjects(); } });
  pMain.addEventListener('click', (e) => {
    const t = e.target.closest('[data-project],[data-back],[data-open-contact]');
    if (!t) return;
    if (t.dataset.project) { s.sel = t.dataset.project; renderProjects(); }
    else if ('back' in t.dataset) { s.sel = null; renderProjects(); }
    else open('contact');
  });

  // Render
  const tabsEl = $('#tabs');
  const placeWindows = () => {
    for (const el of $$('.win')) {
      const g = geo(el.dataset.win);
      Object.assign(el.style, { left: g.x + 'px', top: g.y + 'px', width: g.w + 'px', height: g.h + 'px' });
    }
  };
  const render = () => {
    const act = activeId();
    for (const el of $$('.win')) {
      const id = el.dataset.win, w = s.wins[id];
      el.hidden = !(w.open && !w.min);
      el.style.zIndex = w.z;
      el.classList.toggle('active', id === act);
    }
    placeWindows();
    $('.p-side').hidden = geo('projects').w < 560;
    tabsEl.innerHTML = ORDER.filter((id) => s.wins[id].open).map((id) =>
      `<button class="tab${id === act ? ' active' : ''}${s.wins[id].min ? ' min' : ''}" data-tab="${id}">${DEFS[id].title}</button>`).join('');
    startEl.hidden = !s.start;
    startBtn.classList.toggle('on', s.start);
  };
  tabsEl.addEventListener('click', (e) => {
    const b = e.target.closest('[data-tab]');
    if (!b) return;
    const id = b.dataset.tab;
    if (id === activeId()) { s.wins[id].min = true; render(); } else open(id);
  });

  renderProjects();
  render();
})();

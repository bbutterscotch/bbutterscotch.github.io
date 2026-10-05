// Emily Root · Desktop — draggable windows, project browser, taskbar, theme.
(() => {
  const PROJECTS = [
    { id: 'outlook', title: 'BrightVine Outlook Integration', kind: 'Software', year: '2025', meta: 'BrightVine Solutions', desc: 'Add a short description: what the add-in does, who uses it, and the part you owned.', tags: ['Outlook add-in', 'BrightVine'], phLabel: 'add-in screenshot' },
    { id: 'snapshot', title: 'Snapshot', kind: 'Software', year: '2025', meta: 'BrightVine Solutions', desc: 'Add a short description of Snapshot and your role on it.', tags: ['BrightVine'], phLabel: 'Snapshot screenshot' },
    { id: 'gainz', title: 'Gainz: The Financial Literacy Game', kind: 'Game', year: '2024', meta: 'Team lead + programmer, team of 5', img: 'img/gainz_logo_large.png', contain: true, desc: 'Gainz is an educational game about financial literacy. It was created in for a non-profit educational organization, Katabasis, in 2024. I worked with a team of 5 as the team lead and programmer.', tags: ['Katabasis', 'Team lead', 'Educational'], link: 'https://bbutterscotch.itch.io/gainz' },
    { id: 'pollenation', title: 'Pollenation', kind: 'Game', jam: true, year: '2024', meta: 'GMTK Jam, main programmer', img: 'img/pollenation.png', desc: 'Pollenation is a beehive simulation game where the player controls a hive of bees through resource tiles. It was created for GMTK Jam 2024, but was not finished in the given 72 hours. I worked on a team of 4 as the main programmer.', tags: ['GMTK Jam 2024', 'Team of 4', 'Simulation'], link: 'https://xinmi.itch.io/pollenation' },
    { id: 'cats', title: "Cat's Cradle", kind: 'Game', jam: true, year: '2023', meta: 'GMTK Jam, programmer', img: 'img/cats_cradle.png', pixel: true, desc: "Cat's Cradle is a tile-based puzzle game where the player tries to rid its home of pesky dogs. It was created for GMTK Jam 2023 and made in 48 hours. I worked with a team of 6 as a programmer.", tags: ['GMTK Jam 2023', '48 hours', 'Puzzle'], link: 'https://xinmi.itch.io/cats-cradle' },
    { id: 'javabean', title: 'JavaBean', kind: 'Software', year: '2023', meta: 'Lead UX + front end', img: 'img/baristaHome.png', desc: 'JavaBean is a project I worked on as a front-end developer in a software engineering class in 2023. As the lead UX designer, I overhauled the original design, came up with wireframes for all the usecases, and implemented the design using Bootstrap and AngularJS.', tags: ['AngularJS', 'Bootstrap', 'UX'] },
    { id: 'resource', title: 'Resource Rush', kind: 'Game', year: '2023', meta: 'Unity port, features + art', img: 'img/resourcerush.png', desc: 'Resource Rush is an educational farming game created in Unity in 2023. I converted the project from a javascript-based game to a Unity one and added features and art.', tags: ['Unity', 'Educational'] },
    { id: 'winter', title: 'Winter Break', kind: 'Game', year: '2023', meta: 'Class project, programmer', img: 'img/winterbreak.png', desc: 'Winter Break is a puzzle adventure game where the player is trapped in a snowglobe and must find all the pieces to escape. It was created for a class in 2023. I worked with a team of 4 as a programmer.', tags: ['Team of 4', 'Puzzle adventure'] },
    { id: 'squid', title: 'Squidnapped', kind: 'Game', year: '2023', meta: 'Solo, PuzzleScript', img: 'img/squidnapped.png', pixel: true, desc: 'Squidnapped is a game created in PuzzleScript about a squid escaping an aquarium by blocking cameras. I created it on my own for a class in 2023.', tags: ['PuzzleScript', 'Solo'], link: 'https://bbutterscotch.itch.io/squidnapped' },
    { id: 'dice', title: 'Dice Warp', kind: 'Game', jam: true, year: '2022', meta: 'GMTK Jam, solo', img: 'img/dicewarp.png', pixel: true, desc: 'Dice warp is a tile-based puzzle game built in Unity where the goal is to get the dice to the end with the correct face. I created it on my own for GMTK Jam 2022. I used outside assets for the art.', tags: ['GMTK Jam 2022', 'Unity', 'Solo'], link: 'https://bbutterscotch.itch.io/dice-warp' },
    { id: 'gods', title: "God's Year Off", kind: 'Game', jam: true, year: '2021', meta: 'GMTK Jam, solo art + code', img: 'img/gods_year_off.png', pixel: true, desc: "God's Year Off is a asteroids-style pixel art game. I created it for GMTK Jam 2021 and it was the first game I ever published. I created all of the art and programmed it on my own.", tags: ['GMTK Jam 2021', 'Pixel art', 'Solo'], link: 'https://bbutterscotch.itch.io/gods-year-off' },
  ];
  const FILTERS = [['all', 'All projects'], ['software', 'Software'], ['games', 'Games'], ['jams', 'Game jams']];
  const match = (p, f) => f === 'all' || (f === 'software' ? p.kind === 'Software' : f === 'games' ? p.kind === 'Game' && !p.jam : !!p.jam);
  const DEFS = { projects: { title: 'Projects', w: 800, h: 540 }, about: { title: 'About.txt', w: 470, h: 430 }, resume: { title: 'Resume.pdf', w: 500, h: 620 }, contact: { title: 'New message', w: 500, h: 500 } };
  const ORDER = ['projects', 'about', 'resume', 'contact'];
  const TASKBAR = 48;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const q = new URLSearchParams(location.search);
  const embedded = q.get('embed') === '1';
  const vw0 = innerWidth, vh0 = innerHeight, narrow0 = vw0 < 700;
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
    return { w, h, x: narrow ? 8 : Math.max(-(w - 90), Math.min(s.wins[id].x, s.vw - 90)), y: Math.min(s.wins[id].y, Math.max(0, s.vh - TASKBAR - 38)) };
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
      drag = { id, dx: e.clientX - g.x, dy: e.clientY - g.y };
    });
    $('[data-act="min"]', el).addEventListener('click', () => { s.wins[id].min = true; render(); });
    $('[data-act="close"]', el).addEventListener('click', () => { Object.assign(s.wins[id], { open: false, min: false }); render(); });
  }
  addEventListener('pointermove', (e) => {
    if (!drag) return;
    const { id, dx, dy } = drag, w = geo(id).w;
    s.wins[id].x = Math.max(-(w - 90), Math.min(s.vw - 90, e.clientX - dx));
    s.wins[id].y = Math.max(0, Math.min(s.vh - TASKBAR - 38, e.clientY - dy));
    placeWindows();
  });
  addEventListener('pointerup', () => { drag = null; });
  addEventListener('resize', () => { s.vw = innerWidth; s.vh = innerHeight; render(); });

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

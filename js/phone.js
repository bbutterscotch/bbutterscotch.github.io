// Emily Root · Phone — home screen, apps, project details, theme.
(() => {
  const PROJECTS = window.PROJECTS;
  const APPS = {
    code: { title: 'Code', filter: (p) => p.kind === 'Software' },
    games: { title: 'Games', filter: (p) => p.kind === 'Game' && !p.jam },
    jams: { title: 'Game Jams', filter: (p) => !!p.jam },
    about: { title: 'About', sub: '' },
    resume: { title: 'Resume', sub: 'resume_emilyroot.pdf · 1 page' },
    mail: { title: 'Mail', sub: 'New message' },
    settings: { title: 'Settings', sub: '' },
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const s = { app: null, closing: false, detail: null, detailClosing: false };

  // √Emily marks
  const markTpl = $('#rootmark');
  $$('[data-rootmark]').forEach((el) => el.appendChild(markTpl.content.cloneNode(true)));

  // Stars (seeded, so they sit in the same places every visit)
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  $('#stars').style.boxShadow = Array.from({ length: 70 }, () =>
    `${(rnd() * 100).toFixed(1)}cqw ${(rnd() * 62).toFixed(1)}cqh rgba(255,255,255,${(0.35 + rnd() * 0.6).toFixed(2)})`).join(',');

  // On a real phone (not inside the desk) the phone site is the whole site: drop the drawn phone chrome and
  // the ways back to the desk, and let the device's back button close projects and apps.
  const native = window.isPhone && parent === window;
  if (native) document.documentElement.classList.add('native');
  const themeColor = $('meta[name="theme-color"]');

  // Theme: ?theme=, then the desk's er-theme message, else the system preference
  const setTheme = (t) => {
    if (t !== 'light' && t !== 'dark') return;
    document.documentElement.dataset.theme = t;
    $$('.seg button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.theme === t)));
    themeColor.content = t === 'light' ? '#d1edfb' : '#0a0f24'; // browser bar matches the wallpaper
  };
  const qTheme = new URLSearchParams(location.search).get('theme');
  setTheme(qTheme === 'light' || qTheme === 'dark' ? qTheme : (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
  $$('.seg button').forEach((b) => b.addEventListener('click', () => setTheme(b.dataset.theme)));
  addEventListener('message', (e) => { if (e.data && e.data.type === 'er-theme') setTheme(e.data.theme); });

  // Status bar clock
  const tick = () => { $('#clock').textContent = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/\s?[AP]M/i, ''); };
  tick(); setInterval(tick, 15000);

  // Leaving: back to the 3D desk (parent frame when embedded, the home page otherwise)
  const leave = () => { if (parent !== window) parent.postMessage({ type: 'er-exit' }, '*'); else location.href = './'; };
  $$('[data-leave]').forEach((b) => b.addEventListener('click', leave));

  // Apps
  const appEl = $('#app'), detailEl = $('#detail'), listEl = $('#list');
  const bg = (p, ph) => `background:url('${esc(p.img || 'data:image/gif;base64,R0lGODlhAQABAAAAACw=')}') center / ${p.contain ? 'contain' : 'cover'} no-repeat,` +
    `repeating-linear-gradient(135deg,var(--phA) 0 ${ph}px,var(--phB) ${ph}px ${ph + 1}px);image-rendering:${p.pixel ? 'pixelated' : 'auto'}`;

  const openApp = (id) => {
    const a = APPS[id];
    Object.assign(s, { app: id, closing: false, detail: null, detailClosing: false });
    const items = a.filter ? PROJECTS.filter(a.filter) : [];
    $('#appTitle').textContent = a.title;
    $('#appSub').textContent = a.filter ? `${items.length} project${items.length === 1 ? '' : 's'}` : a.sub;
    $$('[data-pane]', appEl).forEach((el) => { el.hidden = el.dataset.pane !== (a.filter ? 'list' : id); });
    if (a.filter) {
      listEl.innerHTML = items.map((p) =>
        `<button class="row" data-project="${p.id}"><span class="row-thumb" style="${bg(p, 6)}"></span>` +
        `<span class="row-text"><span class="row-title">${esc(p.title)}</span><span class="row-meta">${esc(p.meta)}</span></span>` +
        `<span class="row-year">${p.year} ›</span></button>`).join('');
    }
    detailEl.hidden = true;
    appEl.classList.remove('closing');
    // Restart the open animation even when switching straight from one app to another
    appEl.hidden = true; void appEl.offsetWidth; appEl.hidden = false;
    $('.sheet-body', appEl).scrollTop = 0;
    $('#homebar').setAttribute('aria-label', 'Home');
  };
  const goHome = () => {
    if (!s.app || s.closing) return;
    s.closing = true; s.detail = null; detailEl.hidden = true;
    appEl.classList.add('closing');
    setTimeout(() => { appEl.hidden = true; appEl.classList.remove('closing'); s.app = null; s.closing = false; $('#homebar').setAttribute('aria-label', 'Home bar'); }, 220);
  };
  const openDetail = (id) => {
    const p = PROJECTS.find((x) => x.id === id);
    Object.assign(s, { detail: id, detailClosing: false });
    $('#backLabel').textContent = APPS[s.app].title;
    $('#detailBody').innerHTML =
      `<div class="hero" role="img" aria-label="${esc(p.title)}" style="${bg(p, 8)}"></div>` +
      `<div class="detail-title"><h2>${esc(p.title)}</h2><span>${esc(p.meta)} · ${p.year}</span></div>` +
      `<p class="detail-desc">${esc(p.desc)}</p>` +
      `<div class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>` +
      (p.link ? `<a class="btn" href="${esc(p.link)}" target="_blank" rel="noopener">Play on itch.io ↗</a>` : '<span class="no-link">No public build. Ask me about it in Mail.</span>');
    detailEl.classList.remove('closing');
    detailEl.hidden = false;
    $('#detailBody').scrollTop = 0;
  };
  const closeDetail = () => {
    if (!s.detail || s.detailClosing) return;
    s.detailClosing = true;
    detailEl.classList.add('closing');
    setTimeout(() => { detailEl.hidden = true; detailEl.classList.remove('closing'); s.detail = null; s.detailClosing = false; }, 240);
  };

  // On a real phone each open app and project is a history entry, so the back button/gesture closes it.
  // Switching apps replaces the entry; the on-screen Home and back buttons go back through history too.
  const show = {
    app: (id) => { if (native) history[s.app ? 'replaceState' : 'pushState']({ er: 'app' }, ''); openApp(id); },
    detail: (id) => { if (native) history.pushState({ er: 'detail' }, ''); openDetail(id); },
  };
  const closeDetailUI = () => { if (native && s.detail) history.back(); else closeDetail(); };
  const goHomeUI = () => { if (native && s.app) history.go(s.detail ? -2 : -1); else goHome(); };
  addEventListener('popstate', (e) => {
    if (!native) return;
    const at = e.state && e.state.er; // the entry we landed on: nothing (home), an app, or a project
    if (!at) goHome(); else if (at === 'app' && s.detail) closeDetail();
  });

  $$('[data-app]').forEach((b) => b.addEventListener('click', () => show.app(b.dataset.app)));
  listEl.addEventListener('click', (e) => { const b = e.target.closest('[data-project]'); if (b) show.detail(b.dataset.project); });
  $('#detailBack').addEventListener('click', closeDetailUI);
  $('#homebar').addEventListener('click', goHomeUI);
  $('#appHome').addEventListener('click', goHomeUI);
  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (s.detail) closeDetailUI(); else if (s.app) goHomeUI(); else if (!native) leave();
  });
})();

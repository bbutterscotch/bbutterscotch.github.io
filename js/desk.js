// 3D desk scene: model, lava-lamp lighting states, and zoom-in to the desktop / phone.
import { createStage } from './stage.js';

const stage = createStage(document.getElementById('stage'), { autorotate: true });
const { THREE } = stage;
const g = new THREE.Group(); g.name = 'desk_computer';

const M = {
  desk: new THREE.MeshStandardMaterial({ name: 'desk_black', color: 0x18181c, roughness: 0.55, metalness: 0 }),
  legs: new THREE.MeshStandardMaterial({ name: 'legs_black', color: 0x222227, roughness: 0.4, metalness: 0.3 }),
  plastic: new THREE.MeshStandardMaterial({ name: 'plastic_navy', color: 0x1d2440, roughness: 0.5, metalness: 0.05 }),
  metal: new THREE.MeshStandardMaterial({ name: 'brushed_metal', color: 0xb4bcc6, roughness: 0.38, metalness: 0.35 }),
  key: new THREE.MeshStandardMaterial({ name: 'keycap', color: 0xe9edf4, roughness: 0.55 }),
  screen: new THREE.MeshStandardMaterial({ name: 'screen', color: 0x0a0f24, emissive: 0x0a0f24, emissiveIntensity: 1, roughness: 0.2 }),
  side: new THREE.MeshStandardMaterial({ name: 'screen_sidebar', color: 0x1f2a5c, emissive: 0x1f2a5c, emissiveIntensity: 1, roughness: 0.3 }),
  row: new THREE.MeshStandardMaterial({ name: 'screen_rows', color: 0x16204a, emissive: 0x16204a, emissiveIntensity: 1, roughness: 0.3 }),
  aqua: new THREE.MeshStandardMaterial({ name: 'teal_glow', color: 0x4fe0e6, emissive: 0x2fc6cf, emissiveIntensity: 1.2, roughness: 0.3 }),
  yellow: new THREE.MeshStandardMaterial({ name: 'yellow_glow', color: 0xffd84d, emissive: 0xf5c21b, emissiveIntensity: 1.0, roughness: 0.3 }),
  mouse: new THREE.MeshStandardMaterial({ name: 'mouse_black', color: 0x16161a, roughness: 0.35, metalness: 0.1 }),
  can: new THREE.MeshStandardMaterial({ name: 'soda_can_black', color: 0x16161a, roughness: 0.3, metalness: 0.3 }),
  alu: new THREE.MeshStandardMaterial({ name: 'aluminum', color: 0xd3d7dd, roughness: 0.3, metalness: 0.4 }),
  cover: new THREE.MeshStandardMaterial({ name: 'book_cover', color: 0x24305e, roughness: 0.6 }),
  pages: new THREE.MeshStandardMaterial({ name: 'book_pages', color: 0xf3eee2, roughness: 0.85 }),
};
const add = (name, geo, mat, x, y, z, parent = g) => { const m = new THREE.Mesh(geo, mat); m.name = name; m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; };
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);

// Desk
const TOP = 0.75, DW = 1.4, DD = 0.7, DT = 0.03;
add('desk_top', box(DW, DT, DD), M.desk, 0, TOP - DT / 2, 0);
for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
  add('desk_leg', new THREE.CylinderGeometry(0.018, 0.014, TOP - DT, 24), M.legs, sx * (DW / 2 - 0.07), (TOP - DT) / 2, sz * (DD / 2 - 0.07));
}
add('desk_rail_back', box(DW - 0.14, 0.04, 0.02), M.legs, 0, TOP - DT - 0.02, -(DD / 2 - 0.07));

// Monitor
const mz = -0.17;
add('monitor_base', new THREE.CylinderGeometry(0.11, 0.12, 0.012, 48), M.metal, 0, TOP + 0.006, mz - 0.03);
add('monitor_neck', box(0.05, 0.3, 0.02), M.metal, 0, TOP + 0.15, mz - 0.06);
const PW = 0.64, PH = 0.38, PD = 0.025, PY = TOP + 0.31;
add('monitor_bezel', box(PW, PH, PD), M.plastic, 0, PY, mz);
const sz0 = mz + PD / 2 + 0.001, SW = 0.61, SH = 0.345;
add('screen', box(SW, SH, 0.002), M.screen, 0, PY + 0.005, sz0);
// on-screen UI: low-poly desktop (stars, stepped sun, grid floor, Projects window, taskbar)
const uiMats = [], uiCache = {};
const glow = (hex, k = 1) => { const key = hex + ':' + k; if (!uiCache[key]) { const m = new THREE.MeshStandardMaterial({ name: 'ui_' + hex.toString(16).padStart(6, '0') + (k !== 1 ? '_dim' : ''), color: hex, emissive: hex, emissiveIntensity: k, roughness: 0.4 }); uiCache[key] = m; uiMats.push(m); } return uiCache[key]; };
const lerpHex = (a, b, t) => new THREE.Color(a).lerp(new THREE.Color(b), t).getHex();
const sy0 = PY + 0.005, SB = -SH / 2, TB = 0.022;
const q = (name, w, hh, mat, x, y, layer) => { const m = add('ui_' + name, box(w, hh, 0.0004), mat, x, sy0 + y, sz0 + 0.0012 + layer * 0.0005); m.castShadow = false; return m; };
const yH = SB + TB + (SH - TB) * 0.4;
let sd = 5; const rr = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
for (let i = 0; i < 30; i++) { const s = 0.0015 + rr() * 0.0015; q('star', s, s, glow(0xffffff, 0.8), (rr() - 0.5) * (SW - 0.01), yH + 0.012 + rr() * (SH / 2 - yH - 0.016), 0); }
const SUN_R = 0.088, SUN_CY = yH - 0.024, N = 9, hS = (SUN_CY + SUN_R - yH) / N;
for (let i = 0; i < N; i++) {
  const ym = yH + (i + 0.5) * hS, half = Math.sqrt(Math.max(0, SUN_R * SUN_R - (ym - SUN_CY) ** 2));
  const gap = i < 4 ? hS * (0.42 - i * 0.1) : 0;
  const col = lerpHex(0x3fb6d6, 0xc8f04a, i / (N - 1));
  q('sun', half * 2, hS - gap + 0.0002, glow(col), 0, ym + gap / 2, 1);
  q('sun_reflection', half * 2, hS * 0.55, glow(lerpHex(col, 0x0a0f24, 0.55), 0.8), 0, yH - (ym - yH), 1);
}
q('horizon', SW, 0.0016, glow(0x4fe0e6), 0, yH, 2);
const gridMat = glow(0x2fa6c8, 0.7), FB = SB + TB, FH = yH - FB;
for (let k = 1; k <= 6; k++) q('grid_h', SW, 0.0011, gridMat, 0, yH - FH * Math.pow(k / 6, 1.7), 2);
for (let j = -9; j <= 9; j++) {
  let x0 = j * 0.01, x1 = j * 0.05, y0 = yH, y1 = FB; const lim = SW / 2 - 0.001;
  if (Math.abs(x1) > lim) { const t = (lim - Math.abs(x0)) / (Math.abs(x1) - Math.abs(x0)); x1 = x0 + (x1 - x0) * t; y1 = y0 + (y1 - y0) * t; }
  const dx = x1 - x0, dy = y1 - y0;
  q('grid_v', 0.0011, Math.hypot(dx, dy), gridMat, (x0 + x1) / 2, (y0 + y1) / 2, 2).rotation.z = Math.atan2(-dx, dy);
}
[0x2fc6cf, 0xf3f6fb, 0x3b7bff, 0xffd84d].forEach((c, i) => { const y = SH / 2 - 0.03 - i * 0.046; q('icon', 0.022, 0.022, glow(c), -SW / 2 + 0.028, y, 3); q('icon_label', 0.026, 0.0035, glow(0xd8e2f5, 0.8), -SW / 2 + 0.028, y - 0.0175, 3); });
const WX = 0.175, WY = 0.045, WW = 0.24, WH = 0.17;
q('win_frame', WW, WH, glow(0x1a2350, 0.9), WX, WY, 4);
q('win_title', WW, 0.018, glow(0x222c5c), WX, WY + WH / 2 - 0.009, 5);
[0x4fe0e6, 0xffd84d, 0x9be15d].forEach((c, i) => q('win_dot', 0.006, 0.006, glow(c), WX - WW / 2 + 0.01 + i * 0.009, WY + WH / 2 - 0.009, 6));
q('win_title_text', 0.05, 0.0035, glow(0xd8e2f5, 0.8), WX, WY + WH / 2 - 0.009, 6);
const SBW = 0.072, cTop = WY + WH / 2 - 0.018, cH = WH - 0.018;
q('win_sidebar', SBW, cH, glow(0x16204a, 0.9), WX - WW / 2 + SBW / 2, cTop - cH / 2, 5);
for (let i = 0; i < 4; i++) q('win_folder', SBW - 0.014, 0.008, glow(i === 0 ? 0x2fc6cf : 0x2a3566), WX - WW / 2 + SBW / 2, cTop - 0.014 - i * 0.013, 6);
const CW = WW - SBW, CX = WX - WW / 2 + SBW + CW / 2;
q('win_content', CW, cH, glow(0x141c3c), CX, cTop - cH / 2, 5);
q('win_heading', 0.07, 0.006, glow(0xe8eefb, 0.9), CX - CW / 2 + 0.049, cTop - 0.014, 6);
const tw = (CW - 0.04) / 3, tH = tw * 0.62;
[0xf2a65a, 0x9be15d, 0x2fc6cf, 0xffd84d, 0x3b7bff, 0xc77dff].forEach((c, i) => {
  const cx = CX - CW / 2 + 0.014 + tw / 2 + (i % 3) * (tw + 0.006), cy = cTop - 0.03 - tH / 2 - Math.floor(i / 3) * (tH + 0.02);
  q('win_thumb', tw, tH, glow(c, 0.85), cx, cy, 6);
  q('win_thumb_label', tw * 0.7, 0.003, glow(0xc8d2ea, 0.8), cx - tw * 0.15, cy - tH / 2 - 0.007, 6);
});
q('taskbar', SW, TB, glow(0x10173a), 0, SB + TB / 2, 7);
q('start_btn', 0.03, 0.01, glow(0x2fc6cf), -SW / 2 + 0.022, SB + TB / 2, 8);
for (let i = 0; i < 3; i++) q('task_btn', 0.04, 0.012, glow(i === 0 ? 0x26326a : 0x1a2350), -SW / 2 + 0.07 + i * 0.046, SB + TB / 2, 8);
q('task_toggle', 0.016, 0.008, glow(0x4fe0e6), SW / 2 - 0.052, SB + TB / 2, 8);
q('task_clock', 0.026, 0.005, glow(0xe8eefb, 0.9), SW / 2 - 0.022, SB + TB / 2, 8);
add('monitor_back', box(0.2, 0.16, 0.03), M.plastic, 0, PY - 0.02, mz - PD / 2 - 0.015);

// Keyboard
const kz = 0.13, kbW = 0.37, kbD = 0.125;
add('keyboard_base', box(kbW, 0.016, kbD), M.plastic, -0.02, TOP + 0.008, kz);
const kg = new THREE.Group(); kg.name = 'keys'; g.add(kg);
const KS = 0.0235, kc = box(0.02, 0.008, 0.02);
const cT = new THREE.Color(0x2fc6cf), cY = new THREE.Color(0xffd84d);
const ombre = Array.from({ length: 4 }, (_, i) => new THREE.MeshStandardMaterial({ name: 'keycap_row_' + (i + 1), color: cT.clone().lerp(cY, i / 3), roughness: 0.5 }));
for (let r = 0; r < 4; r++) for (let c = 0; c < 14; c++) {
  if (r === 3 && c >= 4 && c <= 9) continue;
  add('key', kc, ombre[r], -0.02 - kbW / 2 + 0.032 + c * KS, TOP + 0.02, kz - kbD / 2 + 0.024 + r * KS, kg);
}
add('key_space', box(0.135, 0.008, 0.02), new THREE.MeshStandardMaterial({ name: 'keycap_space', color: cY.clone(), roughness: 0.5 }), -0.02 - kbW / 2 + 0.032 + 6.5 * KS, TOP + 0.02, kz - kbD / 2 + 0.024 + 3 * KS, kg);

// Mouse + pad
add('mouse_pad', box(0.24, 0.003, 0.2), M.plastic, 0.33, TOP + 0.0015, kz);
// Gaming mouse: faceted body, split buttons, RGB strips
const mouse = new THREE.Group(); mouse.name = 'gaming_mouse'; mouse.position.set(0.33, TOP + 0.003, kz + 0.01); mouse.rotation.y = -0.08; g.add(mouse);
const mBody = new THREE.MeshStandardMaterial({ name: 'gaming_mouse_black', color: 0x16161a, roughness: 0.4, metalness: 0.15, flatShading: true });
const mTop = new THREE.MeshStandardMaterial({ name: 'gaming_mouse_buttons', color: 0x22232a, roughness: 0.3, metalness: 0.2, flatShading: true });
const shell = add('mouse_shell', new THREE.SphereGeometry(1, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), mBody, 0, 0, 0.004, mouse); shell.scale.set(0.035, 0.025, 0.064);
add('mouse_base', new THREE.CylinderGeometry(1, 1, 0.004, 10), mBody, 0, 0.002, 0.004, mouse).scale.set(0.036, 1, 0.066);
for (const s of [-1, 1]) {
  const btn = add('mouse_button', box(0.02, 0.003, 0.036), mTop, s * 0.0118, 0.0222, -0.03, mouse); btn.rotation.x = -0.36; btn.rotation.z = s * -0.22;
  add('mouse_rgb_strip', box(0.002, 0.0025, 0.052), M.aqua, s * 0.0335, 0.004, 0.0, mouse).rotation.y = s * -0.05;
}
add('mouse_wheel', new THREE.CylinderGeometry(0.0055, 0.0055, 0.006, 12), M.aqua, 0, 0.0245, -0.027, mouse).rotation.z = Math.PI / 2;
add('mouse_dpi', box(0.004, 0.002, 0.006), M.yellow, 0, 0.0262, -0.01, mouse);
add('mouse_logo', new THREE.CylinderGeometry(0.0065, 0.0065, 0.0012, 3), M.aqua, 0, 0.0232, 0.026, mouse).rotation.y = Math.PI;
for (const zz of [-0.014, 0.002]) add('mouse_side_button', box(0.003, 0.0045, 0.013), mTop, -0.0335, 0.012, zz, mouse);


// Soda can
add('soda_can', new THREE.CylinderGeometry(0.033, 0.033, 0.11, 48), M.can, -0.47, TOP + 0.061, 0.1);
add('can_bottom', new THREE.CylinderGeometry(0.029, 0.033, 0.006, 48), M.alu, -0.47, TOP + 0.003, 0.1);
add('can_neck', new THREE.CylinderGeometry(0.027, 0.033, 0.008, 48), M.alu, -0.47, TOP + 0.12, 0.1);
add('can_lid', new THREE.CylinderGeometry(0.027, 0.027, 0.002, 48), M.alu, -0.47, TOP + 0.125, 0.1);
add('can_tab', box(0.012, 0.0015, 0.02), M.alu, -0.47, TOP + 0.1265, 0.105);

// Book (closed, lying flat)
const book = new THREE.Group(); book.name = 'book'; book.position.set(-0.52, TOP, -0.17); book.rotation.y = 0.35; g.add(book);
add('book_back_cover', box(0.17, 0.004, 0.24), M.cover, 0, 0.002, 0, book);
add('book_pages', box(0.162, 0.026, 0.232), M.pages, 0.003, 0.017, 0, book);
add('book_front_cover', box(0.17, 0.004, 0.24), M.cover, 0, 0.032, 0, book);
add('book_spine', box(0.004, 0.034, 0.24), M.cover, -0.085, 0.017, 0, book);
add('book_band', box(0.171, 0.0045, 0.03), M.yellow, 0, 0.0325, 0.06, book);

// Rubik's cube (on the book)
const cube = new THREE.Group(); cube.name = 'rubiks_cube'; cube.position.set(-0.52, TOP + 0.034 + 0.0285, -0.17); cube.rotation.y = -0.3; g.add(cube);
const cubieMat = new THREE.MeshStandardMaterial({ name: 'cube_core', color: 0xe8eefb, roughness: 0.45 });
const stick = [0x2fc6cf, 0x3b7bff, 0xe8eefb, 0xffd84d, 0x9be15d, 0x24305e].map((c, i) => new THREE.MeshStandardMaterial({ name: 'cube_sticker_' + ['teal', 'blue', 'white', 'yellow', 'lime', 'navy'][i], color: c, roughness: 0.35 }));
const CS = 0.019, cubieGeo = new THREE.BoxGeometry(CS * 0.995, CS * 0.995, CS * 0.995);
const SS = CS * 0.99, stX = new THREE.BoxGeometry(0.0008, SS, SS), stY = new THREE.BoxGeometry(SS, 0.0008, SS), stZ = new THREE.BoxGeometry(SS, SS, 0.0008);
const topLayer = new THREE.Group(); topLayer.name = 'cube_top_layer'; topLayer.rotation.y = 0.32; cube.add(topLayer);
for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) {
  const par = j === 1 ? topLayer : cube;
  const cg = new THREE.Group(); cg.position.set(i * CS, j * CS, k * CS); par.add(cg);
  add('cubie', cubieGeo, cubieMat, 0, 0, 0, cg);
  const o = CS * 0.485 + 0.0004;
  if (i === 1) add('sticker', stX, stick[0], o, 0, 0, cg);
  if (i === -1) add('sticker', stX, stick[1], -o, 0, 0, cg);
  if (j === 1) add('sticker', stY, stick[2], 0, o, 0, cg);
  if (j === -1) add('sticker', stY, stick[3], 0, -o, 0, cg);
  if (k === 1) add('sticker', stZ, stick[4], 0, 0, o, cg);
  if (k === -1) add('sticker', stZ, stick[5], 0, 0, -o, cg);
}

// Rubber duck
const duckMat = new THREE.MeshStandardMaterial({ name: 'duck_yellow', color: 0xffd23f, roughness: 0.35 });
const beakMat = new THREE.MeshStandardMaterial({ name: 'duck_beak_orange', color: 0xff8a1f, roughness: 0.4 });
const eyeMat = new THREE.MeshStandardMaterial({ name: 'duck_eye', color: 0x111114, roughness: 0.2 });
const duck = new THREE.Group(); duck.name = 'rubber_duck'; duck.position.set(0.42, TOP, -0.07); duck.rotation.y = Math.atan2(-(0.67), -0.42); g.add(duck);
const dBody = add('duck_body', new THREE.SphereGeometry(1, 40, 28), duckMat, 0, 0.026, 0, duck); dBody.scale.set(0.036, 0.027, 0.03);
const dTail = add('duck_tail', new THREE.ConeGeometry(0.012, 0.025, 24), duckMat, -0.036, 0.04, 0, duck); dTail.rotation.z = Math.PI / 2.6;
add('duck_head', new THREE.SphereGeometry(0.021, 36, 24), duckMat, 0.018, 0.064, 0, duck);
const beak = add('duck_beak', new THREE.SphereGeometry(1, 24, 16), beakMat, 0.039, 0.06, 0, duck); beak.scale.set(0.012, 0.005, 0.011);
for (const s of [-1, 1]) add('duck_eye', new THREE.SphereGeometry(0.0032, 16, 12), eyeMat, 0.032, 0.071, s * 0.011, duck);
for (const s of [-1, 1]) { const w = add('duck_wing', new THREE.SphereGeometry(1, 24, 16), duckMat, -0.004, 0.032, s * 0.026, duck); w.scale.set(0.018, 0.011, 0.006); }

// Pen (lying in front of the keyboard)
const pen = new THREE.Group(); pen.name = 'pen'; pen.position.set(-0.02, TOP + 0.0055, 0.25); pen.rotation.y = 0.18; g.add(pen);
const penBody = new THREE.MeshStandardMaterial({ name: 'pen_body_teal', color: 0x2fc6cf, roughness: 0.3, metalness: 0.15 });
const penCap = new THREE.MeshStandardMaterial({ name: 'pen_cap_black', color: 0x16161a, roughness: 0.35, metalness: 0.2 });
const along = (name, geo, mat, x) => { const m = add(name, geo, mat, x, 0, 0, pen); m.rotation.z = Math.PI / 2; return m; };
along('pen_barrel', new THREE.CylinderGeometry(0.0055, 0.0055, 0.1, 28), penBody, 0);
along('pen_cap', new THREE.CylinderGeometry(0.006, 0.006, 0.045, 28), penCap, 0.07);
along('pen_cap_end', new THREE.SphereGeometry(0.006, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), penCap, 0.0925).rotation.z = -Math.PI / 2;
along('pen_grip', new THREE.CylinderGeometry(0.0055, 0.0045, 0.018, 28), penCap, -0.059);
along('pen_tip', new THREE.ConeGeometry(0.0045, 0.012, 24), M.metal, -0.074).rotation.z = Math.PI / 2;
add('pen_clip', box(0.035, 0.0018, 0.003), M.metal, 0.072, 0.0065, 0, pen);

// Phone (face up, left of the keyboard)
const phone = new THREE.Group(); phone.name = 'phone'; phone.position.set(-0.32, TOP, 0.12); g.add(phone);
const PHW = 0.074, PHL = 0.152, PHT = 0.008;
const phoneBody = new THREE.MeshStandardMaterial({ name: 'phone_body', color: 0x101426, roughness: 0.35, metalness: 0.5 });
add('phone_body', box(PHW, PHT, PHL), phoneBody, 0, PHT / 2, 0, phone);
const PSY = PHT + 0.0006;
add('phone_screen', box(PHW - 0.006, 0.001, PHL - 0.008), M.screen, 0, PSY, 0, phone);
const PSW = PHW - 0.006, PSL = PHL - 0.008, zT = -PSL / 2;
const qp = (name, w, l, mat, x, z, layer) => { const m = add('phone_ui_' + name, box(w, 0.0003, l), mat, x, PSY + 0.0006 + layer * 0.00035, z, phone); m.castShadow = false; return m; };
const pzH = zT + PSL * 0.7;
for (let i = 0; i < 14; i++) { const s = 0.0006 + rr() * 0.0005; qp('star', s, s, glow(0xffffff, 0.8), (rr() - 0.5) * (PSW - 0.004), zT + 0.012 + rr() * (pzH - zT - 0.02), 0); }
const PR = 0.023, PCY = pzH + 0.005, PN = 7, phS = (pzH - (PCY - PR)) / PN;
for (let i = 0; i < PN; i++) {
  const zm = pzH - (i + 0.5) * phS, half = Math.sqrt(Math.max(0, PR * PR - (zm - PCY) ** 2));
  const gap = i < 3 ? phS * (0.4 - i * 0.12) : 0;
  const col = lerpHex(0x3fb6d6, 0xc8f04a, i / (PN - 1));
  qp('sun', half * 2, phS - gap + 0.0001, glow(col), 0, zm - gap / 2, 1);
  qp('sun_reflection', half * 2, phS * 0.55, glow(lerpHex(col, 0x0a0f24, 0.55), 0.8), 0, pzH + (pzH - zm), 1);
}
qp('horizon', PSW, 0.0006, glow(0x4fe0e6), 0, pzH, 2);
const PFH = PSL / 2 - pzH;
for (let k = 1; k <= 4; k++) qp('grid_h', PSW, 0.0005, gridMat, 0, pzH + PFH * Math.pow(k / 4, 1.7), 2);
for (let j = -5; j <= 5; j++) {
  let x0 = j * 0.0035, x1 = j * 0.014, z0 = pzH, z1 = PSL / 2; const lim = PSW / 2 - 0.0005;
  if (Math.abs(x1) > lim) { const t = (lim - Math.abs(x0)) / (Math.abs(x1) - Math.abs(x0)); x1 = x0 + (x1 - x0) * t; z1 = z0 + (z1 - z0) * t; }
  const dx = x1 - x0, dz = z1 - z0;
  qp('grid_v', 0.0005, Math.hypot(dx, dz), gridMat, (x0 + x1) / 2, (z0 + z1) / 2, 2).rotation.y = Math.atan2(dx, dz);
}
const islandMat = new THREE.MeshStandardMaterial({ name: 'phone_island', color: 0x000000, roughness: 0.3 });
qp('island', 0.02, 0.0062, islandMat, 0, zT + 0.006, 9);
qp('clock', 0.009, 0.0022, glow(0xe8eefb, 0.9), -PSW / 2 + 0.011, zT + 0.006, 9);
qp('battery', 0.007, 0.0026, glow(0xe8eefb, 0.9), PSW / 2 - 0.009, zT + 0.006, 9);
const cz = zT + 0.022;
qp('card', PSW - 0.008, 0.02, glow(0x1f2a5c, 0.9), 0, cz, 3);
qp('card_logo', 0.014, 0.0035, glow(0x4fe0e6), -PSW / 2 + 0.0125, cz - 0.0055, 4);
qp('card_name', 0.018, 0.0022, glow(0xe8eefb, 0.9), -PSW / 2 + 0.0145, cz + 0.0005, 4);
qp('card_sub', 0.032, 0.0018, glow(0x99a5c6, 0.8), -PSW / 2 + 0.0215, cz + 0.004, 4);
qp('card_status', 0.0022, 0.0022, glow(0x9be15d), -PSW / 2 + 0.0065, cz + 0.0075, 4);
[0x3b6fe0, 0x2aa8b8, 0xf2cf45, 0xfa5c5c, 0x2b3038, 0x0a66c2, 0x16161a].forEach((c, i) => {
  const x = -PSW / 2 + 0.0095 + (i % 4) * ((PSW - 0.019) / 3), z = zT + 0.044 + Math.floor(i / 4) * 0.02;
  qp('app', 0.011, 0.011, glow(c), x, z, 4);
  qp('app_label', 0.0075, 0.0011, glow(0xe8eefb, 0.85), x, z + 0.0078, 4);
  if (i === 6) qp('app_desk_screen', 0.006, 0.004, glow(0x4fe0e6), x, z - 0.0005, 5);
});
const dkz = PSL / 2 - 0.014;
qp('dock', PSW - 0.006, 0.016, glow(0x1f2a5c, 0.9), 0, dkz, 6);
[0x46c2cf, 0x3b7bff, 0xf4f6fb, 0x5a6488].forEach((c, i) => qp('dock_app', 0.0095, 0.0095, glow(c), -PSW / 2 + 0.011 + i * ((PSW - 0.022) / 3), dkz, 7));
qp('home_bar', 0.02, 0.0011, glow(0xe8eefb, 0.85), 0, PSL / 2 - 0.0028, 8);

// Gaming headset (laid down on its back: cups upright on their rims, band resting on the desk behind)
{
const HCR = 0.042, HCX = 0.072;
const hs = new THREE.Group(); hs.name = 'gaming_headset'; hs.position.set(-0.27, TOP + HCR, -0.02); hs.rotation.y = 0.25; g.add(hs);
const piv = new THREE.Group(); piv.rotation.x = -(Math.PI / 2 + 0.24); hs.add(piv);
const hsBlack = new THREE.MeshStandardMaterial({ name: 'headset_black', color: 0x16161a, roughness: 0.4, metalness: 0.2, flatShading: true });
const hsPad = new THREE.MeshStandardMaterial({ name: 'headset_cushion', color: 0x2a2c35, roughness: 0.85, flatShading: true });
for (const s of [-1, 1]) {
  add('headset_earcup', new THREE.CylinderGeometry(HCR, HCR * 0.92, 0.03, 10), hsBlack, s * HCX, 0, 0, piv).rotation.z = Math.PI / 2;
  add('headset_cushion', new THREE.TorusGeometry(HCR * 0.72, 0.011, 6, 10), hsPad, s * (HCX - 0.02), 0, 0, piv).rotation.y = Math.PI / 2;
  add('headset_rgb_ring', new THREE.TorusGeometry(HCR * 0.66, 0.0028, 6, 20), M.aqua, s * (HCX + 0.0155), 0, 0, piv).rotation.y = Math.PI / 2;
  add('headset_cup_plate', new THREE.CylinderGeometry(HCR * 0.55, HCR * 0.55, 0.003, 6), hsBlack, s * (HCX + 0.016), 0, 0, piv).rotation.z = Math.PI / 2;
  add('headset_yoke', box(0.008, 0.05, 0.018), hsBlack, s * (HCX + 0.004), 0.045, 0, piv);
}
add('headset_band', new THREE.TorusGeometry(HCX + 0.004, 0.0075, 6, 16, Math.PI), hsBlack, 0, 0.07, 0, piv);
add('headset_band_pad', new THREE.TorusGeometry(HCX - 0.006, 0.006, 6, 12, Math.PI * 0.62), hsPad, 0, 0.07, 0, piv).rotation.z = Math.PI * 0.19;
add('headset_band_accent', new THREE.TorusGeometry(HCX + 0.004, 0.0025, 4, 16, Math.PI * 0.3), M.aqua, 0, 0.07, 0.0075, piv).rotation.z = Math.PI * 0.35;
}

// Tower (on the floor, under the desk)
const tx = 0.47, tz = -0.02;
add('tower_case', box(0.2, 0.44, 0.44), M.plastic, tx, 0.225, tz);
add('tower_glow_strip', box(0.006, 0.36, 0.004), M.aqua, tx - 0.06, 0.24, tz + 0.222);
add('tower_power', new THREE.CylinderGeometry(0.01, 0.01, 0.004, 32), M.yellow, tx + 0.05, 0.4, tz + 0.222).rotation.x = Math.PI / 2;
for (const fx of [-1, 1]) for (const fz of [-1, 1]) add('tower_foot', new THREE.CylinderGeometry(0.012, 0.012, 0.005, 24), M.metal, tx + fx * 0.08, 0.0025, tz + fz * 0.19);

// Lava lamp (right side)
const LX = 0.58, LZ = -0.2;
const lampMat = new THREE.MeshStandardMaterial({ name: 'lamp_black', color: 0x16161a, roughness: 0.4, metalness: 0.3 });
const bulbMat = new THREE.MeshStandardMaterial({ name: 'lava_wax', color: 0xffb21e, emissive: 0xff7a00, emissiveIntensity: 0, roughness: 0.35, transparent: true, opacity: 1 });
const liquidMat = new THREE.MeshStandardMaterial({ name: 'lava_liquid', color: 0x1a5cff, emissive: 0x2a6bff, emissiveIntensity: 0.7, transparent: true, opacity: 0.78, roughness: 0.1, depthWrite: false });
const glassMat = new THREE.MeshStandardMaterial({ name: 'lava_glass', color: 0xe8fbff, transparent: true, opacity: 0.16, roughness: 0.05, metalness: 0.1, depthWrite: false });
const lamp = new THREE.Group(); lamp.name = 'lava_lamp'; lamp.position.set(LX - 0.02, TOP, LZ + 0.02); g.add(lamp);
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const lathe = (pts, seg = 64) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
// base cone + teal band
add('lava_base', lathe([[0, 0], [0.058, 0], [0.058, 0.004], [0.034, 0.12], [0.032, 0.124], [0, 0.124]]), lampMat, 0, 0, 0, lamp);
const band = add('lava_base_band', new THREE.TorusGeometry(0.0545, 0.0025, 12, 64), M.aqua, 0, 0.012, 0, lamp); band.rotation.x = Math.PI / 2;
// glass vessel (wide in the middle, tapering to the top)
const G0 = 0.124, GH = 0.2;
const vessel = [[0.031, 0], [0.04, 0.03], [0.044, 0.07], [0.04, 0.12], [0.031, 0.17], [0.022, GH]];
add('lava_glass', lathe(vessel.map(([r, y]) => [r, G0 + y])), glassMat, 0, 0, 0, lamp);
add('lava_liquid', lathe([[0, 0.004], ...vessel.slice(0, 5).map(([r, y]) => [r - 0.002, y + 0.004]), [0.023, GH - 0.012], [0, GH - 0.012]].map(([r, y]) => [r, G0 + y])), liquidMat, 0, 0, 0, lamp);
// cap
add('lava_cap', lathe([[0.022, 0], [0.024, 0.002], [0.012, 0.05], [0, 0.052]].map(([r, y]) => [r, G0 + GH + y])), lampMat, 0, 0, 0, lamp);
const capRing = add('lava_cap_ring', new THREE.TorusGeometry(0.0235, 0.0018, 10, 48), M.aqua, 0, G0 + GH + 0.002, 0, lamp); capRing.rotation.x = Math.PI / 2;
// wax: pooled blob at the bottom + rising blobs
const pool = add('lava_pool', new THREE.SphereGeometry(1, 32, 16), bulbMat, 0, G0 + 0.01, 0, lamp); pool.scale.set(0.03, 0.011, 0.03);
const radiusAt = y => { for (let i = 1; i < vessel.length; i++) if (y <= vessel[i][1]) { const [r0, y0] = vessel[i - 1], [r1, y1] = vessel[i]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return vessel[vessel.length - 1][0]; };
const blobs = [
  { r: 0.014, sp: 0.09, ph: 0.0, x: 0.004, z: -0.003 },
  { r: 0.011, sp: 0.07, ph: 0.35, x: -0.008, z: 0.006 },
  { r: 0.0085, sp: 0.11, ph: 0.62, x: 0.009, z: 0.008 },
  { r: 0.012, sp: 0.06, ph: 0.82, x: -0.004, z: -0.009 },
].map((b, i) => ({ ...b, m: add('lava_blob', new THREE.SphereGeometry(1, 28, 18), bulbMat, 0, 0, 0, lamp) }));
let lavaT = 0, lavaLast = performance.now();
(function lava(now) {
  const dt = Math.min(0.05, (now - lavaLast) / 1000); lavaLast = now;
  const on = Math.min(1, bulbMat.emissiveIntensity / 2.5);
  lavaT += dt * (0.25 + 0.75 * on);
  liquidMat.emissiveIntensity = 0.7 + on * 1.1;
  for (const b of blobs) {
    const p = (lavaT * b.sp + b.ph) % 1, tri = p < 0.5 ? p * 2 : 2 - p * 2;
    const ease = tri * tri * (3 - 2 * tri);
    const y = 0.02 + ease * (GH - 0.075);
    const maxR = radiusAt(y) - 0.004, rr = Math.min(b.r, maxR);
    const wob = Math.sin(lavaT * 3 + b.ph * 10) * 0.12;
    b.m.position.set(b.x * (maxR / 0.04), G0 + y, b.z * (maxR / 0.04));
    b.m.scale.set(rr * (1 - wob * 0.5), rr * (1 + wob + (1 - ease) * 0.15), rr * (1 - wob * 0.5));
  }
  requestAnimationFrame(lava);
})(lavaLast);
const bulbPos = lamp.position.clone().add(V(0, G0 + 0.09, 0));
const aim = bulbPos.clone().add(V(0, -1, 0));

stage.setObject(g);
for (const m of lamp.children) { if (m.material === glassMat || m.material === liquidMat) m.castShadow = false; if (m.material === liquidMat) m.renderOrder = 1; if (m.material === bulbMat) m.renderOrder = 2; if (m.material === glassMat) m.renderOrder = 3; }

// Lighting states: 0 lamp on · 1 lamp off, dark room lit by the screen
const { scene, canvas, hemi, fill } = stage;
const lampLight = new THREE.PointLight(0xffb84a, 0, 1.6, 2);
lampLight.position.copy(bulbPos);
const lavaFill = new THREE.PointLight(0x4fe0e6, 0, 0.9, 2); lavaFill.position.copy(bulbPos).add(new THREE.Vector3(-0.02, 0.05, 0.06));
const screenLight = new THREE.SpotLight(0x7fd6ff, 0, 0, 1.2, 1, 2);
screenLight.position.set(0, PY, sz0 + 0.03); screenLight.target.position.set(0, TOP - 0.2, 0.8);
screenLight.castShadow = true; screenLight.shadow.mapSize.set(1024, 1024); screenLight.shadow.bias = -0.0005; screenLight.shadow.camera.near = 0.02;
const towerLight = new THREE.PointLight(0x4fe0e6, 0, 0.6, 2);
towerLight.position.set(tx - 0.06, 0.24, tz + 0.26);
scene.add(lampLight, lavaFill, screenLight, screenLight.target, towerLight);

const glowMats = [M.screen, M.side, M.row, M.aqua, M.yellow, ...uiMats];
const baseGlow = glowMats.map(m => m.emissiveIntensity);
const STATES = [
  { bg: '#ece6da', ink: '#3a2f1a', hint: 'Click the lava lamp to turn it off · click the screen or phone to go inside', hemi: 0.55, key: 1.1, fill: 0.3, lamp: 0.9, bulb: 2.5, screen: 0, tower: 0, glow: 1 },
  { bg: '#060914', ink: '#9fb4d8', hint: 'Click the lava lamp to turn it on · click the screen or phone to go inside', hemi: 0.04, key: 0, fill: 0.02, lamp: 0, bulb: 0, screen: 1.8, tower: 0.25, glow: 1.8 },
];
let state = 0;
const cur = { ...STATES[0] };
const bgCur = new THREE.Color(STATES[0].bg), bgTo = new THREE.Color();
const hintEl = document.getElementById('hint');
const keys = ['hemi', 'key', 'fill', 'lamp', 'bulb', 'screen', 'tower', 'glow'];
let last = performance.now();
(function tick(now) {
  const t = STATES[state], k = 1 - Math.exp(-(now - last) / 1000 * 6); last = now;
  for (const p of keys) cur[p] += (t[p] - cur[p]) * k;
  hemi.intensity = cur.hemi; stage.key.intensity = cur.key; if (fill) fill.intensity = cur.fill;
  lampLight.intensity = cur.lamp; lavaFill.intensity = cur.lamp * 0.25; bulbMat.emissiveIntensity = cur.bulb;
  screenLight.intensity = cur.screen; towerLight.intensity = cur.tower;
  glowMats.forEach((m, i) => m.emissiveIntensity = baseGlow[i] * cur.glow);
  bgCur.lerp(bgTo.set(t.bg), k);
  const css = '#' + bgCur.getHexString();
  document.body.style.background = css;
  requestAnimationFrame(tick);
})(last);
const noteEl = document.getElementById('note');
const showHints = v => { hintEl.style.opacity = v; noteEl.style.opacity = v; };
const setState = s => { state = s; hintEl.textContent = STATES[s].hint; hintEl.style.color = STATES[s].ink; noteEl.style.color = STATES[s].ink; };
setState(0);

const ray = new THREE.Raycaster(), ptr = new THREE.Vector2();
// Click the screen to go inside the desktop
const iframe = document.getElementById('os');
const ctl = stage.controls, cam = stage.camera;
const lampMeshes = [], screenParts = [], phoneParts = [];
phone.traverse(o => o.isMesh && phoneParts.push(o));
lamp.traverse(o => o.isMesh && lampMeshes.push(o));
g.traverse(o => { if (o.isMesh && (o.name === 'screen' || o.name === 'monitor_bezel' || o.name.startsWith('ui_'))) screenParts.push(o); });
const pick = e => {
  const r = canvas.getBoundingClientRect();
  ptr.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ptr, cam);
  const hit = ray.intersectObject(g, true)[0];
  if (!hit) return null;
  return lampMeshes.includes(hit.object) ? 'lamp' : screenParts.includes(hit.object) ? 'screen' : phoneParts.includes(hit.object) ? 'phone' : null;
};
let mode = 'desk', saved = null;
const C = new THREE.Vector3(0, PY + 0.005, sz0);
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const tween = (toPos, toTarget, ms, done) => {
  const fp = cam.position.clone(), ft = ctl.target.clone(), t0 = performance.now();
  (function step(now) {
    const k = Math.min(1, (now - t0) / ms), q = ease(k);
    cam.position.lerpVectors(fp, toPos, q); ctl.target.lerpVectors(ft, toTarget, q);
    if (k < 1) requestAnimationFrame(step); else if (done) done();
  })(t0);
};
const enter = () => {
  if (mode !== 'desk') return; mode = 'moving';
  saved = { pos: cam.position.clone(), target: ctl.target.clone() };
  ctl.enabled = false; ctl.autoRotate = false; canvas.style.cursor = ''; showHints(0);
  if (iframe.contentWindow) iframe.contentWindow.postMessage({ type: 'er-theme', theme: state === 1 ? 'dark' : 'light' }, '*');
  const t = Math.tan(cam.fov * Math.PI / 360);
  const d = Math.max((SH / 2) / t, (SW / 2) / (t * cam.aspect)) * 0.9;
  tween(C.clone().add(new THREE.Vector3(0, 0, d)), C, 1300, () => {
    iframe.style.opacity = 1; iframe.style.pointerEvents = 'auto'; iframe.focus(); mode = 'os';
  });
};
const mobile = document.getElementById('mobile'), mFrame = document.getElementById('mobileFrame');
const sendMobileTheme = () => { try { mFrame.contentWindow.postMessage({ type: 'er-theme', theme: state === 1 ? 'dark' : 'light' }, '*'); } catch (e) {} };
mFrame.addEventListener('load', sendMobileTheme);
const enterPhone = () => {
  if (mode !== 'desk') return; mode = 'moving';
  saved = { pos: cam.position.clone(), target: ctl.target.clone() };
  ctl.enabled = false; ctl.autoRotate = false; canvas.style.cursor = ''; showHints(0);
  if (!mFrame.src) mFrame.src = 'phone.html?theme=' + (state === 1 ? 'dark' : 'light'); else sendMobileTheme();
  const P = new THREE.Vector3(); phone.getWorldPosition(P); P.y += PHT;
  const t = Math.tan(cam.fov * Math.PI / 360), frac = Math.min(844, innerHeight - 96) / innerHeight;
  const d = (PHL * 1.08) / (2 * t * frac);
  tween(P.clone().add(new THREE.Vector3(0, d, d * 0.02)), P, 1300, () => {
    mobile.style.opacity = 1; mobile.style.pointerEvents = 'auto'; mode = 'os';
  });
};
document.getElementById('mobileExit').addEventListener('click', () => exit());
const exit = () => {
  if (mode !== 'os') return; mode = 'moving';
  iframe.style.opacity = 0; iframe.style.pointerEvents = 'none';
  mobile.style.opacity = 0; mobile.style.pointerEvents = 'none';
  setTimeout(() => tween(saved.pos, saved.target, 1100, () => { ctl.enabled = true; mode = 'desk'; showHints(1); }), 350);
};
addEventListener('message', e => { if (e.data && e.data.type === 'er-exit') exit(); });
addEventListener('keydown', e => { if (e.key === 'Escape') exit(); });

let down = null;
canvas.addEventListener('pointerdown', e => { down = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointerup', e => {
  if (mode === 'desk' && down && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 5) {
    const p = pick(e);
    if (p === 'lamp') setState(1 - state); else if (p === 'screen') enter(); else if (p === 'phone') enterPhone();
  }
  down = null;
});
canvas.addEventListener('pointermove', e => { canvas.style.cursor = mode === 'desk' && pick(e) ? 'pointer' : ''; });

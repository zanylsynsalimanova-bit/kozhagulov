/* Scroll-scrubbed 3D: each chapter = one object; scroll rotates it, then the camera dives INTO it
   and the next object emerges from inside. Global progress G = chapter index + local u (0..1). */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const BG = 0x071519;
const scene = new THREE.Scene();
scene.background = new THREE.Color(BG);
scene.fog = new THREE.Fog(BG, 22, 75);
const camera = new THREE.PerspectiveCamera(42, 1, 0.05, 300);
camera.position.set(0, 0, 18);

scene.add(new THREE.HemisphereLight(0xcffff4, 0x081a1f, 1.2));
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(6, 10, 10); scene.add(key);
const rim = new THREE.DirectionalLight(0x7ee8d2, 1.6); rim.position.set(-8, -2, -6); scene.add(rim);
const warm = new THREE.PointLight(0xf0a83c, 50, 40); warm.position.set(-7, -4, 8); scene.add(warm);

const still = matchMedia("(prefers-reduced-motion:reduce)").matches;
const mat = (c, e = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: .3, metalness: .1, emissive: c, emissiveIntensity: e });
const C = { C: 0x55666d, N: 0x4f7cff, O: 0xff5a5a, H: 0xeef6f4, Na: 0xb07cff, Cl: 0x7ee86a, T: 0x1fb59a, T2: 0x7ee8d2, A: 0xf0a83c };
const sph = new THREE.SphereGeometry(1, 32, 20), cyl = new THREE.CylinderGeometry(1, 1, 1, 14), up = new THREE.Vector3(0, 1, 0);
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
function ball(g, p, r, c, e) { const m = new THREE.Mesh(sph, mat(c, e)); m.position.copy(p); m.scale.setScalar(r); g.add(m); return m; }
function bond(g, a, b, r = .16, c = 0xc9d6d3) { const m = new THREE.Mesh(cyl, mat(c, .05)), d = new THREE.Vector3().subVectors(b, a);
  m.position.copy(a).addScaledVector(d, .5); m.scale.set(r, d.length(), r); m.quaternion.setFromUnitVectors(up, d.normalize()); g.add(m); return m; }

/* chapter = { g, off: x-offset on desktop, hold(u,t): rotation while reading, dive: {z, scale, rot:[x,y,z]} } */
const CH = [];
function chapter(build, cfg) { const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner); build(inner, g); scene.add(g); CH.push(Object.assign({ g, inner }, cfg)); }

/* 0 · Erlenmeyer flask with glowing liquid — dive into the neck */
chapter((g, root) => {
  const prof = [[0,-3.2],[3.1,-3.2],[3.3,-3],[1,1.6],[.85,2],[.85,4.2],[1.05,4.35],[1.05,4.6],[.8,4.6]].map(([x, y]) => new THREE.Vector2(x, y));
  const glass = new THREE.Mesh(new THREE.LatheGeometry(prof, 80), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .05, metalness: 0, transmission: .92, thickness: .4, ior: 1.45, transparent: true, opacity: .55, side: THREE.DoubleSide }));
  g.add(glass);
  const liq = [[0,-3.05],[3.0,-3.05],[3.15,-2.9],[2.3,-.6],[0,-.6]].map(([x, y]) => new THREE.Vector2(x, y));
  g.add(new THREE.Mesh(new THREE.LatheGeometry(liq, 80), new THREE.MeshStandardMaterial({ color: C.T, emissive: C.T, emissiveIntensity: .9, transparent: true, opacity: .85, roughness: .2 })));
  const glow = new THREE.PointLight(0x1fb59a, 30, 14); glow.position.y = -1.5; g.add(glow);
  const bub = []; for (let i = 0; i < 26; i++) { const b = ball(g, V(0, 0), .08 + Math.random() * .12, 0xd8fff7, .6); b.userData = { a: Math.random() * 6, r: Math.random() * 2.2, s: .4 + Math.random(), o: Math.random() * 3 }; bub.push(b); }
  // floating atoms around (editorial "floating objects")
  const fl = []; [[-6, 3, C.O], [5.5, 4, C.N], [6.5, -2.5, C.A], [-5.5, -3, C.T2], [0, 7, C.Cl]].forEach(([x, y, c], i) => fl.push(ball(root, V(x, y, -2 + i % 3), .35 + i * .08, c, .35)));
  g.userData.tick = t => { bub.forEach(b => { const d = b.userData, y = -3 + ((t * d.s + d.o) % 2.4); const R = Math.max(.1, d.r * (1 - (y + 3) / 3.2)); b.position.set(Math.cos(d.a) * R, y, Math.sin(d.a) * R); });
    fl.forEach((f, i) => { f.position.y += Math.sin(t * .8 + i) * .004; }); };
  g.position.y = -.6;
}, { off: 4.2, color: "#1fb59a", hold: (o, u, t) => { o.rotation.set(.15, u * Math.PI * 1.4 + t * .05, -.06); },
     dive: { z: 17, rot: [Math.PI / 2, 0, 0] } });

/* 1 · atom — dive into the nucleus */
chapter(g => {
  for (let i = 0; i < 18; i++) { const p = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 1.15); ball(g, p, .55, i % 2 ? C.O : 0x8aa3a8, .2); }
  const els = [];
  for (let k = 0; k < 3; k++) { const o = new THREE.Group(); o.rotation.set(k * 1.05, k * .6, 0);
    o.add(new THREE.Mesh(new THREE.TorusGeometry(6, .035, 8, 140), new THREE.MeshBasicMaterial({ color: C.T2, transparent: true, opacity: .6 })));
    const e = ball(o, V(6, 0), .3, C.T2, 1.5); els.push([e, k * 2]); g.add(o); }
  g.userData.tick = t => els.forEach(([e, ph], i) => { const a = t * (1.2 + i * .35) + ph; e.position.set(Math.cos(a) * 6, Math.sin(a) * 6, 0); });
}, { off: -4.5, color: "#ff5a5a", hold: (o, u, t) => o.rotation.set(u * 1.2, u * Math.PI * 1.6, 0), dive: { z: 18.5, rot: [0, 0, 0], scale: 2.2 } });

/* 2 · benzene — fly through the ring */
chapter(g => {
  const c = [], h = [];
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + Math.PI / 6; c.push(V(Math.cos(a) * 3.6, Math.sin(a) * 3.6)); h.push(V(Math.cos(a) * 6, Math.sin(a) * 6)); }
  c.forEach((p, i) => { ball(g, p, .75, C.C, .12); ball(g, h[i], .42, C.H); bond(g, p, h[i], .13); const q = c[(i + 1) % 6]; bond(g, p, q, .18);
    if (i % 2 === 0) { const n = p.clone().add(q).multiplyScalar(.5).normalize().multiplyScalar(-.55); bond(g, p.clone().lerp(q, .15).add(n), q.clone().lerp(p, .15).add(n), .1, C.T); } });
  for (const z of [-1.1, 1.1]) { const t = new THREE.Mesh(new THREE.TorusGeometry(3.6, .7, 16, 90), new THREE.MeshStandardMaterial({ color: C.T, emissive: C.T, emissiveIntensity: .7, transparent: true, opacity: .2, depthWrite: false })); t.position.z = z; g.add(t); }
}, { off: 4.5, color: "#7ee8d2", hold: (o, u) => o.rotation.set(-.9 + u * .9, u * Math.PI * 1.2, u * 1.5), dive: { z: 26, rot: [0, 0, Math.PI / 3] } });

/* 3 · NaCl lattice — fly through the crystal */
chapter(g => {
  const n = 4, s = 2.4, Na = [], Cl = [];
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) ((x + y + z) % 2 ? Na : Cl).push(V((x - 1.5) * s, (y - 1.5) * s, (z - 1.5) * s));
  for (const [arr, r, col] of [[Na, .5, C.Na], [Cl, .75, C.Cl]]) { const im = new THREE.InstancedMesh(sph, mat(col, .15), arr.length), m4 = new THREE.Matrix4();
    arr.forEach((p, i) => im.setMatrixAt(i, m4.compose(p, new THREE.Quaternion(), V(r, r, r)))); g.add(im); }
  const pts = [], e = 1.5 * s; for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) { const u = (a - 1.5) * s, v = (b - 1.5) * s; pts.push(-e, u, v, e, u, v, u, -e, v, u, e, v, u, v, -e, u, v, e); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: C.T2, transparent: true, opacity: .3 })));
}, { off: -6, size: .62, color: "#7ee86a", hold: (o, u) => o.rotation.set(.5 + u * .8, .7 + u * Math.PI, .2), dive: { z: 30, rot: [0, 0, 0] } });

/* 4 · periodic table helix — fly through the spiral */
chapter(g => {
  const E = [[1,"H"],[2,"He"],[3,"Li"],[6,"C"],[7,"N"],[8,"O"],[9,"F"],[11,"Na"],[12,"Mg"],[13,"Al"],[14,"Si"],[15,"P"],[16,"S"],[17,"Cl"],[19,"K"],[20,"Ca"],[26,"Fe"],[29,"Cu"],[30,"Zn"],[47,"Ag"],[79,"Au"],[80,"Hg"],[53,"I"],[10,"Ne"]];
  E.forEach(([z, s], i) => { const cv = document.createElement("canvas"); cv.width = cv.height = 256; const x = cv.getContext("2d");
    x.fillStyle = "rgba(10,40,46,.95)"; x.fillRect(0, 0, 256, 256); x.strokeStyle = i % 5 ? "#1fb59a" : "#f0a83c"; x.lineWidth = 10; x.strokeRect(5, 5, 246, 246);
    x.fillStyle = "#7ee8d2"; x.font = "600 44px Inter,Arial"; x.fillText(z, 22, 60); x.fillStyle = "#fff"; x.font = "700 120px Georgia,serif"; x.textAlign = "center"; x.fillText(s, 128, 190);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true }));
    const a = i * .62, r = 6.5; m.position.set(Math.cos(a) * r, (i - E.length / 2) * .55, Math.sin(a) * r); m.lookAt(0, m.position.y, 0); m.rotateY(Math.PI); g.add(m); });
}, { off: 0, size: .6, color: "#f0a83c", hold: (o, u) => o.rotation.set(.25, u * Math.PI * 1.5, 0), dive: { z: 26, rot: [Math.PI / 2, 0, 0] } });

/* 5 · water molecules — dive through the swarm */
chapter(g => {
  const N = 60, O = new THREE.InstancedMesh(sph, mat(C.O, .12), N), H = new THREE.InstancedMesh(sph, mat(C.H, .05), N * 2), data = [];
  for (let i = 0; i < N; i++) data.push({ p: new THREE.Vector3().randomDirection().multiplyScalar(2.5 + Math.random() * 6), q: new THREE.Euler(Math.random() * 6, Math.random() * 6, 0), w: Math.random() * 6 });
  g.add(O, H); const m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), hp = [V(.75, .58), V(-.75, .58)];
  g.userData.tick = t => { data.forEach((d, i) => { const p = d.p.clone(); p.y += Math.sin(t + d.w) * .35; d.q.x += .004; d.q.y += .006; qt.setFromEuler(d.q);
    O.setMatrixAt(i, m4.compose(p, qt, V(.55, .55, .55))); hp.forEach((h, j) => H.setMatrixAt(i * 2 + j, m4.compose(h.clone().applyQuaternion(qt).add(p), qt, V(.32, .32, .32)))); });
    O.instanceMatrix.needsUpdate = H.instanceMatrix.needsUpdate = true; };
}, { off: 4.5, color: "#ff5a5a", hold: (o, u) => o.rotation.set(0, u * Math.PI, 0), dive: { z: 24, rot: [0, 0, 0] } });

/* 6 · DNA helix — finale */
chapter(g => {
  for (let i = 0; i < 32; i++) { const a = i * .45, y = (i - 16) * .62, p1 = V(Math.cos(a) * 2.8, y, Math.sin(a) * 2.8), p2 = V(-Math.cos(a) * 2.8, y, -Math.sin(a) * 2.8);
    ball(g, p1, .36, C.T, .5); ball(g, p2, .36, C.A, .5); bond(g, p1, p2, .08, i % 2 ? C.N : C.O); }
}, { off: 6, size: .7, color: "#7ee8d2", hold: (o, u, t) => o.rotation.set(0, u * Math.PI * 2 + t * .1, .45) });

/* dust */
{ const n = 1400, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i*3] = (Math.random() - .5) * 60; a[i*3+1] = (Math.random() - .5) * 40; a[i*3+2] = (Math.random() - .5) * 60; }
  const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.BufferAttribute(a, 3));
  var dust = new THREE.Points(gg, new THREE.PointsMaterial({ color: 0x7ee8d2, size: .07, transparent: true, opacity: .6 })); scene.add(dust); }

/* scroll mapping */
const secs = [...document.querySelectorAll(".chap")], flash = document.getElementById("flash");
let tops = [];
function measure() { tops = secs.map(s => s.offsetTop).concat(document.documentElement.scrollHeight - innerHeight); }
function globalG() { if (window.__forceG != null) return window.__forceG; const y = scrollY; for (let i = 0; i < secs.length; i++) { const a = tops[i], b = i < secs.length - 1 ? tops[i + 1] : tops[i] + secs[i].offsetHeight - innerHeight;
    if (y < b || i === secs.length - 1) return i + Math.min(1, Math.max(0, (y - a) / Math.max(1, b - a))); } return 0; }
window.__G = 0;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, cl = v => Math.min(1, Math.max(0, v));
function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); measure(); }
addEventListener("resize", resize); addEventListener("load", measure); new ResizeObserver(measure).observe(document.body); resize();

let G = globalG(), prev = performance.now(); const t0 = prev, EM = .14, DV = .8;
function frame(now) {
  const t = (now - t0) / 1000, dt = Math.min(.1, (now - prev) / 1000); prev = now;
  G += (globalG() - G) * (still ? 1 : 1 - Math.exp(-dt * 7)); window.__G = G;
  const k = Math.min(CH.length - 1, Math.floor(G)), u = G - k, mob = innerWidth < 800, last = k === CH.length - 1;
  let fl = 0, fov = 42;
  CH.forEach((c, i) => c.g.visible = i === k);
  const c = CH[k], o = c.g, base = (mob ? .62 : 1) * (c.size || 1);
  const e = k === 0 ? 1 : ease(cl(u / EM)), d = last ? 0 : ease(cl((u - DV) / (1 - DV)));
  c.hold(o, cl((u - EM) / (DV - EM)), t);
  if (d > 0) { const r = c.dive.rot; o.rotation.x += (r[0] - o.rotation.x) * d; o.rotation.y += (r[1] - o.rotation.y) * d; o.rotation.z += (r[2] - o.rotation.z) * d; }
  const off = (mob ? 0 : c.off) * e * (1 - d);
  o.position.set(off, (c.dive && c.dive.y ? c.dive.y * d : 0) + (1 - e) * 0, -55 * (1 - e) + (c.dive ? c.dive.z * d : 0));
  o.scale.setScalar(base * (.35 + .65 * e) * (1 + (c.dive && c.dive.scale ? (c.dive.scale - 1) * d : 0)));
  if (!still) o.position.y += Math.sin(t * .9) * .15 * (1 - d);
  o.userData.tick = o.children[0].userData.tick; o.children[0].userData.tick && o.children[0].userData.tick(t);
  fl = Math.max(Math.pow(cl((u - .9) / .1), 2) * (last ? 0 : 1), k > 0 ? Math.pow(1 - cl(u / .07), 2) : 0);
  fov = 42 + d * 30 + (1 - e) * 18;
  camera.fov = fov; camera.updateProjectionMatrix();
  camera.position.set(Math.sin(t * .25) * .4, Math.cos(t * .2) * .3, 18); camera.lookAt(0, 0, 0);
  dust.rotation.y = G * .4; dust.position.z = (G % 1) * 10;
  const col = (u > .5 && !last) ? CH[k + 1].color : c.color;
  flash.style.background = `radial-gradient(circle at 50% 50%, ${col} 0%, #071519 75%)`; flash.style.opacity = fl.toFixed(3);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
document.documentElement.classList.add("gl-on");

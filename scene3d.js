/* 3D chemistry journey: camera flies between scenes as the page scrolls */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace;
const BG = 0x081a1f;
const scene = new THREE.Scene();
scene.background = new THREE.Color(BG);
scene.fog = new THREE.Fog(BG, 18, 62);
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 300);

scene.add(new THREE.HemisphereLight(0xbff7ec, 0x0b1c22, 1.1));
const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(6, 10, 8); scene.add(key);
const tl = new THREE.PointLight(0x1fb59a, 60, 60); scene.add(tl);
const am = new THREE.PointLight(0xf0a83c, 40, 50); scene.add(am);

const SP = 60;                       // distance between scenes
const still = matchMedia("(prefers-reduced-motion:reduce)").matches;
const mat = (c, e = 0) => new THREE.MeshStandardMaterial({ color: c, roughness: .35, metalness: .15, emissive: c, emissiveIntensity: e });
const C = { C: 0x55666d, N: 0x4f7cff, O: 0xff5a5a, H: 0xeef6f4, Na: 0xb07cff, Cl: 0x7ee86a, T: 0x1fb59a, A: 0xf0a83c };
const sph = new THREE.SphereGeometry(1, 32, 20);
const cyl = new THREE.CylinderGeometry(1, 1, 1, 14);
const up = new THREE.Vector3(0, 1, 0);
function ball(g, p, r, c, e) { const m = new THREE.Mesh(sph, mat(c, e)); m.position.copy(p); m.scale.setScalar(r); g.add(m); return m; }
function bond(g, a, b, r = .16, c = 0xc9d6d3) {
  const m = new THREE.Mesh(cyl, mat(c, .05)), d = new THREE.Vector3().subVectors(b, a);
  m.position.copy(a).addScaledVector(d, .5); m.scale.set(r, d.length(), r);
  m.quaternion.setFromUnitVectors(up, d.normalize()); g.add(m); return m;
}
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const scenes = [];
function addScene(build, offX) { const g = new THREE.Group(); g.userData.offX = offX; build(g); g.position.z = -scenes.length * SP; scene.add(g); scenes.push(g); return g; }

/* 0 · caffeine molecule */
addScene(g => {
  const s = 1.7, A = {
    N1: [0, 1.4, "N"], C2: [-1.2, .7, "C"], N3: [-1.2, -.7, "N"], C4: [0, -1.4, "C"], C5: [1.2, -.7, "C"], C6: [1.2, .7, "C"],
    N7: [2.4, -1.1, "N"], C8: [3.1, 0, "C"], N9: [2.4, 1.1, "N"], O2: [-2.3, 1.3, "O"], O4: [0, -2.7, "O"],
    M1: [0, 2.8, "C"], M3: [-2.4, -1.4, "C"], M9: [3.0, 2.3, "C"]
  }, P = {};
  for (const k in A) { const [x, y, t] = A[k]; P[k] = V((x - .5) * s, y * s, (Math.random() - .5) * .8); ball(g, P[k], t === "C" ? .62 : .58, C[t], .08); }
  [["N1","C2"],["C2","N3"],["N3","C4"],["C4","C5"],["C5","C6"],["C6","N1"],["C5","N7"],["N7","C8"],["C8","N9"],["N9","C6"],["C2","O2"],["C4","O4"],["N1","M1"],["N3","M3"],["N9","M9"]].forEach(([a, b]) => bond(g, P[a], P[b]));
  for (const m of ["M1","M3","M9"]) for (let i = 0; i < 3; i++) { const h = P[m].clone().add(V(Math.cos(i * 2.1) * .9, Math.sin(i * 2.1) * .9 + .3, (i - 1) * .6)); ball(g, h, .3, C.H); bond(g, P[m], h, .08); }
  g.userData.spin = [.12, .25, .04];
}, 4);

/* 1 · atom (Bohr model) */
addScene(g => {
  for (let i = 0; i < 16; i++) { const p = new THREE.Vector3().randomDirection().multiplyScalar(Math.random() * 1.1); ball(g, p, .55, i % 2 ? C.O : 0x8aa3a8, .15); }
  const els = [];
  for (let k = 0; k < 3; k++) {
    const o = new THREE.Group(); o.rotation.set(k * 1.05, k * .6, 0);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(6.5, .04, 8, 120), new THREE.MeshBasicMaterial({ color: C.T, transparent: true, opacity: .55 }));
    o.add(ring); const e = ball(o, V(6.5, 0, 0), .32, 0x7ee8d2, 1.2); els.push([e, k * 2]); g.add(o);
  }
  g.userData.tick = t => els.forEach(([e, ph], i) => { const a = t * (1.1 + i * .3) + ph; e.position.set(Math.cos(a) * 6.5, Math.sin(a) * 6.5, 0); });
  g.userData.spin = [.05, .1, 0];
}, 6);

/* 2 · benzene ring + pi cloud */
addScene(g => {
  const c = [], h = [];
  for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; c.push(V(Math.cos(a) * 3.6, Math.sin(a) * 3.6)); h.push(V(Math.cos(a) * 6, Math.sin(a) * 6)); }
  c.forEach((p, i) => { ball(g, p, .75, C.C, .1); ball(g, h[i], .42, C.H); bond(g, p, h[i], .13);
    const q = c[(i + 1) % 6]; bond(g, p, q, .18);
    if (i % 2 === 0) { const n = p.clone().add(q).multiplyScalar(.5).normalize().multiplyScalar(-.55); bond(g, p.clone().lerp(q, .15).add(n), q.clone().lerp(p, .15).add(n), .1, C.T); } });
  for (const z of [-1.1, 1.1]) { const t = new THREE.Mesh(new THREE.TorusGeometry(3.6, .7, 16, 80), new THREE.MeshStandardMaterial({ color: C.T, emissive: C.T, emissiveIntensity: .6, transparent: true, opacity: .18, depthWrite: false })); t.position.z = z; g.add(t); }
  g.userData.spin = [.18, .3, .08];
}, 7);

/* 3 · NaCl crystal lattice */
addScene(g => {
  const n = 4, s = 2.4, Na = [], Cl = [];
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) ((x + y + z) % 2 ? Na : Cl).push(V((x - 1.5) * s, (y - 1.5) * s, (z - 1.5) * s));
  for (const [arr, r, col] of [[Na, .5, C.Na], [Cl, .78, C.Cl]]) {
    const im = new THREE.InstancedMesh(sph, mat(col, .12), arr.length), m4 = new THREE.Matrix4();
    arr.forEach((p, i) => im.setMatrixAt(i, m4.compose(p, new THREE.Quaternion(), V(r, r, r)))); g.add(im);
  }
  const pts = [], e = 1.5 * s;
  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) { const u = (a - 1.5) * s, v = (b - 1.5) * s; pts.push(-e, u, v, e, u, v, u, -e, v, u, e, v, u, v, -e, u, v, e); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x7ee8d2, transparent: true, opacity: .25 })));
  g.userData.spin = [.15, .22, .05];
}, 7);

/* 4 · periodic table tiles on a helix */
addScene(g => {
  const E = [[1,"H"],[2,"He"],[3,"Li"],[6,"C"],[7,"N"],[8,"O"],[9,"F"],[11,"Na"],[12,"Mg"],[13,"Al"],[14,"Si"],[15,"P"],[16,"S"],[17,"Cl"],[19,"K"],[20,"Ca"],[26,"Fe"],[29,"Cu"],[30,"Zn"],[47,"Ag"],[79,"Au"],[80,"Hg"],[53,"I"],[10,"Ne"]];
  E.forEach(([z, s], i) => {
    const cv = document.createElement("canvas"); cv.width = cv.height = 256; const x = cv.getContext("2d");
    x.fillStyle = "rgba(10,40,46,.92)"; x.fillRect(0, 0, 256, 256); x.strokeStyle = i % 5 ? "#1fb59a" : "#f0a83c"; x.lineWidth = 10; x.strokeRect(5, 5, 246, 246);
    x.fillStyle = "#7ee8d2"; x.font = "600 44px Inter,Arial"; x.fillText(z, 22, 60);
    x.fillStyle = "#fff"; x.font = "700 120px Georgia,serif"; x.textAlign = "center"; x.fillText(s, 128, 190);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 2.6), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, transparent: true }));
    const a = i * .62, r = 8; m.position.set(Math.cos(a) * r, (i - E.length / 2) * .62, Math.sin(a) * r); m.lookAt(0, m.position.y, 0); m.rotateY(Math.PI); g.add(m);
  });
  g.userData.spin = [0, .25, 0];
}, 0);

/* 5 · water molecules swarm */
addScene(g => {
  const N = 70, O = new THREE.InstancedMesh(sph, mat(C.O, .1), N), H = new THREE.InstancedMesh(sph, mat(C.H, .05), N * 2), data = [];
  for (let i = 0; i < N; i++) data.push({ p: new THREE.Vector3().randomDirection().multiplyScalar(2 + Math.random() * 8), q: new THREE.Euler(Math.random() * 6, Math.random() * 6, 0), w: Math.random() * 6 });
  g.add(O, H); const m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), hp = [V(.75, .58, 0), V(-.75, .58, 0)];
  g.userData.tick = t => data.forEach((d, i) => {
    const p = d.p.clone(); p.y += Math.sin(t + d.w) * .4; d.q.x += .004; d.q.y += .006; qt.setFromEuler(d.q);
    O.setMatrixAt(i, m4.compose(p, qt, V(.55, .55, .55)));
    hp.forEach((h, j) => H.setMatrixAt(i * 2 + j, m4.compose(h.clone().applyQuaternion(qt).add(p), qt, V(.32, .32, .32))));
    O.instanceMatrix.needsUpdate = H.instanceMatrix.needsUpdate = true;
  });
  g.userData.spin = [0, .06, 0];
}, 6);

/* 6 · DNA double helix (finale) */
addScene(g => {
  for (let i = 0; i < 32; i++) {
    const a = i * .45, y = (i - 16) * .7, p1 = V(Math.cos(a) * 3, y, Math.sin(a) * 3), p2 = V(-Math.cos(a) * 3, y, -Math.sin(a) * 3);
    ball(g, p1, .38, C.T, .4); ball(g, p2, .38, C.A, .4); bond(g, p1, p2, .09, i % 2 ? 0x4f7cff : 0xff5a5a);
  }
  g.rotation.z = .5; g.userData.spin = [0, .4, 0];
}, 0);

/* dust */
{ const n = 1600, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i*3] = (Math.random() - .5) * 70; a[i*3+1] = (Math.random() - .5) * 45; a[i*3+2] = 20 - Math.random() * (SP * scenes.length + 30); }
  const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.BufferAttribute(a, 3));
  scene.add(new THREE.Points(gg, new THREE.PointsMaterial({ color: 0x7ee8d2, size: .08, transparent: true, opacity: .7 }))); }

/* scroll → progress through scenes */
const secs = [...document.querySelectorAll("[data-step]")];
let centers = [];
function measure() { centers = secs.map(s => { const r = s.getBoundingClientRect(); return r.top + scrollY + r.height / 2; }); }
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function progress() {
  const v = scrollY + innerHeight / 2; if (v <= centers[0]) return 0;
  for (let i = 0; i < centers.length - 1; i++) if (v < centers[i + 1]) {
    const t = (v - centers[i]) / (centers[i + 1] - centers[i]);
    return i + ease(Math.min(1, Math.max(0, (t - .3) / .45)));   // hold → fly → hold
  }
  return centers.length - 1;
}
function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); measure(); }
addEventListener("resize", resize); addEventListener("load", measure); new ResizeObserver(measure).observe(document.body); resize();

let P = progress(), t0 = performance.now();
function frame(now) {
  const t = (now - t0) / 1000, target = progress(); P += (target - P) * .08;
  const i = Math.round(P), f = P - Math.floor(P), warp = Math.sin(f * Math.PI);   // 0 at scenes, 1 mid-flight
  const mob = innerWidth < 800;
  const a = scenes[Math.floor(P)], b = scenes[Math.min(scenes.length - 1, Math.floor(P) + 1)];
  const ox = (mob ? 0 : a.userData.offX * (1 - f) + b.userData.offX * f);
  camera.position.set(-ox + Math.sin(t * .3) * .6, Math.cos(t * .25) * .5, -P * SP + 24);
  camera.lookAt(-ox, 0, -P * SP);
  camera.rotation.z += warp * .5 * (Math.floor(P) % 2 ? -1 : 1);
  camera.fov = 50 + warp * 22; camera.updateProjectionMatrix();
  tl.position.set(-ox + 8, 6, -P * SP + 6); am.position.set(-ox - 8, -5, -P * SP + 2);
  scenes.forEach((g, k) => {
    const d = Math.abs(k - P); g.visible = d < 1.6;
    if (!g.visible) return;
    const s = (mob ? .7 : 1) * (1 - Math.min(1, d) * .35); g.scale.setScalar(s);
    if (!still) { const [x, y, z] = g.userData.spin; g.rotation.x += x * .01; g.rotation.y += y * .01; g.rotation.z += z * .01; }
    g.userData.tick && g.userData.tick(t);
  });
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
document.documentElement.classList.add("gl-on");

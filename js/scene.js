// =====================================================
// Hero scene: scattered pixel squares snapped to the grid
// Ink + pink + violet confetti. They twinkle, dodge the
// cursor, and burst on click. Palette unchanged.
// =====================================================
import * as THREE from "three";

const canvas = document.getElementById("scene");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 0, 14);

// world-space size of the visible field
let fieldW = 30;
let fieldH = 16;
let unitsPerPx = 0.02;

function computeField() {
  const vFov = (camera.fov * Math.PI) / 180;
  fieldH = 2 * Math.tan(vFov / 2) * camera.position.z;
  fieldW = fieldH * camera.aspect;
  unitsPerPx = fieldH / (canvas.clientHeight || 800);
}

// ---------- layers: size + color variety, like scattered pixels ----------
// density = particles per 10,000 square world units, scaled to viewport
const LAYERS = [
  { color: "#17141A", density: 4.2, size: 0.16, opacity: 0.9 },  // ink, chunky
  { color: "#17141A", density: 7.5, size: 0.09, opacity: 0.7 },  // ink, fine
  { color: "#F5257C", density: 3.4, size: 0.15, opacity: 1.0 },  // pink, chunky
  { color: "#F5257C", density: 5.0, size: 0.08, opacity: 0.85 }, // pink, fine
  { color: "#4B2AA6", density: 2.2, size: 0.11, opacity: 0.75 }, // violet
];

const MAX = 1600; // per layer ceiling
const systems = [];

for (const layer of LAYERS) {
  const positions = new Float32Array(MAX * 3);
  const home = new Float32Array(MAX * 3);
  const velocity = new Float32Array(MAX * 3);
  const phase = new Float32Array(MAX);
  for (let i = 0; i < MAX; i++) phase[i] = Math.random() * Math.PI * 2;

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setDrawRange(0, 0);

  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(layer.color),
    size: layer.size,
    transparent: true,
    opacity: layer.opacity,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  scene.add(points);

  systems.push({
    geo, mat, points, home, velocity, phase,
    n: 0,
    density: layer.density,
    baseSize: layer.size,
    baseOpacity: layer.opacity,
  });
}

// scatter homes across the viewport, snapped to the 44px CSS grid
function scatterHomes() {
  const step = 44 * unitsPerPx;
  const area = (fieldW * fieldH) / 10000;

  for (const s of systems) {
    const n = Math.min(Math.round(s.density * area * 1000), MAX);
    s.n = n;
    const pos = s.geo.attributes.position.array;

    for (let i = 0; i < n; i++) {
      const gx = Math.round(((Math.random() - 0.5) * fieldW * 1.1) / step) * step;
      const gy = Math.round(((Math.random() - 0.5) * fieldH * 1.1) / step) * step;
      const jx = (Math.random() - 0.5) * step * 0.5;
      const jy = (Math.random() - 0.5) * step * 0.5;
      const z = (Math.random() - 0.5) * 2;

      s.home.set([gx + jx, gy + jy, z], i * 3);
      pos[i * 3] = gx + jx;
      pos[i * 3 + 1] = gy + jy;
      pos[i * 3 + 2] = z;
      s.velocity[i * 3] = 0;
      s.velocity[i * 3 + 1] = 0;
    }
    s.geo.setDrawRange(0, n);
    s.geo.attributes.position.needsUpdate = true;
  }
}

// ---------- pointer: particles get out of the way ----------
const mouseWorld = new THREE.Vector3(9999, 9999, 0);
const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

function toWorld(clientX, clientY, out) {
  const rect = canvas.getBoundingClientRect();
  ndc.x = ((clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  raycaster.ray.intersectPlane(plane, out);
}

window.addEventListener("pointermove", (e) => toWorld(e.clientX, e.clientY, mouseWorld));
window.addEventListener("pointerleave", () => mouseWorld.set(9999, 9999, 0));

// ---------- click: confetti burst ----------
let burst = 0;
const burstCenter = new THREE.Vector3();
document.querySelector(".hero").addEventListener("click", (e) => {
  toWorld(e.clientX, e.clientY, burstCenter);
  burst = 1;
});

// ---------- resize ----------
function resize() {
  const { clientWidth: w, clientHeight: h } = canvas.parentElement;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  computeField();
  scatterHomes();
}
resize();

let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(resize, 150);
});

// ---------- animate ----------
const clock = new THREE.Clock();
const REPEL_R = 2.0;
const REPEL_F = 0.055;
const SPRING = 0.022;
const DAMP = 0.88;

function animate() {
  const t = clock.getElapsedTime();
  burst *= 0.93;

  for (const s of systems) {
    const pos = s.geo.attributes.position.array;

    for (let i = 0; i < s.n; i++) {
      const ix = i * 3;
      const px = pos[ix];
      const py = pos[ix + 1];

      const dxm = px - mouseWorld.x;
      const dym = py - mouseWorld.y;
      const dm = Math.hypot(dxm, dym);
      if (dm < REPEL_R && dm > 0.0001) {
        const f = (1 - dm / REPEL_R) * REPEL_F;
        s.velocity[ix] += (dxm / dm) * f;
        s.velocity[ix + 1] += (dym / dm) * f;
      }

      if (burst > 0.05) {
        const dxb = px - burstCenter.x;
        const dyb = py - burstCenter.y;
        const db = Math.hypot(dxb, dyb);
        if (db < 7 && db > 0.0001) {
          const f = (1 - db / 7) * 0.1 * burst;
          s.velocity[ix] += (dxb / db) * f;
          s.velocity[ix + 1] += (dyb / db) * f;
        }
      }

      s.velocity[ix] += (s.home[ix] - px) * SPRING + Math.sin(t * 0.5 + s.phase[i]) * 0.001;
      s.velocity[ix + 1] += (s.home[ix + 1] - py) * SPRING + Math.cos(t * 0.4 + s.phase[i]) * 0.001;
      s.velocity[ix] *= DAMP;
      s.velocity[ix + 1] *= DAMP;

      pos[ix] += s.velocity[ix];
      pos[ix + 1] += s.velocity[ix + 1];
    }

    s.geo.attributes.position.needsUpdate = true;
    s.mat.opacity = Math.min(s.baseOpacity * (0.92 + Math.sin(t * 1.6 + s.phase[0]) * 0.08) + burst * 0.1, 1);
    s.mat.size = s.baseSize * (1 + burst * 0.45);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

if (prefersReduced) {
  renderer.render(scene, camera);
} else {
  animate();
}

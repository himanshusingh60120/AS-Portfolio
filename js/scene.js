// =====================================================
// Hero scene: scattered pixel-confetti particle field
// (inspired by the reference site's scatter, in pink)
// Particles drift, twinkle, dodge your cursor,
// and burst when you click. Palette unchanged.
// =====================================================
import * as THREE from "three";

const canvas = document.getElementById("scene");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();

// camera looks straight at a shallow field of particles
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
camera.position.set(0, 0, 14);

// ---------- field dimensions (recomputed on resize) ----------
let fieldW = 30;
let fieldH = 16;

function computeField() {
  const dist = camera.position.z;
  const vFov = (camera.fov * Math.PI) / 180;
  fieldH = 2 * Math.tan(vFov / 2) * dist * 1.15; // slight overscan
  fieldW = fieldH * camera.aspect * 1.15;
}

// ---------- particle system factory ----------
// three layers: pink, violet, quiet grey. squares, like confetti pixels.
// density is per-layer base count, scaled to viewport area at runtime
const LAYERS = [
  { color: "#F5257C", count: 2600, size: 0.10, opacity: 0.95 },
  { color: "#4B2AA6", count: 1300, size: 0.085, opacity: 0.8 },
  { color: "#a49fa9", count: 2100, size: 0.065, opacity: 0.6 },
];

const systems = [];

for (const layer of LAYERS) {
  const n = layer.count;
  const positions = new Float32Array(n * 3);
  const home = new Float32Array(n * 3);      // where each particle belongs
  const velocity = new Float32Array(n * 3);  // current drift
  const phase = new Float32Array(n);         // twinkle offset

  for (let i = 0; i < n; i++) {
    const x = (Math.random() - 0.5) * 34;
    const y = (Math.random() - 0.5) * 20;
    const z = (Math.random() - 0.5) * 3;
    positions.set([x, y, z], i * 3);
    home.set([x, y, z], i * 3);
    phase[i] = Math.random() * Math.PI * 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: new THREE.Color(layer.color),
    size: layer.size,
    transparent: true,
    opacity: layer.opacity,
    depthWrite: false,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  systems.push({ geo, mat, points, home, velocity, phase, n, baseSize: layer.size, baseOpacity: layer.opacity });
}

// respawn homes to fill the current viewport nicely
function scatterHomes() {
  for (const s of systems) {
    for (let i = 0; i < s.n; i++) {
      const x = (Math.random() - 0.5) * fieldW;
      const y = (Math.random() - 0.5) * fieldH;
      const z = (Math.random() - 0.5) * 3;
      s.home.set([x, y, z], i * 3);
      s.geo.attributes.position.set([x, y, z], i * 3);
    }
    s.geo.attributes.position.needsUpdate = true;
  }
}

// ---------- mouse: particles politely get out of the way ----------
const mouseWorld = new THREE.Vector3(9999, 9999, 0);
const raycastPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const raycaster = new THREE.Raycaster();
const ndc = new THREE.Vector2();

window.addEventListener("pointermove", (e) => {
  const rect = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  raycaster.ray.intersectPlane(raycastPlane, mouseWorld);
});

window.addEventListener("pointerleave", () => {
  mouseWorld.set(9999, 9999, 0);
});

// ---------- click: confetti burst from the click point ----------
let burst = 0;
const burstCenter = new THREE.Vector3();

document.querySelector(".hero").addEventListener("click", (e) => {
  const rect = canvas.getBoundingClientRect();
  ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  ndc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  raycaster.setFromCamera(ndc, camera);
  raycaster.ray.intersectPlane(raycastPlane, burstCenter);
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
const REPEL_RADIUS = 2.2;
const REPEL_FORCE = 0.06;
const SPRING = 0.02;   // pull back home
const DAMPING = 0.88;  // settle down

function animate() {
  const t = clock.getElapsedTime();
  burst *= 0.93;

  for (const s of systems) {
    const pos = s.geo.attributes.position.array;

    for (let i = 0; i < s.n; i++) {
      const ix = i * 3;
      let px = pos[ix];
      let py = pos[ix + 1];

      // cursor repulsion
      const dxm = px - mouseWorld.x;
      const dym = py - mouseWorld.y;
      const distM = Math.hypot(dxm, dym);
      if (distM < REPEL_RADIUS && distM > 0.0001) {
        const f = (1 - distM / REPEL_RADIUS) * REPEL_FORCE;
        s.velocity[ix] += (dxm / distM) * f;
        s.velocity[ix + 1] += (dym / distM) * f;
      }

      // click burst: shove outward from the click point
      if (burst > 0.05) {
        const dxb = px - burstCenter.x;
        const dyb = py - burstCenter.y;
        const distB = Math.hypot(dxb, dyb);
        if (distB < 6 && distB > 0.0001) {
          const f = (1 - distB / 6) * 0.10 * burst;
          s.velocity[ix] += (dxb / distB) * f;
          s.velocity[ix + 1] += (dyb / distB) * f;
        }
      }

      // spring home + gentle ambient drift
      s.velocity[ix] += (s.home[ix] - px) * SPRING + Math.sin(t * 0.5 + s.phase[i]) * 0.0012;
      s.velocity[ix + 1] += (s.home[ix + 1] - py) * SPRING + Math.cos(t * 0.4 + s.phase[i]) * 0.0012;

      s.velocity[ix] *= DAMPING;
      s.velocity[ix + 1] *= DAMPING;

      pos[ix] += s.velocity[ix];
      pos[ix + 1] += s.velocity[ix + 1];
    }

    s.geo.attributes.position.needsUpdate = true;

    // twinkle: opacity and size breathe a little, more on burst
    const tw = 0.9 + Math.sin(t * 2 + s.phase[0]) * 0.1;
    s.mat.opacity = Math.min(s.baseOpacity * tw + burst * 0.15, 1);
    s.mat.size = s.baseSize * (1 + burst * 0.5);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

if (prefersReduced) {
  renderer.render(scene, camera);
} else {
  animate();
}

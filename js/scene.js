// =====================================================
// Hero scene: cobalt particle wave + wireframe shape
// Three.js via CDN import map
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

const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
camera.position.set(0, 2.2, 9);
camera.lookAt(0, 0, 0);

// ---------- particle wave ----------
const COLS = 90;
const ROWS = 50;
const SPACING = 0.32;
const count = COLS * ROWS;

const positions = new Float32Array(count * 3);
const colors = new Float32Array(count * 3);

const cobalt = new THREE.Color("#2742F5");
const coral = new THREE.Color("#FF6A4D");
const ink = new THREE.Color("#9a99a8");

let i = 0;
for (let x = 0; x < COLS; x++) {
  for (let z = 0; z < ROWS; z++) {
    positions[i * 3] = (x - COLS / 2) * SPACING;
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = (z - ROWS / 2) * SPACING;

    // mostly cobalt, a sprinkle of coral, some quiet grey
    const r = Math.random();
    const c = r < 0.06 ? coral : r < 0.55 ? cobalt : ink;
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
    i++;
  }
}

const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const mat = new THREE.PointsMaterial({
  size: 0.05,
  vertexColors: true,
  transparent: true,
  opacity: 0.85,
  depthWrite: false,
});

const points = new THREE.Points(geo, mat);
points.position.y = -1.4;
scene.add(points);

// ---------- floating wireframe icosahedron ----------
const icoGeo = new THREE.IcosahedronGeometry(1.4, 1);
const icoMat = new THREE.MeshBasicMaterial({
  color: cobalt,
  wireframe: true,
  transparent: true,
  opacity: 0.35,
});
const ico = new THREE.Mesh(icoGeo, icoMat);
ico.position.set(3.4, 1.2, 1.5);
scene.add(ico);

const icoSmallGeo = new THREE.IcosahedronGeometry(0.5, 0);
const icoSmallMat = new THREE.MeshBasicMaterial({
  color: coral,
  wireframe: true,
  transparent: true,
  opacity: 0.5,
});
const icoSmall = new THREE.Mesh(icoSmallGeo, icoSmallMat);
icoSmall.position.set(-4.2, 2, 0.5);
scene.add(icoSmall);

// ---------- mouse parallax ----------
const mouse = { x: 0, y: 0 };
const target = { x: 0, y: 0 };

window.addEventListener("pointermove", (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

// ---------- resize ----------
function resize() {
  const { clientWidth: w, clientHeight: h } = canvas.parentElement;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
resize();
window.addEventListener("resize", resize);

// ---------- animate ----------
const clock = new THREE.Clock();
const pos = geo.attributes.position;

function animate() {
  const t = clock.getElapsedTime();

  // wave motion
  let idx = 0;
  for (let x = 0; x < COLS; x++) {
    for (let z = 0; z < ROWS; z++) {
      const px = pos.array[idx * 3];
      const pz = pos.array[idx * 3 + 2];
      pos.array[idx * 3 + 1] =
        Math.sin(px * 0.55 + t * 0.9) * 0.45 +
        Math.cos(pz * 0.7 + t * 0.6) * 0.35;
      idx++;
    }
  }
  pos.needsUpdate = true;

  // shapes
  ico.rotation.x = t * 0.15;
  ico.rotation.y = t * 0.2;
  ico.position.y = 1.2 + Math.sin(t * 0.8) * 0.2;

  icoSmall.rotation.x = -t * 0.25;
  icoSmall.rotation.z = t * 0.18;
  icoSmall.position.y = 2 + Math.cos(t * 0.7) * 0.25;

  // parallax easing
  target.x += (mouse.x - target.x) * 0.04;
  target.y += (mouse.y - target.y) * 0.04;
  camera.position.x = target.x * 1.1;
  camera.position.y = 2.2 + target.y * 0.6;
  camera.lookAt(0, 0, 0);

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

if (prefersReduced) {
  // single static frame for reduced motion
  renderer.render(scene, camera);
} else {
  animate();
}

// =====================================================
// UI interactions: nav, mobile menu, custom cursor,
// scroll reveals, animated counters
// =====================================================

// ---------- sticky nav ----------
const nav = document.querySelector(".nav");
window.addEventListener("scroll", () => {
  nav.classList.toggle("is-scrolled", window.scrollY > 30);
});

// ---------- mobile menu ----------
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");

burger.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("is-open");
  burger.classList.toggle("is-open", open);
  document.body.style.overflow = open ? "hidden" : "";
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
    burger.classList.remove("is-open");
    document.body.style.overflow = "";
  });
});

// ---------- custom cursor ----------
const cursor = document.getElementById("cursor");
let cursorX = 0, cursorY = 0, renderX = 0, renderY = 0;

window.addEventListener("pointermove", (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;
  cursor.classList.add("is-active");
});

function cursorLoop() {
  renderX += (cursorX - renderX) * 0.2;
  renderY += (cursorY - renderY) * 0.2;
  cursor.style.transform = `translate(${renderX}px, ${renderY}px) translate(-50%, -50%)`;
  requestAnimationFrame(cursorLoop);
}
cursorLoop();

document.querySelectorAll("a, button").forEach((el) => {
  el.addEventListener("pointerenter", () => cursor.classList.add("is-hover"));
  el.addEventListener("pointerleave", () => cursor.classList.remove("is-hover"));
});

// ---------- scroll reveal ----------
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 80}ms`;
  revealObserver.observe(el);
});

// ---------- animated counters ----------
function animateCount(el) {
  const end = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || "";
  const duration = 1200;
  const start = performance.now();

  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(end * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.6 }
);

document.querySelectorAll(".stat__num").forEach((el) => statObserver.observe(el));

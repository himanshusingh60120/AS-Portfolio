// =====================================================
// UI: nav, mobile menu, cursor, reveals, counters,
// brand voice switcher, page likes, live engagement rate
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

// =====================================================
// SIGNATURE: brand voice switcher
// Same message, four brand voices. Proof of craft.
// =====================================================
const voices = {
  mine:
    "Social media manager by title, brand whisperer by habit. I run four brands across three audiences with one calendar and zero identity crises.",
  b2b:
    "Results-driven social media professional leveraging cross-functional synergies to deliver stakeholder-aligned engagement outcomes across the full funnel. Agree? Repost to your network.",
  genz:
    "bestie i literally make brands go viral for a living. me and the algorithm? besties. 90% growth in 6 months, organic, no cap fr fr.",
  luxury:
    "Considered narratives. Curated aesthetics. An audience that does not scroll past. Growth, achieved quietly and without discounting.",
};

const voiceText = document.getElementById("voiceText");
const voiceBtns = document.getElementById("voiceBtns");

voiceBtns.addEventListener("click", (e) => {
  const btn = e.target.closest(".voice__btn");
  if (!btn) return;

  voiceBtns.querySelectorAll(".voice__btn").forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");

  voiceText.classList.add("is-switching");
  setTimeout(() => {
    voiceText.textContent = voices[btn.dataset.voice];
    voiceText.classList.remove("is-switching");
  }, 250);
});

// =====================================================
// Page likes: click anywhere drops a heart
// =====================================================
const heartsLayer = document.getElementById("heartsLayer");
const likeCountEl = document.getElementById("likeCount");
const heartEmojis = ["\u2764\uFE0F", "\uD83D\uDC96", "\uD83D\uDC97", "\uD83E\uDE77"];
let likes = 0;
let lastHeart = 0;

document.addEventListener("click", (e) => {
  // don't hijack real interactions
  if (e.target.closest("a, button, input, textarea")) return;

  const now = Date.now();
  if (now - lastHeart < 120) return; // gentle throttle
  lastHeart = now;

  const heart = document.createElement("span");
  heart.className = "heart";
  heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
  heart.style.left = e.clientX + "px";
  heart.style.top = e.clientY + "px";
  heartsLayer.appendChild(heart);
  setTimeout(() => heart.remove(), 1400);

  likes++;
  likeCountEl.textContent =
    likes + (likes === 1 ? " like given to this page since you opened it" : " likes given to this page since you opened it");

  bumpEngagement(0.4);
});

// =====================================================
// Live engagement rate: the page measures you back
// =====================================================
const engageNum = document.getElementById("engageNum");
let engagement = 0.8;
let displayed = 0.8;

function bumpEngagement(amount) {
  engagement = Math.min(engagement + amount, 99.9);
}

// scrolling counts as engagement (of course it does)
let lastScrollBump = 0;
window.addEventListener("scroll", () => {
  const now = Date.now();
  if (now - lastScrollBump > 900) {
    lastScrollBump = now;
    bumpEngagement(0.15);
  }
});

// hovering links counts too
document.querySelectorAll("a, button").forEach((el) => {
  el.addEventListener("pointerenter", () => bumpEngagement(0.05), { once: false });
});

// time on page counts. slowly. like real life.
setInterval(() => bumpEngagement(0.03), 4000);

function engageLoop() {
  displayed += (engagement - displayed) * 0.08;
  engageNum.textContent = displayed.toFixed(1) + "%";
  requestAnimationFrame(engageLoop);
}
engageLoop();

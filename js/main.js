// =====================================================
// UI: nav, menu, cursor, grid tag, reveals, counters,
// work rows, toolkit sheet, voice switcher, likes,
// engagement meter, clock
// =====================================================

// ---------- sticky nav ----------
const nav = document.getElementById("nav");
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
let cx = 0, cy = 0, rx = 0, ry = 0;

window.addEventListener("pointermove", (e) => {
  cx = e.clientX; cy = e.clientY;
  cursor.classList.add("is-active");
});
(function cursorLoop() {
  rx += (cx - rx) * 0.2;
  ry += (cy - ry) * 0.2;
  cursor.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
  requestAnimationFrame(cursorLoop);
})();

function bindHover(el) {
  el.addEventListener("pointerenter", () => cursor.classList.add("is-hover"));
  el.addEventListener("pointerleave", () => cursor.classList.remove("is-hover"));
}
document.querySelectorAll("a, button, .cell").forEach(bindHover);

// ---------- grid coordinate tag (the feed is a grid, after all) ----------
const gridtag = document.getElementById("gridtag");
const hero = document.getElementById("hero");
const CELL = 44;

hero.addEventListener("pointermove", (e) => {
  const rect = hero.getBoundingClientRect();
  const col = Math.floor((e.clientX - rect.left) / CELL);
  const row = Math.floor((e.clientY - rect.top) / CELL);
  gridtag.textContent =
    "R" + String(row).padStart(2, "0") + ":C" + String(col).padStart(2, "0");
  gridtag.style.left = e.clientX + "px";
  gridtag.style.top = e.clientY + "px";
  gridtag.classList.add("is-on");
});
hero.addEventListener("pointerleave", () => gridtag.classList.remove("is-on"));

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
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 70}ms`;
  revealObserver.observe(el);
});

// ---------- animated counters ----------
function animateCount(el) {
  const end = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || "";
  const duration = 1200;
  const start = performance.now();
  (function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(end * eased) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  })(performance.now());
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
document.querySelectorAll(".stat__num[data-count]").forEach((el) => statObserver.observe(el));

// ---------- live impressions counter ----------
const impressionsEl = document.getElementById("impressions");
let impressions = 1;
setInterval(() => {
  impressions += Math.floor(Math.random() * 3) + 1;
  impressionsEl.textContent = impressions.toLocaleString("en-IN");
}, 700);

// ---------- work rows: click to open ----------
document.getElementById("workRows").addEventListener("click", (e) => {
  const head = e.target.closest(".row__head");
  if (!head) return;
  const row = head.parentElement;
  const open = row.classList.toggle("is-open");
  head.setAttribute("aria-expanded", open ? "true" : "false");
  head.querySelector(".row__sign").textContent = "+";
});

// ---------- toolkit sheet: caption bar ----------
const sheetVal = document.getElementById("sheetVal");
const sheetGrid = document.getElementById("sheetGrid");
const sheetDefault = "hover a skill and I'll caption it for you";

sheetGrid.addEventListener("pointerover", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;
  sheetVal.textContent = cell.dataset.caption;
});
sheetGrid.addEventListener("pointerleave", () => {
  sheetVal.textContent = sheetDefault;
});
// tap support
sheetGrid.addEventListener("click", (e) => {
  const cell = e.target.closest(".cell");
  if (!cell) return;
  sheetGrid.querySelectorAll(".cell").forEach((c) => c.classList.remove("is-live"));
  cell.classList.add("is-live");
  sheetVal.textContent = cell.dataset.caption;
});

// =====================================================
// SIGNATURE: brand voice switcher, typed out live
// =====================================================
const voices = {
  mine: {
    meta: "my voice · the one you get in the meeting",
    text: "Social media manager by title, brand whisperer by habit. I run four brands across three audiences on one calendar, and none of them sound like each other. That part is the job.",
  },
  b2b: {
    meta: "b2b linkedin · leveraging synergies since forever",
    text: "Results-driven social media professional leveraging cross-functional synergies to deliver stakeholder-aligned engagement outcomes across the full funnel. Thoughts? Repost to your network. ♻",
  },
  genz: {
    meta: "gen-z · the algorithm and i are besties",
    text: "bestie i literally make brands go viral for a living. 90% growth in six months, organic, no cap. the comments section is my roman empire and yes i do reply at 11pm.",
  },
  luxury: {
    meta: "luxury · we do not use exclamation marks here",
    text: "Considered narratives. Curated restraint. An audience that does not scroll past, because nothing here begs. Growth, achieved quietly, and never discounted.",
  },
};

const voiceBtns = document.getElementById("voiceBtns");
const voiceOut = document.getElementById("voiceOut");
const voiceMeta = document.getElementById("voiceMeta");
let typeTimer;

function typeOut(text) {
  clearInterval(typeTimer);
  let i = 0;
  voiceOut.textContent = "";
  const caret = document.createElement("span");
  caret.className = "caret";
  caret.textContent = "\u00A0";
  voiceOut.appendChild(caret);

  typeTimer = setInterval(() => {
    i += 2;
    caret.remove();
    voiceOut.textContent = text.slice(0, i);
    voiceOut.appendChild(caret);
    if (i >= text.length) {
      clearInterval(typeTimer);
      setTimeout(() => caret.remove(), 1200);
    }
  }, 16);
}

voiceBtns.addEventListener("click", (e) => {
  const btn = e.target.closest(".voice__btn");
  if (!btn) return;
  voiceBtns.querySelectorAll(".voice__btn").forEach((b) => b.classList.remove("is-active"));
  btn.classList.add("is-active");
  const v = voices[btn.dataset.voice];
  voiceMeta.textContent = v.meta;
  typeOut(v.text);
  bumpEngagement(0.6);
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
  if (e.target.closest("a, button, input, textarea")) return;
  const now = Date.now();
  if (now - lastHeart < 120) return;
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
    likes + (likes === 1 ? " LIKE GIVEN TO THIS PAGE" : " LIKES GIVEN TO THIS PAGE");
  bumpEngagement(0.4);
});

// =====================================================
// Live engagement rate: the page measures you back
// =====================================================
const engageNum = document.getElementById("engageNum");
let engagement = 0.8;
let displayedRate = 0.8;

function bumpEngagement(amount) {
  engagement = Math.min(engagement + amount, 99.9);
}
let lastScrollBump = 0;
window.addEventListener("scroll", () => {
  const now = Date.now();
  if (now - lastScrollBump > 900) {
    lastScrollBump = now;
    bumpEngagement(0.15);
  }
});
document.querySelectorAll("a, button, .cell").forEach((el) => {
  el.addEventListener("pointerenter", () => bumpEngagement(0.05));
});
setInterval(() => bumpEngagement(0.03), 4000);

(function engageLoop() {
  displayedRate += (engagement - displayedRate) * 0.08;
  engageNum.textContent = displayedRate.toFixed(1) + "%";
  requestAnimationFrame(engageLoop);
})();

// ---------- footer clock (IST) ----------
const clock = document.getElementById("clock");
setInterval(() => {
  clock.textContent = new Date().toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  });
}, 1000);

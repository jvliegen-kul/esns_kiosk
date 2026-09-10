/*
 * Kiosk image carousel
 * ---------------------
 * Reads the list of images to show from images/manifest.json, e.g.:
 *   ["photo1.jpg", "photo2.jpg", "flyer.png"]
 *
 * Run generate-manifest.py (see README) any time you add/remove
 * files from the images/ folder to regenerate that list.
 */

const CONFIG = {
  manifestUrl: "images/manifest.json",
  imagesDir: "images/",
  slideDurationMs: 20000,     // how long each image stays on screen
  transitionMs: 300,          // must match --transition-ms in style.css
  requestFullscreenOnTap: true,
  loop: true,
};

const carouselEl = document.getElementById("carousel");
const dotsEl = document.getElementById("dots");
const progressBarEl = document.getElementById("progress-bar");
const emptyStateEl = document.getElementById("empty-state");

let slides = [];
let current = 0;
let timerId = null;

async function loadManifest() {
  try {
    const res = await fetch(CONFIG.manifestUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(`manifest fetch failed: ${res.status}`);
    const list = await res.json();
    if (!Array.isArray(list) || list.length === 0) throw new Error("manifest empty");
    return list;
  } catch (err) {
    console.warn("Could not load images/manifest.json:", err.message);
    return [];
  }
}

function buildSlides(filenames) {
  carouselEl.innerHTML = "";
  dotsEl.innerHTML = "";
  slides = [];

  filenames.forEach((name, i) => {
    const img = document.createElement("img");
    img.src = CONFIG.imagesDir + encodeURIComponent(name);
    img.alt = "";
    img.draggable = false;
    carouselEl.appendChild(img);
    slides.push(img);

    const dot = document.createElement("div");
    dot.className = "dot";
    dot.dataset.index = String(i);
    dotsEl.appendChild(dot);
  });

  dotsEl.classList.toggle("hidden", slides.length <= 1);
}

function showSlide(index) {
  slides.forEach((img, i) => img.classList.toggle("active", i === index));
  const dots = dotsEl.querySelectorAll(".dot");
  dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
  current = index;
}

function startProgressBar() {
  progressBarEl.classList.remove("animate");
  progressBarEl.style.width = "0%";
  // Force reflow so the transition restarts every slide
  void progressBarEl.offsetWidth;
  progressBarEl.style.transition = `width ${CONFIG.slideDurationMs}ms linear`;
  progressBarEl.style.width = "100%";
}

function nextSlide() {
  let next = current + 1;
  if (next >= slides.length) {
    if (!CONFIG.loop) return;
    next = 0;
  }
  showSlide(next);
  startProgressBar();
}

function preload(filenames) {
  filenames.forEach((name) => {
    const img = new Image();
    img.src = CONFIG.imagesDir + encodeURIComponent(name);
  });
}

function startAutoplay() {
  if (timerId) clearInterval(timerId);
  if (slides.length <= 1) return; // nothing to advance to
  timerId = setInterval(nextSlide, CONFIG.slideDurationMs);
}

function enterFullscreenOnce() {
  if (!CONFIG.requestFullscreenOnTap) return;
  const el = document.documentElement;
  const request =
    el.requestFullscreen ||
    el.webkitRequestFullscreen ||
    el.msRequestFullscreen;
  if (request && !document.fullscreenElement) {
    request.call(el).catch(() => {
      /* ignore — some browsers require a real user gesture, that's fine */
    });
  }
}

async function init() {
  const filenames = await loadManifest();

  if (filenames.length === 0) {
    emptyStateEl.classList.add("show");
    return;
  }

  emptyStateEl.classList.remove("show");
  preload(filenames);
  buildSlides(filenames);
  showSlide(0);
  startProgressBar();
  startAutoplay();
}

// Kiosks often run unattended, but if a real screen/mouse is present,
// the first tap/click requests fullscreen and hides any lingering UI chrome.
window.addEventListener("click", enterFullscreenOnce, { once: true });
window.addEventListener("touchstart", enterFullscreenOnce, { once: true });

// Pause the timer while the tab/window isn't visible, resume cleanly after.
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    if (timerId) clearInterval(timerId);
  } else {
    startProgressBar();
    startAutoplay();
  }
});

init();

/* =========================================================
   Carlos Villamizar: interactions
   ========================================================= */

(() => {
  "use strict";

  const SITE = window.SITE;
  const Art = window.Art;
  const $ = (s, el = document) => el.querySelector(s);
  const pad = (n) => String(n).padStart(2, "0");
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* =======================================================
     1. Sound: only the blue landscape makes sound.
        Everything runs through a distortion stage whose
        drive follows the mouse over the panorama.
     ======================================================= */
  const Sound = {
    ctx: null, on: false, input: null, drive: null, tone: null, analyser: null, drone: null,
    scale: [55, 65.41, 73.42, 82.41, 98, 110, 130.81, 146.83, 164.81, 196, 220],

    curve(amount) {
      const n = 2048, c = new Float32Array(n);
      for (let i = 0; i < n; i++) {
        const x = (i * 2) / n - 1;
        c[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x)); // soft-clip
      }
      return c;
    },

    init() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      const c = (this.ctx = new AC());

      // input -> drive -> fuzz -> crunch -> tone -> out (+ dark echo)
      this.input = c.createGain(); this.input.gain.value = 0.6;
      this.drive = c.createGain(); this.drive.gain.value = 3;
      const fuzz = c.createWaveShaper(); fuzz.curve = this.curve(60); fuzz.oversample = "4x";
      const crunch = c.createWaveShaper(); crunch.curve = this.curve(8);
      this.tone = c.createBiquadFilter(); this.tone.type = "lowpass"; this.tone.frequency.value = 1400; this.tone.Q.value = 6;
      const out = c.createGain(); out.gain.value = 0.16;
      this.analyser = c.createAnalyser(); this.analyser.fftSize = 512;

      const delay = c.createDelay(2); delay.delayTime.value = 0.33;
      const fb = c.createGain(); fb.gain.value = 0.48;
      const dark = c.createBiquadFilter(); dark.type = "lowpass"; dark.frequency.value = 900;

      this.input.connect(this.drive).connect(fuzz).connect(crunch).connect(this.tone).connect(out);
      out.connect(this.analyser).connect(c.destination);
      out.connect(delay); delay.connect(dark); dark.connect(fb); fb.connect(delay); dark.connect(this.analyser);
      return true;
    },

    start() {
      if (!this.init()) return false;
      this.on = true;
      if (this.ctx.state === "suspended") this.ctx.resume();
      return true;
    },

    // mouse over the landscape bends the sound: x opens the filter, speed adds drive
    shape(x01, energy) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      this.tone.frequency.setTargetAtTime(250 + x01 * x01 * 4200, t, 0.08);
      this.drive.gain.setTargetAtTime(2 + energy * 40, t, 0.06);
    },

    hit(freq) {
      if (!this.on) return;
      const c = this.ctx, t = c.currentTime;
      const env = c.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.9, t + 0.005);
      env.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
      env.connect(this.input);
      [[1, "sawtooth", 0], [1.5, "square", 9], [0.5, "sawtooth", -7]].forEach(([m, type, det]) => {
        const o = c.createOscillator();
        o.type = type; o.frequency.setValueAtTime(freq * m * 1.04, t);
        o.frequency.exponentialRampToValueAtTime(freq * m, t + 0.25); // pitch dive
        o.detune.value = det; o.connect(env); o.start(t); o.stop(t + 3);
      });
      // crackle
      const len = c.sampleRate * 0.25, buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.15));
      const n = c.createBufferSource(); n.buffer = buf;
      const ng = c.createGain(); ng.gain.value = 0.5; n.connect(ng).connect(this.input); n.start(t);
    },

    note(i) { const s = this.scale; return s[((i % s.length) + s.length) % s.length]; },

    startDrone() {
      if (!this.on || this.drone) return;
      const c = this.ctx, t = c.currentTime;
      const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.5, t + 2.5);
      const lfo = c.createOscillator(), lfoG = c.createGain();
      lfo.frequency.value = 0.11; lfoG.gain.value = 18; lfo.connect(lfoG); lfo.start();
      const oscs = [41.2, 55, 61.7, 82.4, 110.2].map((f, i) => {
        const o = c.createOscillator(), og = c.createGain();
        o.type = i % 2 ? "square" : "sawtooth"; o.frequency.value = f; o.detune.value = (i - 2) * 7;
        lfoG.connect(o.detune);
        og.gain.value = 0.3 / (i + 1); o.connect(og).connect(g); o.start(); return o;
      });
      g.connect(this.input);
      this.drone = { g, oscs, lfo };
    },

    stopDrone() {
      if (!this.drone) return;
      const { g, oscs, lfo } = this.drone, t = this.ctx.currentTime;
      g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0, t + 1.2);
      setTimeout(() => { oscs.forEach((o) => o.stop()); lfo.stop(); }, 1400);
      this.drone = null;
    },

    level() {
      if (!this.analyser || !this.on) return 0;
      const a = new Uint8Array(this.analyser.fftSize);
      this.analyser.getByteTimeDomainData(a);
      let s = 0; for (const v of a) s += ((v - 128) / 128) ** 2;
      return Math.min(1, Math.sqrt(s / a.length) * 4);
    }
  };

  const listenBtn = $("#listenBtn");
  function setListening(on) {
    if (on) { Sound.start(); Sound.startDrone(); }
    else Sound.stopDrone();
    listenBtn.textContent = on ? "– Stop" : "+ Listen";
    listenBtn.classList.toggle("is-on", on);
  }
  listenBtn.addEventListener("click", () => setListening(!Sound.drone));

  /* =======================================================
     2. Content: real items first, generated placeholders after
     ======================================================= */
  const allItems = [];
  SITE.sections.forEach((sec) => sec.items.forEach((it, i) => allItems.push({ ...it, section: sec.id, index: i })));
  const withImages = allItems.filter((it) => it.image);

  const PLACEHOLDER_NAMES = {
    spectrogram: "Spectrogram study", haze: "Room tone", chladni: "Chladni figure",
    waveform: "Waveform", lissajous: "Lissajous figure", ridges: "Listening landscape"
  };

  function placeholder(n, w, h) {
    const kind = Art.KINDS[n % Art.KINDS.length];
    const seed = 1000 + n * 37;
    return {
      ghost: true, kind, seed,
      image: Art.render(kind, seed, w, h),
      title: `${PLACEHOLDER_NAMES[kind]} ${pad(n + 1)}`,
      year: "Forthcoming",
      location: "Berlin, Germany"
    };
  }

  /* =======================================================
     3. Collage: an edge-to-edge composition of tiles
     ======================================================= */
  const LAYOUT_WIDE = [
    { x: 0,  y: 0,  w: 35, h: 62, veil: 0 },
    { x: 35, y: 0,  w: 31, h: 57, veil: 0.62 },
    { x: 66, y: 0,  w: 34, h: 60, veil: 0.72 },
    { x: 0,  y: 62, w: 29, h: 38, veil: 0.08 },
    { x: 54, y: 66, w: 21, h: 34, veil: 0.8 }
  ];
  const LAYOUT_NARROW = [
    { x: 0,  y: 0,  w: 62, h: 38, veil: 0 },
    { x: 62, y: 0,  w: 38, h: 26, veil: 0.6 },
    { x: 0,  y: 68, w: 54, h: 32, veil: 0.1 }
  ];

  const collage = $("#collage");
  function buildCollage() {
    const narrow = innerWidth < 900;
    const layout = narrow ? LAYOUT_NARROW : LAYOUT_WIDE;
    collage.innerHTML = "";
    layout.forEach((L, i) => {
      const real = withImages[i];
      const item = real || placeholder(i, 640, Math.round(640 * (L.h / L.w) * (innerHeight / innerWidth) * 1.1) || 640);
      const tile = document.createElement("figure");
      tile.className = "tile";
      tile.style.cssText = `left:${L.x}%;top:${L.y}%;width:${L.w}%;height:${L.h}%;--veil:${L.veil};--i:${i}`;
      tile.innerHTML = `
        <img src="${esc(item.image)}" alt="">
        <figcaption class="tile__cap">
          <span>${esc(item.title)}, ${esc(item.year ?? "")}</span>
          <span class="muted">${esc(item.location ?? "")}</span>
          <span class="plus"><span class="link">+ More</span></span>
        </figcaption>`;
      tile.addEventListener("click", () => {
        location.hash = item.ghost ? "#archive" : `#item/${item.section}/${item.index}`;
      });
      collage.appendChild(tile);
    });
  }

  /* =======================================================
     4. Thumbnail strip (slowly scrolling)
     ======================================================= */
  function buildStrip() {
    const strip = $("#strip");
    const n = 14;
    const thumbs = Array.from({ length: n }, (_, i) =>
      withImages[i] ? { ...withImages[i] } : placeholder(i + 20, 120, 150));
    const track = document.createElement("div");
    track.className = "strip__track";
    [...thumbs, ...thumbs].forEach((t) => {
      const img = new Image();
      img.src = t.image; img.alt = "";
      img.addEventListener("click", () => { location.hash = t.ghost ? "#archive" : `#item/${t.section}/${t.index}`; });
      track.appendChild(img);
    });
    strip.innerHTML = ""; strip.appendChild(track);
  }

  /* =======================================================
     5. The panorama: ultramarine ridges drawn by sound
     ======================================================= */
  const pano = $("#pano"), pctx = pano.getContext("2d");
  let PW = 0, PH = 0;
  const pm = { x: -1, tx: -1, energy: 0 };

  function sizePano() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const r = pano.getBoundingClientRect();
    PW = Math.round(r.width); PH = Math.round(r.height);
    pano.width = PW * dpr; pano.height = PH * dpr;
    pctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  pano.addEventListener("pointermove", (e) => {
    const r = pano.getBoundingClientRect();
    pm.tx = e.clientX - r.left;
    if (pm.x < 0) pm.x = pm.tx;
    pm.energy = Math.min(1, pm.energy + Math.abs(e.movementX || 0) * 0.01);
    Sound.shape(pm.tx / r.width, pm.energy);
  });
  pano.addEventListener("pointerleave", () => { pm.tx = -1; });
  pano.addEventListener("pointerdown", (e) => {
    const r = pano.getBoundingClientRect();
    const idx = Math.floor(((e.clientX - r.left) / r.width) * 8) + 3;
    Sound.start();
    Sound.hit(Sound.note(idx));
    pm.energy = 1;
    Sound.shape((e.clientX - r.left) / r.width, 1);
  });

  function frame(time) {
    const t = time / 1000;
    if (pm.tx < 0) pm.x = -1; else pm.x += (pm.tx - pm.x) * 0.1;
    pm.energy *= 0.95;
    const e = Math.min(1, pm.energy + Sound.level());
    Art.drawRidges(pctx, PW, PH, t, e, pm.x, 6, 20260);
    if (!reduceMotion) requestAnimationFrame(frame);
  }

  $("#panoTitle").textContent = `${SITE.hero.title}, ${SITE.hero.year}`;
  $("#panoMeta").textContent = SITE.hero.meta;

  /* =======================================================
     6. Navigation
     ======================================================= */
  const topNav = $("#topNav"), drawer = $("#drawer"), menuBtn = $("#menuBtn");
  topNav.innerHTML = SITE.sections.map((s) => `<a href="#${s.id}">${esc(s.title)}</a>`).join("");
  drawer.innerHTML = SITE.sections.map((s) => `<a href="#${s.id}">${esc(s.title)}</a>`).join("") +
    `<a href="#archive">Archive</a>`;

  function setDrawer(open) {
    drawer.classList.toggle("is-visible", open);
    drawer.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "+ Close" : "+ Menu";
  }
  menuBtn.addEventListener("click", () => setDrawer(!drawer.classList.contains("is-visible")));

  /* =======================================================
     7. Archive overlay (grid + filters)
     ======================================================= */
  const archive = $("#archive");

  function cardHTML(it, n) {
    const href = it.ghost ? "" : `href="#item/${it.section}/${it.index}"`;
    return `
      <a class="card ${it.ghost ? "is-ghost" : ""}" ${href} data-n="${n}">
        <div class="card__img"><img src="${esc(it.image || Art.render(Art.KINDS[n % 10], 3000 + n, 480, 600))}" alt="${esc(it.title)}" loading="lazy"></div>
        <div class="card__t">${esc(it.title)}${it.year ? ", " + esc(it.year) : ""}</div>
        <div class="card__m">${esc(it.location || it.medium || "")}</div>
        <div class="card__p"><span class="link">+ More</span></div>
      </a>`;
  }

  function openArchive(sectionId) {
    const sec = SITE.sections.find((s) => s.id === sectionId);
    const items = sec ? sec.items.map((it, i) => ({ ...it, section: sec.id, index: i })) : allItems;
    const title = sec ? sec.title : "Archive";

    $("#archiveTitle").textContent = title;
    $("#archiveCount").textContent = items.length ? `(${items.length})` : "(0)";
    $("#archiveTabs").innerHTML =
      `<a href="#archive" class="${!sec ? "is-active" : ""}">All</a>` +
      SITE.sections.map((s) => `<a href="#${s.id}" class="${sec && s.id === sec.id ? "is-active" : ""}">${esc(s.title)}</a>`).join("");
    $("#archiveFilters").innerHTML = SITE.filters.map((f) => `<span class="link">+ ${esc(f)}</span>`).join("");

    let html;
    if (items.length) {
      html = items.map(cardHTML).join("");
    } else {
      const ghosts = Array.from({ length: 8 }, (_, n) => {
        const h = [600, 480, 720, 560, 640, 500, 700, 540][n];
        return { ...placeholder(n + 40, 480, h) };
      });
      html = `<p class="archive__empty">${esc(title)} is still <em>resonating</em>. Soon to be heard.</p>` +
        ghosts.map((g, n) => cardHTML(g, n)).join("");
    }
    const grid = $("#archiveGrid");
    grid.innerHTML = html;

    archive.classList.add("is-visible");
    archive.setAttribute("aria-hidden", "false");
    archive.scrollTop = 0;
    document.title = `${title} — Carlos Villamizar`;
    [...topNav.children].forEach((a) => a.classList.toggle("is-active", sec && a.getAttribute("href") === "#" + sec.id));
  }

  function closeArchive() {
    archive.classList.remove("is-visible");
    archive.setAttribute("aria-hidden", "true");
    [...topNav.children].forEach((a) => a.classList.remove("is-active"));
  }

  /* =======================================================
     8. Detail view
     ======================================================= */
  const detail = $("#detail");
  function openDetail(sectionId, index) {
    const sec = SITE.sections.find((s) => s.id === sectionId);
    const it = sec && sec.items[index];
    if (!it) return false;
    const meta = [it.year, it.medium, it.location].filter(Boolean).map(esc).join(", ");
    const related = sec.items.map((r, i) => ({ r, i })).filter(({ i }) => i !== +index && sec.items[i].image).slice(0, 8);
    $("#detailBody").innerHTML = `
      <div class="detail__media">
        ${it.video ? `<iframe src="${esc(it.video)}" allow="autoplay; fullscreen" allowfullscreen></iframe>` : ""}
        ${it.image ? `<img src="${esc(it.image)}" alt="${esc(it.title)}">` : ""}
      </div>
      <div class="detail__text">
        <h3>${esc(it.title)}</h3>
        ${meta ? `<p class="muted">${meta}</p>` : ""}
        ${it.description ? `<p>${esc(it.description)}</p>` : ""}
        ${it.audio ? `<audio controls preload="none" src="${esc(it.audio)}"></audio>` : ""}
        ${it.link ? `<p><a class="link" href="${esc(it.link)}" target="_blank" rel="noopener">+ Visit</a></p>` : ""}
      </div>
      ${related.length ? `<div class="related">Related<div class="related__row">${related.map(({ r, i }) =>
        `<a href="#item/${sec.id}/${i}"><img src="${esc(r.image)}" alt="${esc(r.title)}"></a>`).join("")}</div></div>` : ""}`;
    detail.classList.add("is-visible");
    detail.setAttribute("aria-hidden", "false");
    detail.scrollTop = 0;
    document.title = `${it.title} — Carlos Villamizar`;
    return true;
  }
  function closeDetail() { detail.classList.remove("is-visible"); detail.setAttribute("aria-hidden", "true"); }
  $("#detailBack").addEventListener("click", () => history.back());
  $("#detailClose").addEventListener("click", () => { location.hash = ""; });

  /* =======================================================
     9. Router (hash based, works on GitHub Pages)
     ======================================================= */
  function route() {
    const h = location.hash.replace(/^#/, "");
    setDrawer(false);
    if (h.startsWith("item/")) {
      const [, s, i] = h.split("/");
      if (openDetail(s, i)) { document.body.classList.add("is-open"); return; }
    }
    closeDetail();
    if (h === "archive" || SITE.sections.some((s) => s.id === h)) {
      openArchive(h === "archive" ? null : h);
      document.body.classList.add("is-open");
      return;
    }
    closeArchive();
    document.body.classList.remove("is-open");
    document.title = "Carlos Villamizar — Sound Artist";
  }

  document.querySelectorAll("[data-home]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      history.pushState("", document.title, location.pathname + location.search);
      route();
    }));
  addEventListener("hashchange", route);
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if ($("#hi").classList.contains("is-visible")) return closeHi();
    if (location.hash) location.hash = "";
  });

  /* =======================================================
     10. "Hi!" box
     ======================================================= */
  const hi = $("#hi");
  function closeHi() {
    hi.classList.remove("is-visible");
    setTimeout(() => (hi.hidden = true), 600);
    try { sessionStorage.setItem("cv-hi", "1"); } catch (_) {}
  }
  $("#hiClose").addEventListener("click", closeHi);
  $("#hiSound").addEventListener("click", () => { setListening(true); closeHi(); });
  let seen = false;
  try { seen = sessionStorage.getItem("cv-hi") === "1"; } catch (_) {}
  if (SITE.greeting && !seen) {
    setTimeout(() => {
      if (document.body.classList.contains("is-open")) return;
      hi.hidden = false;
      requestAnimationFrame(() => hi.classList.add("is-visible"));
    }, 2600);
  }

  /* =======================================================
     11. Clock, year, boot
     ======================================================= */
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", hour12: false });
  const tick = () => { $("#clock").textContent = "Berlin " + fmt.format(new Date()); };
  tick(); setInterval(tick, 10000);
  $("#year").textContent = new Date().getFullYear();

  let lastNarrow = innerWidth < 900;
  addEventListener("resize", () => {
    sizePano();
    const narrow = innerWidth < 900;
    if (narrow !== lastNarrow) { lastNarrow = narrow; buildCollage(); }
    if (reduceMotion) frame(0);
  });

  buildCollage();
  buildStrip();
  sizePano();
  requestAnimationFrame(frame);
  route();
})();

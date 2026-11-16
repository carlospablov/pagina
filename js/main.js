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
     1. Sound (Web Audio, silent until the visitor asks)
     ======================================================= */
  const Sound = {
    ctx: null, on: false, master: null, analyser: null, drone: null,
    scale: [110, 130.81, 146.83, 164.81, 196, 220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25],

    init() {
      if (this.ctx) return true;
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      const c = (this.ctx = new AC());
      this.master = c.createGain(); this.master.gain.value = 0.25;
      this.analyser = c.createAnalyser(); this.analyser.fftSize = 512;
      const delay = c.createDelay(2); delay.delayTime.value = 0.42;
      const fb = c.createGain(); fb.gain.value = 0.42;
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 1800;
      this.master.connect(this.analyser).connect(c.destination);
      this.master.connect(delay); delay.connect(lp); lp.connect(fb); fb.connect(delay); lp.connect(this.analyser);
      return true;
    },

    set(on) {
      if (!this.init()) return false;
      this.on = on;
      if (on && this.ctx.state === "suspended") this.ctx.resume();
      if (!on) this.stopDrone();
      return on;
    },

    tone(freq, { gain = 0.4, dur = 2.4, type = "sine", partials = [[1, 1], [2.01, 0.25], [3, 0.08]], delay = 0 } = {}) {
      if (!this.on) return;
      const c = this.ctx, t = c.currentTime + delay;
      const env = c.createGain();
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(gain, t + 0.01);
      env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      env.connect(this.master);
      partials.forEach(([m, l]) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.value = freq * m; g.gain.value = l;
        o.connect(g).connect(env); o.start(t); o.stop(t + dur + 0.1);
      });
    },

    noise({ gain = 0.2, dur = 1.2, freq = 1200, q = 0.8 } = {}) {
      if (!this.on) return;
      const c = this.ctx, t = c.currentTime;
      const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      const src = c.createBufferSource(); src.buffer = buf;
      const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = freq; bp.Q.value = q;
      const env = c.createGain();
      env.gain.setValueAtTime(0, t); env.gain.linearRampToValueAtTime(gain, t + 0.02);
      env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      src.connect(bp).connect(env).connect(this.master); src.start(t);
    },

    note(i) { const s = this.scale; return s[((i % s.length) + s.length) % s.length]; },

    // each kind of image has its own sound signature
    signature(kind, seed = 0) {
      const b = 5 + (seed % 5);
      switch (kind) {
        case "spectrogram": [1, 2, 3, 4, 5, 6].forEach((k, i) => this.tone(110 * k, { gain: 0.18 / Math.sqrt(k), delay: i * 0.09, dur: 2.8, partials: [[1, 1]] })); break;
        case "chladni":     this.tone(this.note(b + 4), { gain: 0.35, dur: 4, partials: [[1, 1], [2.76, 0.4], [5.4, 0.2], [8.93, 0.1]] }); break;
        case "waveform":    this.noise({ gain: 0.35, dur: 0.9, freq: 900 + seed % 7 * 200, q: 2 }); break;
        case "lissajous":   this.tone(this.note(b), { gain: 0.25, dur: 3 }); this.tone(this.note(b) * 1.5, { gain: 0.2, dur: 3, delay: 0.02 }); break;
        case "haze":        this.noise({ gain: 0.25, dur: 2.6, freq: 400, q: 0.5 }); this.tone(this.note(b - 3), { gain: 0.12, dur: 3 }); break;
        default:            [0, 2, 4].forEach((n, i) => this.tone(this.note(b + n), { gain: 0.22, delay: i * 0.12 }));
      }
    },

    startDrone() {
      if (!this.on || this.drone) return;
      const c = this.ctx, t = c.currentTime;
      const out = c.createGain(); out.gain.setValueAtTime(0, t); out.gain.linearRampToValueAtTime(0.32, t + 3);
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 700; lp.Q.value = 3;
      const lfo = c.createOscillator(), lfoG = c.createGain();
      lfo.frequency.value = 0.07; lfoG.gain.value = 420; lfo.connect(lfoG).connect(lp.frequency); lfo.start();
      const oscs = [55, 82.41, 110.3, 164.81, 220.6].map((f, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = i % 2 ? "triangle" : "sawtooth"; o.frequency.value = f; o.detune.value = (i - 2) * 4;
        g.gain.value = 0.12 / (i + 1); o.connect(g).connect(lp); o.start(); return o;
      });
      lp.connect(out).connect(this.master);
      this.drone = { out, oscs, lfo };
    },

    stopDrone() {
      if (!this.drone) return;
      const { out, oscs, lfo } = this.drone, t = this.ctx.currentTime;
      out.gain.cancelScheduledValues(t); out.gain.setValueAtTime(out.gain.value, t);
      out.gain.linearRampToValueAtTime(0, t + 1.5);
      setTimeout(() => { oscs.forEach((o) => o.stop()); lfo.stop(); }, 1700);
      this.drone = null;
    },

    level() {
      if (!this.analyser || !this.on) return 0;
      const a = new Uint8Array(this.analyser.fftSize);
      this.analyser.getByteTimeDomainData(a);
      let s = 0; for (const v of a) s += ((v - 128) / 128) ** 2;
      return Math.min(1, Math.sqrt(s / a.length) * 6);
    }
  };

  const soundBtn = $("#soundBtn"), listenBtn = $("#listenBtn");
  function setSound(on) {
    Sound.set(on);
    soundBtn.textContent = on ? "Sound on" : "Sound off";
    soundBtn.setAttribute("aria-pressed", String(on));
    if (!on) { listenBtn.textContent = "+ Listen"; listenBtn.classList.remove("is-on"); }
    if (on) [0, 2, 4, 7].forEach((n, i) => Sound.tone(Sound.note(n + 5), { gain: 0.18, delay: i * 0.12 }));
  }
  soundBtn.addEventListener("click", () => setSound(!Sound.on));
  listenBtn.addEventListener("click", () => {
    if (!Sound.on) setSound(true);
    if (Sound.drone) { Sound.stopDrone(); listenBtn.textContent = "+ Listen"; listenBtn.classList.remove("is-on"); }
    else { Sound.startDrone(); listenBtn.textContent = "– Stop"; listenBtn.classList.add("is-on"); }
  });

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
          <span class="plus"><span class="link">+ Listen</span><span class="link">+ More</span></span>
        </figcaption>`;
      tile.addEventListener("pointerenter", () => {
        if (item.ghost) Sound.signature(item.kind, item.seed);
        else Sound.tone(Sound.note(i + 4), { gain: 0.25 });
      });
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
      img.addEventListener("pointerenter", () => t.ghost ? Sound.signature(t.kind, t.seed) : Sound.tone(Sound.note(3), { gain: 0.2 }));
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
  });
  pano.addEventListener("pointerleave", () => { pm.tx = -1; });
  pano.addEventListener("pointerdown", (e) => {
    const r = pano.getBoundingClientRect();
    const idx = Math.floor(((e.clientX - r.left) / r.width) * 8) + 3;
    Sound.tone(Sound.note(idx), { gain: 0.35, dur: 3.5 });
    Sound.tone(Sound.note(idx + 2), { gain: 0.18, dur: 3.5, delay: 0.08 });
    pm.energy = 1;
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
  [...topNav.children, ...drawer.children].forEach((a, i) =>
    a.addEventListener("pointerenter", () => Sound.tone(Sound.note(i + 6), { gain: 0.14, dur: 1.4 })));

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
        <div class="card__p"><span class="link">+ Listen</span><span class="link">+ More</span></div>
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
    grid.querySelectorAll(".card").forEach((c, n) =>
      c.addEventListener("pointerenter", () => Sound.tone(Sound.note(n + 2), { gain: 0.12, dur: 1.6 })));

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
  $("#hiSound").addEventListener("click", () => { setSound(true); closeHi(); });
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

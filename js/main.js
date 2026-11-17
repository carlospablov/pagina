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
     2. Content: real items first, generated placeholders after
     ======================================================= */
  const allItems = [];
  SITE.sections.forEach((sec) => sec.items.forEach((it, i) => allItems.push({ ...it, section: sec.id, index: i })));
  const withImages = allItems.filter((it) => it.image);

  // Every real picture (cover first, then gallery photos) for the home collage + strip
  // Interleaved: all covers first, then gallery photos taken in turns from each item
  const pool = withImages.map((it) => ({ ...it, src: it.image }));
  const galleries = withImages.map((it) => (it.gallery || []).map((g) => ({ ...it, src: g.src, caption: g.caption })));
  for (let k = 0; galleries.some((g) => g[k]); k++) galleries.forEach((g) => g[k] && pool.push(g[k]));

  const PLACEHOLDER_NAMES = {
    spectrogram: "Spectrogram study", haze: "Room tone", chladni: "Chladni figure",
    waveform: "Waveform", lissajous: "Lissajous figure", ridges: "Landscape"
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
      const real = pool[i];
      const item = real || placeholder(i, 640, Math.round(640 * (L.h / L.w) * (innerHeight / innerWidth) * 1.1) || 640);
      const src = real ? real.src : item.image;
      const tile = document.createElement("figure");
      tile.className = "tile";
      tile.style.cssText = `left:${L.x}%;top:${L.y}%;width:${L.w}%;height:${L.h}%;--veil:${L.veil};--i:${i}`;
      tile.innerHTML = `
        <img src="${esc(src)}" alt="${esc(real ? real.title + (real.caption ? ", " + real.caption : "") : "")}">
        <span class="tile__dim"></span>
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
      pool[i] ? { ...pool[i], image: pool[i].src } : placeholder(i + 20, 120, 150));
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
     5. Tile dimensions (shown in Measure mode)
     ======================================================= */
  function updateSpecs() {
    document.querySelectorAll(".tile").forEach((t, i) => {
      const r = t.getBoundingClientRect();
      const d = t.querySelector(".tile__dim");
      if (d) d.textContent = `T${pad(i + 1)} · ${Math.round(r.width)} × ${Math.round(r.height)}`;
    });
  }

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
        <div class="card__img"><img src="${esc(it.thumb || it.image || (it.visual ? Art.render(it.visual, 4100 + n, 480, 600) : Art.render(Art.KINDS[n % 10], 3000 + n, 480, 600)))}" alt="${esc(it.title)}" loading="lazy"></div>
        <div class="card__t">${esc(it.title)}${it.year ? ", " + esc(it.year) : ""}</div>
        <div class="card__m">${esc(it.location || it.medium || "")}</div>
        <div class="card__p"><span class="link">+ More</span></div>
      </a>`;
  }

  function openArchive(sectionId) {
    const sec = SITE.sections.find((s) => s.id === sectionId);
    const items = sec ? sec.items.map((it, i) => ({ ...it, section: sec.id, index: i })) : allItems;
    const title = sec ? sec.title : "Archive";

    const isText = !!(sec && (sec.text || sec.form));
    $("#archiveTitle").textContent = title;
    $("#archiveCount").textContent = isText ? "" : items.length ? `(${items.length})` : "(0)";
    $("#archiveTabs").innerHTML =
      `<a href="#archive" class="${!sec ? "is-active" : ""}">All</a>` +
      SITE.sections.map((s) => `<a href="#${s.id}" class="${sec && s.id === sec.id ? "is-active" : ""}">${esc(s.title)}</a>`).join("");
    $("#archiveFilters").innerHTML = isText ? "" : SITE.filters.map((f) => `<span class="link">+ ${esc(f)}</span>`).join("");

    let html;
    if (sec && sec.form) {
      html = contactFormHTML();
    } else if (isText) {
      html = `<div class="textpage">${sec.text.map((line) => `<p${/\s/.test(line) ? "" : ' class="is-run"'}>${esc(line)}</p>`).join("")}</div>`;
    } else if (items.length) {
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
    grid.classList.toggle("is-text", isText);
    grid.innerHTML = html;
    if (sec && sec.form) wireContactForm(sec.form);

    archive.classList.add("is-visible");
    archive.setAttribute("aria-hidden", "false");
    archive.scrollTop = 0;
    document.title = `${title} — Carlos Villamizar`;
    [...topNav.children].forEach((a) => a.classList.toggle("is-active", sec && a.getAttribute("href") === "#" + sec.id));
  }

  /* ---------- Contact form (FormSubmit) ---------- */
  function contactFormHTML() {
    return `
      <form class="contact" id="contactForm" novalidate>
        <label class="contact__field">
          <span>Your email</span>
          <input type="email" name="email" required autocomplete="email" />
        </label>
        <label class="contact__field contact__field--msg">
          <span>Message</span>
          <textarea name="message" rows="7" required></textarea>
        </label>
        <input type="text" name="_honey" class="contact__honey" tabindex="-1" autocomplete="off" aria-hidden="true" />
        <div class="contact__row">
          <p class="contact__status" id="contactStatus" role="status"></p>
          <button class="pill" type="submit">+ Send</button>
        </div>
      </form>`;
  }

  function wireContactForm(cfg) {
    const form = $("#contactForm"), status = $("#contactStatus");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form));
      if (data._honey) return;                       // bots fill the hidden field
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "")) { status.textContent = "Please enter a valid email."; return; }
      if (!(data.message || "").trim()) { status.textContent = "Please write a message."; return; }
      const btn = form.querySelector("button");
      btn.disabled = true; status.textContent = "Sending…";
      try {
        const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(cfg.to)}`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            email: data.email, message: data.message,
            _subject: "New message from carlosvillamizar.net", _template: "box", _captcha: "false"
          })
        });
        const out = await res.json().catch(() => ({}));
        if (!res.ok || out.success === "false" || out.success === false) {
          // FormSubmit explains what is wrong (e.g. the form still needs activation)
          status.textContent = out.message || `The message could not be sent (error ${res.status}).`;
          return;
        }
        form.reset();
        status.textContent = "Thank you, your message was sent.";
      } catch (err) {
        // Network/CORS problem: fall back to a classic form post (FormSubmit's own page, then back here)
        classicSubmit(cfg, data);
      } finally {
        btn.disabled = false;
      }
    });
  }

  function classicSubmit(cfg, data) {
    const f = document.createElement("form");
    f.method = "POST";
    f.action = `https://formsubmit.co/${encodeURIComponent(cfg.to)}`;
    const fields = {
      email: data.email, message: data.message,
      _subject: "New message from carlosvillamizar.net", _template: "box",
      _next: location.href.split("#")[0] + "#contact"
    };
    for (const [k, v] of Object.entries(fields)) {
      const i = document.createElement("input");
      i.type = "hidden"; i.name = k; i.value = v; f.appendChild(i);
    }
    document.body.appendChild(f);
    f.submit();
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
    if (it.type === "release") return openRelease(it);
    if (it.type === "work") return openWork(it, sec);
    const meta = [it.year, it.medium, it.location].filter(Boolean).map(esc).join(", ");
    const related = sec.items.map((r, i) => ({ r, i })).filter(({ i }) => i !== +index && sec.items[i].image).slice(0, 8);
    detail.classList.remove("is-release");
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
  /* ---------- Release page ---------- */
  const toSec = (t) => t.split(":").reduce((a, v) => a * 60 + +v, 0);
  const fmtTime = (sec) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;

  function openRelease(it) {
    const tracks = (it.sides || []).flatMap((sd) => sd.tracks);
    const total = fmtTime(tracks.reduce((a, [, d]) => a + toSec(d), 0));
    // Releases are numbered in chronological order (oldest = 01)
    const rels = (SITE.sections.find((x) => x.id === "releases")?.items || [])
      .filter((x) => x.type === "release")
      .sort((a, b) => String(a.released || a.year).localeCompare(String(b.released || b.year)));
    const relIndex = rels.findIndex((x) => x.title === it.title) + 1 || 1;
    const accent = it.accent || "var(--ultramarine)";
    const bc = it.bandcamp && it.bandcamp.album
      ? `<iframe class="release__player" title="${esc(it.title)} on Bandcamp" loading="lazy"
           src="https://bandcamp.com/EmbeddedPlayer/album=${encodeURIComponent(it.bandcamp.album)}/size=large/bgcol=ffffff/linkcol=${(it.accent || "#142a86").replace("#", "")}/tracklist=false/artwork=none/transparent=true/"
           seamless></iframe>` : "";

    $("#detailBody").innerHTML = `
      <article class="release${it.lowercase ? " release--lower" : ""}" style="--accent:${esc(accent)}">
       <div class="release__top">
        <div class="release__cover">
          <img src="${esc(it.image)}" alt="${esc(it.title)}, cover artwork">
          <span class="release__fig">FIG. 00 — COVER${it.artwork ? " · ARTWORK: " + esc(it.artwork.toUpperCase()) : ""}</span>
        </div>
        <div class="release__info">
          <p class="release__kicker">RELEASE ${pad(relIndex)} · ${esc((it.label || "").toUpperCase())} · ${esc((it.format || "").toUpperCase())}</p>
          <h3 class="release__title">${esc(it.title)}</h3>
          <p class="release__meta">${esc(it.date || it.year)} · ${tracks.length} TRACKS · ${total}</p>
          ${bc}
          <div class="release__text">
            ${it.text ? `<p>${esc(it.text)}</p>` : ""}
            ${it.textEs ? `<p class="release__sep">//</p><p class="release__es">${esc(it.textEs)}</p>` : ""}
          </div>
          ${(it.sides || []).map((sd) => `
            <div class="release__side">
              <p class="release__sidename">${esc(sd.name)}</p>
              <ol>${sd.tracks.map(([t, d]) => `<li><span>${esc(t)}</span><i></i><b>${esc(d)}</b></li>`).join("")}</ol>
            </div>`).join("")}
          ${it.credits ? `<div class="release__credits"><p class="release__label">Credits</p>${it.credits.map((c) => `<p>${esc(c)}</p>`).join("")}</div>` : ""}
          <p class="release__links">
            ${it.bandcamp ? `<a class="link" href="${esc(it.bandcamp.url)}" target="_blank" rel="noopener">+ Listen &amp; buy on Bandcamp</a>` : ""}
          </p>
        </div>
       </div>
        ${(it.gallery || []).length ? `
          <div class="release__gallery" data-count="${it.gallery.length}">
            ${it.gallery.map((g, i) => `
              <figure>
                <button class="release__shot" data-src="${esc(g.src)}" aria-label="Enlarge: ${esc(g.caption || "")}"><img src="${esc(g.src)}" alt="${esc(g.caption || it.title)}" loading="lazy"></button>
                <figcaption>FIG. ${pad(i + 1)} — ${esc((g.caption || "").toUpperCase())}</figcaption>
              </figure>`).join("")}
          </div>` : ""}
      </article>`;

    $("#detailBody").querySelectorAll(".release__shot").forEach((b) =>
      b.addEventListener("click", () => openLightbox(b.dataset.src, b.querySelector("img").alt)));
    detail.classList.add("is-visible", "is-release");
    detail.setAttribute("aria-hidden", "false");
    detail.scrollTop = 0;
    document.title = `${it.title} — Carlos Villamizar`;
    return true;
  }

  /* ---------- Work page ---------- */
  let radio = null;   // animation handle for the live 'untuned radio' visual

  function openWork(it, sec) {
    const n = sec.items.indexOf(it) + 1;
    const meta = [it.year, it.location].filter(Boolean).map(esc).join(" · ");
    const media = it.image
      ? `<img src="${esc(it.image)}" alt="${esc(it.title)}">`
      : it.visual === "static"
        ? `<canvas class="work__radio" id="workRadio" aria-label="Live visual: noise of an untuned radio frequency"></canvas>`
        : "";
    $("#detailBody").innerHTML = `
      <article class="release work">
       <div class="release__top">
        <div class="release__cover">
          ${media}
          <span class="release__fig">FIG. 00 — ${it.image ? "INSTALLATION VIEW" : "UNTUNED FREQUENCY · LIVE NOISE"}</span>
        </div>
        <div class="release__info">
          <p class="release__kicker">WORK ${pad(n)} · ${esc((it.category || "").toUpperCase())}</p>
          <h3 class="release__title">${esc(it.title)}</h3>
          ${it.subtitle ? `<p class="work__subtitle">${esc(it.subtitle)}</p>` : ""}
          ${meta ? `<p class="release__meta">${meta}</p>` : ""}
          <div class="release__text">${it.text ? `<p>${esc(it.text)}</p>` : ""}</div>
          ${it.components ? `<div class="release__side work__parts">
              <p class="release__label">Elements</p>
              <ol>${it.components.map((c) => `<li><span>${esc(c)}</span><i></i></li>`).join("")}</ol>
            </div>` : ""}
          ${it.credits ? `<div class="release__credits"><p class="release__label">Credits</p>${it.credits.map((c) => `<p>${esc(c)}</p>`).join("")}</div>` : ""}
        </div>
       </div>
        ${(it.gallery || []).length ? `
          <div class="release__gallery" data-count="${it.gallery.length}">
            ${it.gallery.map((g, i) => `
              <figure>
                <button class="release__shot" data-src="${esc(g.src)}" aria-label="Enlarge: ${esc(g.caption || "")}"><img src="${esc(g.src)}" alt="${esc(g.caption || it.title)}" loading="lazy"></button>
                <figcaption>FIG. ${pad(i + 1)} — ${esc((g.caption || "").toUpperCase())}</figcaption>
              </figure>`).join("")}
          </div>` : ""}
      </article>`;
    $("#detailBody").querySelectorAll(".release__shot").forEach((b) =>
      b.addEventListener("click", () => openLightbox(b.dataset.src, b.querySelector("img").alt)));
    if (!it.image && it.visual === "static") startRadio($("#workRadio"));
    detail.classList.add("is-visible", "is-release");
    detail.setAttribute("aria-hidden", "false");
    detail.scrollTop = 0;
    document.title = `${it.title} — Carlos Villamizar`;
    return true;
  }

  // A slowly scrolling 'waterfall' of radio noise: grain + faint drifting carriers
  function startRadio(canvas) {
    stopRadio();
    const ctx = canvas.getContext("2d");
    const W = 360, H = 360;
    canvas.width = W; canvas.height = H;
    ctx.fillStyle = "#eeede8"; ctx.fillRect(0, 0, W, H);
    const carriers = Array.from({ length: 6 }, () => ({ x: Math.random() * W, w: 1.5 + Math.random() * 7, s: 0.12 + Math.random() * 0.35, drift: (Math.random() - 0.5) * 0.25 }));
    const row = ctx.createImageData(W, 1), d = row.data;
    let t = 0, frame = 0;
    const loop = () => {
      if (!detail.classList.contains("is-visible")) { radio = null; return; }
      if (frame++ % 2 === 0) {
        ctx.drawImage(canvas, 0, 0, W, H - 1, 0, 1, W, H - 1);   // scroll down 1px
        t++;
        const burst = Math.random() < 0.01 ? 0.5 : 0;            // rare bursts of interference
        for (const c of carriers) { c.x = (c.x + c.drift + W) % W; c.s = Math.max(0.05, Math.min(0.55, c.s + (Math.random() - 0.5) * 0.03)); }
        for (let x = 0; x < W; x++) {
          let v = Math.pow(Math.random(), 3) * 0.7 + burst * Math.random();
          for (const c of carriers) { const dx = (x - c.x) / c.w; v += c.s * Math.exp(-dx * dx) * (0.55 + Math.random() * 0.45); }
          const g = 238 - Math.min(1, v) * 222;
          d[x * 4] = g; d[x * 4 + 1] = g; d[x * 4 + 2] = g - 4; d[x * 4 + 3] = 255;
        }
        ctx.putImageData(row, 0, 0);
      }
      radio = requestAnimationFrame(loop);
    };
    // pre-fill so the visual is complete from the first moment
    for (let i = 0; i < H; i++) { frame = 0; loopFill(); }
    function loopFill() {
      ctx.drawImage(canvas, 0, 0, W, H - 1, 0, 1, W, H - 1);
      for (let x = 0; x < W; x++) {
        let v = Math.pow(Math.random(), 3) * 0.7;
        for (const c of carriers) { const dx = (x - c.x) / c.w; v += c.s * Math.exp(-dx * dx) * (0.55 + Math.random() * 0.45); }
        const g = 238 - Math.min(1, v) * 222;
        d[x * 4] = g; d[x * 4 + 1] = g; d[x * 4 + 2] = g - 4; d[x * 4 + 3] = 255;
      }
      ctx.putImageData(row, 0, 0);
      for (const c of carriers) c.x = (c.x + c.drift + W) % W;
    }
    radio = requestAnimationFrame(loop);
  }
  function stopRadio() { if (radio) cancelAnimationFrame(radio); radio = null; }

  /* ---------- Lightbox ---------- */
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox";
  lightbox.innerHTML = `<img alt=""><button class="link lightbox__x" aria-label="Close">X</button>`;
  document.body.appendChild(lightbox);
  function openLightbox(src, alt) {
    lightbox.querySelector("img").src = src;
    lightbox.querySelector("img").alt = alt || "";
    lightbox.classList.add("is-visible");
  }
  function closeLightbox() { lightbox.classList.remove("is-visible"); }
  lightbox.addEventListener("click", closeLightbox);

  function closeDetail() { stopRadio(); closeLightbox(); detail.classList.remove("is-visible", "is-release"); detail.setAttribute("aria-hidden", "true"); }
  $("#detailBack").addEventListener("click", () => history.back());
  $("#detailClose").addEventListener("click", () => goHome());

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

  // Back to the home page. Removes the #hash cleanly where allowed;
  // in sandboxed previews (srcdoc iframes) pushState is blocked, so fall back.
  function goHome() {
    try {
      history.pushState(null, "", location.href.split("#")[0]);
      route();
    } catch (_) {
      if (location.hash) location.hash = ""; // triggers route() via hashchange
      else route();
    }
  }

  document.querySelectorAll("[data-home]").forEach((el) =>
    el.addEventListener("click", (e) => {
      e.preventDefault();
      goHome();
    }));
  // Handle all in-page "#section" links ourselves, so navigation also works
  // when the page runs inside sandboxed previews (srcdoc iframes).
  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.hasAttribute("data-home") || e.metaKey || e.ctrlKey) return;
    e.preventDefault();
    const h = a.getAttribute("href");
    if (h === "#") goHome();
    else if (location.hash === h) route();
    else location.hash = h;
  });
  addEventListener("hashchange", route);
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (lightbox.classList.contains("is-visible")) return closeLightbox();
    if ($("#hi").classList.contains("is-visible")) return closeHi();
    if (location.hash) goHome();
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
  $("#hiArchive").addEventListener("click", closeHi);
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
     11. Measure mode: dimension labels, guides, cursor readout
     ======================================================= */
  const measureBtn = $("#measureBtn"), cursorRead = $("#cursorRead");
  const gx = document.createElement("div"), gy = document.createElement("div");
  gx.className = "guide-x"; gy.className = "guide-y";
  document.body.append(gx, gy);
  measureBtn.addEventListener("click", () => {
    const on = document.body.classList.toggle("measure");
    measureBtn.setAttribute("aria-pressed", String(on));
    updateSpecs();
  });
  addEventListener("pointermove", (e) => {
    if (!document.body.classList.contains("measure")) return;
    cursorRead.style.left = e.clientX + "px";
    cursorRead.style.top = e.clientY + "px";
    cursorRead.textContent = `X ${e.clientX} · Y ${e.clientY}`;
    gx.style.top = e.clientY + "px";
    gy.style.left = e.clientX + "px";
  });

  /* =======================================================
     12. Clock, year, boot
     ======================================================= */
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit", hour12: false });
  const tick = () => { $("#clock").textContent = "Berlin " + fmt.format(new Date()); };
  tick(); setInterval(tick, 10000);
  $("#year").textContent = new Date().getFullYear();

  let lastNarrow = innerWidth < 900;
  addEventListener("resize", () => {
    const narrow = innerWidth < 900;
    if (narrow !== lastNarrow) { lastNarrow = narrow; buildCollage(); }
    updateSpecs();
  });

  buildCollage();
  buildStrip();
  setTimeout(updateSpecs, 1600); // after the tiles have faded in
  route();
})();

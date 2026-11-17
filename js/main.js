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
  // Everything is shown in chronological order (oldest first)
  const when = (it) => String(it.released || it.year || "9999");
  SITE.sections.forEach((sec) => sec.items.sort((a, b) => when(a).localeCompare(when(b))));

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
  // One tile per work / release. The bottom-left corner stays free for the CV mark.
  const LAYOUT_WIDE = [
    { x: 0,  y: 0,  w: 34, h: 54, veil: 0 },
    { x: 34, y: 0,  w: 30, h: 46, veil: 0.12 },
    { x: 64, y: 0,  w: 36, h: 60, veil: 0 },
    { x: 40, y: 54, w: 25, h: 46, veil: 0.08 },
    { x: 66, y: 64, w: 18, h: 36, veil: 0.1 },
    { x: 84, y: 64, w: 16, h: 30, veil: 0.1 }
  ];
  const LAYOUT_NARROW = [
    { x: 0,  y: 0,  w: 52, h: 30, veil: 0 },
    { x: 52, y: 0,  w: 48, h: 24, veil: 0.1 },
    { x: 0,  y: 32, w: 46, h: 26, veil: 0 },
    { x: 48, y: 27, w: 52, h: 31, veil: 0.1 },
    { x: 56, y: 60, w: 44, h: 22, veil: 0.1 },
    { x: 56, y: 84, w: 44, h: 16, veil: 0 }
  ];

  const collage = $("#collage");

  // The tape-in animation plays once per visit
  try {
    if (sessionStorage.getItem("cv-intro")) document.body.classList.add("no-intro");
    else sessionStorage.setItem("cv-intro", "1");
  } catch (_) {}
  function buildCollage() {
    const narrow = innerWidth < 900;
    const layout = narrow ? LAYOUT_NARROW : LAYOUT_WIDE;
    collage.innerHTML = "";
    // one picture per work / release, chronological (works, then releases)
    const main = withImages.map((it) => ({ ...it, src: it.image }));
    layout.slice(0, main.length).forEach((L, i) => {
      if (!L.w) return;
      const real = main[i];
      const item = real;
      const src = real.src;
      const tile = document.createElement("figure");
      tile.className = "tile";
      tile.style.cssText = `left:${L.x}%;top:${L.y}%;width:${L.w}%;height:${L.h}%;--veil:${L.veil};--i:${i}`;
      tile.innerHTML = `
        <img src="${esc(src)}" alt="${esc(real ? real.title + (real.caption ? ", " + real.caption : "") : "")}">
        <span class="tile__dim"></span>
        <figcaption class="tile__cap">
          <span>${esc(item.homeTitle || item.title)}, ${esc(item.year ?? "")}</span>
          <span class="muted">${esc(item.homeMeta || (item.type === "release" ? item.location : item.medium || item.location || ""))}</span>
          <span class="plus"><span class="link">+ More</span></span>
        </figcaption>`;
      tile.addEventListener("click", () => {
        location.hash = item.ghost ? "#works" : `#item/${item.section}/${item.index}`;
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
      img.addEventListener("click", () => { location.hash = t.ghost ? "#works" : `#item/${t.section}/${t.index}`; });
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
  drawer.innerHTML = SITE.sections.map((s) => `<a href="#${s.id}">${esc(s.title)}</a>`).join("");

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
    const media = it.youtube
      ? `<div class="work__yt"><iframe src="https://www.youtube-nocookie.com/embed/${esc(it.youtube)}?rel=0" title="${esc(it.title)} — video" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`
      : it.video
      ? `<div class="work__video">
           <video id="workVideo" src="${esc(it.video.src)}" poster="${esc(it.video.poster || "")}" autoplay muted loop playsinline preload="metadata"></video>
           <button class="link work__sound" id="workSound" aria-pressed="false">+ Sound on</button>
         </div>`
      : it.image
      ? `<img src="${esc(it.image)}" alt="${esc(it.title)}">`
      : it.visual === "static"
        ? `<canvas class="work__radio" id="workRadio" aria-label="Live visual: noise of an untuned radio frequency"></canvas>`
        : "";
    $("#detailBody").innerHTML = `
      <article class="release work">
       <div class="release__top">
        <div class="release__cover">
          ${media}
          <span class="release__fig">FIG. 00 — ${it.youtube ? "VIDEO" : it.video ? esc((it.video.caption || "Video").toUpperCase()) : it.image ? esc((it.imageCaption || "Installation view").toUpperCase()) : "UNTUNED FREQUENCY · LIVE NOISE"}</span>
        </div>
        <div class="release__info">
          <p class="release__kicker">${sec.id === "collaborations" ? "COLLABORATION" : "WORK"} ${pad(n)} · ${esc((it.category || "").toUpperCase())}</p>
          <h3 class="release__title">${esc(it.title)}</h3>
          ${it.subtitle ? `<p class="work__subtitle">${esc(it.subtitle)}</p>` : ""}
          ${meta ? `<p class="release__meta">${meta}</p>` : ""}
          ${it.roles ? `<div class="release__side work__roles"><ol>${it.roles.map((r) => `<li><span class="work__role">${esc(r.role)}</span><span>${r.link ? `<a class="link" href="${esc(r.link)}" target="_blank" rel="noopener">${esc(r.name)}</a>` : esc(r.name)}</span></li>`).join("")}</ol></div>` : ""}
          ${it.audio ? playerHTML(it.audio) : ""}
          <div class="release__text">${it.text ? `<p>${esc(it.text)}</p>` : ""}${it.textNote ? `<p class="work__note">${esc(it.textNote)}</p>` : ""}</div>
          ${it.tools ? `<p class="release__meta work__tools">TOOLS · ${esc(it.tools.toUpperCase())}</p>` : ""}
          ${it.research ? `<div class="release__text work__research"><p class="release__label">Research</p><p>${esc(it.research)}</p></div>` : ""}
          ${it.exhibitions ? `<div class="release__side work__shows">
              <p class="release__label">Presented at</p>
              <ol>${it.exhibitions.map((x) => `<li><span>${esc(x.title)} <em>— ${esc(x.place)}</em></span><i></i><b>${esc(x.date)}</b></li>`).join("")}</ol>
            </div>` : ""}
          ${it.credits ? `<div class="release__credits"><p class="release__label">Credits</p>${it.credits.map((c) => `<p>${esc(c)}</p>`).join("")}</div>` : ""}
        </div>
       </div>
        ${(it.gallery || []).length ? `
          <div class="release__gallery" data-count="${it.gallery.length}">
            ${it.gallery.map((g, i) => `
              <figure${g.youtube ? ' class="is-video"' : ""}>
                ${g.youtube
                  ? `<div class="work__yt"><iframe src="https://www.youtube-nocookie.com/embed/${esc(g.youtube)}?rel=0" title="${esc(g.caption || it.title)}" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>`
                  : `<button class="release__shot" data-src="${esc(g.src)}" aria-label="Enlarge: ${esc(g.caption || "")}"><img src="${esc(g.src)}" alt="${esc(g.caption || it.title)}" loading="lazy"></button>`}
                <figcaption>FIG. ${pad(i + 1)} — ${esc((g.caption || "").toUpperCase())}</figcaption>
              </figure>`).join("")}
          </div>
          ${it.credit ? `<p class="release__fig work__credit">${esc(it.credit.toUpperCase())}</p>` : ""}` : ""}
      </article>`;
    $("#detailBody").querySelectorAll(".release__shot").forEach((b) =>
      b.addEventListener("click", () => openLightbox(b.dataset.src, b.querySelector("img").alt)));
    if (!it.image && it.visual === "static") startRadio($("#workRadio"));
    if (it.audio) wirePlayer(it.audio);
    if (it.video) {
      const v = $("#workVideo"), b = $("#workSound");
      b.addEventListener("click", () => {
        v.muted = !v.muted;
        if (!v.muted) v.play();
        b.textContent = v.muted ? "+ Sound on" : "– Sound off";
        b.setAttribute("aria-pressed", String(!v.muted));
      });
    }
    detail.classList.add("is-visible", "is-release");
    detail.setAttribute("aria-hidden", "false");
    detail.scrollTop = 0;
    document.title = `${it.title} — Carlos Villamizar`;
    return true;
  }

  /* ---------- Audio player with waveform ---------- */
  let player = null;
  function playerHTML(a) {
    return `
      <div class="player" id="player">
        <button class="player__btn" id="playerBtn" aria-label="Play">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path class="i-play" d="M4 2.5v11l9-5.5z"/><path class="i-pause" d="M4 2.5h3v11H4zM9 2.5h3v11H9z"/></svg>
        </button>
        <div class="player__wave" id="playerWave" role="slider" aria-label="Seek" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <canvas id="playerCanvas"></canvas>
        </div>
        <span class="player__time" id="playerTime">0:00</span>
        <span class="player__label">AUDIO · ${esc((a.label || "").toUpperCase())}</span>
        <audio id="playerAudio" preload="metadata" src="${esc(a.src)}"></audio>
      </div>`;
  }
  function wirePlayer(a) {
    const audio = $("#playerAudio"), btn = $("#playerBtn"), wave = $("#playerWave"), cv = $("#playerCanvas"), time = $("#playerTime");
    const ctx = cv.getContext("2d");
    const peaks = a.peaks || [];
    const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`;
    function draw() {
      const r = wave.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(r.width * dpr)) { cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, r.width, r.height);
      const p = audio.duration ? audio.currentTime / audio.duration : 0;
      const n = peaks.length, bw = r.width / n, mid = r.height / 2;
      for (let i = 0; i < n; i++) {
        const h = Math.max(1, peaks[i] * (r.height - 4));
        ctx.fillStyle = i / n < p ? "#0b0b0b" : "#c9c9c4";
        ctx.fillRect(i * bw, mid - h / 2, Math.max(1, bw - 1.5), h);
      }
      time.textContent = `${fmt(audio.currentTime || 0)} / ${audio.duration ? fmt(audio.duration) : "–:––"}`;
      wave.setAttribute("aria-valuenow", Math.round(p * 100));
    }
    const loop = () => { draw(); if (!audio.paused) player = requestAnimationFrame(loop); };
    btn.addEventListener("click", () => { audio.paused ? audio.play() : audio.pause(); });
    audio.addEventListener("play", () => { btn.classList.add("is-playing"); btn.setAttribute("aria-label", "Pause"); loop(); });
    audio.addEventListener("pause", () => { btn.classList.remove("is-playing"); btn.setAttribute("aria-label", "Play"); draw(); });
    audio.addEventListener("loadedmetadata", draw);
    audio.addEventListener("ended", () => { audio.currentTime = 0; draw(); });
    const seek = (x) => { const r = wave.getBoundingClientRect(); if (audio.duration) { audio.currentTime = Math.max(0, Math.min(1, (x - r.left) / r.width)) * audio.duration; draw(); } };
    wave.addEventListener("click", (e) => seek(e.clientX));
    wave.addEventListener("keydown", (e) => {
      if (!audio.duration) return;
      if (e.key === "ArrowRight") audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
      if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
      if (e.key === " ") { e.preventDefault(); btn.click(); }
      draw();
    });
    addEventListener("resize", draw);
    draw();
  }
  function stopPlayer() {
    const a = document.getElementById("playerAudio");
    if (a) a.pause();
    const v = document.getElementById("workVideo");
    if (v) { v.pause(); v.muted = true; }
    if (player) cancelAnimationFrame(player);
    player = null;
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

  function closeDetail() { stopPlayer(); stopRadio(); closeLightbox(); detail.classList.remove("is-visible", "is-release"); detail.setAttribute("aria-hidden", "true"); }
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
    if (SITE.sections.some((s) => s.id === h)) {
      openArchive(h);
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
     11. Boot
     ======================================================= */

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

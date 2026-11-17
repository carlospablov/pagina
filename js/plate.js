/* =========================================================
   Chladni plate
   ---------------------------------------------------------
   Thousands of sand grains on a vibrating square plate.
   Grains are shaken hard where the plate moves and come to
   rest on the nodal lines (where it doesn't move), drawing
   the Chladni figure for the current mode.

   Click the plate   → next vibration mode (grains jump, re-settle)
   Move over it      → your finger disturbs the sand locally
   + Shake           → scatter everything
   ========================================================= */

(() => {
  "use strict";

  const canvas = document.getElementById("plate");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const $ = (s) => document.querySelector(s);

  // (n, m, sign) modes: v = cos(nπx)cos(mπy) + s·cos(mπx)cos(nπy)
  const MODES = [
    [1, 2, -1], [2, 3, 1], [1, 4, -1], [3, 4, -1], [2, 5, 1], [1, 3, 1],
    [3, 5, -1], [2, 7, -1], [4, 5, 1], [1, 6, -1], [3, 7, 1], [5, 6, -1],
    [2, 9, 1], [4, 7, -1], [6, 7, 1]
  ];

  const small = Math.min(innerWidth, innerHeight) < 700;
  const N = small ? 7000 : 16000;
  const px = new Float32Array(N), py = new Float32Array(N);
  for (let i = 0; i < N; i++) { px[i] = Math.random(); py[i] = Math.random(); }

  let modeIndex = Math.floor(Math.random() * 6);
  let n, m, s, PIn, PIm;
  let shake = 4;                 // extra agitation, decays over time
  let hover = { x: -1, y: -1 };  // finger position in plate units (0–1)
  let W = 0, scale = 1, img = null, buf = null;
  let settledShare = 0;

  function setMode(i) {
    modeIndex = (i + MODES.length) % MODES.length;
    [n, m, s] = MODES[modeIndex];
    PIn = Math.PI * n; PIm = Math.PI * m;
    // a nominal frequency for the label: grows with the mode numbers
    const hz = Math.round(48 * (n * n + m * m));
    $("#plateMode").textContent = `MODE ${n}:${m}${s > 0 ? "+" : "−"} · ${hz} HZ`;
  }

  function resize() {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = Math.max(50, Math.round(r.width * dpr));
    scale = dpr;
    canvas.width = W; canvas.height = W;
    img = ctx.createImageData(W, W);
    buf = new Uint32Array(img.data.buffer);
    $("#plateW").textContent = `W = ${Math.round(r.width)} · SQUARE PLATE`;
  }

  // plate background (warm paper), precomputed per size
  let bgCache = null;
  function background() {
    if (bgCache && bgCache.length === buf.length) return bgCache;
    const b = new Uint32Array(W * W);
    const c = W / 2;
    for (let y = 0; y < W; y++) {
      for (let x = 0; x < W; x++) {
        const d = Math.hypot(x - c, y - c) / (W * 0.75);
        const g = 241 - d * 10 + (Math.random() - 0.5) * 4;   // soft vignette + grain
        const R = g | 0, G = (g - 2) | 0, B = (g - 7) | 0;
        b[y * W + x] = (255 << 24) | (B << 16) | (G << 8) | R;  // little-endian ABGR
      }
    }
    return (bgCache = b);
  }

  function step() {
    const jitterBase = 0.016 * (1 + shake);
    const pull = 0.00035;
    const floor = 0.0022;   // grains never sit perfectly still: keeps lines sandy, not vector-thin
    let settled = 0;
    for (let i = 0; i < N; i++) {
      let x = px[i], y = py[i];
      const cnx = Math.cos(PIn * x), cmx = Math.cos(PIm * x);
      const cny = Math.cos(PIn * y), cmy = Math.cos(PIm * y);
      const v = cnx * cmy + s * cmx * cny;
      const a = Math.abs(v);

      // vibration: grains bounce in proportion to how much the plate moves here
      let j = a * jitterBase + floor;
      if (hover.x >= 0) {
        const dx = x - hover.x, dy = y - hover.y, d2 = dx * dx + dy * dy;
        if (d2 < 0.006) j += 0.012;
      }
      x += (Math.random() - 0.5) * j;
      y += (Math.random() - 0.5) * j;

      // gentle drift down the slope of v² toward the nodal lines
      const snx = Math.sin(PIn * x), smx = Math.sin(PIm * x);
      const sny = Math.sin(PIn * y), smy = Math.sin(PIm * y);
      const gx = -PIn * snx * cmy - s * PIm * smx * cny;
      const gy = -PIm * cnx * smy - s * PIn * cmx * sny;
      x -= pull * v * gx;
      y -= pull * v * gy;

      // keep the sand on the plate
      if (x < 0) x = -x; else if (x > 1) x = 2 - x;
      if (y < 0) y = -y; else if (y > 1) y = 2 - y;
      px[i] = x; py[i] = y;
      if (a < 0.12) settled++;
    }
    settledShare = settled / N;
    shake *= 0.965;
  }

  const SAND = [0xff1c1c1e, 0xff2a2a2c, 0xff3b3a38, 0xff141414];
  function draw() {
    buf.set(background());
    const size = scale >= 1.5 ? 2 : 1;
    for (let i = 0; i < N; i++) {
      const x = (px[i] * (W - size)) | 0, y = (py[i] * (W - size)) | 0;
      const c = SAND[i & 3];
      const o = y * W + x;
      buf[o] = c;
      if (size === 2) { buf[o + 1] = c; buf[o + W] = c; }
    }
    ctx.putImageData(img, 0, 0);
  }

  let tick = 0;
  function frame() {
    if (!document.body.classList.contains("is-open") && !document.hidden) {
      step(); draw();
      if (++tick % 10 === 0) {
        $("#plateRead").textContent =
          `${N.toLocaleString("en")} GRAINS · ${Math.round(settledShare * 100)}% AT REST`;
      }
    }
    requestAnimationFrame(frame);
  }

  // ---------- interaction ----------
  const toUnit = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  };
  canvas.addEventListener("pointermove", (e) => { hover = toUnit(e); });
  canvas.addEventListener("pointerleave", () => { hover = { x: -1, y: -1 }; });
  canvas.addEventListener("pointerdown", () => { setMode(modeIndex + 1); shake = 3.5; });
  $("#plateNext").addEventListener("click", () => { setMode(modeIndex + 1); shake = 3.5; });
  $("#plateShake").addEventListener("click", () => {
    for (let i = 0; i < N; i++) { px[i] = Math.random(); py[i] = Math.random(); }
    shake = 5;
  });
  addEventListener("resize", () => { resize(); bgCache = null; });

  setMode(modeIndex);
  resize();
  requestAnimationFrame(frame);
})();

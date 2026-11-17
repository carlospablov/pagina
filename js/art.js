/* =========================================================
   Generative "sound images", used as placeholders until
   real media is uploaded. Every image is drawn from a seed,
   so the same seed always gives the same picture.
   ========================================================= */

window.Art = (() => {
  "use strict";

  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function canvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    return [c, c.getContext("2d")];
  }

  function grain(ctx, w, h, r, amount = 14) {
    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * amount;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
  }

  const kinds = {
    // harmonic spectrogram: grey bands rising and falling in time
    spectrogram(ctx, w, h, r) {
      const img = ctx.createImageData(w, h);
      const d = img.data;
      const f0 = 0.05 + r() * 0.06;
      const harmonics = 6 + Math.floor(r() * 8);
      const glide = (r() - 0.5) * 0.04;
      const onsets = Array.from({ length: 5 }, () => r());
      for (let x = 0; x < w; x++) {
        const tx = x / w;
        let env = 0.15;
        for (const o of onsets) { const k = tx - o; if (k > 0) env += Math.exp(-k * 9) * 0.9; }
        const f = f0 + glide * Math.sin(tx * 6);
        for (let y = 0; y < h; y++) {
          const fy = 1 - y / h;
          let v = 0;
          for (let k = 1; k <= harmonics; k++) {
            const dist = (fy - f * k) * 140;
            v += Math.exp(-dist * dist) / Math.sqrt(k);
          }
          v = v * env + Math.random() * 0.12 * (1 - fy);
          const c = 238 - Math.min(1, v) * 210;
          const i = (y * w + x) * 4;
          d[i] = c; d[i + 1] = c; d[i + 2] = c - 3; d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    },

    // dense waveform drawn as vertical hairlines
    waveform(ctx, w, h, r) {
      ctx.fillStyle = "#efeeea"; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(15,15,15,0.85)"; ctx.lineWidth = 1;
      const bursts = Array.from({ length: 4 }, () => [r(), 0.3 + r() * 0.7]);
      const mid = h * (0.35 + r() * 0.3);
      ctx.beginPath();
      for (let x = 0; x < w; x += 1.5) {
        const t = x / w;
        let a = 0.03;
        for (const [o, s] of bursts) { const k = t - o; if (k > 0) a += Math.exp(-k * 7) * s; }
        const y = (Math.random() * 2 - 1) * a * h * 0.32;
        ctx.moveTo(x, mid - Math.abs(y)); ctx.lineTo(x, mid + Math.abs(y));
      }
      ctx.stroke();
    },

    // Chladni figure: sand settling on a vibrating plate
    chladni(ctx, w, h, r) {
      const img = ctx.createImageData(w, h);
      const d = img.data;
      const n = 1 + Math.floor(r() * 5), m = n + 1 + Math.floor(r() * 4);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const X = x / w, Y = y / h;
          const v = Math.cos(n * Math.PI * X) * Math.cos(m * Math.PI * Y) -
                    Math.cos(m * Math.PI * X) * Math.cos(n * Math.PI * Y);
          const sand = Math.abs(v) < 0.05 + Math.random() * 0.07;
          const c = sand ? 30 + Math.random() * 50 : 232 + Math.random() * 10;
          const i = (y * w + x) * 4;
          d[i] = c; d[i + 1] = c - 2; d[i + 2] = c - 6; d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    },

    // Lissajous figure: two frequencies in conversation
    lissajous(ctx, w, h, r) {
      ctx.fillStyle = "#e8e7e3"; ctx.fillRect(0, 0, w, h);
      const a = 1 + Math.floor(r() * 5), b = a + 1 + Math.floor(r() * 3), ph = r() * Math.PI;
      ctx.strokeStyle = "rgba(10,10,10,0.55)"; ctx.lineWidth = 0.7;
      ctx.beginPath();
      for (let t = 0; t < Math.PI * 2 * 40; t += 0.01) {
        const dmp = Math.exp(-t * 0.006);
        const x = w / 2 + Math.sin(a * t + ph) * w * 0.4 * dmp;
        const y = h / 2 + Math.sin(b * t) * h * 0.4 * dmp;
        t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    },

    // overexposed, hazy room: soft light shapes
    haze(ctx, w, h, r) {
      ctx.fillStyle = "#f1f0ec"; ctx.fillRect(0, 0, w, h);
      ctx.filter = "blur(" + Math.round(w / 18) + "px)";
      for (let i = 0; i < 7; i++) {
        const g = 150 + r() * 90;
        ctx.fillStyle = `rgba(${g},${g},${g - 6},${0.25 + r() * 0.4})`;
        if (r() > 0.5) ctx.fillRect(r() * w, r() * h, w * (0.05 + r() * 0.3), h * (0.2 + r() * 0.8));
        else { ctx.beginPath(); ctx.arc(r() * w, r() * h, w * (0.05 + r() * 0.25), 0, 7); ctx.fill(); }
      }
      ctx.filter = "none";
      ctx.strokeStyle = "rgba(60,60,60,0.35)"; ctx.lineWidth = 1;
      const x = w * (0.3 + r() * 0.4);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h * (0.5 + r() * 0.5)); ctx.stroke();
    },

    // untuned radio: a still of the noise waterfall
    static(ctx, w, h, r) {
      const img = ctx.createImageData(w, h), d = img.data;
      const bands = Array.from({ length: 5 }, () => [r() * w, 2 + r() * 10, 0.15 + r() * 0.35]);
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          let v = Math.pow(Math.random(), 3) * 0.75;
          for (const [bx, bw, bs] of bands) {
            const dx = (x - bx - Math.sin(y * 0.02) * 6) / bw;
            v += bs * Math.exp(-dx * dx) * (0.6 + Math.random() * 0.4);
          }
          const c = 238 - Math.min(1, v) * 220;
          const i = (y * w + x) * 4;
          d[i] = c; d[i + 1] = c; d[i + 2] = c - 4; d[i + 3] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);
    },

    // ultramarine ridges: layered mountain lines
    ridges(ctx, w, h, r) {
      drawRidges(ctx, w, h, r() * 100, 0, -1, 0, Math.floor(r() * 1e6));
    }
  };

  // Draws the ultramarine ridges
  function drawRidges(ctx, w, h, t, energy = 0, mx = -1, panels = 6, seed = 7) {
    const r = rng(seed);
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, "#1a2c8c");
    bg.addColorStop(0.5, "#0f1d66");
    bg.addColorStop(1, "#050a2a");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const L = 11;
    const freqs = Array.from({ length: L }, () => [r() * 0.004 + 0.002, r() * 0.01 + 0.006, r() * 0.03 + 0.02, r() * 6]);
    for (let i = 0; i < L; i++) {
      const depth = i / (L - 1);
      const base = h * (0.3 + depth * 0.66);
      const amp = h * (0.12 + 0.22 * (1 - depth));
      const [f1, f2, f3, p] = freqs[i];
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w + 4; x += 4) {
        const drift = t * (0.02 + depth * 0.05);
        let y = Math.pow(1 - Math.abs(Math.sin(x * f1 + p + drift)), 2.2) * 0.75 +
                Math.sin(x * f2 + p * 2 - drift) * 0.25 +
                Math.sin(x * f3 + p * 3) * 0.08;
        if (mx >= 0) {
          const g = Math.exp(-((x - mx) ** 2) / (2 * (w * 0.08) ** 2));
          y += g * (0.15 + energy * 0.9) * Math.sin(x * 0.09 - t * 7 + i);
        }
        y += energy * 0.2 * Math.sin(x * 0.05 + t * 4 + i);
        ctx.lineTo(x, base - y * amp);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      // far ridges: misty and light; near ridges: deep, almost black ultramarine
      const l = Math.pow(1 - depth, 1.6);
      ctx.fillStyle = `rgba(${8 + l * 52},${14 + l * 70},${52 + l * 130},${0.55 + depth * 0.4})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(150,175,255,${0.06 + l * 0.16})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // folding-screen panel seams
    for (let i = 1; i < panels; i++) {
      const x = Math.round((w / panels) * i) + 0.5;
      ctx.fillStyle = "rgba(0,0,10,0.18)"; ctx.fillRect(x - 1, 0, 1, h);
      ctx.fillStyle = "rgba(160,180,255,0.06)"; ctx.fillRect(x, 0, 1, h);
    }
  }

  const KINDS = ["spectrogram", "haze", "chladni", "waveform", "lissajous", "spectrogram", "ridges", "haze", "chladni", "lissajous"];

  function render(kind, seed, w = 480, h = 600) {
    const [c, ctx] = canvas(w, h);
    const r = rng(seed);
    kinds[kind](ctx, w, h, r);
    if (kind !== "ridges") grain(ctx, w, h, r, 10);
    return c.toDataURL("image/jpeg", 0.82);
  }

  return { render, rng, drawRidges, KINDS };
})();

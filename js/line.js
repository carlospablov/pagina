/* =========================================================
   The line
   ---------------------------------------------------------
   A single straight line across the middle of the home page.
   When the cursor (or a finger) crosses it, the line is
   plucked like a string: a small wave runs along it,
   reflects at the ends and fades back to stillness.
   ========================================================= */

(() => {
  "use strict";

  const canvas = document.getElementById("line");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  const N = 260;                       // points along the string
  const y = new Float32Array(N);       // displacement
  const v = new Float32Array(N);       // velocity
  const C2 = 0.42;                     // wave speed² (stable below 0.5)
  const DAMP = 0.012;                  // how quickly it settles
  let W = 0, H = 0, dpr = 1, running = false;
  let last = null;                     // previous pointer position (page coords)

  function resize() {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function pluck(x01, amount) {
    const c = x01 * (N - 1), width = N * 0.035;
    for (let i = 1; i < N - 1; i++) {
      const d = (i - c) / width;
      y[i] += amount * Math.exp(-d * d);
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }

  function step() {
    let energy = 0;
    for (let i = 1; i < N - 1; i++) v[i] += C2 * (y[i - 1] - 2 * y[i] + y[i + 1]) - DAMP * v[i];
    for (let i = 1; i < N - 1; i++) { y[i] += v[i]; energy += Math.abs(y[i]) + Math.abs(v[i]); }
    return energy;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const mid = H / 2;
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const px = (i / (N - 1)) * W;
      i ? ctx.lineTo(px, mid + y[i]) : ctx.moveTo(px, mid + y[i]);
    }
    ctx.strokeStyle = "#0b0b0b";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function tick() {
    // two physics steps per frame make the wave travel at a pleasant speed
    const e = step() + step();
    draw();
    if (e > 0.02) requestAnimationFrame(tick);
    else { y.fill(0); v.fill(0); draw(); running = false; }
  }

  // Pluck when the pointer crosses the line (or moves along it very closely)
  addEventListener("pointermove", (ev) => {
    if (document.body.classList.contains("is-open")) { last = null; return; }
    const r = canvas.getBoundingClientRect();
    const mid = r.top + r.height / 2;
    const p = { x: ev.clientX, y: ev.clientY };
    if (last && p.x >= r.left && p.x <= r.right) {
      const crossed = (last.y - mid) * (p.y - mid) <= 0 && last.y !== p.y;
      if (crossed) {
        const dy = p.y - last.y;
        const amount = Math.sign(dy) * Math.min(26, 6 + Math.abs(dy) * 0.9);
        pluck((p.x - r.left) / r.width, amount);
      }
    }
    last = p;
  }, { passive: true });
  // Tapping (or clicking) close to the line also plucks it — needed on touch screens
  addEventListener("pointerdown", (ev) => {
    if (document.body.classList.contains("is-open")) return;
    const r = canvas.getBoundingClientRect();
    const mid = r.top + r.height / 2;
    if (Math.abs(ev.clientY - mid) < 40 && ev.clientX >= r.left && ev.clientX <= r.right) {
      pluck((ev.clientX - r.left) / r.width, ev.clientY < mid ? 18 : -18);
    }
  }, { passive: true });
  addEventListener("pointerleave", () => { last = null; });
  addEventListener("resize", resize);

  resize();
})();

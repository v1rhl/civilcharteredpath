/* Culvert hydraulics: indicative first-pass engine. Pure functions, no DOM. window.CulvertCalc (also module.exports for tests).
   Units: metres, seconds, m3/s. Levels are absolute (for example m AOD). Distances along the barrel are measured from the outlet.

   Everything is worked from published hydraulic theory with the user's own coefficients:
   - inlet control: critical depth at the inlet with an entry loss on the critical velocity head (unsubmerged, weir-type),
     an orifice equation (submerged), and a straight-line transition between two headwater ratios the user sets;
   - outlet control: energy from the tailwater (or the outlet control depth) back to the headwater pool, with an exit loss,
     friction along the barrel by a direct-step water surface profile (part full) or the friction slope (full), and an
     entrance loss;
   - overtopping: a broad-crested weir over the road, theoretical coefficient as the editable default.
   It does not reproduce the inlet-control nomographs, equation constants or coefficient tables of any design manual,
   and it does not claim compliance with any of them. Coefficient defaults are placeholders taken from general fluid
   mechanics, to be replaced with values the user is satisfied with. */
(function (root) {
  "use strict";
  var G = 9.81;

  var DEFAULTS = {
    project: "Example access road", ref: "C1",
    Q: 4.0, N: 1,
    shape: "box", D: 1.2, B: 2.0, H: 1.2, t: 0.2,
    L: 30, ILi: 20.30, ILo: 20.20,
    method: "manning", n: 0.013, ks: 0.6, nu: 1.141,
    inlet: "square", Ke: 0.5, Ku: 0.5, Cd: 0.6, Kx: 1.0, t1: 1.0, t2: 1.4,
    TW: 21.30, road: 22.50, crestW: 10, slope: 2, Lw: 40, Cw: 1.70,
    fb: 0.6, hwRatio: 1.2, vScour: 4.0, vSed: 1.0, vOut: 2.0,
    Qlow: 0.15, vFish: 1.0, dFish: 0.15
  };

  /* Entrance presets: typical textbook values for pipe entrances in general fluid mechanics, not culvert-manual tables. */
  var INLETS = {
    square: { label: "Square edge, flush with a headwall", Ke: 0.5, Ku: 0.5, Cd: 0.6 },
    rounded: { label: "Rounded or bevelled edge in a headwall", Ke: 0.2, Ku: 0.2, Cd: 0.8 },
    projecting: { label: "Thin barrel projecting from the fill", Ke: 0.8, Ku: 0.8, Cd: 0.5 },
    custom: { label: "Custom coefficients" }
  };

  function num(v, d) { var n = parseFloat(v); return isFinite(n) ? n : d; }
  function f(v, n) { if (v == null || !isFinite(v)) return "–"; return (+v).toFixed(n == null ? 3 : n); }
  function oneIn(S) { if (!(S > 0)) return S === 0 ? "level" : "adverse"; var N = 1 / S; return "1 in " + (N >= 100 ? Math.round(N) : N >= 10 ? N.toFixed(1) : N.toFixed(2)); }

  /* ---------- Sections. y is depth above the invert of one barrel. ---------- */
  function section(shape, B, H) {
    var s = { shape: shape, B: B, H: H };
    if (shape === "circ") {
      var D = H; s.B = D;
      s.A = function (y) { y = Math.min(Math.max(y, 0), D); var th = 2 * Math.acos(1 - 2 * y / D); return D * D / 8 * (th - Math.sin(th)); };
      s.P = function (y) { y = Math.min(Math.max(y, 0), D); return D * Math.acos(1 - 2 * y / D); };
      s.T = function (y) { y = Math.min(Math.max(y, 0), D); return 2 * Math.sqrt(Math.max(0, y * (D - y))); };
      s.Afull = Math.PI * D * D / 4; s.Pfull = Math.PI * D;
      s.width = function (y) { return s.T(y); };
    } else if (shape === "arch") {
      /* Flat invert, vertical legs to the springing, circular-arc soffit with chord B and rise r = min(H, B/2). */
      var r = Math.min(H, B / 2), hs = H - r, R = (B * B / 4 + r * r) / (2 * r), c0 = hs + r - R;
      var seg = function (h) { h = Math.max(-R, Math.min(R, h)); return R * R * Math.acos(h / R) - h * Math.sqrt(R * R - h * h); };
      var phiS = Math.acos(Math.max(-1, Math.min(1, (hs - c0) / R)));
      s.arch = { r: r, hs: hs, R: R, c0: c0 };
      s.A = function (y) { y = Math.min(Math.max(y, 0), H); return y <= hs ? B * y : B * hs + seg(hs - c0) - seg(y - c0); };
      s.P = function (y) { y = Math.min(Math.max(y, 0), H); return y <= hs ? B + 2 * y : B + 2 * hs + 2 * R * (phiS - Math.acos(Math.max(-1, Math.min(1, (y - c0) / R)))); };
      s.T = function (y) { y = Math.min(Math.max(y, 0), H); return y <= hs ? B : 2 * Math.sqrt(Math.max(0, R * R - (y - c0) * (y - c0))); };
      s.Afull = s.A(H); s.Pfull = B + 2 * hs + 2 * R * phiS;
      s.width = s.T;
    } else {
      s.A = function (y) { return B * Math.min(Math.max(y, 0), H); };
      s.P = function (y) { return B + 2 * Math.min(Math.max(y, 0), H); };
      s.T = function () { return B; };
      s.Afull = B * H; s.Pfull = 2 * B + 2 * H;
      s.width = s.T;
    }
    s.R = function (y) { var p = s.P(y); return p > 0 ? s.A(y) / p : 0; };
    s.Rfull = s.Afull / s.Pfull;
    /* First moment of the flow area about the water surface, the integral of A from 0 to y (Simpson). */
    s.Ay = function (y) {
      if (shape === "box") return B * y * y / 2;
      var n = 40, h = y / n, sum = s.A(0) + s.A(y);
      for (var i = 1; i < n; i++) sum += (i % 2 ? 4 : 2) * s.A(i * h);
      return sum * h / 3;
    };
    s.yBar = H - s.Ay(H) / s.Afull; /* centroid of the full opening above the invert */
    return s;
  }

  /* ---------- Friction ---------- */
  function velUniform(R, S, rough) {
    if (!(R > 0) || !(S > 0)) return 0;
    if (rough.method === "manning") return Math.pow(R, 2 / 3) * Math.sqrt(S) / rough.n;
    var De = 4 * R, a = Math.sqrt(2 * G * De * S);
    return -2 * a * Math.log10(rough.ks / (3.7 * De) + 2.51 * rough.nu / (De * a));
  }
  function lambdaCW(V, R, rough) {
    var De = 4 * R, Re = Math.max(V * De / rough.nu, 1), lam = 0.02;
    for (var i = 0; i < 60; i++) { var x = -2 * Math.log10(rough.ks / (3.7 * De) + 2.51 / (Re * Math.sqrt(lam))); lam = 1 / (x * x); }
    return lam;
  }
  function frictionSlope(V, R, rough) {
    if (!(V > 0) || !(R > 0)) return 0;
    if (rough.method === "manning") return rough.n * rough.n * V * V / Math.pow(R, 4 / 3);
    return lambdaCW(V, R, rough) * V * V / (8 * G * R);
  }

  /* ---------- Critical and normal depth ---------- */
  function critical(sec, q) {
    if (!(q > 0)) return 0;
    if (sec.shape === "box") { var yc = Math.pow(q * q / (G * sec.B * sec.B), 1 / 3); return yc < sec.H ? yc : null; }
    var fr = function (y) { var A = sec.A(y); return q * q * sec.T(y) / (G * A * A * A); };
    var lo = 1e-6 * sec.H, hi = sec.H * (1 - 1e-7);
    if (fr(hi) > 1) return null;
    for (var i = 0; i < 100; i++) { var m = (lo + hi) / 2; if (fr(m) > 1) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  function capacityFull(sec, S, rough) { return sec.Afull * velUniform(sec.Rfull, S, rough); }
  function normal(sec, q, S, rough) {
    if (!(S > 0) || !(q > 0)) return null;
    if (q > capacityFull(sec, S, rough)) return null;
    var Qy = function (y) { return sec.A(y) * velUniform(sec.R(y), S, rough); };
    var top = sec.H * (1 - 1e-6);
    if (sec.shape !== "box") { /* lower root: search below the depth of peak open-channel flow */
      var a = 0.5 * sec.H, b = sec.H, k = (Math.sqrt(5) - 1) / 2, c = b - k * (b - a), d = a + k * (b - a);
      for (var j = 0; j < 60; j++) { if (Qy(c) > Qy(d)) b = d; else a = c; c = b - k * (b - a); d = a + k * (b - a); }
      top = (a + b) / 2;
    }
    var lo = 0, hi = top;
    for (var i = 0; i < 100; i++) { var m = (lo + hi) / 2; if (Qy(m) < q) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  function froude2(sec, q, y) { var A = sec.A(y); return A > 0 ? q * q * sec.T(y) / (G * A * A * A) : Infinity; }
  function spE(sec, q, y) { var A = sec.A(y); return y + q * q / (2 * G * A * A); }
  function momentum(sec, q, y) { var A = sec.A(y); return q * q / (G * A) + sec.Ay(y); }
  function sfOpen(sec, q, y, rough) { var A = sec.A(y); return frictionSlope(q / A, sec.R(y), rough); }

  /* ---------- Inlet control (per barrel) ---------- */
  function inletModel(sec, c) {
    var H = sec.H;
    function weir(q) {
      var yc = critical(sec, q);
      if (yc == null || yc > 0.98 * H) return { hw: Infinity, yc: yc };
      var Vc = q / sec.A(yc), hv = Vc * Vc / (2 * G);
      return { hw: yc + (1 + c.Ku) * hv, yc: yc, Vc: Vc, hv: hv };
    }
    function orifice(q) { var a = q / (c.Cd * sec.Afull); return sec.yBar + a * a / (2 * G); }
    /* Q1: flow at which the weir relation reaches t1 H. Q2: flow at which the orifice relation reaches t2 H. */
    var qHi = 1e-3; while (weir(qHi).hw < c.t1 * H && qHi < 1e4) qHi *= 1.6;
    var lo = 0, hi = qHi;
    for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (weir(m).hw < c.t1 * H) lo = m; else hi = m; }
    var Q1 = lo, Q2 = c.Cd * sec.Afull * Math.sqrt(2 * G * Math.max(0, c.t2 * H - sec.yBar));
    function hw(q) {
      if (q <= Q1) { var w = weir(q); return { hw: w.hw, regime: "unsubmerged", w: w }; }
      if (Q2 > Q1 && q < Q2) return { hw: c.t1 * H + (q - Q1) / (Q2 - Q1) * (c.t2 - c.t1) * H, regime: "transition", w: weir(q) };
      return { hw: Math.max(c.t1 * H, orifice(q)), regime: "submerged", w: weir(q) };
    }
    return { weir: weir, orifice: orifice, hw: hw, Q1: Q1, Q2: Q2 };
  }

  /* ---------- Outlet control: march from the outlet to the inlet (per barrel) ---------- */
  function outletProfile(sec, q, c) {
    var H = sec.H, S0 = c.S0, L = c.L, rough = c.rough;
    var yc = critical(sec, q), yn = normal(sec, q, S0, rough), twd = c.TW - c.ILo;
    var Vfull = q / sec.Afull, hvFull = Vfull * Vfull / (2 * G), SfFull = frictionSlope(Vfull, sec.Rfull, rough);
    var out = { yc: yc, yn: yn, twd: twd, pts: [], hf: 0, fullLen: 0, reach: true, Vfull: Vfull, SfFull: SfFull };
    var x = 0, state, y = 0, hgl = 0;
    function z(xx) { return c.ILo + S0 * xx; }
    if (yc == null || yc >= 0.999 * H || twd >= H) {
      state = "full";
      if (twd >= H) { out.start = "submerged"; out.Eout = c.TW + c.Kx * hvFull; out.exitLoss = c.Kx * hvFull; hgl = out.Eout - hvFull; }
      else { out.start = "fullFree"; hgl = c.ILo + H; out.Eout = hgl + hvFull; out.exitLoss = 0; }
      out.yOut = H; out.Vout = Vfull; out.outFull = true;
    } else {
      var y0;
      var g0 = function (yy) { var V = q / sec.A(yy); return yy + (1 - c.Kx) * V * V / (2 * G) - twd; };
      if (g0(yc) >= 0) { y0 = yc; out.start = "critical"; }
      else { var lo = yc, hi = H; for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (g0(m) < 0) lo = m; else hi = m; } y0 = (lo + hi) / 2; out.start = "tailwater"; }
      var V0 = q / sec.A(y0);
      out.yOut = y0; out.Vout = V0; out.outFull = false;
      out.Eout = c.ILo + spE(sec, q, y0);
      out.exitLoss = out.start === "tailwater" ? c.Kx * V0 * V0 / (2 * G) : 0;
      state = "open"; y = out.start === "critical" ? Math.min(yc * (1 + 1e-4), H * (1 - 1e-6)) : y0;
    }
    out.pts.push({ x: 0, ws: state === "full" ? hgl : z(0) + y, full: state === "full", y: state === "full" ? H : y });
    var guard = 0;
    while (x < L - 1e-9 && guard++ < 20) {
      if (state === "full") {
        var xEnd = L;
        if (SfFull < S0 - 1e-12) { var xs = x + (hgl - (z(x) + H)) / (S0 - SfFull); if (xs < L) xEnd = Math.max(x, xs); }
        var dx = xEnd - x;
        out.hf += SfFull * dx; out.fullLen += dx; hgl += SfFull * dx; x = xEnd;
        out.pts.push({ x: x, ws: hgl, full: true, y: H });
        if (x < L - 1e-9) { state = "open"; y = H * (1 - 1e-4); }
        continue;
      }
      /* open channel: direct step in depth towards the asymptote, a change of state, or the inlet */
      var Fr2 = froude2(sec, q, y), dir = (sfOpen(sec, q, y, rough) - S0) * (1 - Fr2) >= 0 ? 1 : -1, target;
      if (Fr2 >= 1) { out.reach = false; out.jumpX = x; break; }
      if (dir > 0) target = yn != null && yn > y ? yn : H;
      else target = Math.max(yn != null && yn < y ? yn : 0, yc || 0);
      if (Math.abs(target - y) < 1e-7 * H) { /* already uniform */
        out.hf += S0 * (L - x); x = L; out.pts.push({ x: x, ws: z(x) + y, full: false, y: y }); break;
      }
      var n = 400, dy = (target - y) / n, E1 = spE(sec, q, y), S1 = sfOpen(sec, q, y, rough), done = false;
      for (var k = 1; k <= n; k++) {
        var y2 = y + dy, E2 = spE(sec, q, y2), S2 = sfOpen(sec, q, y2, rough), Sa = (S1 + S2) / 2;
        var dX = (E2 - E1) / (Sa - S0);
        if (!(dX >= 0) || !isFinite(dX)) dX = Infinity;
        if (x + dX >= L) { var fr = dX === Infinity ? 0 : (L - x) / dX; y = y + fr * dy; out.hf += Sa * (L - x); x = L; out.pts.push({ x: x, ws: z(x) + y, full: false, y: y }); done = true; break; }
        x += dX; out.hf += Sa * dX; y = y2; E1 = E2; S1 = S2;
        if (k % 8 === 0 || k === n) out.pts.push({ x: x, ws: z(x) + y, full: false, y: y });
      }
      if (done) break;
      if (target === H && dir > 0) { state = "full"; hgl = z(x) + H; continue; }
      if (yc != null && target === yc && dir < 0) { out.reach = false; out.jumpX = x; break; }
      /* reached the asymptote numerically; carry uniform flow to the inlet */
      out.hf += S0 * (L - x); x = L; out.pts.push({ x: x, ws: z(x) + y, full: false, y: y });
    }
    if (!out.reach) return out;
    var last = out.pts[out.pts.length - 1];
    out.inFull = last.full;
    if (last.full) { out.Vin = Vfull; out.hvIn = hvFull; out.Ein = last.ws + hvFull; out.yIn = H; }
    else { out.yIn = last.y; out.Vin = q / sec.A(last.y); out.hvIn = out.Vin * out.Vin / (2 * G); out.Ein = last.ws + out.hvIn; }
    out.entLoss = c.Ke * out.hvIn;
    out.HW = out.Ein + out.entLoss;
    return out;
  }

  /* Supercritical profile from critical depth at the inlet, marching downstream (steep barrels under inlet control). */
  function superProfile(sec, q, c, yc, yn) {
    var pts = [], L = c.L, S0 = c.S0, rough = c.rough, x = 0, y = yc * (1 - 1e-4);
    pts.push({ x: 0, y: y });
    var target = yn != null && yn < y ? yn : 0.02 * sec.H, n = 400, dy = (target - y) / n, E1 = spE(sec, q, y), S1 = sfOpen(sec, q, y, rough);
    for (var k = 1; k <= n; k++) {
      var y2 = y + dy, E2 = spE(sec, q, y2), S2 = sfOpen(sec, q, y2, rough), Sa = (S1 + S2) / 2, dX = (E2 - E1) / (S0 - Sa);
      if (!(dX >= 0) || !isFinite(dX)) dX = Infinity;
      if (x + dX >= L) { y = y + (dX === Infinity ? 0 : (L - x) / dX) * dy; x = L; pts.push({ x: x, y: y }); break; }
      x += dX; y = y2; E1 = E2; S1 = S2; if (k % 8 === 0) pts.push({ x: x, y: y });
    }
    if (x < L) { pts.push({ x: L, y: y }); }
    return pts; /* x measured from the inlet */
  }

  /* ---------- One flow: both controls (q per barrel) ---------- */
  function atFlow(sec, inl, c, q) {
    var i = inl.hw(q), o = outletProfile(sec, q, c);
    var hwI = c.ILi + i.hw, hwO = o.reach ? o.HW : null;
    return { q: q, inlet: i, out: o, hwI: hwI, hwO: hwO, hw: hwO != null ? Math.max(hwI, hwO) : hwI, gov: hwO != null && hwO > hwI ? "outlet" : "inlet" };
  }

  function clean(inp) {
    var d = DEFAULTS, o = {};
    for (var k in d) o[k] = typeof d[k] === "number" ? num(inp[k], d[k]) : (inp[k] != null ? String(inp[k]) : d[k]);
    o.N = Math.max(1, Math.round(o.N));
    if (o.shape === "circ") { o.B = o.D; o.H = o.D; }
    o.Kx = Math.max(0, Math.min(1, o.Kx));
    return o;
  }

  function run(input) {
    var I = clean(input || {}), warn = [], rows = [], checks = [];
    if (!(I.Q > 0)) warn.push("Enter a design flow greater than zero.");
    if (!(I.B > 0 && I.H > 0)) warn.push("Enter barrel dimensions greater than zero.");
    if (!(I.L > 0)) warn.push("Enter a barrel length greater than zero.");
    if (I.method === "manning" ? !(I.n > 0) : !(I.ks >= 0 && I.nu > 0)) warn.push("Enter a roughness value.");
    if (!(I.Cd > 0)) warn.push("Enter an orifice coefficient greater than zero.");
    if (!(I.t2 > I.t1 && I.t1 > 0)) warn.push("The submerged-inlet headwater ratio must be greater than the unsubmerged one.");
    if (warn.length) return { inputs: I, error: true, warn: warn, rows: [], checks: [], curve: [] };

    var notes = [];
    if (I.TW > I.road) notes.push("The tailwater is above the road level, so the road would be flooded from downstream whatever the culvert does. Check the levels.");
    if (I.TW < I.ILo) notes.push("The tailwater is below the outlet invert, so the outlet discharges freely and the tailwater level has no effect.");
    if (I.road < I.ILi + I.H + I.t) notes.push("The road level is below the top of the barrel at the inlet. Check the levels.");
    var sec = section(I.shape, I.B, I.H), rough = I.method === "manning" ? { method: "manning", n: I.n } : { method: "cw", ks: I.ks / 1000, nu: I.nu * 1e-6 };
    var S0 = (I.ILi - I.ILo) / I.L;
    var c = { S0: S0, L: I.L, ILi: I.ILi, ILo: I.ILo, TW: I.TW, Ke: I.Ke, Ku: I.Ku, Cd: I.Cd, Kx: I.Kx, t1: I.t1, t2: I.t2, rough: rough };
    var inl = inletModel(sec, c), q = I.Q / I.N;
    var D = atFlow(sec, inl, c, q);

    /* Performance curve, total flow through all barrels */
    var Qmax = Math.max(1.8 * I.Q, 0.1), curve = [];
    for (var j = 1; j <= 48; j++) {
      var Qt = Qmax * j / 48, a = atFlow(sec, inl, c, Qt / I.N), qw = weirQ(a.hw);
      curve.push({ Q: Qt, hwI: a.hwI, hwO: a.hwO, hw: a.hw, gov: a.gov, Qtot: Qt + qw });
    }
    function weirQ(hw) { return I.Lw > 0 && hw > I.road ? I.Cw * I.Lw * Math.pow(hw - I.road, 1.5) : 0; }

    /* Overtopping: split the design flow between the barrels and the road */
    var over = null;
    if (D.hw > I.road && I.Lw > 0) {
      var lo = 0, hi = I.Q;
      for (var it = 0; it < 60; it++) { var m = (lo + hi) / 2, am = atFlow(sec, inl, c, m / I.N); if (m + weirQ(am.hw) < I.Q) lo = m; else hi = m; }
      var Qc = (lo + hi) / 2, ac = atFlow(sec, inl, c, Qc / I.N);
      over = { Qc: Qc, Qw: I.Q - Qc, hw: ac.hw, depth: ac.hw - I.road, at: ac };
    }
    var HW = over ? over.hw : D.hw, des = over ? over.at : D;

    /* Conditions at the design point */
    var yc = D.out.yc, yn = D.out.yn, steep = yn != null && yc != null && yn < yc;
    var sup = null, jump = false, outY, outV, outFull;
    if (des.gov === "inlet" && steep) {
      sup = superProfile(sec, des.q, c, des.out.yc, des.out.yn);
      var ys = sup[sup.length - 1].y;
      if (des.out.outFull || (des.out.start === "tailwater" && momentum(sec, des.q, des.out.yOut) > momentum(sec, des.q, ys))) { jump = true; outY = des.out.yOut; outV = des.out.Vout; outFull = des.out.outFull; }
      else { outY = ys; outV = des.q / sec.A(ys); outFull = false; }
    } else { outY = des.out.yOut; outV = des.out.Vout; outFull = des.out.outFull; }
    var outFr = outFull ? null : Math.sqrt(froude2(sec, des.q, outY));

    /* Velocities in the barrel at the design point */
    var vmax = outV, vmin = outV;
    if (des.gov === "outlet" || !steep) des.out.pts.forEach(function (p) { var v = p.full ? des.q / sec.Afull : des.q / sec.A(p.y); vmax = Math.max(vmax, v); vmin = Math.min(vmin, v); });
    if (sup) sup.forEach(function (p) { var v = des.q / sec.A(p.y); vmax = Math.max(vmax, v); vmin = Math.min(vmin, v); });

    /* Low flow (fish passage) at normal depth, or critical depth if the barrel is level or adverse */
    var low = null;
    if (I.Qlow > 0) {
      var ql = I.Qlow / I.N, yl = normal(sec, ql, S0, rough), basis = "normal depth";
      if (yl == null) { yl = critical(sec, ql); basis = "critical depth (no normal depth on a level or adverse barrel)"; }
      if (yl != null) low = { q: ql, y: yl, V: ql / sec.A(yl), basis: basis };
    }

    /* ---------- Calculation sheet ---------- */
    var no = 0, sn = 0;
    function head(t) { sn++; no = 0; rows.push({ head: sn + ". " + t }); }
    function row(desc, sym, eq, val, unit, dp) { no++; rows.push({ ref: sn + "." + no, desc: desc, sym: sym, eq: eq, val: typeof val === "number" ? +val.toFixed(dp == null ? 3 : dp) : val, unit: unit || "" }); }
    var shapeName = { box: "Box (rectangular)", circ: "Circular", arch: "Arch, flat invert" }[I.shape] || I.shape;
    var hv = function (V) { return V * V / (2 * G); };

    head("Barrel geometry and gradient");
    row("Barrel shape", "", shapeName, "", "");
    if (I.shape === "circ") row("Internal diameter", "D", "input", I.D, "m");
    else { row("Internal span", "B", "input", I.B, "m"); row("Internal rise", "H", "input", I.H, "m"); }
    if (I.shape === "arch") row("Springing height, arc rise, arc radius", "h_s, r, R", "r = min(H, B/2) = " + f(sec.arch.r) + "; R = (B²/4 + r²)/(2r) = " + f(sec.arch.R), f(sec.arch.hs) + " / " + f(sec.arch.r) + " / " + f(sec.arch.R), "m");
    row("Number of barrels", "N", "input; flow assumed to split equally", I.N, "");
    row("Full flow area, one barrel", "A_f", I.shape === "box" ? "B × H = " + f(I.B) + " × " + f(I.H) : I.shape === "circ" ? "πD²/4 = π × " + f(I.D) + "²/4" : "B h_s + circular segment above the springing", sec.Afull, "m²", 4);
    row("Full wetted perimeter", "P_f", I.shape === "box" ? "2(B + H)" : I.shape === "circ" ? "πD" : "B + 2h_s + arc length", sec.Pfull, "m", 4);
    row("Hydraulic radius, full", "R_f", "A_f / P_f = " + f(sec.Afull, 4) + " / " + f(sec.Pfull, 4), sec.Rfull, "m", 4);
    row("Centroid of opening above invert", "ȳ", I.shape === "box" ? "H/2" : I.shape === "circ" ? "D/2" : "first moment of area / A_f", sec.yBar, "m");
    row("Barrel length", "L", "input", I.L, "m", 2);
    row("Barrel gradient", "S₀", "(IL_in − IL_out)/L = (" + f(I.ILi) + " − " + f(I.ILo) + ")/" + f(I.L, 2) + " = " + oneIn(S0), S0, "m/m", 5);
    row("Design flow per barrel", "q", "Q/N = " + f(I.Q) + "/" + I.N, q, "m³/s");
    row("Roughness", I.method === "manning" ? "n" : "k_s", I.method === "manning" ? "Manning, input" : "Colebrook-White, input; ν = " + f(I.nu, 3) + " × 10⁻⁶ m²/s", I.method === "manning" ? I.n : I.ks, I.method === "manning" ? "s/m^⅓" : "mm", 4);

    head("Critical and normal depth at the design flow");
    if (yc != null) {
      var Ac = sec.A(yc), Tc = sec.T(yc);
      row("Critical depth", "y_c", I.shape === "box" ? "(q²/(gB²))^⅓ = (" + f(q) + "²/(9.81 × " + f(I.B) + "²))^⅓" : "solves q² T/(g A³) = 1 by bisection", yc, "m");
      row("Area and top width at y_c", "A_c, T_c", "", f(Ac, 4) + " / " + f(Tc), "m², m");
      row("Critical velocity", "V_c", "q/A_c = " + f(q) + "/" + f(Ac, 4), q / Ac, "m/s");
    } else row("Critical depth", "y_c", "no free-surface critical depth below the soffit: the barrel cannot pass this flow part full at critical", "above soffit", "");
    var Qcap = capacityFull(sec, S0, rough);
    row("Uniform-flow capacity running full", "Q_f", S0 > 0 ? (I.method === "manning" ? "A_f R_f^⅔ S₀^½ / n = " + f(sec.Afull, 4) + " × " + f(sec.Rfull, 4) + "^⅔ × " + f(S0, 5) + "^½ / " + f(I.n, 4) : "Colebrook-White with 4R_f in place of D") : "no gradient, so no uniform flow", S0 > 0 ? Qcap : "–", "m³/s");
    row("Normal depth", "y_n", yn != null ? "solves A V(R, S₀) = q by bisection" : S0 > 0 ? "q exceeds Q_f, so uniform flow would run full" : "level or adverse barrel", yn != null ? yn : "–", "m");
    row("Barrel slope type at this flow", "", yn == null ? (S0 > 0 ? "normal flow full" : "no normal depth") : steep ? "y_n < y_c" : "y_n > y_c", yn == null ? (S0 > 0 ? "full" : S0 === 0 ? "horizontal" : "adverse") : steep ? "steep" : "mild", "");

    head("Inlet control");
    var w = D.inlet.w;
    row("Unsubmerged entry loss coefficient", "K_u", "input (applied to the critical velocity head)", I.Ku, "", 2);
    if (w.hw !== Infinity) row("Headwater, unsubmerged relation", "HW_u", "y_c + (1 + K_u) V_c²/2g = " + f(w.yc) + " + " + f(1 + I.Ku, 2) + " × " + f(w.hv), w.hw, "m");
    else row("Headwater, unsubmerged relation", "HW_u", "not applicable: critical depth is at or above the soffit", "–", "");
    row("Orifice coefficient", "C_d", "input", I.Cd, "", 2);
    row("Headwater, submerged relation", "HW_s", "ȳ + (q/(C_d A_f))²/2g = " + f(sec.yBar) + " + (" + f(q) + "/(" + f(I.Cd, 2) + " × " + f(sec.Afull, 4) + "))²/19.62", inl.orifice(q), "m");
    row("Transition limits", "t₁, t₂", "unsubmerged up to HW = t₁H, submerged from HW = t₂H (inputs)", f(I.t1, 2) + " / " + f(I.t2, 2), "× H");
    row("Flows at the transition limits", "q₁, q₂", "q₁ from HW_u = t₁H; q₂ = C_d A_f √(2g(t₂H − ȳ))", f(inl.Q1) + " / " + f(inl.Q2), "m³/s");
    row("Inlet regime at q", "", D.inlet.regime === "transition" ? "q₁ < q < q₂: straight line between t₁H and t₂H" : D.inlet.regime === "unsubmerged" ? "q ≤ q₁" : "q ≥ q₂", D.inlet.regime, "");
    row("Inlet control headwater depth", "HW_i", "above inlet invert", D.inlet.hw, "m");
    row("Inlet control headwater level", "", "IL_in + HW_i = " + f(I.ILi) + " + " + f(D.inlet.hw), D.hwI, "m");

    head("Outlet control");
    var o = D.out;
    row("Tailwater level", "TW", "input; depth over outlet invert " + f(o.twd), I.TW, "m");
    row("Exit loss coefficient", "K_x", "input", I.Kx, "", 2);
    row("Entrance loss coefficient", "K_e", "input", I.Ke, "", 2);
    if (o.start === "submerged") {
      row("Full-flow velocity", "V", "q/A_f = " + f(q) + "/" + f(sec.Afull, 4), o.Vfull, "m/s");
      row("Velocity head", "V²/2g", f(o.Vfull) + "²/19.62", hv(o.Vfull), "m");
      row("Outlet submerged: energy level in the barrel at the outlet", "E_out", "TW + K_x V²/2g = " + f(I.TW) + " + " + f(I.Kx, 2) + " × " + f(hv(o.Vfull)), o.Eout, "m");
    } else if (o.start === "fullFree") {
      row("Full-flow velocity", "V", "q/A_f", o.Vfull, "m/s");
      row("Barrel full at a free outlet: hydraulic grade taken at the outlet soffit", "E_out", "IL_out + H + V²/2g = " + f(I.ILo) + " + " + f(I.H) + " + " + f(hv(o.Vfull)), o.Eout, "m");
    } else if (o.start === "critical") {
      row("Tailwater below critical depth: control at the outlet", "y_out", "y_out = y_c", o.yOut, "m");
      row("Energy level at the outlet", "E_out", "IL_out + y_c + V_c²/2g", o.Eout, "m");
    } else {
      row("Depth in the barrel at the outlet", "y_out", "y_out + (1 − K_x) V²/2g = TW − IL_out" + (I.Kx === 1 ? ", so y_out = TW − IL_out" : ""), o.yOut, "m");
      row("Velocity at the outlet", "V_out", "q/A(y_out) = " + f(q) + "/" + f(sec.A(o.yOut), 4), o.Vout, "m/s");
      row("Exit loss", "h_x", "K_x V_out²/2g = " + f(I.Kx, 2) + " × " + f(hv(o.Vout)), o.exitLoss, "m");
      row("Energy level in the barrel at the outlet", "E_out", "IL_out + y_out + V_out²/2g = " + f(I.ILo) + " + " + f(o.yOut) + " + " + f(hv(o.Vout)), o.Eout, "m");
    }
    if (o.fullLen > 0) row("Full-flow friction slope", "S_f", I.method === "manning" ? "n² V²/R_f^(4/3) = " + f(I.n, 4) + "² × " + f(o.Vfull) + "² / " + f(sec.Rfull, 4) + "^(4/3)" : "λ V²/(8 g R_f), λ from Colebrook-White", o.SfFull, "m/m", 5);
    if (o.reach) {
      var partLen = I.L - o.fullLen;
      row("Length running full / part full", "", o.fullLen > 0 && partLen > 0.01 ? "part full profile by direct step, full length at S_f" : o.fullLen > 0 ? "full throughout" : "part full throughout, direct-step profile", f(o.fullLen, 1) + " / " + f(partLen, 1), "m");
      row("Friction loss along the barrel", "h_f", o.fullLen >= I.L - 1e-6 ? "S_f × L = " + f(o.SfFull, 5) + " × " + f(I.L, 2) : "sum of S_f Δx over the profile", o.hf, "m");
      row("Energy level in the barrel at the inlet", "E_in", "E_out + h_f = " + f(o.Eout) + " + " + f(o.hf), o.Ein, "m");
      row("Flow at the inlet section", "", o.inFull ? "barrel full at the inlet" : "part full, depth " + f(o.yIn), o.inFull ? "full" : "part full", "");
      row("Velocity head at the inlet section", "V_in²/2g", f(o.Vin) + "²/19.62", o.hvIn, "m");
      row("Entrance loss", "h_e", "K_e V_in²/2g = " + f(I.Ke, 2) + " × " + f(o.hvIn), o.entLoss, "m");
      row("Outlet control headwater level", "HW_o", "E_in + h_e (approach velocity neglected) = " + f(o.Ein) + " + " + f(o.entLoss), o.HW, "m");
      row("Outlet control headwater depth", "", "HW_o − IL_in", o.HW - I.ILi, "m");
    } else {
      row("Subcritical profile from the outlet", "", "reaches critical depth " + f(o.jumpX, 1) + " m from the outlet, before the inlet", "does not reach inlet", "");
      row("Outlet control headwater", "HW_o", "the barrel is steep at this flow and runs supercritical from the inlet, so outlet conditions cannot set the headwater", "n/a", "");
    }

    head("Governing headwater");
    row("Inlet control level", "", "", D.hwI, "m");
    row("Outlet control level", "", "", D.hwO != null ? D.hwO : "n/a", "m");
    row("Governing control", "", "the higher of the two", D.gov === "inlet" ? "INLET CONTROL" : "OUTLET CONTROL", "");
    row("Headwater level, all flow through the barrels", "HW", "max(HW_i, HW_o)", D.hw, "m");
    row("Headwater ratio", "HW/H", "(" + f(D.hw) + " − " + f(I.ILi) + ")/" + f(I.H), (D.hw - I.ILi) / I.H, "", 2);

    head("Road overtopping and freeboard");
    row("Road (overtopping) level", "", "input; lowest level over the crossing", I.road, "m");
    row("Weir length and coefficient", "L_w, C_w", "inputs; C_w default (2/3)^1.5 √g = 1.70, critical depth on a broad crest", f(I.Lw, 1) + " / " + f(I.Cw, 2), "m, m^½/s");
    if (over) {
      row("Flow over the road", "Q_w", "C_w L_w (HW − road)^1.5, with Q_barrels + Q_w = Q solved by bisection", over.Qw, "m³/s");
      row("Flow through the barrels", "", "", over.Qc, "m³/s");
      row("Depth over the road", "", "HW − road", over.depth, "m");
      row("Design headwater level", "HW", "", HW, "m");
    } else row("Design headwater level", "HW", D.hw > I.road ? "above the road; no weir length given, so overtopping flow is not counted" : "no overtopping", HW, "m");
    row("Freeboard to the road", "", "road − HW = " + f(I.road) + " − " + f(HW), I.road - HW, "m");

    head("Velocities");
    row("Depth at the outlet", "", jump ? "hydraulic jump in the barrel; subcritical at exit" : sup && des.gov === "inlet" ? "supercritical profile from y_c at the inlet (direct step)" : "from the outlet condition above", outFull ? "full" : outY, outFull ? "" : "m");
    row("Outlet velocity", "V_out", outFull ? "q/A_f" : "q/A(y_out)", outV, "m/s", 2);
    if (outFr != null) row("Outlet Froude number", "Fr", "V/√(gA/T)", outFr, "", 2);
    row("Highest velocity in the barrel", "", "over the computed profile", vmax, "m/s", 2);
    row("Lowest velocity in the barrel", "", "over the computed profile", vmin, "m/s", 2);
    if (low) {
      row("Low (fish passage) flow per barrel", "q_l", "Q_l/N", low.q, "m³/s");
      row("Depth at low flow", "y_l", low.basis, low.y, "m");
      row("Velocity at low flow", "V_l", "q_l/A(y_l)", low.V, "m/s", 2);
    }

    /* ---------- Checks ---------- */
    function chk(id, label, status, detail, why) { checks.push({ id: id, label: label, status: status, detail: detail, why: why || "" }); }
    chk("control", "Governing control", "INFO", (D.gov === "inlet" ? "Inlet control" : "Outlet control") + " governs at the design flow: headwater " + f(D.hw) + " m (inlet " + f(D.hwI) + ", outlet " + (D.hwO != null ? f(D.hwO) : "n/a") + ").",
      D.gov === "inlet" ? "The entrance limits the flow, so a better inlet edge or a larger opening helps; roughness and tailwater matter less." : "Barrel losses and tailwater set the headwater, so size, roughness, length and tailwater all matter.");
    chk("overtop", "Overtopping", HW > I.road ? "FAIL" : "OK", HW > I.road ? (over ? f(over.Qw) + " m³/s passes over the road, " + f(over.depth * 1000, 0) + " mm deep." : "Headwater is above the road level.") : "Headwater is " + f(I.road - HW) + " m below the road.", HW > I.road ? "Enlarge the opening, add barrels, or raise the road." : "");
    chk("freeboard", "Freeboard to the road", I.road - HW >= I.fb ? "OK" : "CHECK", f(I.road - HW) + " m against your " + f(I.fb, 2) + " m.", "Below your freeboard requirement.");
    if (I.hwRatio > 0) chk("hwr", "Headwater ratio HW/H", (HW - I.ILi) / I.H <= I.hwRatio ? "OK" : "CHECK", f((HW - I.ILi) / I.H, 2) + " against your limit of " + f(I.hwRatio, 2) + ".", "Above your limit: check upstream flooding, the embankment and debris risk.");
    var fullAt = des.gov === "outlet" ? (des.out.fullLen >= I.L - 1e-6 ? "full throughout" : des.out.fullLen > 0 ? "full over " + f(des.out.fullLen, 1) + " m from the outlet, part full upstream" : "part full throughout") : (des.inlet.regime === "unsubmerged" ? "part full; the inlet is not submerged" : "part full below a submerged inlet (orifice-type entry)");
    chk("full", "Barrel running", "INFO", "The barrel runs " + fullAt + (jump ? ", with a hydraulic jump inside the barrel" : "") + ".", "");
    chk("scour", "Barrel velocity against scour or abrasion", vmax <= I.vScour ? "OK" : "CHECK", f(vmax, 2) + " m/s highest against your " + f(I.vScour, 1) + " m/s.", "Consider abrasion of the barrel lining and the bed, a flatter barrel, or a larger section.");
    chk("sed", "Barrel velocity against sediment deposition", vmin >= I.vSed ? "OK" : "CHECK", f(vmin, 2) + " m/s lowest at the design flow against your " + f(I.vSed, 2) + " m/s.", "Sediment may settle in the barrel. Check the velocity at more frequent flows, the bed material and maintenance access.");
    if (low) {
      chk("fishV", "Low-flow velocity (fish passage)", low.V <= I.vFish ? "OK" : "CHECK", f(low.V, 2) + " m/s at " + f(I.Qlow) + " m³/s against your " + f(I.vFish, 2) + " m/s.", "Too fast for your fish passage criterion. Consider embedding the invert, baffles or a wider, flatter barrel.");
      chk("fishD", "Low-flow depth (fish passage)", low.y >= I.dFish ? "OK" : "CHECK", f(low.y * 1000, 0) + " mm against your " + f(I.dFish * 1000, 0) + " mm.", "Too shallow. Consider a low-flow channel, an embedded or sunken invert, or fewer barrels.");
    }
    var vo = outV > I.vOut, frx = outFr != null && outFr > 1;
    chk("outlet", "Outlet velocity and energy", vo || frx ? "CHECK" : "OK", f(outV, 2) + " m/s at the outlet against your " + f(I.vOut, 2) + " m/s for the receiving channel" + (outFr != null ? "; Froude number " + f(outFr, 2) : "; barrel full at exit") + ".",
      (vo ? "Scour protection at the outlet is indicated. " : "") + (frx ? "Supercritical flow leaves the barrel: a hydraulic jump will form downstream, so energy dissipation is indicated." : ""));
    if (yc != null && Math.abs(Math.sqrt(froude2(sec, q, yn != null ? yn : yc)) - 1) < 0.15 && yn != null) chk("nearcrit", "Normal flow close to critical", "INFO", "Normal depth " + f(yn) + " m is close to critical depth " + f(yc) + " m.", "The water surface may be wavy and unstable, and the control can switch with small changes.");
    if (S0 <= 0) chk("grad", "Barrel gradient", "CHECK", "The barrel is " + (S0 === 0 ? "level" : "adverse") + ".", "Water and sediment will stand in the barrel at low flows.");

    return {
      inputs: I, sec: sec, S0: S0, q: q, design: D, over: over, HW: HW, gov: D.gov, governed: des, inl: inl, steep: steep,
      outlet: { y: outY, V: outV, full: outFull, Fr: outFr, jump: jump }, sup: sup, vmax: vmax, vmin: vmin, low: low,
      curve: curve, rows: rows, checks: checks, warn: warn, notes: notes, oneIn: oneIn(S0), Qcap: Qcap * I.N
    };
  }

  var api = { DEFAULTS: DEFAULTS, INLETS: INLETS, G: G, section: section, critical: critical, normal: normal, frictionSlope: frictionSlope, velUniform: velUniform, inletModel: inletModel, outletProfile: outletProfile, run: run, oneIn: oneIn };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.CulvertCalc = api;
})(this);

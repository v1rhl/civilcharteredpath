/* Retaining wall: first-pass calculation engine. Pure functions, no DOM. window.RWCalc (also module.exports for tests).
   Units: m, kN, kPa, degrees in inputs. Origin at the bottom front corner of the base (toe), x towards the retained side, y up.
   Everything here is worked from first principles with the user's own inputs. Partial factors, limits and material
   parameters are inputs; the defaults are placeholders to check against the governing document, not values taken from it. */
(function (root) {
  "use strict";
  var RAD = Math.PI / 180;

  var DEFAULTS = {
    wallType: "T",                 /* T, L or gravity */
    H: 3.0, dt: 0.5, D: 0.5, toe: 0.8, tTop: 0.3, tBot: 0.35, heel: 1.9, beta: 0, batter: "back",
    gam: 18, gamSat: 20, phi: 30, c: 0,                                   /* retained soil */
    gamF: 19, phiF: 30, cF: 0, cuF: 75, founding: "drained", kb: 1.0, adhesion: false, qAllow: 150, /* founding soil */
    q: 10, water: "none", zw: 2.0, hwf: 0, gamW: 9.81, gamC: 24,
    basis: "active", method: "rankine", deltaRatio: 0.67, Kover: "",
    passive: false, hp: 1.0, mob: 1.0, toeSoil: false,
    nGamma: "2(Nq-1)tan",
    sets: [
      { name: "Characteristic", gGunf: 1, gGfav: 1, gQ: 1, gPhi: 1, gC: 1, gCu: 1, gRh: 1, gRv: 1, reqOT: 2.0, reqSL: 1.5, reqBR: 3.0, eLim: 1 / 6 },
      { name: "Set 1 (factored actions)", gGunf: 1.35, gGfav: 1.0, gQ: 1.5, gPhi: 1.0, gC: 1.0, gCu: 1.0, gRh: 1.0, gRv: 1.0, reqOT: 1.0, reqSL: 1.0, reqBR: 1.0, eLim: 1 / 3 },
      { name: "Set 2 (factored strength)", gGunf: 1.0, gGfav: 1.0, gQ: 1.3, gPhi: 1.25, gC: 1.25, gCu: 1.4, gRh: 1.0, gRv: 1.0, reqOT: 1.0, reqSL: 1.0, reqBR: 1.0, eLim: 1 / 3 }
    ],
    structSet: 1,
    fck: 32, fyk: 500, gc: 1.5, gs: 1.15, acc: 0.85, lam: 0.8, eta: 1.0, zMax: 0.95, xdLim: 0.45,
    cover: 50, rhoMin: 0.13, vRdc: "", fctAllow: 0
  };

  function num(v, d) { var n = parseFloat(v); return isFinite(n) ? n : d; }
  function r(v, n) { if (!isFinite(v)) return v; var p = Math.pow(10, n == null ? 2 : n); return Math.round(v * p) / p; }

  /* ---- polygon helpers ---- */
  function polyAC(P) {
    var A = 0, cx = 0, cy = 0;
    for (var i = 0; i < P.length; i++) {
      var a = P[i], b = P[(i + 1) % P.length], k = a[0] * b[1] - b[0] * a[1];
      A += k; cx += (a[0] + b[0]) * k; cy += (a[1] + b[1]) * k;
    }
    A /= 2; if (Math.abs(A) < 1e-12) return { A: 0, x: 0, y: 0 };
    return { A: Math.abs(A), x: cx / (6 * A), y: cy / (6 * A) };
  }
  function clipY(P, yc, below) { /* keep the part with y <= yc (below) or y >= yc */
    var out = [];
    function inside(p) { return below ? p[1] <= yc + 1e-12 : p[1] >= yc - 1e-12; }
    for (var i = 0; i < P.length; i++) {
      var a = P[i], b = P[(i + 1) % P.length], ia = inside(a), ib = inside(b);
      if (ia) out.push(a);
      if (ia !== ib) { var t = (yc - a[1]) / (b[1] - a[1]); out.push([a[0] + t * (b[0] - a[0]), yc]); }
    }
    return out.length >= 3 ? out : [];
  }

  /* ---- earth pressure coefficients ---- */
  function coulombKa(phi, delta, beta) { /* vertical back (theta = 0); delta = beta gives Rankine's sloping-backfill value */
    var p = phi * RAD, d = delta * RAD, b = beta * RAD;
    if (beta >= phi) return NaN;
    var s = Math.sqrt(Math.sin(p + d) * Math.sin(p - b) / (Math.cos(d) * Math.cos(b)));
    return Math.pow(Math.cos(p), 2) / (Math.cos(d) * Math.pow(1 + s, 2));
  }
  function rankineKp(phi) { var s = Math.sin(phi * RAD); return (1 + s) / (1 - s); }

  /* Pressure on a vertical plane of height Hv measured down from its top. Water table at depth zw below the top (Infinity if none).
     Normal pressure p = max(0, gG (K s'v - 2c sqrt K) + gQ K q); horizontal component = p cos(delta). Returns piecewise-linear segments. */
  function earthDiagram(o) {
    var Hv = o.Hv, zw = o.zw, sq = Math.sqrt(o.K);
    function sv(z) { return z <= zw ? o.gam * z : o.gam * zw + (o.gamSat - o.gamW) * (z - zw); }
    function f(z) { return (o.gG * (o.K * sv(z) - 2 * o.c * sq) + o.gQ * o.K * o.q) * o.cosd; }
    var pts = [0]; if (zw > 0 && zw < Hv) pts.push(zw); pts.push(Hv);
    var all = [pts[0]];
    for (var i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], fa = f(a), fb = f(b);
      if ((fa < 0 && fb > 0) || (fa > 0 && fb < 0)) all.push(a + (b - a) * (-fa) / (fb - fa));
      all.push(b);
    }
    var segs = [], F = 0, M = 0;
    for (var j = 1; j < all.length; j++) {
      var z1 = all[j - 1], z2 = all[j], p1 = Math.max(0, f(z1 + 1e-9 * (z2 - z1))), p2 = Math.max(0, f(z2 - 1e-9 * (z2 - z1)));
      if (z2 - z1 < 1e-9) continue;
      if (Math.abs(p1) < 1e-9) p1 = 0; if (Math.abs(p2) < 1e-9) p2 = 0;
      var dz = z2 - z1, Fi = (p1 + p2) / 2 * dz, zc = p1 + p2 > 0 ? z1 + dz * (p1 + 2 * p2) / (3 * (p1 + p2)) : z1 + dz / 2;
      segs.push({ z1: z1, z2: z2, p1: p1, p2: p2, F: Fi, arm: Hv - zc });
      F += Fi; M += Fi * (Hv - zc);
    }
    var zc0 = null; for (var k = 0; k < segs.length; k++) if (segs[k].p1 === 0 && segs[k].p2 === 0) zc0 = segs[k].z2;
    return { segs: segs, F: F, arm: F > 0 ? M / F : 0, M: M, crack: zc0, ptop: segs.length ? segs[0].p1 : 0, pbot: segs.length ? segs[segs.length - 1].p2 : 0 };
  }

  /* Linear (or triangular, partial contact) bearing pressure under the base. */
  function contact(V, xbar, B) {
    var e = B / 2 - xbar, res = { e: e, V: V, xbar: xbar };
    if (V <= 0 || xbar <= 0 || xbar >= B) { res.fail = true; res.qToe = res.qHeel = Infinity; res.len = 0; res.at = function () { return 0; }; return res; }
    if (Math.abs(e) <= B / 6 + 1e-12) {
      res.qToe = V / B * (1 + 6 * e / B); res.qHeel = V / B * (1 - 6 * e / B); res.len = B; res.full = true;
      res.at = function (x) { return res.qToe + (res.qHeel - res.qToe) * x / B; };
    } else if (e > 0) {
      res.len = 3 * xbar; res.qToe = 2 * V / res.len; res.qHeel = 0;
      res.at = function (x) { return x >= res.len ? 0 : res.qToe * (1 - x / res.len); };
    } else {
      res.len = 3 * (B - xbar); res.qHeel = 2 * V / res.len; res.qToe = 0;
      res.at = function (x) { var s = B - x; return s >= res.len ? 0 : res.qHeel * (1 - s / res.len); };
    }
    res.qmax = Math.max(res.qToe, res.qHeel); res.qmin = Math.min(res.qToe, res.qHeel);
    return res;
  }

  function integrate(fn, a, b, n) { n = n || 400; if (b <= a) return 0; var h = (b - a) / n, s = fn(a) + fn(b); for (var i = 1; i < n; i++) s += (i % 2 ? 4 : 2) * fn(a + i * h); return s * h / 3; }

  /* Rectangular stress block from first principles: M = eta fcd b (lam x)(d - lam x / 2). */
  function flexure(M, h, o, barDia) {
    var b = 1000, d = h * 1000 - o.cover - barDia / 2, Mn = Math.abs(M) * 1e6; /* N mm per m */
    var fcd = o.acc * o.fck / o.gc, fyd = o.fyk / o.gs, a = o.eta * fcd * b * o.lam;
    var disc = a * a * d * d - 2 * a * o.lam * Mn, out = { M: M, h: h, d: d, fcd: fcd, fyd: fyd, b: b, barDia: barDia };
    if (d <= 0) { out.fail = "Section too thin for the cover"; return out; }
    if (disc < 0) { out.fail = "Concrete compression capacity exceeded: increase thickness"; out.x = NaN; return out; }
    var x = (a * d - Math.sqrt(disc)) / (a * o.lam), z = Math.min(d - o.lam * x / 2, o.zMax * d);
    out.x = x; out.xd = x / d; out.z = z; out.K = Mn / (b * d * d * o.fck);
    out.AsReq = Mn / (fyd * z); out.AsMin = o.rhoMin / 100 * b * d; out.As = Math.max(out.AsReq, out.AsMin);
    out.xdFail = out.xd > o.xdLim;
    return out;
  }
  var BARS = [10, 12, 16, 20, 25, 32], SPACINGS = [300, 250, 200, 175, 150, 125, 100];
  function pickBars(As) {
    var best = null;
    BARS.forEach(function (d) { SPACINGS.forEach(function (s) {
      var a = Math.PI * d * d / 4 * 1000 / s;
      if (a >= As && (!best || a < best.area - 1e-6 || (Math.abs(a - best.area) < 1e-6 && s > best.s))) best = { dia: d, s: s, area: a };
    }); });
    return best;
  }

  function run(inp) {
    var I = {}, k; for (k in DEFAULTS) I[k] = inp && inp[k] !== undefined ? inp[k] : DEFAULTS[k];
    ["H", "dt", "D", "toe", "tTop", "tBot", "heel", "beta", "gam", "gamSat", "phi", "c", "gamF", "phiF", "cF", "cuF", "kb", "qAllow", "q", "zw", "hwf", "gamW", "gamC", "deltaRatio", "hp", "mob",
      "fck", "fyk", "gc", "gs", "acc", "lam", "eta", "zMax", "xdLim", "cover", "rhoMin", "fctAllow", "structSet"].forEach(function (k) { I[k] = num(I[k], num(DEFAULTS[k], 0)); });
    var warn = [], rows = [], sec = "";
    function S(title) { sec = title; rows.push({ head: title }); }
    function R(ref, desc, sym, eq, val, unit, dp) { rows.push({ sec: sec, ref: ref, desc: desc, sym: sym || "", eq: eq || "", val: typeof val === "number" ? (isFinite(val) ? r(val, dp == null ? 2 : dp) : val > 0 ? "∞ (fails)" : "n/a") : val, raw: val, unit: unit || "" }); return val; }

    /* ---------- Geometry ---------- */
    var hs = I.H + I.dt, B = I.toe + I.tBot + I.heel, yTop = I.D + hs;
    var front = I.batter === "front", xft = front ? I.toe + I.tBot - I.tTop : I.toe, xbt = xft + I.tTop, wSlope = B - xbt;
    var Ht = I.D + hs + wSlope * Math.tan(I.beta * RAD);
    if (I.tTop > I.tBot) warn.push("Stem is thicker at the top than at the bottom. Check the stem thicknesses.");
    if (I.H <= 0 || I.D <= 0 || B <= 0) return { error: "Retained height, base thickness and base width must all be greater than zero.", inputs: I };
    S("1. Geometry");
    R("1.1", "Retained height (ground level difference)", "H", "input", I.H, "m");
    R("1.2", "Soil cover over toe", "d_t", "input", I.dt, "m");
    R("1.3", "Stem height above base", "h_s", "h_s = H + d_t", hs, "m", 3);
    R("1.4", "Base thickness", "D", "input", I.D, "m");
    R("1.5", "Toe, stem (top / bottom, " + (front ? "front" : "back") + " face battered), heel", "a, t_t, t_b, b", "input", r(I.toe, 3) + ", " + r(I.tTop, 3) + " / " + r(I.tBot, 3) + ", " + r(I.heel, 3), "m");
    R("1.6", "Base width", "B", "B = a + t_b + b", B, "m", 3);
    R("1.7", "Backfill slope", "β", "input", I.beta, "°");
    R("1.8", "Height of virtual back (vertical plane through heel end)", "H_v", "H_v = D + h_s + (B − x_top,back) tan β", Ht, "m", 3);

    /* ---------- Water ---------- */
    var hasW = I.water === "wt", yw = hasW ? Math.max(0, Math.min(yTop, yTop - I.zw)) : 0, hwb = hasW ? yw : 0, hwf = hasW ? Math.max(0, I.hwf) : 0;
    S("2. Groundwater");
    if (!hasW) R("2.1", "Drainage condition", "", "Free-draining backfill and working drainage assumed: no water pressure on wall or base", "none", "");
    else {
      R("2.1", "Water table depth below top of stem (behind wall)", "z_w", "input", I.zw, "m");
      R("2.2", "Water height above underside of base, behind", "h_wb", "h_wb = D + h_s − z_w", hwb, "m", 3);
      R("2.3", "Water height above underside of base, in front", "h_wf", "input", hwf, "m", 3);
      R("2.4", "Uplift pressure at heel / toe", "u_h, u_t", "u = γ_w h_w", r(I.gamW * hwb, 2) + " / " + r(I.gamW * hwf, 2), "kPa");
      R("2.5", "Steady seepage", "", "Not modelled: hydrostatic pressures each side, linear uplift between", "", "");
    }

    /* ---------- Characteristic weights ---------- */
    S("3. Characteristic weights and lever arms about the toe");
    var W = [];
    function addW(ref, name, P, gamma, kind) {
      if (!P.length) return;
      var g = polyAC(P); if (g.A < 1e-9) return;
      var w = { name: name, A: g.A, x: g.x, y: g.y, gamma: gamma, W: g.A * gamma, kind: kind };
      W.push(w);
      R(ref, name, "W", "A × γ = " + r(g.A, 3) + " × " + r(gamma, 2), w.W, "kN/m");
      R("", "  lever arm from toe", "x", "centroid of area", w.x, "m", 3);
    }
    var xs = I.toe, xb = I.toe + I.tBot;
    addW("3.1", "Stem", [[xs, I.D], [xb, I.D], [xbt, yTop], [xft, yTop]], I.gamC, "conc");
    addW("3.3", "Base", [[0, 0], [B, 0], [B, I.D], [0, I.D]], I.gamC, "conc");
    var soilPoly = [[xb, I.D], [B, I.D], [B, Ht], [xbt, yTop]];
    if (hasW && yw > I.D) {
      addW("3.4", "Retained soil over heel, above water table", clipY(soilPoly, yw, false), I.gam, "soil");
      addW("3.5", "Retained soil over heel, below water table (saturated)", clipY(soilPoly, yw, true), I.gamSat, "soil");
    } else addW("3.4", "Retained soil over heel (including any batter and slope wedge)", soilPoly, I.gam, "soil");
    if (I.toeSoil && I.dt > 0 && I.toe > 0) addW("3.6", "Soil over toe (included by choice)", [[0, I.D], [I.toe, I.D], [I.toe + (xft - xs) * I.dt / hs, I.D + I.dt], [0, I.D + I.dt]], I.gamF, "toe");
    else R("3.6", "Soil over toe", "", "Ignored in stability (it could be dug away)", 0, "kN/m");
    var qW = I.q * wSlope, qx = xbt + wSlope / 2;
    R("3.7", "Surcharge resultant over heel (variable)", "Q_v", "q × (B − x_top,back) = " + r(I.q, 2) + " × " + r(wSlope, 3), qW, "kN/m");
    R("", "  lever arm from toe", "x", "mid-width of loaded length", qx, "m", 3);
    var Wsum = W.reduce(function (s, w) { return s + w.W; }, 0), Msum = W.reduce(function (s, w) { return s + w.W * w.x; }, 0);
    R("3.8", "Total characteristic permanent weight", "ΣW", "sum of 3.1 to 3.6", Wsum, "kN/m");
    R("3.9", "Moment of weights about toe", "ΣWx", "Σ W × x", Msum, "kNm/m");

    /* ---------- Per combination ---------- */
    var combos = I.sets.map(function (st, si) {
      var s = {}; for (var kk in st) s[kk] = kk === "name" ? st[kk] : num(st[kk], 1);
      var tag = "4." + (si + 1);
      S("4." + (si + 1) + " " + s.name + ": earth pressure");
      var phid = Math.atan(Math.tan(I.phi * RAD) / s.gPhi) / RAD, cd = I.c / s.gC;
      var phiFd = Math.atan(Math.tan(I.phiF * RAD) / s.gPhi) / RAD, cFd = I.cF / s.gC, cuFd = I.cuF / s.gCu;
      R(tag + ".1", "Partial factors on actions", "γ_G,unf / γ_G,fav / γ_Q", "input", s.gGunf + " / " + s.gGfav + " / " + s.gQ, "");
      R(tag + ".2", "Partial factors on strength", "γ_φ' / γ_c' / γ_cu", "input", s.gPhi + " / " + s.gC + " / " + s.gCu, "");
      R(tag + ".3", "Design friction angle, retained soil", "φ'_d", "atan(tan φ' / γ_φ')", phid, "°");
      R(tag + ".4", "Design cohesion, retained soil", "c'_d", "c' / γ_c'", cd, "kPa");
      var K, delta, Kname;
      if (I.Kover !== "" && isFinite(parseFloat(I.Kover))) { K = parseFloat(I.Kover); delta = I.basis === "active" ? (I.method === "rankine" ? I.beta : I.deltaRatio * phid) : 0; Kname = "user override"; R(tag + ".5", "Earth pressure coefficient (user override)", "K", "input", K, "", 3); }
      else if (I.basis === "atrest") {
        K = 1 - Math.sin(phid * RAD); delta = 0; Kname = "at rest";
        R(tag + ".5", "At-rest coefficient (normally consolidated, horizontal ground)", "K_0", "1 − sin φ'_d", K, "", 3);
        if (I.beta > 0) warn.push("At-rest pressure is not adjusted for the sloping backfill. Enter your own K if the slope matters.");
      } else {
        delta = I.method === "rankine" ? I.beta : I.deltaRatio * phid; Kname = "active";
        K = coulombKa(phid, delta, I.beta);
        R(tag + ".5", "Wall friction on virtual back", "δ", I.method === "rankine" ? "δ = β (Rankine: soil on soil, parallel to surface)" : "δ = (δ/φ') × φ'_d = " + I.deltaRatio + " × " + r(phid, 2), delta, "°");
        R(tag + ".6", "Active coefficient (Coulomb, vertical back)", "K_a", "cos²φ / [cos δ (1 + √(sin(φ+δ) sin(φ−β) / (cos δ cos β)))²]", K, "", 3);
      }
      if (!isFinite(K)) return { name: s.name, error: "Backfill slope is steeper than the design friction angle: no limiting active state." };
      var cosd = Math.cos(delta * RAD), tand = Math.tan(delta * RAD);
      R(tag + ".7", "Horizontal component factor", "cos δ", "", cosd, "", 3);
      var zwV = hasW ? Ht - yw : Infinity;
      var ed = earthDiagram({ Hv: Ht, zw: zwV, K: K, c: cd, gam: I.gam, gamSat: I.gamSat, gamW: I.gamW, q: I.q, gG: s.gGunf, gQ: s.gQ, cosd: cosd });
      R(tag + ".8", "Horizontal pressure at top / bottom of virtual back", "p_h", "[γ_G (K σ'_v − 2c'√K) + γ_Q K q] cos δ ≥ 0", r(ed.ptop, 2) + " / " + r(ed.pbot, 2), "kPa");
      if (ed.crack) R("", "  depth of zero pressure (tension ignored)", "z_0", "where pressure = 0", ed.crack, "m", 3);
      ed.segs.forEach(function (g, gi) { R(tag + ".9." + (gi + 1), "Pressure block z = " + r(g.z1, 2) + " to " + r(g.z2, 2) + " m", "F", "(p₁ + p₂)/2 × Δz = (" + r(g.p1, 2) + " + " + r(g.p2, 2) + ")/2 × " + r(g.z2 - g.z1, 3), g.F, "kN/m"); });
      var Pah = R(tag + ".10", "Horizontal earth thrust (design)", "P_h", "Σ F", ed.F, "kN/m");
      var yP = R(tag + ".11", "  height of thrust above underside of base", "y_P", "Σ F y / Σ F", ed.arm, "m", 3);
      var Pav = R(tag + ".12", "Vertical component on virtual back", "P_v", "P_h tan δ", Pah * tand, "kN/m");
      var Uwb = s.gGunf * 0.5 * I.gamW * hwb * hwb, Ff = s.gGfav * 0.5 * I.gamW * hwf * hwf;
      if (hasW) {
        R(tag + ".13", "Water thrust behind (design)", "U_wb", "γ_G,unf × ½ γ_w h_wb²", Uwb, "kN/m");
        R(tag + ".14", "Water thrust in front (design, resisting)", "U_wf", "γ_G,fav × ½ γ_w h_wf²", Ff, "kN/m");
      }
      /* passive at front */
      var Pp = 0, yPp = 0;
      if (I.passive) {
        var Kp = rankineKp(phiFd), hp = Math.max(0, Math.min(I.hp, I.dt + I.D));
        var pp0 = 2 * cFd * Math.sqrt(Kp), pp1 = Kp * I.gamF * hp + pp0;
        Pp = s.gGfav * I.mob * (pp0 + pp1) / 2 * hp; yPp = (pp0 + pp1) > 0 ? hp * (pp0 + 2 * pp1) / (3 * (pp0 + pp1)) : 0; yPp = hp - yPp;
        R(tag + ".15", "Passive coefficient at toe (Rankine, level ground)", "K_p", "(1 + sin φ'_d) / (1 − sin φ'_d)", Kp, "", 3);
        R(tag + ".16", "Passive resistance (mobilised)", "P_p", "m × ∫(K_p γ z + 2c'√K_p) dz over h_p = " + r(hp, 2) + " m, m = " + I.mob, Pp, "kN/m");
      }

      /* two vertical-load cases */
      var uh = I.gamW * hwb, ut = I.gamW * hwf, Uraw = (uh + ut) / 2 * B, xU = uh + ut > 0 ? B * (ut + 2 * uh) / (3 * (ut + uh)) : B / 2;
      function lcase(kind) {
        var gW = kind === "min" ? s.gGfav : s.gGunf, gU = kind === "min" ? s.gGunf : s.gGfav, gQv = kind === "min" ? 0 : s.gQ;
        var Wd = Wsum * gW, MW = Msum * gW, Q = qW * gQv, MQ = Q * qx, U = Uraw * gU, MU = U * xU;
        var V = Wd + Q + Pav - U;
        var Mst = MW + MQ + Pav * B + Ff * hwf / 3 + Pp * yPp, Mot = Pah * yP + Uwb * hwb / 3 + MU;
        var Hnet = Pah + Uwb - Ff;
        var xbar = (Mst - Mot) / V, cp = contact(V, xbar, B);
        return { kind: kind, gW: gW, gU: gU, gQv: gQv, Wd: Wd, MW: MW, Q: Q, MQ: MQ, U: U, MU: MU, V: V, Mst: Mst, Mot: Mot, H: Hnet, xbar: xbar, cp: cp };
      }
      var cMin = lcase("min"), cMax = lcase("max");

      S("4." + (si + 1) + " " + s.name + ": overturning and sliding");
      R(tag + ".20", "Weights as stabilising (× γ_G,fav)", "W_d", "γ_G,fav × ΣW = " + s.gGfav + " × " + r(Wsum, 2), cMin.Wd, "kN/m");
      R(tag + ".21", "Surcharge on heel", "", "Variable and favourable here, so left out", 0, "kN/m");
      if (hasW) R(tag + ".22", "Uplift on base (× γ_G,unf)", "U", "γ_G,unf × (u_t + u_h)/2 × B, at x = " + r(xU, 3) + " m", cMin.U, "kN/m");
      R(tag + ".23", "Stabilising moment about toe", "M_stb", "W_d x + P_v B" + (hasW ? " + U_wf h_wf/3" : "") + (I.passive ? " + P_p y_p" : ""), cMin.Mst, "kNm/m");
      R(tag + ".24", "Overturning moment about toe", "M_dst", "P_h y_P" + (hasW ? " + U_wb h_wb/3 + U x_U" : ""), cMin.Mot, "kNm/m");
      var otRatio = cMin.Mot > 0 ? cMin.Mst / cMin.Mot : Infinity;
      R(tag + ".25", "Overturning ratio", "M_stb / M_dst", "required ≥ " + s.reqOT, otRatio, "", 2);
      var V = cMin.V, Bp = Math.max(0, B - 2 * Math.abs(cMin.cp.e)), resist, resEq;
      if (I.founding === "undrained") { resist = cuFd * Bp; resEq = "c_u,d × B' = " + r(cuFd, 2) + " × " + r(Bp, 3); }
      else {
        var tdb = I.kb * Math.tan(phiFd * RAD); resist = V * tdb + (I.adhesion ? cFd * Bp : 0);
        resEq = "V × k_b tan φ'_f,d" + (I.adhesion ? " + c'_f,d B'" : "") + " = " + r(V, 2) + " × " + r(tdb, 3) + (I.adhesion ? " + " + r(cFd, 2) + " × " + r(Bp, 3) : "");
      }
      R(tag + ".26", "Net vertical load on base", "V", "W_d + P_v − U", V, "kN/m");
      R(tag + ".27", "Horizontal driving force", "H", "P_h" + (hasW ? " + U_wb − U_wf" : ""), cMin.H, "kN/m");
      R(tag + ".28", "Base sliding resistance", "R_base", resEq, resist, "kN/m");
      var slRes = (resist + Pp) / s.gRh;
      var slRatio = cMin.H > 0 ? slRes / cMin.H : Infinity;
      R(tag + ".29", "Sliding ratio", "(R_base + P_p) / (γ_R,h H)", "required ≥ " + s.reqSL, slRatio, "", 2);

      S("4." + (si + 1) + " " + s.name + ": bearing");
      var Nq = Math.exp(Math.PI * Math.tan(phiFd * RAD)) * Math.pow(Math.tan((45 + phiFd / 2) * RAD), 2);
      var Nc = phiFd > 0.01 ? (Nq - 1) / Math.tan(phiFd * RAD) : Math.PI + 2;
      var Ng = I.nGamma === "2(Nq+1)tan" ? 2 * (Nq + 1) * Math.tan(phiFd * RAD) : I.nGamma === "1.5(Nq-1)tan" ? 1.5 * (Nq - 1) * Math.tan(phiFd * RAD) : 2 * (Nq - 1) * Math.tan(phiFd * RAD);
      var q0 = I.gamF * (I.dt + I.D), gEff = hwf > 0 ? I.gamF - I.gamW : I.gamF;
      var bear = [cMin, cMax].map(function (cc, ci) {
        var lbl = ci ? "weights unfavourable (× γ_G,unf), surcharge on heel × γ_Q" : "weights favourable (× γ_G,fav), no surcharge on heel";
        var cp = cc.cp, e = cp.e, Bq = Math.max(0, B - 2 * Math.abs(e));
        var al = Math.atan2(Math.max(0, cc.H), cc.V) / RAD, ic = Math.pow(1 - al / 90, 2), ig = phiFd > 0 ? Math.pow(Math.max(0, 1 - al / phiFd), 2) : 0;
        var qult = I.founding === "undrained" ? (Math.PI + 2) * cuFd * ic + q0 : cFd * Nc * ic + q0 * Nq * ic + 0.5 * gEff * Bq * Ng * ig;
        var Rv = qult * Bq / s.gRv, ratio = cc.V > 0 ? Rv / cc.V : 0;
        var p = tag + "." + (30 + ci * 10);
        R(p, "Case " + (ci ? "B" : "A") + ": " + lbl, "V", "W_d + Q + P_v − U", cc.V, "kN/m");
        R("", "  resultant from toe", "x̄", "(M_stb − M_dst) / V", cc.xbar, "m", 3);
        R("", "  eccentricity (positive towards toe)", "e", "B/2 − x̄", e, "m", 3);
        R("", "  eccentricity ratio", "e/B", "limit " + r(s.eLim, 3), Math.abs(e) / B, "", 3);
        if (cp.fail) R("", "  bearing pressure", "", "Resultant falls outside the base", "FAIL", "");
        else if (cp.full) R("", "  bearing pressure at toe / heel", "q", "V/B (1 ± 6e/B)", r(cp.qToe, 1) + " / " + r(cp.qHeel, 1), "kPa");
        else R("", "  bearing pressure (partial contact, triangle over " + r(cp.len, 3) + " m)", "q_max", "2V / (3 × " + (e > 0 ? "x̄" : "(B − x̄)") + ")", cp.qmax, "kPa", 1);
        R("", "  effective width", "B'", "B − 2|e|", Bq, "m", 3);
        R("", "  load inclination", "α", "atan(H / V)", al, "°", 1);
        if (I.founding === "undrained") R("", "  ultimate bearing (undrained, strip, Meyerhof inclination)", "q_ult", "(π + 2) c_u,d i_c + q₀, i_c = (1 − α/90)²", qult, "kPa", 0);
        else R("", "  ultimate bearing (drained, strip, Meyerhof inclination)", "q_ult", "c' N_c i_c + q₀ N_q i_q + ½ γ' B' N_γ i_γ; N_q = " + r(Nq, 2) + ", N_c = " + r(Nc, 2) + ", N_γ = " + r(Ng, 2) + ", q₀ = " + r(q0, 1) + ", i_q = " + r(ic, 3) + ", i_γ = " + r(ig, 3), qult, "kPa", 0);
        R("", "  bearing resistance ratio", "q_ult B' / (γ_R,v V)", "required ≥ " + s.reqBR, ratio, "", 2);
        return { e: e, eRatio: Math.abs(e) / B, qmax: cp.fail ? Infinity : cp.qmax, ratio: cp.fail ? 0 : ratio, qult: qult, Bq: Bq, cp: cp };
      });
      var gov = bear[0].ratio < bear[1].ratio ? 0 : 1;
      var res = {
        name: s.name, set: s, K: K, Kname: Kname, delta: delta, phid: phid, ed: ed, Pah: Pah, yP: yP, Pav: Pav, Uwb: Uwb, Ff: Ff, Pp: Pp, cases: [cMin, cMax], bear: bear,
        checks: [
          { key: "ot", label: "Overturning", value: otRatio, req: s.reqOT, util: s.reqOT / otRatio },
          { key: "sl", label: "Sliding", value: slRatio, req: s.reqSL, util: s.reqSL / slRatio },
          { key: "br", label: "Bearing resistance", value: bear[gov].ratio, req: s.reqBR, util: bear[gov].ratio > 0 ? s.reqBR / bear[gov].ratio : Infinity },
          { key: "ecc", label: "Eccentricity e/B", value: Math.max(bear[0].eRatio, bear[1].eRatio), req: s.eLim, util: Math.max(bear[0].eRatio, bear[1].eRatio) / s.eLim, lower: true }
        ]
      };
      if (si === 0) {
        var qm = Math.max(bear[0].qmax, bear[1].qmax);
        R(tag + ".50", "Maximum bearing pressure vs allowable (from your ground investigation)", "q_max", "q_max ≤ q_allow = " + I.qAllow + " kPa", qm, "kPa", 1);
        res.checks.push({ key: "qa", label: "Bearing pressure vs allowable", value: qm, req: I.qAllow, util: I.qAllow > 0 ? qm / I.qAllow : Infinity, lower: true, unit: "kPa" });
      }
      return res;
    });

    /* ---------- Structural (indicative) ---------- */
    var struct = null, ss = combos[Math.max(0, Math.min(combos.length - 1, I.structSet))];
    if (ss && !ss.error) {
      var st = ss.set, tag2 = "5";
      S("5. Indicative structural actions (" + ss.name + ")");
      var hasWs = hasW && yw > I.D, zwS = hasWs ? yTop - yw : Infinity;
      var sed = earthDiagram({ Hv: hs, zw: zwS, K: ss.K, c: I.c / st.gC, gam: I.gam, gamSat: I.gamSat, gamW: I.gamW, q: I.q, gG: st.gGunf, gQ: st.gQ, cosd: Math.cos(ss.delta * RAD) });
      var hwS = hasWs ? yw - I.D : 0, Fw = st.gGunf * 0.5 * I.gamW * hwS * hwS;
      var Vst = sed.F + Fw, Mst = sed.M + Fw * hwS / 3;
      R("5.1", "Earth pressure on stem (horizontal, design)", "F_s", "same pressure law as 4.x.8 over h_s, top = top of stem", sed.F, "kN/m");
      R("", "  lever arm above top of base", "y", "", sed.arm, "m", 3);
      if (hasWs) R("5.2", "Water on stem (design)", "F_w", "γ_G,unf × ½ γ_w (h_wb − D)²", Fw, "kN/m");
      R("5.3", "Stem shear at base of stem", "V_Ed", "F_s" + (hasWs ? " + F_w" : ""), Vst, "kN/m");
      R("5.4", "Stem moment at base of stem", "M_Ed", "Σ F y", Mst, "kNm/m");
      var elems = [{ id: "stem", name: "Stem (tension on retained face)", M: Mst, V: Vst, h: I.tBot }];
      /* base slabs from both load cases of the chosen set */
      var toeR = [], heelR = [];
      ss.cases.forEach(function (cc, ci) {
        var cp = cc.cp; if (cp.fail) return;
        var u = function (x) { return cc.gU * (I.gamW * hwf + (I.gamW * hwb - I.gamW * hwf) * x / B); };
        var wToe = cc.gW * (I.gamC * I.D + (I.toeSoil ? I.gamF * I.dt : 0));
        var a = I.toe;
        var mT = integrate(function (x) { return (cp.at(x) + u(x) - wToe) * (a - x); }, 0, a), vT = integrate(function (x) { return cp.at(x) + u(x) - wToe; }, 0, a);
        toeR.push({ c: ci, M: mT, V: vT, q0: cp.at(0), q1: cp.at(a), w: wToe });
        var x1 = xb, L = B - x1;
        var ysurf = function (x) { return yTop + Math.max(0, x - xbt) * Math.tan(I.beta * RAD); };
        var soilDown = function (x) {
          var h = ysurf(x) - I.D; if (h <= 0) return 0;
          if (!hasW || yw <= I.D) return I.gam * h;
          var hb = Math.min(h, yw - I.D); return I.gamSat * hb + I.gam * (h - hb);
        };
        var down = function (x) { return cc.gW * (I.gamC * I.D + soilDown(x)) + (x >= xbt ? I.q * cc.gQv : 0); };
        var mH = integrate(function (x) { return (down(x) - cp.at(x) - u(x)) * (x - x1); }, x1, B) + ss.Pav * L;
        var vH = integrate(function (x) { return down(x) - cp.at(x) - u(x); }, x1, B) + ss.Pav;
        heelR.push({ c: ci, M: mH, V: vH, q0: cp.at(x1), q1: cp.at(B) });
      });
      function worst(arr) { return arr.reduce(function (m, x) { return !m || Math.abs(x.M) > Math.abs(m.M) ? x : m; }, null); }
      var tw = worst(toeR), hw = worst(heelR);
      if (tw && I.toe > 0) {
        R("5.5", "Toe: bearing pressure at front edge / stem face (case " + (tw.c ? "B" : "A") + ")", "q", "from 4.x bearing distribution", r(tw.q0, 1) + " / " + r(tw.q1, 1), "kPa");
        R("5.6", "Toe: moment at front face of stem", "M_Ed", "∫ (q + u − w_toe) (a − x) dx, w_toe = " + r(tw.w, 2) + " kPa", tw.M, "kNm/m");
        R("5.7", "Toe: shear at front face of stem", "V_Ed", "∫ (q + u − w_toe) dx", tw.V, "kN/m");
        elems.push({ id: "toe", name: "Toe (tension " + (tw.M >= 0 ? "bottom" : "top") + ")", M: tw.M, V: tw.V, h: I.D });
      }
      if (hw && I.heel > 0) {
        R("5.8", "Heel: bearing pressure at stem face / heel end (case " + (hw.c ? "B" : "A") + ")", "q", "from 4.x bearing distribution", r(hw.q0, 1) + " / " + r(hw.q1, 1), "kPa");
        R("5.9", "Heel: moment at back face of stem", "M_Ed", "∫ (w_soil + w_slab + q_Q − q − u)(x − x_b) dx + P_v b", hw.M, "kNm/m");
        R("5.10", "Heel: shear at back face of stem", "V_Ed", "∫ (w − q − u) dx + P_v", hw.V, "kN/m");
        elems.push({ id: "heel", name: "Heel (tension " + (hw.M >= 0 ? "top" : "bottom") + ")", M: hw.M, V: hw.V, h: I.D });
      }
      if (I.wallType === "gravity") {
        S("6. Mass concrete stem: stress at the stem to base joint");
        var Nn = W.filter(function (w) { return /^Stem/.test(w.name); }).reduce(function (s, w) { return s + w.W; }, 0) * st.gGfav;
        var xw = W.filter(function (w) { return /^Stem/.test(w.name); }).reduce(function (s, w) { return s + w.W * w.x; }, 0) * st.gGfav / (Nn || 1);
        var xc = xs + I.tBot / 2, Mnet = Mst + Nn * (xc - xw), t = I.tBot;
        var sb = Nn / t - 6 * Mnet / (t * t), sf = Nn / t + 6 * Mnet / (t * t);
        R("6.1", "Axial load from stem self-weight (× γ_G,fav)", "N", "", Nn, "kN/m");
        R("6.2", "Moment about centre of joint", "M", "M_Ed + N (x_c − x_N)", Mnet, "kNm/m");
        R("6.3", "Stress at retained face / front face", "σ", "N/t ∓ 6M/t²", r(sb / 1000, 3) + " / " + r(sf / 1000, 3), "MPa");
        R("6.4", "Allowable flexural tension (your input)", "f_t", "input", I.fctAllow, "MPa");
        struct = { gravity: true, sb: sb / 1000, sf: sf / 1000, util: sb < 0 ? (I.fctAllow > 0 ? -sb / 1000 / I.fctAllow : Infinity) : 0, elems: elems };
      } else {
        S("6. Indicative reinforcement (rectangular stress block, b = 1 m)");
        R("6.1", "Concrete and steel", "f_ck / f_yk", "input", I.fck + " / " + I.fyk, "MPa");
        R("6.2", "Design strengths", "f_cd / f_yd", "α_cc f_ck/γ_c ; f_yk/γ_s", r(I.acc * I.fck / I.gc, 2) + " / " + r(I.fyk / I.gs, 1), "MPa");
        R("6.3", "Stress block", "η, λ", "input", I.eta + ", " + I.lam, "");
        elems.forEach(function (el, ei) {
          var bar = 16, f = flexure(el.M, el.h, I, bar), pick = f.As ? pickBars(f.As) : null;
          if (pick && pick.dia !== bar) { f = flexure(el.M, el.h, I, pick.dia); pick = f.As ? pickBars(f.As) : pick; }
          el.flex = f; el.bars = pick;
          var p = "6." + (4 + ei);
          R(p, el.name, "M_Ed", "from section 5", Math.abs(el.M), "kNm/m");
          R("", "  effective depth", "d", "h − cover − φ/2 = " + r(el.h * 1000, 0) + " − " + I.cover + " − " + (f.barDia / 2), f.d, "mm", 0);
          if (f.fail) { R("", "  result", "", f.fail, "FAIL", ""); return; }
          R("", "  neutral axis depth", "x", "solve M = η f_cd b λx (d − λx/2)", f.x, "mm", 1);
          R("", "  x/d", "x/d", "limit " + I.xdLim, f.xd, "", 3);
          R("", "  lever arm", "z", "min(d − λx/2, " + I.zMax + "d)", f.z, "mm", 1);
          R("", "  steel required", "A_s,req", "M / (f_yd z)", f.AsReq, "mm²/m", 0);
          R("", "  minimum steel (your input " + I.rhoMin + "% of b d)", "A_s,min", "ρ_min b d", f.AsMin, "mm²/m", 0);
          R("", "  indicative bars", "", pick ? "H" + pick.dia + " at " + pick.s + " mm" : "over H32 at 100: rethink section", pick ? pick.area : "", "mm²/m", 0);
          var v = Math.abs(el.V) * 1000 / (1000 * f.d);
          el.v = v;
          R("", "  shear stress at face", "v_Ed", "V / (b d) = " + r(Math.abs(el.V), 1) + " kN / (1000 × " + r(f.d, 0) + ")", v, "MPa", 3);
          if (I.vRdc !== "" && isFinite(parseFloat(I.vRdc))) R("", "  vs concrete shear resistance (your input)", "v_Rd,c", "input", parseFloat(I.vRdc), "MPa", 3);
        });
        struct = { gravity: false, elems: elems };
      }
    }

    /* governing summary */
    var summary = [];
    combos.forEach(function (c) { if (c.error) { summary.push({ name: c.name, label: c.error, util: Infinity }); return; } c.checks.forEach(function (k) { summary.push({ name: c.name, label: k.label, value: k.value, req: k.req, util: k.util, lower: k.lower, unit: k.unit }); }); });
    if (struct && struct.elems) struct.elems.forEach(function (el) {
      if (el.flex && el.flex.fail) summary.push({ name: "Structure", label: el.name + ": " + el.flex.fail, util: Infinity });
      else if (el.flex) {
        summary.push({ name: "Structure", label: el.name + ": x/d", value: el.flex.xd, req: I.xdLim, util: el.flex.xd / I.xdLim, lower: true });
        if (I.vRdc !== "" && isFinite(parseFloat(I.vRdc))) summary.push({ name: "Structure", label: el.name + ": shear stress", value: el.v, req: parseFloat(I.vRdc), util: el.v / parseFloat(I.vRdc), lower: true, unit: "MPa" });
      }
    });
    if (struct && struct.gravity) summary.push({ name: "Structure", label: "Mass concrete joint tension", value: Math.min(0, struct.sb), req: -I.fctAllow, util: struct.util, lower: true, unit: "MPa" });

    return { inputs: I, geom: { xft: xft, xbt: xbt, hs: hs, B: B, yTop: yTop, Ht: Ht, wSlope: wSlope, yw: yw, hwb: hwb, hwf: hwf, hasW: hasW }, weights: W, combos: combos, struct: struct, rows: rows, warn: warn, summary: summary };
  }

  var api = { DEFAULTS: DEFAULTS, run: run, coulombKa: coulombKa, rankineKp: rankineKp, earthDiagram: earthDiagram, contact: contact, flexure: flexure, pickBars: pickBars, polyAC: polyAC, clipY: clipY };
  root.RWCalc = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : this);

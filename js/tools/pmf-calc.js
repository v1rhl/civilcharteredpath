/* PMF screening engine: generic rainfall-runoff chain from first principles.
   window.PMFCalc = { DEFAULTS, run(inputs) }   (also module.exports for node tests)

   Chain per storm case:
     design rainfall depth (user) x areal reduction (user) -> symmetric storm profile (parametric or user blocks)
     -> losses (constant percentage runoff, or a curve-number cumulative loss) -> net rainfall blocks
     -> triangular unit hydrograph built by volume conservation from a time to peak
        (Kirpich time of concentration, travel velocity, or a user-entered Tp)
     -> discrete convolution + constant baseflow -> inflow hydrograph
     -> optional level-pool routing (RK4) through a weir or a user rating table.

   No tabulated parameters, regional factors, rainfall depths or storm profiles from any published
   reservoir flood estimation method are included. Every value that would normally be looked up is an input. */
(function (root) {
  "use strict";

  var DEFAULTS = {
    /* catchment */
    A: 12, L: 8.0, S: 15,
    tpMethod: "kirpich", lagRatio: 0.6, vel: 1.5, tpDirect: 2.0, tpFactor: 1.0,
    baseRatio: 2.67, baseflow: 0.5,
    /* rainfall and losses */
    lossModel: "pr", lambda: 0.2,
    profile: "peaked", peak: 0.5, custom: "5, 10, 20, 30, 20, 10, 5",
    dtUser: "",
    cases: [
      { name: "Case A, summer (example)", D: 4.5, P: 150, arf: 1.0, pr: 60, cn: 85, snow: 0 },
      { name: "Case B, winter (example)", D: 9, P: 190, arf: 1.0, pr: 70, cn: 90, snow: 2 }
    ],
    /* reservoir */
    route: true, A0: 25, A1: 28, hc: 1.5, h0: 0,
    rating: "weir", Cw: 1.7, Lw: 30, table: "0, 0\n0.5, 12\n1.0, 34\n1.5, 62\n2.0, 96"
  };

  function num(v, d) { var n = typeof v === "number" ? v : parseFloat(v); return isFinite(n) ? n : d; }
  function r(v, n) { if (!isFinite(v)) return v > 0 ? "∞" : "–"; return (+v).toFixed(n == null ? 3 : n); }
  function nice(v) { var a = Math.abs(v); return a >= 1000 ? r(v, 0) : a >= 100 ? r(v, 1) : a >= 10 ? r(v, 2) : r(v, 3); }

  function parseList(s) { return String(s || "").split(/[\s,;]+/).map(parseFloat).filter(function (x) { return isFinite(x); }); }
  function parseTable(s) {
    var rows = String(s || "").split(/\n+/).map(function (l) { return parseList(l); }).filter(function (p) { return p.length >= 2; }).map(function (p) { return [p[0], p[1]]; });
    rows.sort(function (a, b) { return a[0] - b[0]; });
    return rows;
  }

  /* cumulative fraction of storm depth reached at time fraction x for a symmetric profile:
     the central fraction p of the duration holds p^a of the depth (a = 1 is uniform). */
  function Fpeak(x, a) { var d = 2 * x - 1; return 0.5 + 0.5 * (d < 0 ? -1 : 1) * Math.pow(Math.abs(d), a); }

  function profileFractions(I, n, warn) {
    var f = [], i;
    if (I.profile === "uniform") { for (i = 0; i < n; i++) f.push(1 / n); return f; }
    if (I.profile === "custom") {
      var b = parseList(I.custom).filter(function (x) { return x >= 0; }), tot = b.reduce(function (s, x) { return s + x; }, 0);
      if (b.length && tot > 0) {
        var cum = [0]; b.forEach(function (x) { cum.push(cum[cum.length - 1] + x / tot); });
        var at = function (x) { var p = x * b.length, k = Math.min(b.length - 1, Math.floor(p)); return cum[k] + (cum[k + 1] - cum[k]) * (p - k); };
        for (i = 0; i < n; i++) f.push(at((i + 1) / n) - at(i / n));
        return f;
      }
      warn.push("Custom storm profile is empty or invalid, so a uniform profile was used.");
      for (i = 0; i < n; i++) f.push(1 / n); return f;
    }
    var a = Math.min(1, Math.max(0.05, num(I.peak, 0.5)));
    for (i = 0; i < n; i++) f.push(Fpeak((i + 1) / n, a) - Fpeak(i / n, a));
    return f;
  }

  function ratingFn(I) {
    if (I.rating === "table") {
      var t = parseTable(I.table);
      if (t.length < 2) return null;
      if (t[0][0] > 0) t.unshift([0, 0]);
      var fn = function (h) {
        if (h <= t[0][0]) return t[0][1];
        for (var i = 1; i < t.length; i++) if (h <= t[i][0]) return t[i - 1][1] + (t[i][1] - t[i - 1][1]) * (h - t[i - 1][0]) / (t[i][0] - t[i - 1][0]);
        var a = t[t.length - 2], b = t[t.length - 1]; return b[1] + (b[1] - a[1]) * (h - b[0]) / (b[0] - a[0]);
      };
      fn.hMax = t[t.length - 1][0]; fn.pts = t;
      return fn;
    }
    var C = num(I.Cw, 1.7), L = num(I.Lw, 0);
    var w = function (h) { return h > 0 ? C * L * Math.pow(h, 1.5) : 0; };
    w.hMax = Infinity;
    return w;
  }

  function runCase(I, cs, idx, warn) {
    var out = { name: cs.name || "Case " + (idx + 1), rows: [], warn: [] }, R = out.rows;
    function row(ref, desc, sym, eq, raw, unit, n) { R.push({ ref: ref, desc: desc, sym: sym, eq: eq, raw: raw, val: typeof raw === "number" ? (n == null ? nice(raw) : r(raw, n)) : raw, unit: unit || "" }); }
    function head(t) { R.push({ head: t }); }
    var A = num(I.A, 0), L = num(I.L, 0), S = num(I.S, 0), D = num(cs.D, 0), P = num(cs.P, 0), arf = num(cs.arf, 1);
    if (!(A > 0)) return { error: "Catchment area must be above zero." };
    if (!(D > 0)) return { error: out.name + ": storm duration must be above zero." };
    if (!(P >= 0)) return { error: out.name + ": rainfall depth must be zero or more." };

    /* 1. catchment response */
    head("1. Catchment response and unit hydrograph");
    row("1.1", "Catchment area", "A", "input", A, "km²");
    var lag = null, Tc = null, tpBase, lr = num(I.lagRatio, 0.6), tpF = num(I.tpFactor, 1);
    if (I.tpMethod === "kirpich" || I.tpMethod === "velocity") {
      if (!(L > 0)) return { error: "Main stream length must be above zero." };
      row("1.2", "Main stream length", "L", "input", L, "km");
      if (I.tpMethod === "kirpich") {
        if (!(S > 0)) return { error: "Stream slope must be above zero for the Kirpich time of concentration." };
        row("1.3", "Representative stream slope", "S", "input " + nice(S) + " m/km = " + r(S / 1000, 4) + " m/m", S, "m/km");
        Tc = 0.0195 * Math.pow(L * 1000, 0.77) * Math.pow(S / 1000, -0.385) / 60;
        row("1.4", "Time of concentration (Kirpich)", "T_c", "0.0195 × (" + r(L * 1000, 0) + ")^0.77 × (" + r(S / 1000, 4) + ")^−0.385 / 60", Tc, "h");
        if (A > 50) out.warn.push("Kirpich was fitted to small, steep agricultural catchments. At " + nice(A) + " km² it is likely to underestimate the response time; consider entering T_p directly.");
      } else {
        var v = num(I.vel, 0); if (!(v > 0)) return { error: "Travel velocity must be above zero." };
        row("1.3", "Assumed mean travel velocity", "v", "input (placeholder: judge from the channel)", v, "m/s");
        Tc = L * 1000 / v / 3600;
        row("1.4", "Time of concentration (travel time)", "T_c", r(L * 1000, 0) + " / " + nice(v) + " / 3600", Tc, "h");
      }
      lag = lr * Tc;
      row("1.5", "Lag (time from centroid of rain to peak)", "t_L", nice(lr) + " × " + nice(Tc), lag, "h");
    }

    /* time step: an odd number of blocks so a symmetric storm has a central peak block */
    var tgt = (lag != null ? Math.max(lag, 0.05) : Math.max(num(I.tpDirect, 1), 0.05)) / 4, n, dtU = num(I.dtUser, NaN);
    if (dtU > 0) { n = Math.max(1, Math.round(D / dtU)); if (Math.abs(n * dtU - D) > 1e-9) out.warn.push("Time step adjusted from " + nice(dtU) + " h to " + nice(D / n) + " h so it divides the " + nice(D) + " h storm."); }
    else { n = Math.max(1, Math.ceil(D / tgt)); if (n % 2 === 0) n++; }
    if (n > 600) { n = 601; out.warn.push("Time step capped so the storm has at most 601 blocks."); }
    var dt = D / n;
    row("1.6", "Computation time step", "Δt", dtU > 0 ? nice(D) + " / " + n + " (user value, made to divide D)" : nice(D) + " / " + n + " (about one quarter of the lag, odd block count)", dt, "h");

    if (lag != null) { tpBase = dt / 2 + lag; row("1.7", "Time to peak of the Δt unit hydrograph", "T_p′", nice(dt) + " / 2 + " + nice(lag), tpBase, "h"); }
    else { tpBase = num(I.tpDirect, 0); if (!(tpBase > 0)) return { error: "Unit hydrograph time to peak must be above zero." }; row("1.7", "Time to peak of the Δt unit hydrograph", "T_p′", "input", tpBase, "h"); }
    var Tp = tpBase * tpF;
    row("1.8", "Adjusted time to peak for the extreme event", "T_p", nice(tpBase) + " × " + nice(tpF) + " (adjustment factor, placeholder)", Tp, "h");
    if (!(Tp > 0)) return { error: "Time to peak must be above zero." };
    var br = num(I.baseRatio, 2.67); if (!(br > 1)) return { error: "Time base ratio must be above 1." };
    var TB = br * Tp;
    row("1.9", "Time base", "T_B", nice(br) + " × " + nice(Tp), TB, "h");
    var Up = 2 * A * 1000 / (TB * 3600);
    row("1.10", "Unit hydrograph peak (1 mm net rain over A, by volume)", "U_p", "2 × " + nice(A) + " × 1000 / (" + nice(TB) + " × 3600)", Up, "m³/s per mm");
    var uh = [], k, nU = Math.ceil(TB / dt) + 1;
    for (k = 0; k <= nU; k++) { var t = k * dt; uh.push(t <= Tp ? Up * t / Tp : t < TB ? Up * (TB - t) / (TB - Tp) : 0); }
    var uvol = uh.reduce(function (s, x) { return s + x; }, 0) * dt * 3600, unitV = A * 1000;
    var sc = uvol > 0 ? unitV / uvol : 1; uh = uh.map(function (x) { return x * sc; });
    row("1.11", "Ordinates sampled at Δt and scaled so the volume is exactly 1 mm over A", "Σu·Δt", "scale " + r(sc, 4), unitV, "m³ per mm");
    while (uh.length > 1 && uh[uh.length - 1] === 0 && uh[uh.length - 2] === 0) uh.pop();

    /* 2. rainfall */
    head("2. Design rainfall and storm profile");
    row("2.1", "Point design rainfall depth over duration D", "P", "input (must come from the governing guidance)", P, "mm", 1);
    row("2.2", "Storm duration", "D", "input", D, "h");
    row("2.3", "Areal reduction factor", "ARF", "input (placeholder 1.0 = no reduction)", arf, "", 3);
    var Pa = P * arf;
    row("2.4", "Catchment rainfall depth", "P_A", nice(P) + " × " + r(arf, 3), Pa, "mm", 1);
    var snow = num(cs.snow, 0) || 0, snowT = snow * D;
    if (snow > 0) row("2.5", "Snowmelt added uniformly", "M", nice(snow) + " mm/h × " + nice(D) + " h", snowT, "mm", 1);
    var fr = profileFractions(I, n, out.warn), gross = fr.map(function (f) { return Pa * f + snow * dt; });
    var profName = I.profile === "uniform" ? "uniform" : I.profile === "custom" ? "user blocks, resampled to " + n + " blocks" : "symmetric, central fraction p holds p^" + r(Math.min(1, Math.max(0.05, num(I.peak, 0.5))), 2) + " of the depth";
    var pk = Math.max.apply(null, gross);
    row("2.6", "Storm profile", "", profName, "", "");
    row("2.7", "Peak block gross input", "i_max", "max over " + n + " blocks of P_A × Δf + M·Δt", pk, "mm", 2);
    row("2.8", "Peak gross intensity", "", nice(pk) + " / " + nice(dt), pk / dt, "mm/h", 1);

    /* 3. losses */
    head("3. Losses and net rainfall");
    var net = [], totG = Pa + snowT;
    if (I.lossModel === "cn") {
      var CN = num(cs.cn, 0); if (!(CN > 0 && CN <= 100)) return { error: out.name + ": curve number must be between 1 and 100." };
      var Smax = 25400 / CN - 254, lam = num(I.lambda, 0.2), Ia = lam * Smax;
      row("3.1", "Curve number (user, placeholder)", "CN", "input", CN, "", 0);
      row("3.2", "Potential maximum retention", "S_r", "25400 / " + r(CN, 0) + " − 254", Smax, "mm", 1);
      row("3.3", "Initial abstraction", "I_a", nice(lam) + " × " + nice(Smax), Ia, "mm", 1);
      var Q = function (p) { return p > Ia ? (p - Ia) * (p - Ia) / (p - Ia + Smax) : 0; }, cum = 0;
      gross.forEach(function (g) { var a = Q(cum); cum += g; net.push(Q(cum) - a); });
      row("3.4", "Total net rainfall", "R", "(" + nice(totG) + " − " + nice(Ia) + ")² / (" + nice(totG) + " − " + nice(Ia) + " + " + nice(Smax) + ")", Q(totG), "mm", 1);
    } else {
      var PR = num(cs.pr, 0); if (!(PR >= 0 && PR <= 100)) return { error: out.name + ": percentage runoff must be between 0 and 100." };
      row("3.1", "Percentage runoff (user, placeholder)", "PR", "input", PR, "%", 1);
      net = gross.map(function (g) { return g * PR / 100; });
      row("3.4", "Total net rainfall", "R", nice(totG) + " × " + nice(PR) + " / 100", totG * PR / 100, "mm", 1);
    }
    var totN = net.reduce(function (s, x) { return s + x; }, 0);
    row("3.5", "Effective runoff ratio", "R / (P_A + M)", nice(totN) + " / " + nice(totG), totG > 0 ? totN / totG * 100 : 0, "%", 1);

    /* 4. convolution */
    head("4. Inflow hydrograph");
    var qb = num(I.baseflow, 0) || 0, N = n + uh.length, qd = [], j, i;
    for (j = 0; j < N; j++) { var s = 0; for (i = Math.max(0, j - uh.length + 1); i <= Math.min(j, n - 1); i++) s += net[i] * uh[j - i]; qd.push(s); }
    var tArr = qd.map(function (_, j2) { return j2 * dt; });
    var inflow = qd.map(function (x) { return x + qb; });
    var ip = 0; for (j = 1; j < N; j++) if (inflow[j] > inflow[ip]) ip = j;
    var Vd = qd.reduce(function (s2, x) { return s2 + x; }, 0) * dt * 3600;
    row("4.1", "Convolution", "q_j", "q_j = Σ R_i · u_(j−i), i = 1.." + n + ", " + uh.length + " ordinates", "", "");
    row("4.2", "Baseflow (constant, user)", "Q_b", "input", qb, "m³/s");
    row("4.3", "Peak inflow", "Q_p,in", "max(q_j) + Q_b = " + nice(inflow[ip] - qb) + " + " + nice(qb), inflow[ip], "m³/s", 1);
    row("4.4", "Time to peak inflow from start of storm", "t_p,in", ip + " × " + nice(dt), tArr[ip], "h", 2);
    row("4.5", "Direct runoff volume", "V_d", "Σq·Δt·3600 (check: " + nice(totN) + " mm × " + nice(A) + " km² × 1000 = " + r(totN * A * 1000, 0) + ")", Vd, "m³", 0);
    var Vt = Vd + qb * (N - 1) * dt * 3600;
    row("4.6", "Total inflow volume including baseflow over the hydrograph", "V_t", r(Vd, 0) + " + " + nice(qb) + " × " + nice((N - 1) * dt) + " × 3600", Vt, "m³", 0);
    var halfT = 0; for (j = 0; j < N; j++) if (inflow[j] - qb >= (inflow[ip] - qb) / 2) halfT += dt;
    row("4.7", "Width of the direct hydrograph at half peak", "W_50", "count of steps above half peak × Δt", halfT, "h", 2);

    out.dt = dt; out.n = n; out.Tp = Tp; out.TB = TB; out.Up = Up; out.Tc = Tc; out.lag = lag;
    out.uh = uh; out.gross = gross; out.net = net; out.Pa = Pa; out.totN = totN; out.totG = totG;
    out.t = tArr; out.inflow = inflow; out.qd = qd; out.Qin = inflow[ip]; out.tin = tArr[ip]; out.Vd = Vd; out.Vt = Vt; out.W50 = halfT; out.qb = qb;

    /* 5. routing */
    if (I.route) {
      head("5. Reservoir routing (level pool)");
      var rf = ratingFn(I); if (!rf) return { error: "The spillway rating table needs at least two rows of head and flow." };
      var A0 = num(I.A0, 0) * 1e4, A1v = num(I.A1, NaN), hc = num(I.hc, 0), h0 = Math.max(0, num(I.h0, 0) || 0);
      if (!(A0 > 0)) return { error: "Reservoir surface area at spillway crest must be above zero." };
      if (!(hc > 0)) return { error: "Dam crest height above spillway crest must be above zero." };
      var A1 = isFinite(A1v) && A1v > 0 ? A1v * 1e4 : A0;
      var Ah = function (h) { return Math.max(A0 * 0.05, A0 + (A1 - A0) * h / hc); };
      row("5.1", "Surface area at spillway crest", "A_0", "input " + nice(A0 / 1e4) + " ha", A0, "m²", 0);
      row("5.2", "Surface area at dam crest level", "A_1", isFinite(A1v) && A1v > 0 ? "input " + nice(A1 / 1e4) + " ha" : "not given, A_0 used", A1, "m²", 0);
      row("5.3", "Dam crest above spillway crest (freeboard to overtopping)", "h_c", "input", hc, "m");
      row("5.4", "Area with head h", "A(h)", "A_0 + (A_1 − A_0) h / h_c, linear", "", "");
      if (I.rating === "table") row("5.5", "Spillway rating", "O(h)", "user table, " + rf.pts.length + " points, linear between points", "", "");
      else row("5.5", "Spillway rating (free weir)", "O(h)", nice(num(I.Cw, 1.7)) + " × " + nice(num(I.Lw, 0)) + " × h^1.5", "", "");
      var Qcap = rf(hc);
      row("5.6", "Spillway capacity with water at dam crest", "O(h_c)", I.rating === "table" ? "rating at h = " + nice(hc) : nice(num(I.Cw, 1.7)) + " × " + nice(num(I.Lw, 0)) + " × " + nice(hc) + "^1.5", Qcap, "m³/s", 1);
      row("5.7", "Initial head above spillway crest", "h_0", "input (0 = reservoir full to crest at start)", h0, "m");
      row("5.8", "Continuity", "dh/dt", "(I(t) − O(h)) / A(h), solved by 4th-order Runge–Kutta, 8 substeps per Δt", "", "");
      var inAt = function (tt) { var p = tt / dt, a = Math.floor(p); if (a >= N - 1) return qb; return inflow[a] + (inflow[a + 1] - inflow[a]) * (p - a); };
      var dh = function (tt, h) { return (inAt(tt) - rf(Math.max(0, h))) / Ah(Math.max(0, h)) ; };
      var h = h0, oT = [0], oQ = [rf(h)], oH = [h], subs = 8, hs = dt * 3600 / subs, tt = 0, step = 0;
      var maxSteps = N * 6 + 50;
      while (step < maxSteps) {
        for (var m = 0; m < subs; m++) {
          var ts = tt * 3600;
          var k1 = dh(tt, h), k2 = dh((ts + hs / 2) / 3600, h + hs / 2 * k1), k3 = dh((ts + hs / 2) / 3600, h + hs / 2 * k2), k4 = dh((ts + hs) / 3600, h + hs * k3);
          h = Math.max(0, h + hs / 6 * (k1 + 2 * k2 + 2 * k3 + k4)); tt += hs / 3600;
        }
        step++; oT.push(step * dt); oQ.push(rf(h)); oH.push(h);
        if (step >= N - 1) { var qeq = qb, recent = oQ[oQ.length - 1]; if (Math.abs(recent - qeq) <= Math.max(0.02 * (Math.max.apply(null, oQ) - qeq), 0.005)) break; }
      }
      var op = 0; for (j = 1; j < oQ.length; j++) if (oQ[j] > oQ[op]) op = j;
      var hmax = Math.max.apply(null, oH);
      /* extend inflow with baseflow to the routed length */
      while (inflow.length < oT.length) { inflow.push(qb); qd.push(0); tArr.push(tArr.length * dt); }
      row("5.9", "Peak outflow", "Q_p,out", "max O(h) over " + oT.length + " steps", oQ[op], "m³/s", 1);
      row("5.10", "Time of peak outflow from start of storm", "t_p,out", op + " × " + nice(dt), oT[op], "h", 2);
      row("5.11", "Maximum head above spillway crest", "h_max", "max h", hmax, "m", 3);
      var Smaxs = A0 * hmax + (A1 - A0) * hmax * hmax / (2 * hc);
      row("5.12", "Flood storage used above spillway crest", "ΔS", nice(A0) + " × " + r(hmax, 3) + " + (" + nice(A1) + " − " + nice(A0) + ") × " + r(hmax, 3) + "² / (2 × " + nice(hc) + ")", Smaxs, "m³", 0);
      row("5.13", "Attenuation of peak", "", "(1 − " + nice(oQ[op]) + " / " + nice(inflow[ip]) + ") × 100", (1 - oQ[op] / inflow[ip]) * 100, "%", 1);
      row("5.14", "Remaining freeboard to dam crest", "h_c − h_max", nice(hc) + " − " + r(hmax, 3), hc - hmax, "m", 3);
      if (hmax > hc) out.warn.push("The routed level rises " + r(hmax - hc, 2) + " m above the dam crest: the dam would overtop. Flow over the crest is not modelled, so the routed results above crest level are indicative only.");
      if (I.rating === "table" && hmax > rf.hMax) out.warn.push("The routed level exceeds the top of the rating table (" + nice(rf.hMax) + " m), so outflow was extrapolated from the last segment.");
      out.route = { t: oT, Q: oQ, h: oH, Qout: oQ[op], tout: oT[op], hmax: hmax, Qcap: Qcap, hc: hc, dS: Smaxs, atten: 1 - oQ[op] / inflow[ip] };
    }
    out.t = tArr; out.inflow = inflow; out.qd = qd;
    return out;
  }

  function run(I) {
    var warn = [], res = { inputs: I, warn: warn, cases: [] };
    if (!I.cases || !I.cases.length) return { error: "Add at least one storm case." };
    for (var c = 0; c < I.cases.length; c++) {
      var o = runCase(I, I.cases[c], c, warn);
      if (o.error) return { error: o.error };
      res.cases.push(o);
    }
    var key = function (o) { return I.route ? o.route.Qout : o.Qin; }, ci = 0;
    res.cases.forEach(function (o, i) { if (key(o) > key(res.cases[ci])) ci = i; });
    res.critical = ci;
    res.summary = res.cases.map(function (o) {
      return { name: o.name, Qin: o.Qin, tin: o.tin, Vd: o.Vd, Vt: o.Vt, R: o.totN, Tp: o.Tp, dt: o.dt,
        Qout: o.route ? o.route.Qout : null, tout: o.route ? o.route.tout : null, hmax: o.route ? o.route.hmax : null,
        Qcap: o.route ? o.route.Qcap : null, hc: o.route ? o.route.hc : null };
    });
    return res;
  }

  var api = { DEFAULTS: DEFAULTS, run: run, Fpeak: Fpeak, parseTable: parseTable };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.PMFCalc = api;
})(typeof window !== "undefined" ? window : null);

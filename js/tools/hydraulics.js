/* Hydraulics of circular pipes running full and part-full.
   Pure functions, no DOM, so other tools (and Node, for testing) can use them.
   Units: metres, seconds, m3/s. Gradient S is m/m (1 in 150 = 1/150).

   Roughness is an object, either
     { method: "cw", ks: <m>, nu: <m2/s> }   Colebrook-White
     { method: "manning", n: <s/m^(1/3)> }   Manning
*/
(function (root) {
  "use strict";
  var G = 9.81;

  /* Geometry of a circular section of diameter D flowing at depth y. */
  function geom(D, y) {
    var p = Math.min(Math.max(y / D, 0), 1);
    var theta = 2 * Math.acos(1 - 2 * p); /* angle subtended at the centre by the wetted perimeter (rad) */
    var A = D * D / 8 * (theta - Math.sin(theta));
    var P = D * theta / 2;
    var T = D * Math.sin(theta / 2); /* water surface width */
    return { p: p, theta: theta, A: A, P: P, R: P > 0 ? A / P : 0, T: T };
  }

  /* Mean velocity for hydraulic radius R. Colebrook-White is written with the
     equivalent diameter 4R, so it reduces to the usual full-bore form when R = D/4. */
  function velocity(R, S, rough) {
    if (!(R > 0) || !(S > 0)) return 0;
    if (rough.method === "manning") return Math.pow(R, 2 / 3) * Math.sqrt(S) / rough.n;
    var De = 4 * R, a = Math.sqrt(2 * G * De * S);
    return -2 * a * Math.log10(rough.ks / (3.7 * De) + 2.51 * rough.nu / (De * a));
  }

  /* Everything at one depth. */
  function at(D, S, rough, y) {
    var g = geom(D, y), V = velocity(g.R, S, rough);
    g.y = g.p * D; g.V = V; g.Q = V * g.A;
    g.Fr = g.T > 0 && g.p < 1 ? V / Math.sqrt(G * g.A / g.T) : null;
    return g;
  }
  function fullBore(D, S, rough) { return at(D, S, rough, D); }

  /* Golden-section search for the depth giving the largest flow (about 0.94D). */
  function peak(D, S, rough) {
    var a = 0.8, b = 1, k = (Math.sqrt(5) - 1) / 2, c = b - k * (b - a), d = a + k * (b - a);
    for (var i = 0; i < 60; i++) {
      if (at(D, S, rough, c * D).Q > at(D, S, rough, d * D).Q) b = d; else a = c;
      c = b - k * (b - a); d = a + k * (b - a);
    }
    return at(D, S, rough, (a + b) / 2 * D);
  }

  /* Depth carrying flow Q. Takes the lower root (rising from the invert). Returns null if Q exceeds the peak. */
  function depthForFlow(D, S, rough, Q) {
    var pk = peak(D, S, rough);
    if (Q > pk.Q) return null;
    var lo = 0, hi = pk.p;
    for (var i = 0; i < 80; i++) { var m = (lo + hi) / 2; if (at(D, S, rough, m * D).Q < Q) lo = m; else hi = m; }
    return at(D, S, rough, (lo + hi) / 2 * D);
  }

  /* Monotone bisection on a log scale. f(x) increases with x. */
  function solveLog(f, target, lo, hi) {
    if (f(hi) < target || f(lo) > target) return null;
    var a = Math.log(lo), b = Math.log(hi);
    for (var i = 0; i < 100; i++) { var m = (a + b) / 2; if (f(Math.exp(m)) < target) a = m; else b = m; }
    return Math.exp((a + b) / 2);
  }

  /* Gradient so that Q flows at proportional depth p (1 = full bore). */
  function solveGradient(D, Q, rough, p) {
    return solveLog(function (S) { return at(D, S, rough, p * D).Q; }, Q, 1e-7, 1);
  }
  /* Diameter so that Q flows at proportional depth p. */
  function solveDiameter(Q, S, rough, p) {
    return solveLog(function (D) { return at(D, S, rough, p * D).Q; }, Q, 0.005, 20);
  }

  /* Proportional curves: Q/Qfull and V/Vfull against d/D. */
  function curve(D, S, rough, steps) {
    var f = fullBore(D, S, rough), out = [];
    steps = steps || 100;
    for (var i = 1; i <= steps; i++) {
      var r = at(D, S, rough, i / steps * D);
      out.push({ p: i / steps, q: r.Q / f.Q, v: r.V / f.V });
    }
    return out;
  }

  var api = { G: G, geom: geom, velocity: velocity, at: at, fullBore: fullBore, peak: peak, depthForFlow: depthForFlow,
    solveGradient: solveGradient, solveDiameter: solveDiameter, curve: curve };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.Hydraulics = api;
})(this);

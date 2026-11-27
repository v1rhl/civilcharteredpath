/* Checks for js/tools/pmf-calc.js. Run: node tools/test_pmf.js */
"use strict";
var C = require("../js/tools/pmf-calc.js"), fails = 0;
function ok(c, m) { if (!c) { fails++; console.log("FAIL " + m); } else console.log("ok   " + m); }
function near(a, b, tol, m) { ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), m + " (" + a + " vs " + b + ")"); }
function clone(o) { return JSON.parse(JSON.stringify(o)); }

/* 1. worked example runs */
var res = C.run(clone(C.DEFAULTS));
ok(!res.error && res.cases.length === 2, "worked example runs");
res.cases.forEach(function (c) {
  near(c.Vd, c.totN * 12 * 1000, 1e-6, c.name + ": direct volume equals net rain x area");
  var s = c.uh.reduce(function (a, b) { return a + b; }, 0) * c.dt * 3600; near(s, 12000, 1e-9, c.name + ": unit hydrograph holds 1 mm");
  var g = c.gross.reduce(function (a, b) { return a + b; }, 0); near(g, c.totG, 1e-9, c.name + ": profile blocks sum to storm depth");
});
/* Kirpich hand value: 0.0195 x 8000^0.77 x 0.015^-0.385 / 60 */
near(res.cases[0].Tc, 0.0195 * Math.pow(8000, 0.77) * Math.pow(0.015, -0.385) / 60, 1e-12, "Kirpich Tc");

/* 2. long uniform storm reaches equilibrium flow A x i x PR / 3.6 */
var I = clone(C.DEFAULTS); I.route = false; I.profile = "uniform"; I.tpMethod = "direct"; I.tpDirect = 1; I.baseflow = 0;
I.cases = [{ name: "eq", D: 40, P: 400, arf: 1, pr: 50, cn: 80, snow: 0 }];
var e = C.run(I).cases[0]; near(e.Qin, 12 * 10 * 0.5 / 3.6, 1e-6, "equilibrium peak for uniform 10 mm/h, PR 50%");

/* 3. profile: central fraction p holds p^a */
near(C.Fpeak(0.75, 0.5) - C.Fpeak(0.25, 0.5), Math.pow(0.5, 0.5), 1e-12, "profile central half holds 0.5^a");

/* 4. curve number total */
I = clone(C.DEFAULTS); I.route = false; I.lossModel = "cn"; I.cases = [{ name: "cn", D: 6, P: 100, arf: 1, pr: 50, cn: 80, snow: 0 }];
var c4 = C.run(I).cases[0], Sr = 25400 / 80 - 254, Ia = 0.2 * Sr; near(c4.totN, Math.pow(100 - Ia, 2) / (100 - Ia + Sr), 1e-9, "curve number net rain");

/* 5. routing: mass balance and peak outflow lies on the falling inflow limb */
I = clone(C.DEFAULTS);
var r5 = C.run(I);
r5.cases.forEach(function (c) {
  var R = c.route, dt = c.dt * 3600, vin = 0, vout = 0;
  for (var k = 1; k < R.t.length; k++) { vin += (c.inflow[k] + c.inflow[k - 1]) / 2 * dt; vout += (R.Q[k] + R.Q[k - 1]) / 2 * dt; }
  var hEnd = R.h[R.h.length - 1], A0 = 25e4, A1 = 28e4, hc = 1.5, Send = A0 * hEnd + (A1 - A0) * hEnd * hEnd / (2 * hc);
  near(vin - vout, Send, 0.01, c.name + ": routed volume balance (in − out = storage)");
  ok(R.Qout < c.Qin, c.name + ": routed peak below inflow peak");
  ok(R.tout > c.tin, c.name + ": routed peak later than inflow peak");
  var k2 = Math.round(R.tout / c.dt); ok(Math.min(c.inflow[k2 - 1], c.inflow[k2 + 1]) <= R.Qout * 1.001 && Math.max(c.inflow[k2 - 1], c.inflow[k2 + 1]) >= R.Qout * 0.999, c.name + ": peak outflow sits on the inflow curve (within one step)");
});
near(r5.cases[0].route.Qcap, 1.7 * 30 * Math.pow(1.5, 1.5), 1e-12, "weir capacity at dam crest");

/* 6. rating table equals weir when points lie on the weir curve */
I = clone(C.DEFAULTS); I.rating = "table";
I.table = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3].map(function (h) { return h + ", " + 1.7 * 30 * Math.pow(h, 1.5); }).join("\n");
var t6 = C.run(I); near(t6.cases[1].route.Qout, r5.cases[1].route.Qout, 0.03, "table rating close to weir");

/* 7. errors */
I = clone(C.DEFAULTS); I.A = 0; ok(!!C.run(I).error, "zero area is an error");
I = clone(C.DEFAULTS); I.cases = []; ok(!!C.run(I).error, "no cases is an error");
console.log(fails ? fails + " FAILED" : "all passed"); process.exit(fails ? 1 : 0);

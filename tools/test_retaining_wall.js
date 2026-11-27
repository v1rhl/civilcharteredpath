/* Regression check of the retaining wall engine against an independent hand calculation of the worked example.
   Run: node tools/test_retaining_wall.js */
const C = require("../js/tools/retaining-wall-calc.js");
const o = C.run({});
const [ch, s1, s2] = o.combos;
const near = (a, b, tol, what) => { if (Math.abs(a - b) > tol) { console.error("FAIL", what, a, "expected", b); process.exitCode = 1; } else console.log("ok  ", what, +a.toFixed(3)); };
/* Hand calc: Ka = 1/3; Ph = Ka q Hv + ½ Ka γ Hv² with Hv = 4.0 m, q = 10, γ = 18 */
near(ch.K, 1 / 3, 1e-9, "Ka (phi 30)");
near(ch.Pah, 10 * 4 / 3 + 0.5 * 18 * 16 / 3, 1e-6, "characteristic Ph");
near(ch.cases[0].Mot, 10 * 4 / 3 * 2 + 0.5 * 18 * 16 / 3 * 4 / 3, 1e-6, "characteristic overturning moment");
near(ch.cases[0].Mst, 335.255, 0.01, "characteristic stabilising moment");
near(ch.checks[0].value, 3.698, 0.002, "characteristic overturning ratio");
near(ch.checks[1].value, 1.743, 0.002, "characteristic sliding ratio");
near(s1.checks[1].value, 1.261, 0.002, "set 1 sliding ratio");
near(s2.K, 0.409, 0.001, "set 2 Ka (phi_d = atan(tan30/1.25))");
near(s2.checks[1].value, 1.067, 0.002, "set 2 sliding ratio");
near(s1.bear[1].cp.qToe, 116.67, 0.02, "set 1 case B toe pressure");
const stem = o.struct.elems[0];
near(stem.M, 1.5 * 10 / 3 * 3.5 * 3.5 / 2 + 1.35 * 18 / 3 * Math.pow(3.5, 3) / 6, 1e-6, "set 1 stem moment");
near(stem.V, 1.5 * 10 / 3 * 3.5 + 1.35 * 0.5 * 18 / 3 * 3.5 * 3.5, 1e-6, "set 1 stem shear");
/* Edge cases must not produce NaN */
[{ water: "wt", zw: 1.5, hwf: 0.5 }, { beta: 15 }, { method: "coulomb", beta: 10 }, { basis: "atrest" }, { wallType: "gravity", batter: "front", tTop: 0.6, tBot: 1.8, toe: 0.3, heel: 0.3 },
 { toe: 0, heel: 2.4 }, { founding: "undrained" }, { passive: true }, { c: 5 }, { beta: 35 }, { heel: 0.2 }].forEach((inp) => {
  const r = C.run(inp), bad = r.rows.filter((x) => !x.head && /NaN|undefined/.test(String(x.val) + x.eq));
  if (bad.length) { console.error("FAIL NaN for", JSON.stringify(inp), bad[0]); process.exitCode = 1; } else console.log("ok   no NaN for", JSON.stringify(inp));
});

/* Regression check of the culvert engine against independent hand calculations.
   Run: node tools/test_culvert.js */
const C = require("../js/tools/culvert-calc.js");
const g = 9.81;
const near = (a, b, tol, what) => { if (!(Math.abs(a - b) <= tol)) { console.error("FAIL", what, a, "expected", b); process.exitCode = 1; } else console.log("ok  ", what, +(+a).toFixed(4)); };

/* Worked example: 2.0 x 1.2 m box, 30 m at 1 in 300, n 0.013, Q 4.0 m3/s, TW 21.30 */
const ex = C.run({});
const yc = Math.cbrt(4 * 4 / (g * 4));
near(ex.design.out.yc, yc, 1e-6, "box critical depth (q²/gB²)^⅓");
near(ex.design.inlet.w.hw, yc + 1.5 * yc / 2, 1e-6, "unsubmerged inlet: y_c + 1.5 V_c²/2g = 1.75 y_c");
near(ex.inl.Q2, 0.6 * 2.4 * Math.sqrt(2 * g * (1.4 * 1.2 - 0.6)), 1e-9, "q₂ = C_d A √(2g(t₂H − H/2))");
near(ex.design.out.Eout, 21.30 + Math.pow(4 / 2.2, 2) / (2 * g), 1e-9, "outlet energy = TW + V²/2g (K_x = 1)");
near(ex.HW, ex.design.out.Ein + 0.5 * ex.design.out.hvIn, 1e-9, "outlet control HW = E_in + K_e V_in²/2g");
if (ex.gov !== "outlet") { console.error("FAIL worked example should be outlet control"); process.exitCode = 1; }

/* Submerged outlet, full throughout: HW = TW + (1 + K_e) V²/2g + S_f L */
const full = C.run({ Q: 5, TW: 22 });
const V = 5 / 2.4, R = 2.4 / 6.4, Sf = 0.013 * 0.013 * V * V / Math.pow(R, 4 / 3);
near(full.design.hwO, 22 + 1.5 * V * V / (2 * g) + Sf * 30, 1e-9, "full-flow outlet control headwater");
near(full.design.out.fullLen, 30, 1e-9, "full throughout");

/* Orifice regime */
const orf = C.run({ Q: 8 });
near(orf.design.hwI, 20.30 + 0.6 + Math.pow(8 / (0.6 * 2.4), 2) / (2 * g), 1e-9, "submerged inlet (orifice) headwater");

/* Uniform flow: tailwater at normal depth gives a uniform profile */
function ynBox(Q, B, S, n) { let lo = 0, hi = 1.2; for (let i = 0; i < 100; i++) { const m = (lo + hi) / 2, A = B * m, Rm = A / (B + 2 * m); if (A * Math.pow(Rm, 2 / 3) * Math.sqrt(S) / n < Q) lo = m; else hi = m; } return (lo + hi) / 2; }
const yn = ynBox(2, 2, 0.1 / 30, 0.013);
const uni = C.run({ Q: 2, TW: 20.20 + yn });
near(uni.design.out.yn, yn, 1e-6, "normal depth (independent bisection)");
near(uni.design.out.yIn, yn, 2e-4, "profile stays at normal depth");
near(uni.design.out.hf, 0.1, 1e-4, "friction loss = bed fall in uniform flow");

/* Circular critical depth satisfies q²T/(gA³) = 1 */
const sc = C.section("circ", 1.2, 1.2), ycc = C.critical(sc, 1.5);
near(1.5 * 1.5 * sc.T(ycc) / (g * Math.pow(sc.A(ycc), 3)), 1, 1e-6, "circular critical condition");
/* Arch: legs plus semicircle when H > B/2 */
const sa = C.section("arch", 3, 2.0);
near(sa.Afull, 3 * 0.5 + Math.PI * 9 / 8, 1e-9, "arch area, 0.5 m legs + semicircle");
near(sa.Pfull, 3 + 2 * 0.5 + Math.PI * 1.5, 1e-9, "arch perimeter");

/* Overtopping split closes the flow balance */
const ot = C.run({ Q: 14, road: 22.2 });
near(ot.over.Qc + 1.7 * 40 * Math.pow(ot.over.hw - 22.2, 1.5), 14, 1e-4, "barrel flow + weir flow = Q");

/* Edge cases must not produce NaN */
[{ shape: "circ", D: 0.9 }, { shape: "arch", B: 3, H: 1.2 }, { shape: "arch", B: 3, H: 2.5, Q: 9 }, { ILo: 20.3 }, { ILo: 20.4 }, { ILo: 19.8 }, { TW: 19 }, { TW: 23, Q: 6 },
 { N: 3, Q: 10 }, { method: "cw" }, { Q: 20 }, { Q: 0.05 }, { inlet: "projecting", Ke: 0.8, Ku: 0.8, Cd: 0.5 }, { Kx: 0.5 }, { Qlow: 0 }, { Lw: 0, Q: 15 }].forEach((inp) => {
  const r = C.run(inp), bad = r.rows.filter((x) => !x.head && /NaN|undefined|Infinity/.test(String(x.val) + x.eq));
  const badC = r.curve.filter((p) => !isFinite(p.hw));
  if (r.error || bad.length || badC.length) { console.error("FAIL for", JSON.stringify(inp), r.warn, bad[0], badC[0]); process.exitCode = 1; } else console.log("ok   no NaN for", JSON.stringify(inp), r.gov, r.HW.toFixed(3));
});

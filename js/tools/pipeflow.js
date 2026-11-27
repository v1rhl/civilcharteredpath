/* Pipe flow and capacity calculator (view "pipeflow").
   Maths lives in js/tools/hydraulics.js (window.Hydraulics); this file is the page.
   Link with inputs prefilled: #pipeflow?Q=<l/s>&S=<N for 1 in N>[&D=<mm>][&mode=cap|depth|flow|grad|dia] */
window.CP_TOOLS = (window.CP_TOOLS || []).concat([{
  id: "pipeflow",
  label: "Pipe flow",
  blurb: "Capacity, part-full depth and velocity of a circular pipe by Colebrook-White or Manning. Solve for gradient or diameter, with the working shown."
}]);

(function () {
  "use strict";
  var H = window.Hydraulics;
  var $ = function (id) { return document.getElementById(id); };
  var view = $("view-pipeflow");
  if (!H || !view) return;

  /* Common UK nominal bores (mm). Check availability in your chosen material. */
  var SIZES = [100, 150, 225, 300, 375, 450, 525, 600, 675, 750, 825, 900, 975, 1050, 1200, 1350, 1500, 1650, 1800, 2100, 2400];
  /* Typical textbook values. Editable on the page. */
  var PRESETS = {
    cw: [
      ["Plastic (PVC-U, PE), new", 0.03],
      ["Clay or concrete, new and clean", 0.15],
      ["Surface water sewer, typical design value", 0.6],
      ["Foul sewer allowing for sliming", 1.5],
      ["Older pipe or poor condition", 3.0]
    ],
    manning: [
      ["Plastic, smooth", 0.010],
      ["Clay or concrete, good condition", 0.013],
      ["Brickwork or older concrete", 0.015],
      ["Corrugated metal", 0.024]
    ]
  };
  var NEEDS = { cap: ["D", "S"], depth: ["D", "S", "Q"], flow: ["D", "S", "y"], grad: ["D", "Q", "p"], dia: ["S", "Q", "p", "std"] };
  var MODE_NAMES = { cap: "Full-bore capacity", depth: "Depth for a flow", flow: "Flow at a depth", grad: "Gradient needed", dia: "Diameter needed" };
  var DEFAULTS = { mode: "cap", method: "cw", D: "225", S: "150", Su: "in", Q: "20", y: "112.5", p: "1", ks: "0.6", n: "0.013", nu: "1.141", vmin: "0.75", vmax: "3", std: true };

  var state = { mode: "cap", method: "cw" };
  var last = null;

  $("pf-sizes").innerHTML = SIZES.map(function (s) { return '<option value="' + s + '">'; }).join("");

  /* ---------- formatting ---------- */
  function sig(x, n) {
    if (x == null || !isFinite(x)) return "–";
    if (x === 0) return "0";
    var d = Math.max(0, n - 1 - Math.floor(Math.log10(Math.abs(x))));
    return x.toFixed(Math.min(d, 6));
  }
  function nuTxt(nu) { return sig(nu * 1e6, 4) + " × 10⁻⁶"; }
  function fx(x, d) { return x == null || !isFinite(x) ? "–" : x.toFixed(d); }
  function oneIn(S) { var N = 1 / S; return "1 in " + (N >= 100 ? Math.round(N) : N >= 10 ? N.toFixed(1) : N.toFixed(2)); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function num(id) { var v = parseFloat($(id).value); return isFinite(v) ? v : NaN; }

  /* ---------- inputs ---------- */
  function setPressed(groupId, attr, val) {
    Array.prototype.forEach.call($(groupId).querySelectorAll("button"), function (b) { b.setAttribute("aria-pressed", String(b.dataset[attr] === val)); });
  }
  function fillPresets() {
    var list = PRESETS[state.method], cur = state.method === "cw" ? num("pf-ks") : num("pf-n");
    var hit = -1;
    $("pf-preset").innerHTML = list.map(function (p, i) {
      if (Math.abs(p[1] - cur) < 1e-9) hit = i;
      return '<option value="' + i + '">' + esc(p[0]) + " (" + (state.method === "cw" ? "kₛ " + p[1] + " mm" : "n " + p[1].toFixed(3)) + ")</option>";
    }).join("") + '<option value="custom">Custom value</option>';
    $("pf-preset").value = hit > -1 ? String(hit) : "custom";
  }
  function syncVisibility() {
    var need = NEEDS[state.mode];
    Array.prototype.forEach.call(view.querySelectorAll("[data-need]"), function (el) { el.hidden = need.indexOf(el.dataset.need) < 0; });
    Array.prototype.forEach.call(view.querySelectorAll("[data-rough]"), function (el) { el.hidden = el.dataset.rough !== state.method; });
    var u = $("pf-Su").value;
    $("pf-S-hint").textContent = u === "in" ? "Enter N for 1 in N, e.g. 150." : u === "pct" ? "Percent fall, e.g. 0.67." : "Metres fall per metre, e.g. 0.0067.";
  }
  function readGradient() {
    var v = num("pf-S"), u = $("pf-Su").value;
    if (!(v > 0)) return NaN;
    return u === "in" ? 1 / v : u === "pct" ? v / 100 : v;
  }
  function rough() {
    return state.method === "manning" ? { method: "manning", n: num("pf-n") } : { method: "cw", ks: num("pf-ks") / 1000, nu: num("pf-nu") * 1e-6 };
  }

  /* ---------- solve ---------- */
  function solve() {
    var m = state.mode, r = rough(), err = [];
    var D = num("pf-D") / 1000, S = readGradient(), Q = num("pf-Q") / 1000, y = num("pf-y") / 1000, p = num("pf-p");
    var need = NEEDS[m];
    if (need.indexOf("D") > -1 && !(D > 0)) err.push("Enter a diameter greater than zero.");
    if (need.indexOf("S") > -1 && !(S > 0)) err.push("Enter a gradient greater than zero.");
    if (need.indexOf("Q") > -1 && !(Q > 0)) err.push("Enter a design flow greater than zero.");
    if (need.indexOf("y") > -1 && !(y > 0)) err.push("Enter a depth of flow greater than zero.");
    if (need.indexOf("p") > -1 && !(p > 0 && p <= 1)) err.push("Design proportional depth must be between 0 and 1.");
    if (r.method === "cw" && !(r.ks >= 0 && r.nu > 0)) err.push("Enter a roughness of zero or more and a viscosity greater than zero.");
    if (r.method === "manning" && !(r.n > 0)) err.push("Enter a Manning's n greater than zero.");
    if (err.length) return { err: err };

    var out = { mode: m, r: r, D: D, S: S, Q: need.indexOf("Q") > -1 ? Q : null, p: p, notes: [] };
    if (m === "flow" && y > D) { out.notes.push("Depth is more than the diameter, so the pipe is taken as running full."); y = D; }
    if (m === "grad") {
      out.S = H.solveGradient(D, Q, r, p);
      if (!out.S) return { err: ["No gradient up to 1 in 1 carries that flow in this pipe. Try a larger diameter."] };
    }
    if (m === "dia") {
      out.Dexact = H.solveDiameter(Q, S, r, p);
      if (!out.Dexact) return { err: ["No diameter up to 20 m carries that flow. Check the units: flow is in litres per second."] };
      out.D = out.Dexact;
      if ($("pf-std").checked) {
        var mm = out.Dexact * 1000, pick = null;
        for (var i = 0; i < SIZES.length; i++) if (SIZES[i] >= mm - 1e-6) { pick = SIZES[i]; break; }
        if (pick) out.D = pick / 1000; else out.notes.push("Larger than the biggest listed size (2400 mm), so the exact diameter is used.");
      }
    }
    out.full = H.fullBore(out.D, out.S, r);
    out.peak = H.peak(out.D, out.S, r);
    if (m === "flow") { out.dp = H.at(out.D, out.S, r, y); out.Q = out.dp.Q; }
    else if (out.Q != null) {
      out.dp = H.depthForFlow(out.D, out.S, r, out.Q);
      if (!out.dp) out.surcharged = true;
    }
    return out;
  }

  /* ---------- render ---------- */
  function tile(k, v, unit, sub, solved) {
    return '<div class="pf-tile' + (solved ? " solved" : "") + '"><span class="k">' + k + '</span><span class="v">' + v + (unit ? "<small>" + unit + "</small>" : "") + "</span>" + (sub ? '<span class="s">' + sub + "</span>" : "") + "</div>";
  }
  function check(cls, label, text) { return '<li><span class="pf-badge ' + cls + '">' + label + "</span><span>" + text + "</span></li>"; }

  function render() {
    syncVisibility();
    var o = solve();
    last = o;
    if (o.err) {
      $("pf-msg").hidden = false; $("pf-msg").innerHTML = o.err.map(esc).join("<br>");
      ["pf-tiles", "pf-checks", "pf-chart", "pf-table", "pf-working"].forEach(function (id) { $(id).innerHTML = ""; });
      $("pf-chart-note").textContent = "";
      renderAssumptions(null);
      return;
    }
    var f = o.full, dp = o.dp, m = o.mode, vmin = num("pf-vmin"), vmax = num("pf-vmax");

    /* tiles */
    var t = "";
    if (m === "grad") t += tile("Gradient needed", oneIn(o.S), "", fx(o.S * 100, 3) + "% · " + sig(o.S, 3) + " m/m", true);
    if (m === "dia") t += tile("Diameter", fx(o.D * 1000, 0), "mm", (o.D !== o.Dexact ? "Exact " + fx(o.Dexact * 1000, 0) + " mm, rounded up" : "Exact solution"), true);
    t += tile("Full-bore capacity", sig(f.Q * 1000, 3), "l/s", sig(f.Q, 3) + " m³/s", m === "cap");
    t += tile("Full-bore velocity", fx(f.V, 2), "m/s", "");
    if (dp) {
      t += tile(m === "flow" ? "Flow at that depth" : "Depth of flow", m === "flow" ? sig(dp.Q * 1000, 3) : fx(dp.y * 1000, 0), m === "flow" ? "l/s" : "mm", "d/D " + fx(dp.p, 3) + " · Q/Qfull " + fx(dp.Q / f.Q, 3), m === "depth" || m === "flow");
      t += tile("Velocity at design flow", fx(dp.V, 2), "m/s", "V/Vfull " + fx(dp.V / f.V, 3));
    }
    $("pf-tiles").innerHTML = t;

    /* messages */
    var msg = o.notes.slice();
    if (o.surcharged) msg.push("The design flow (" + sig(o.Q * 1000, 3) + " l/s) is more than this pipe can carry in open-channel flow (peak " + sig(o.peak.Q * 1000, 3) + " l/s at d/D " + fx(o.peak.p, 2) + "). It would surcharge: increase the diameter or gradient, or check the hydraulic gradient as a pressure pipe.");
    else if (dp && o.Q > f.Q) msg.push("The flow is more than full-bore capacity but less than the theoretical peak near the crown. That margin is unstable in practice, so treat this pipe as running full and surcharging.");
    $("pf-msg").hidden = !msg.length; $("pf-msg").innerHTML = msg.map(esc).join("<br>");

    /* checks */
    var c = "";
    if (o.Q != null && !(m === "flow")) c += o.Q <= f.Q ? check("ok", "OK", "Design flow " + sig(o.Q * 1000, 3) + " l/s is " + fx(o.Q / f.Q * 100, 0) + "% of full-bore capacity " + sig(f.Q * 1000, 3) + " l/s.") : check("warn", "Check", "Design flow is " + fx(o.Q / f.Q * 100, 0) + "% of full-bore capacity.");
    if (vmin >= 0) {
      c += f.V >= vmin ? check("ok", "OK", "Full-bore velocity " + fx(f.V, 2) + " m/s is at least the " + fx(vmin, 2) + " m/s minimum you set.") : check("warn", "Check", "Full-bore velocity " + fx(f.V, 2) + " m/s is below the " + fx(vmin, 2) + " m/s minimum you set. Consider a steeper gradient or smaller pipe.");
      if (dp) c += dp.V >= vmin ? check("ok", "OK", "Velocity at the design flow " + fx(dp.V, 2) + " m/s is at least " + fx(vmin, 2) + " m/s.") : check("warn", "Check", "Velocity at the design flow " + fx(dp.V, 2) + " m/s is below " + fx(vmin, 2) + " m/s, so solids may settle at this flow. Check whether a daily peak reaches it.");
    }
    if (vmax > 0) {
      var vtop = Math.max(f.V, dp ? dp.V : 0, o.peak.V);
      c += vtop <= vmax ? check("ok", "OK", "Highest velocity " + fx(vtop, 2) + " m/s is within the " + fx(vmax, 1) + " m/s maximum you set.") : check("warn", "Check", "Velocity reaches " + fx(vtop, 2) + " m/s, above the " + fx(vmax, 1) + " m/s maximum you set. Consider scour, abrasion and backdrops.");
    }
    if (dp && dp.Fr != null) c += check("info", "Info", "Froude number at the design flow " + fx(dp.Fr, 2) + (Math.abs(dp.Fr - 1) < 0.15 ? ", close to critical: the water surface may be wavy and unstable." : dp.Fr > 1 ? " (supercritical)." : " (subcritical)."));
    $("pf-checks").innerHTML = c;

    renderChart(o);
    renderTable(o);
    renderWorking(o);
    renderAssumptions(o);
  }

  /* ---------- chart: d/D on the vertical axis, ratios across ---------- */
  function renderChart(o) {
    var pts = H.curve(o.D, o.S, o.r, 200);
    var W = 560, Ht = 330, L = 46, R = 16, T = 12, B = 40;
    var xmax = 1.2, pw = W - L - R, ph = Ht - T - B;
    var X = function (v) { return L + v / xmax * pw; }, Y = function (p) { return T + (1 - p) * ph; };
    var g = "";
    for (var i = 0; i <= 6; i++) { var xv = i * 0.2; g += '<line x1="' + X(xv) + '" x2="' + X(xv) + '" y1="' + T + '" y2="' + (T + ph) + '" stroke="var(--line)" stroke-width="1"/><text x="' + X(xv) + '" y="' + (T + ph + 16) + '" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="var(--font-mono)">' + xv.toFixed(1) + "</text>"; }
    for (var j = 0; j <= 5; j++) { var yv = j * 0.2; g += '<line x1="' + L + '" x2="' + (L + pw) + '" y1="' + Y(yv) + '" y2="' + Y(yv) + '" stroke="var(--line)" stroke-width="1"/><text x="' + (L - 8) + '" y="' + (Y(yv) + 4) + '" text-anchor="end" font-size="11" fill="var(--muted)" font-family="var(--font-mono)">' + yv.toFixed(1) + "</text>"; }
    g += '<line x1="' + X(1) + '" x2="' + X(1) + '" y1="' + T + '" y2="' + (T + ph) + '" stroke="var(--muted)" stroke-width="1"/>';
    g += '<text x="' + (L + pw / 2) + '" y="' + (Ht - 4) + '" text-anchor="middle" font-size="12" fill="var(--muted)">Proportion of full-bore value</text>';
    g += '<text transform="translate(12 ' + (T + ph / 2) + ') rotate(-90)" text-anchor="middle" font-size="12" fill="var(--muted)">Proportional depth d/D</text>';
    var lq = pts.map(function (q, k) { return (k ? "L" : "M") + X(q.q).toFixed(1) + " " + Y(q.p).toFixed(1); }).join("");
    var lv = pts.map(function (q, k) { return (k ? "L" : "M") + X(q.v).toFixed(1) + " " + Y(q.p).toFixed(1); }).join("");
    g += '<path d="M' + X(0) + " " + Y(0) + lq.slice(1).replace(/^/, "L") + '" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linejoin="round"/>';
    g += '<path d="M' + X(0) + " " + Y(0) + lv.slice(1).replace(/^/, "L") + '" fill="none" stroke="var(--accent-2)" stroke-width="2" stroke-dasharray="6 4" stroke-linejoin="round"/>';
    /* direct labels near the top */
    var top = pts[pts.length - 1], q80 = pts[159];
    g += '<text x="' + (X(q80.q) - 12) + '" y="' + (Y(0.8) + 4) + '" text-anchor="end" font-size="12" fill="var(--ink)">Q/Qfull</text>';
    g += '<text x="' + (X(pts[69].v) + 6) + '" y="' + (Y(0.35) + 4) + '" font-size="12" fill="var(--ink)">V/Vfull</text>';
    /* design point */
    var note = "Curves for this pipe and roughness. Q peaks at " + fx(o.peak.Q / o.full.Q, 3) + " × full bore at d/D " + fx(o.peak.p, 2) + "; V peaks near d/D 0.81.";
    if (o.dp) {
      var dq = o.dp.Q / o.full.Q, dv = o.dp.V / o.full.V, dpY = Y(o.dp.p);
      g += '<line x1="' + L + '" x2="' + (L + pw) + '" y1="' + dpY + '" y2="' + dpY + '" stroke="var(--muted)" stroke-width="1.5" stroke-dasharray="2 3"/>';
      g += '<circle cx="' + X(dq) + '" cy="' + dpY + '" r="5" fill="var(--accent)" stroke="var(--surface)" stroke-width="2"/>';
      g += '<circle cx="' + X(dv) + '" cy="' + dpY + '" r="5" fill="var(--accent-2)" stroke="var(--surface)" stroke-width="2"/>';
      g += '<text x="' + (L + 6) + '" y="' + (dpY - 6) + '" font-size="11" fill="var(--ink)" font-family="var(--font-mono)">design d/D ' + fx(o.dp.p, 3) + "</text>";
      note = "Design point: d/D " + fx(o.dp.p, 3) + ", Q/Qfull " + fx(dq, 3) + ", V/Vfull " + fx(dv, 3) + ". " + note;
    }
    g += '<line class="pf-cross" x1="' + L + '" x2="' + (L + pw) + '" y1="0" y2="0" stroke="var(--ink)" stroke-width="1" opacity="0"/>';
    g += '<rect class="pf-hit" x="' + L + '" y="' + T + '" width="' + pw + '" height="' + ph + '" fill="transparent"/>';
    $("pf-chart").innerHTML = '<svg viewBox="0 0 ' + W + " " + Ht + '" role="img" aria-label="Proportional flow and velocity curves against proportional depth">' + g + '</svg><div class="pf-tip" hidden></div>';
    $("pf-chart-note").textContent = note;

    var svg = $("pf-chart").querySelector("svg"), tip = $("pf-chart").querySelector(".pf-tip"), cross = svg.querySelector(".pf-cross");
    function move(e) {
      var b = svg.getBoundingClientRect(), sy = (e.clientY - b.top) * Ht / b.height;
      var p = Math.min(1, Math.max(0.005, 1 - (sy - T) / ph)), k = Math.max(0, Math.min(pts.length - 1, Math.round(p * 200) - 1)), q = pts[k];
      cross.setAttribute("y1", Y(q.p)); cross.setAttribute("y2", Y(q.p)); cross.setAttribute("opacity", "0.35");
      tip.hidden = false;
      tip.innerHTML = "d/D <b>" + q.p.toFixed(3) + "</b> · depth <b>" + fx(q.p * o.D * 1000, 0) + " mm</b><br>Q/Qfull <b>" + q.q.toFixed(3) + "</b> = " + sig(q.q * o.full.Q * 1000, 3) + " l/s<br>V/Vfull <b>" + q.v.toFixed(3) + "</b> = " + fx(q.v * o.full.V, 2) + " m/s";
      var px = (e.clientX - b.left), py = Y(q.p) * b.height / Ht;
      tip.style.left = Math.min(px + 12, b.width - tip.offsetWidth - 4) + "px";
      tip.style.top = Math.max(0, py - tip.offsetHeight - 8) + "px";
    }
    function leave() { tip.hidden = true; cross.setAttribute("opacity", "0"); }
    var hit = svg.querySelector(".pf-hit");
    hit.addEventListener("pointermove", move); hit.addEventListener("pointerleave", leave);
  }

  /* ---------- results table (also the source for copy and CSV) ---------- */
  function rows(o) {
    var r = o.r, R = [], f = o.full, dp = o.dp;
    R.push(["Inputs"]);
    R.push(["Solving for", MODE_NAMES[o.mode], ""]);
    R.push(["Internal diameter D", fx(o.D * 1000, 1), "mm", o.mode === "dia"]);
    if (o.mode === "dia") R.push(["Exact diameter to carry Q at d/D " + fx(o.p, 2), fx(o.Dexact * 1000, 1), "mm"]);
    R.push(["Gradient S", oneIn(o.S) + " (" + sig(o.S, 4) + ")", "m/m", o.mode === "grad"]);
    if (r.method === "cw") { R.push(["Method", "Colebrook-White", ""]); R.push(["Roughness ks", sig(r.ks * 1000, 3), "mm"]); R.push(["Kinematic viscosity ν", nuTxt(r.nu), "m²/s"]); }
    else { R.push(["Method", "Manning", ""]); R.push(["Manning's n", fx(r.n, 4), "s/m^(1/3)"]); }
    if (o.Q != null && o.mode !== "flow") R.push(["Design flow Q", sig(o.Q * 1000, 4), "l/s"]);
    if (o.mode === "grad" || o.mode === "dia") R.push(["Design proportional depth", fx(o.p, 3), "d/D"]);
    R.push(["Full bore"]);
    R.push(["Area A", sig(f.A, 4), "m²"]);
    R.push(["Hydraulic radius R = D/4", sig(f.R, 4), "m"]);
    R.push(["Velocity V_full", fx(f.V, 3), "m/s"]);
    R.push(["Capacity Q_full", sig(f.Q * 1000, 4), "l/s", o.mode === "cap"]);
    R.push(["Peak open-channel flow", sig(o.peak.Q * 1000, 4) + " at d/D " + fx(o.peak.p, 3), "l/s"]);
    if (dp) {
      R.push(["At design flow"]);
      R.push(["Depth d", fx(dp.y * 1000, 1), "mm", o.mode === "depth"]);
      R.push(["Proportional depth d/D", fx(dp.p, 3), ""]);
      R.push(["Angle θ", fx(dp.theta, 4), "rad"]);
      R.push(["Flow area A", sig(dp.A, 4), "m²"]);
      R.push(["Wetted perimeter P", sig(dp.P, 4), "m"]);
      R.push(["Hydraulic radius R", sig(dp.R, 4), "m"]);
      R.push(["Velocity V", fx(dp.V, 3), "m/s"]);
      R.push(["Flow Q", sig(dp.Q * 1000, 4), "l/s", o.mode === "flow"]);
      R.push(["Q/Q_full", fx(dp.Q / f.Q, 3), ""]);
      R.push(["V/V_full", fx(dp.V / f.V, 3), ""]);
      if (dp.Fr != null) R.push(["Froude number", fx(dp.Fr, 2), ""]);
    }
    return R;
  }
  function propRows(o) {
    var out = [["d/D", "Depth (mm)", "Q/Qfull", "Q (l/s)", "V/Vfull", "V (m/s)"]];
    for (var i = 1; i <= 20; i++) {
      var p = i / 20, a = H.at(o.D, o.S, o.r, p * o.D);
      out.push([p.toFixed(2), fx(p * o.D * 1000, 1), fx(a.Q / o.full.Q, 3), sig(a.Q * 1000, 4), fx(a.V / o.full.V, 3), fx(a.V, 3)]);
    }
    return out;
  }
  function renderTable(o) {
    $("pf-table").innerHTML = rows(o).map(function (x) {
      if (x.length === 1) return '<tr class="grp"><td colspan="3">' + esc(x[0]) + "</td></tr>";
      return "<tr" + (x[3] ? ' class="hl"' : "") + "><td>" + esc(x[0]) + '</td><td class="num">' + esc(x[1]) + '</td><td class="u">' + esc(x[2]) + "</td></tr>";
    }).join("");
  }

  /* ---------- working with numbers substituted ---------- */
  function renderWorking(o) {
    var r = o.r, f = o.full, D = o.D, S = o.S, h = "";
    var gD = Math.sqrt(2 * H.G * D * S);
    h += '<p class="small">Full bore, D = ' + fx(D, 4) + " m, S = " + sig(S, 4) + " (" + oneIn(S) + ")" + "</p>";
    if (r.method === "cw") {
      var t1 = r.ks / (3.7 * D), t2 = 2.51 * r.nu / (D * gD);
      h += '<div class="pf-eq">V = −2 √(2gDS) · log₁₀[ k_s / (3.7D) + 2.51ν / (D √(2gDS)) ]\n' +
        "√(2gDS) = √(2 × 9.81 × " + fx(D, 4) + " × " + sig(S, 4) + ") = " + sig(gD, 4) + " m/s\n" +
        "k_s / (3.7D) = " + sig(r.ks, 3) + " / (3.7 × " + fx(D, 4) + ") = " + sig(t1, 4) + "\n" +
        "2.51ν / (D√(2gDS)) = 2.51 × " + nuTxt(r.nu) + " / (" + fx(D, 4) + " × " + sig(gD, 4) + ") = " + sig(t2, 4) + "\n" +
        "V = −2 × " + sig(gD, 4) + " × log₁₀(" + sig(t1 + t2, 4) + ") = " + fx(f.V, 3) + " m/s\n" +
        "Q = V × πD²/4 = " + fx(f.V, 3) + " × " + sig(f.A, 4) + " = " + sig(f.Q, 4) + " m³/s = " + sig(f.Q * 1000, 4) + " l/s</div>";
    } else {
      h += '<div class="pf-eq">V = R^(2/3) S^(1/2) / n,  R = D/4 = ' + sig(f.R, 4) + " m\n" +
        "V = " + sig(f.R, 4) + "^(2/3) × " + sig(S, 4) + "^(1/2) / " + fx(r.n, 4) + " = " + fx(f.V, 3) + " m/s\n" +
        "Q = V × πD²/4 = " + fx(f.V, 3) + " × " + sig(f.A, 4) + " = " + sig(f.Q, 4) + " m³/s = " + sig(f.Q * 1000, 4) + " l/s</div>";
    }
    if (o.dp) {
      var d = o.dp;
      h += '<p class="small">Part-full, depth d = ' + fx(d.y * 1000, 1) + " mm (d/D = " + fx(d.p, 4) + ")</p>";
      h += '<div class="pf-eq">θ = 2 acos(1 − 2d/D) = 2 acos(' + fx(1 - 2 * d.p, 4) + ") = " + fx(d.theta, 4) + " rad\n" +
        "A = D²(θ − sin θ)/8 = " + sig(d.A, 4) + " m²\n" +
        "P = Dθ/2 = " + sig(d.P, 4) + " m\n" +
        "R = A/P = " + sig(d.R, 4) + " m\n" +
        (r.method === "cw" ? "V from Colebrook-White with D replaced by 4R = " + sig(4 * d.R, 4) + " m:  V = " + fx(d.V, 3) + " m/s\n" : "V = R^(2/3) S^(1/2) / n = " + fx(d.V, 3) + " m/s\n") +
        "Q = V × A = " + sig(d.Q * 1000, 4) + " l/s   (Q/Q_full = " + fx(d.Q / f.Q, 3) + ", V/V_full = " + fx(d.V / f.V, 3) + ")</div>";
      if (o.mode === "depth" || o.mode === "grad" || o.mode === "dia") h += '<p class="small">Depth found by bisection on d/D between 0 and the peak-flow depth, taking the lower depth that carries Q.</p>';
    }
    if (o.mode === "grad") h += '<p class="small">Gradient found by bisection on S so that the flow at d/D = ' + fx(o.p, 2) + " equals " + sig(o.Q * 1000, 4) + " l/s.</p>";
    if (o.mode === "dia") h += '<p class="small">Diameter found by bisection on D so that the flow at d/D = ' + fx(o.p, 2) + " equals " + sig(o.Q * 1000, 4) + " l/s, giving " + fx(o.Dexact * 1000, 1) + " mm" + (o.D !== o.Dexact ? ", then rounded up to " + fx(o.D * 1000, 0) + " mm and the depth recalculated." : ".") + "</p>";
    $("pf-working").innerHTML = h;
  }

  function renderAssumptions(o) {
    var cw = state.method === "cw";
    var a = [
      "Steady, uniform flow: the water surface is parallel to the pipe invert and the friction slope equals the pipe gradient. No backwater, surcharge downstream, junction or entry losses.",
      "Circular pipe of constant internal diameter, flowing as an open channel (free surface) at part depths. Enter the internal bore, not a nominal or external size.",
      cw ? "Colebrook-White with g = 9.81 m/s². Part-full flow uses the same equation with the diameter replaced by four times the hydraulic radius (4R), which is the usual approach for sewers." : "Manning's n is taken as constant with depth. In reality n varies a little with depth, which Manning doesn't capture; Colebrook-White handles part-full flow more consistently.",
      cw ? "Roughness k_s is a single equivalent value for the whole pipe and includes any allowance for sliming or deterioration you choose. Viscosity " + num("pf-nu") + " × 10⁻⁶ m²/s." : "Roughness is a single n value for the whole pipe, including any allowance for deterioration you choose.",
      "Flow above about 0.94 of the diameter can exceed full-bore flow in theory, but it is unstable. Treat any flow above full-bore capacity as surcharging.",
      "Velocity checks compare against the minimum and maximum you set. They are a screening check, not a self-cleansing or scour design to any particular standard."
    ];
    if (state.mode === "dia" && $("pf-std").checked) a.push("Standard sizes are common UK nominal bores. Availability and true internal diameter depend on the pipe material and manufacturer.");
    $("pf-assume").innerHTML = a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("");
  }

  /* ---------- copy, CSV and links ---------- */
  function tableText(o, sep) {
    var q = function (s) { s = String(s); return sep === "," && /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    var lines = ["Pipe flow calculation" + sep + new Date().toISOString().slice(0, 10)];
    rows(o).forEach(function (x) { lines.push(x.length === 1 ? q(x[0]) : [x[0], x[1], x[2]].map(q).join(sep)); });
    lines.push(""); lines.push("Proportional depth table");
    propRows(o).forEach(function (x) { lines.push(x.map(q).join(sep)); });
    return lines.join("\n");
  }
  function flash(t) { $("pf-copied").textContent = t; clearTimeout(flash.t); flash.t = setTimeout(function () { $("pf-copied").textContent = ""; }, 2500); }
  function copy(text, done) {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { flash(done); }, fallback);
    else fallback();
    function fallback() { var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); flash(done); } catch (e) { flash("Couldn't copy"); } ta.remove(); }
  }
  $("pf-copy").addEventListener("click", function () { if (last && !last.err) copy(tableText(last, "\t"), "Copied. Paste into a spreadsheet."); });
  $("pf-csv").addEventListener("click", function () {
    if (!last || last.err) return;
    var name = "pipe-flow-" + fx(last.D * 1000, 0) + "mm.csv", rowsArr = tableText(last, ",");
    var blob = new Blob(["﻿" + rowsArr], { type: "text/csv;charset=utf-8" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
    flash("Downloaded " + name);
  });
  function linkFor() {
    var p = ["mode=" + state.mode, "method=" + state.method];
    [["D", "pf-D"], ["S", "pf-S"], ["Q", "pf-Q"], ["y", "pf-y"], ["p", "pf-p"], ["ks", "pf-ks"], ["n", "pf-n"]].forEach(function (k) { p.push(k[0] + "=" + encodeURIComponent($(k[1]).value)); });
    if ($("pf-Su").value !== "in") p.push("Su=" + $("pf-Su").value);
    return location.href.split("#")[0] + "#pipeflow?" + p.join("&");
  }
  $("pf-link").addEventListener("click", function () { copy(linkFor(), "Link copied with these inputs."); });

  /* ---------- wiring ---------- */
  function setMode(m) { state.mode = m; setPressed("pf-mode", "mode", m); render(); }
  function setMethod(m) { state.method = m; setPressed("pf-method", "method", m); fillPresets(); render(); }
  $("pf-mode").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) setMode(b.dataset.mode); });
  $("pf-method").addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) setMethod(b.dataset.method); });
  $("pf-preset").addEventListener("change", function () {
    var v = $("pf-preset").value; if (v === "custom") return;
    var p = PRESETS[state.method][+v];
    if (state.method === "cw") $("pf-ks").value = p[1]; else $("pf-n").value = p[1].toFixed(3);
    render();
  });
  $("pf-form").addEventListener("input", function (e) {
    if (e.target.id === "pf-ks" || e.target.id === "pf-n") fillPresets();
    render();
  });
  $("pf-form").addEventListener("change", function (e) { if (e.target.id === "pf-Su" || e.target.id === "pf-std") render(); });
  $("pf-form").addEventListener("submit", function (e) { e.preventDefault(); });

  function apply(v) {
    ["D", "S", "Q", "y", "p", "ks", "n", "nu", "vmin", "vmax"].forEach(function (k) { if (v[k] != null) $("pf-" + k).value = v[k]; });
    if (v.Su) $("pf-Su").value = v.Su;
    if (v.std != null) $("pf-std").checked = !!v.std;
    state.method = v.method === "manning" ? "manning" : v.method === "cw" ? "cw" : state.method;
    setPressed("pf-method", "method", state.method);
    fillPresets();
    setMode(NEEDS[v.mode] ? v.mode : state.mode);
  }
  $("pf-reset").addEventListener("click", function () { apply(DEFAULTS); });
  /* Worked example: 225 mm surface water sewer at 1 in 150, ks 0.6 mm, carrying 20 l/s. */
  $("pf-example").addEventListener("click", function () { apply({ mode: "depth", method: "cw", D: "225", S: "150", Su: "in", Q: "20", ks: "0.6", nu: "1.141", vmin: "0.75", vmax: "3" }); });

  /* Prefill from the hash, e.g. #pipeflow?Q=35&S=200 from the runoff tool. Only acts when the query changes. */
  var lastQuery = null;
  function fromHash() {
    var h = location.hash.slice(1), i = h.indexOf("?"), name = i > -1 ? h.slice(0, i) : h;
    document.body.classList.toggle("on-pipeflow", name === "pipeflow");
    if (name !== "pipeflow") return;
    var qs = i > -1 ? h.slice(i + 1) : "";
    if (qs === lastQuery) return;
    lastQuery = qs;
    if (!qs) return;
    var v = {};
    qs.split("&").forEach(function (kv) { var p = kv.split("="); if (p[0]) v[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ""); });
    if (!v.mode) v.mode = v.Q && !v.D ? "dia" : v.Q ? "depth" : "cap";
    if (v.S && !v.Su) v.Su = "in";
    apply(v);
  }
  window.addEventListener("hashchange", fromHash);

  apply(DEFAULTS);
  fromHash();
})();

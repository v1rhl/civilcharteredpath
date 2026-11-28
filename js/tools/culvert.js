/* Tools: culvert hydraulic design check (view "culvert"). Builds its own view; the maths is in js/tools/culvert-calc.js (window.CulvertCalc).
   Link with the flow prefilled: #culvert?Q=<m3/s> or #culvert?Qls=<l/s> (the catchment tool uses Qls). */
(function () {
  "use strict";
  var ID = "culvert";
  window.CP_TOOLS = (window.CP_TOOLS || []).concat([{ id: ID, label: "Culvert", blurb: "Hydraulic check of a culvert crossing: inlet and outlet control headwater, performance curve, freeboard, overtopping and velocities, with a long section and plan." }]);
  var C = window.CulvertCalc, X = window.CPExport;
  var main = document.querySelector("main"); if (!main || !C) return;

  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function f(v, n) { if (typeof v !== "number") return esc(v); if (!isFinite(v)) return "–"; return v.toFixed(n == null ? 3 : n); }
  function $(id) { return document.getElementById(id); }
  var V = "#view-" + ID + " ";

  /* ---------- styles (scoped to this view) ---------- */
  var css = document.createElement("style");
  css.textContent = [
    V + ".cv-grid{display:grid;grid-template-columns:minmax(0,370px) minmax(0,1fr);gap:16px;align-items:start}",
    "@media (max-width:900px){" + V + ".cv-grid{grid-template-columns:minmax(0,1fr)}}",
    V + ".cv-in{gap:0;padding:6px 16px}",
    V + ".cv-in details{border-top:1px solid var(--tool-line,var(--line));padding:10px 0}",
    V + ".cv-in details:first-of-type{border-top:0}",
    V + ".cv-in summary{cursor:pointer;font-weight:700;font-family:var(--font-display)}",
    V + ".cv-fields{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px 12px;margin-top:10px}",
    V + ".cv-fields .field.wide{grid-column:1/-1}",
    V + ".field label{font-size:.84rem;line-height:1.25}",
    V + ".field input,#view-culvert .field select{width:100%;min-width:0}",
    V + ".field .u{font:500 .72rem var(--font-mono);color:var(--muted)}",
    V + ".field .std{font:600 .66rem var(--font-mono);color:var(--accent-2);text-transform:uppercase;letter-spacing:.04em;margin-left:4px}",
    V + ".cv-out{display:flex;flex-direction:column;gap:16px;min-width:0}",
    V + ".cv-tiles{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:10px}",
    V + ".cv-tile{border:1px solid var(--line);border-radius:8px;padding:10px 12px;background:var(--surface);display:flex;flex-direction:column;gap:2px}",
    V + ".cv-tile .k{font-size:.76rem;color:var(--muted)}",
    V + ".cv-tile .v{font:600 1.35rem var(--font-mono);font-variant-numeric:tabular-nums;color:var(--ink)}",
    V + ".cv-tile .v small{font-size:.75rem;margin-left:3px;color:var(--muted)}",
    V + ".cv-tile .s{font-size:.76rem;color:var(--muted)}",
    V + ".cv-tile.gov{border-color:var(--accent);box-shadow:inset 3px 0 0 var(--accent)}",
    V + ".cv-checks{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:8px;font-size:.9rem}",
    V + ".cv-checks li{display:grid;grid-template-columns:64px minmax(0,1fr);gap:10px;align-items:start}",
    V + ".cv-checks .why{display:block;color:var(--muted);font-size:.84rem}",
    V + ".tag{font:600 .72rem var(--font-mono);padding:2px 6px;border-radius:4px;background:var(--accent-soft);color:var(--accent);text-align:center}",
    V + ".tag.bad{background:var(--accent-2-soft);color:var(--accent-2)}",
    V + ".tag.info{background:var(--line);color:var(--ink)}",
    V + ".cv-chart{position:relative}",
    V + ".cv-chart svg{width:100%;height:auto;display:block;touch-action:none}",
    V + ".cv-tip{position:absolute;pointer-events:none;background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:6px 8px;font:500 .78rem var(--font-mono);color:var(--ink);box-shadow:0 2px 8px rgba(0,0,0,.12);white-space:nowrap}",
    V + ".cv-legend{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:.8rem;color:var(--muted);margin:4px 0 0}",
    V + ".cv-legend i{display:inline-block;width:22px;height:0;border-top:2px solid;vertical-align:middle;margin-right:6px}",
    V + ".cv-fig{background:#fff;border:1px solid var(--line);border-radius:6px;overflow:hidden}",
    V + ".cv-fig svg{width:100%;height:auto;display:block}",
    V + ".cv-tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center}",
    V + ".cv-tools .btn{padding:7px 12px;font-size:.88rem}",
    V + ".cv-calc{font-size:.84rem;width:100%}",
    V + ".cv-calc td{padding:5px 8px 5px 0;width:auto;font-weight:400;color:var(--ink);vertical-align:top}",
    V + ".cv-calc td.ref{font-family:var(--font-mono);color:var(--muted);white-space:nowrap}",
    V + ".cv-calc td.eq{font-family:var(--font-mono);font-size:.78rem;color:var(--muted)}",
    V + ".cv-calc td.v{font-family:var(--font-mono);text-align:right;white-space:nowrap}",
    V + ".cv-calc tr.h td{font-weight:700;font-family:var(--font-display);padding-top:16px;border-top:2px solid var(--accent)}",
    V + ".cv-calc th{text-align:left;font-size:.76rem;color:var(--muted);padding:4px 8px 4px 0}",
    V + ".cv-cs>summary{list-style:none;display:inline-flex}" + V + ".cv-cs>summary::-webkit-details-marker{display:none}",
    V + ".cv-lim{margin:0;padding-left:18px;font-size:.86rem;color:var(--muted);display:flex;flex-direction:column;gap:4px}",
    V + ".cv-note{margin:0;padding-left:18px;font-size:.88rem}",
    V + ".cv-grad{font:500 .8rem var(--font-mono);color:var(--muted);grid-column:1/-1}",
    "@media (max-width:520px){" + V + ".cv-calc td.eq," + V + ".cv-calc th.eq{display:none}" + V + ".cv-fields{grid-template-columns:minmax(0,1fr)}}"
  ].join("\n");
  document.head.appendChild(css);

  /* ---------- view ---------- */
  var DISC = "Indicative only. Not a substitute for a proper design check. Coefficients are placeholders from general hydraulic theory, not values from any design manual; set them yourself. Not checked against, and does not claim compliance with, any standard.";
  var sec = document.createElement("section");
  sec.className = "view wrap"; sec.id = "view-" + ID; sec.dataset.view = ID; sec.hidden = true;
  sec.innerHTML =
    '<div class="view-head"><span class="eyebrow"><a href="#tools" style="color:inherit;text-decoration:none">Tools</a> / Culvert</span><h2>Culvert hydraulic check</h2>' +
    '<p class="lede">Check a culvert crossing for a design flow. The tool works out the headwater under inlet control and under outlet control separately, reports which governs, and checks freeboard, overtopping and velocities. Everything updates as you type.</p></div>' +
    '<div class="notice" role="note"><div><p><strong>Indicative only. Not a substitute for a proper design check.</strong> It works from weir, orifice, energy and gradually varied flow theory with your coefficients. ' +
    'Published culvert design manuals use inlet-control relations calibrated by testing for particular inlet shapes; this tool does not reproduce them, so where inlet control governs, check the result against the method your client or authority requires. ' +
    'Defaults marked <span style="font:600 .7rem var(--font-mono);color:var(--accent-2)">SET</span> are placeholders for you to replace.</p></div></div>' +
    '<div class="cv-grid">' +
      '<form class="panel tool cv-in" id="cv-form" autocomplete="off" onsubmit="return false"></form>' +
      '<div class="cv-out">' +
        '<div class="panel"><div id="cv-msg"></div><div class="cv-tiles" id="cv-tiles"></div></div>' +
        '<div class="panel"><h3>Checks</h3><ul class="cv-checks" id="cv-checks"></ul></div>' +
        '<div class="panel"><h3>Performance curve</h3><p class="small">Headwater level against total flow through the barrels, with the tailwater held at your level. The governing curve is the higher of the two controls at each flow.</p>' +
          '<div class="cv-chart" id="cv-chart"></div><div class="cv-legend" id="cv-legend"></div><p class="small" id="cv-chart-note"></p></div>' +
      '</div>' +
    '</div>' +
    '<div class="panel"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:baseline"><h3>Long section and plan</h3>' +
      '<div class="cv-tools"><button type="button" class="btn ghost" id="cv-png">PNG</button><button type="button" class="btn ghost" id="cv-svgdl">SVG</button><button type="button" class="btn" id="cv-pdf">PDF (drawing and calcs)</button><button type="button" class="btn ghost" id="cv-sketch" hidden>Send to sketch pad</button></div></div>' +
      '<p class="small">A3 sheet, dimensioned in metres. Black on white so it prints and exports the same in either theme.</p>' +
      '<div class="cv-fig" id="cv-svg"></div><p class="small" id="cv-status" role="status"></p></div>' +
    '<div class="panel"><div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap;align-items:baseline"><h3>Calculation sheet</h3>' +
      '<div class="cv-tools"><button type="button" class="btn" id="cv-xlsx">Excel (XLSX)</button><button type="button" class="btn ghost" id="cv-csv">CSV</button></div></div>' +
      '<p class="small">Every input, equation and intermediate value at the design flow, with your numbers substituted. The spreadsheet also holds the inputs and the performance curve.</p>' +
      '<details class="cv-cs" id="cv-cs" open><summary class="btn ghost">Hide the calculation sheet</summary><div class="table-wrap" style="margin-top:12px"><table class="cv-calc" id="cv-calc"></table></div></details></div>' +
    '<details class="panel ref"><summary><span class="eyebrow">Method, assumptions and what is left out</span></summary><ul class="cv-lim" id="cv-assume"></ul></details>';
  main.appendChild(sec);

  /* ---------- inputs ---------- */
  var D0 = C.DEFAULTS, KEY = "cp-culvert";
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  var state = (function () { try { var s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && s.v === 1) return s.d; } catch (e) {} return null; })() || clone(D0);
  for (var k0 in D0) if (state[k0] === undefined) state[k0] = D0[k0];
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ v: 1, d: state })); } catch (e) {} }

  /* Typical textbook roughness values. Editable; check against your material supplier. */
  var ROUGH = {
    manning: [["Precast concrete, good condition", 0.013], ["Concrete, rough or older", 0.015], ["Plastic, smooth bore", 0.011], ["Masonry or brick", 0.017], ["Corrugated steel, unlined", 0.024]],
    cw: [["Precast concrete, typical design value", 0.6], ["Plastic, smooth bore", 0.06], ["Masonry or brick", 3], ["Corrugated steel, unlined", 15]]
  };
  var INL = C.INLETS;
  /* [key, label, unit, options|type, cls, help, cond, std] */
  var G = [
    { t: "Project", f: [["project", "Project", "", "text", "wide"], ["ref", "Culvert reference", "", "text"]] },
    { t: "Design flow", open: true, f: [["Q", "Design flow Q", "m³/s", null, "", "", "", false, "flow"], ["N", "Number of barrels", "", null, "", "Flow splits equally between identical barrels."]] },
    { t: "Barrel", open: true, f: [
      ["shape", "Barrel shape", "", [["box", "Box (rectangular)"], ["circ", "Circular pipe"], ["arch", "Arch on a flat invert"]], "wide"],
      ["D", "Internal diameter D", "m", null, "", "", "circ"], ["B", "Internal span B", "m", null, "", "", "notcirc"], ["H", "Internal rise H", "m", null, "", "", "notcirc"],
      ["t", "Wall and slab thickness", "m", null, "", "For the drawing only."], ["L", "Barrel length L", "m"],
      ["ILi", "Inlet invert level", "m"], ["ILo", "Outlet invert level", "m"]] },
    { t: "Material and roughness", f: [
      ["method", "Friction formula", "", [["manning", "Manning"], ["cw", "Colebrook-White"]], "wide"],
      ["preset", "Material", "", "preset", "wide"],
      ["n", "Manning's n", "s/m^⅓", null, "", "", "manning", true], ["ks", "Roughness k_s", "mm", null, "", "", "cw", true], ["nu", "Kinematic viscosity ν", "× 10⁻⁶ m²/s", null, "", "1.141 at 15 °C.", "cw"]] },
    { t: "Inlet and outlet", f: [
      ["inlet", "Inlet type", "", Object.keys(INL).map(function (k) { return [k, INL[k].label]; }), "wide", "Picking a type fills the three inlet coefficients with textbook pipe-entrance values. Replace them with values you are satisfied with."],
      ["Ke", "Entrance loss K_e (outlet control)", "", null, "", "Multiplies the barrel velocity head at entry.", "", true],
      ["Ku", "Unsubmerged entry loss K_u", "", null, "", "Multiplies the critical velocity head when the inlet is not submerged.", "", true],
      ["Cd", "Orifice coefficient C_d", "", null, "", "For the submerged inlet, on the full barrel area.", "", true],
      ["Kx", "Exit loss K_x", "", null, "", "1.0 = the full velocity head is lost (sudden expansion).", "", true],
      ["t1", "Inlet unsubmerged up to HW/H", "", null, "", "", "", true], ["t2", "Inlet submerged from HW/H", "", null, "", "Straight-line transition between the two.", "", true]] },
    { t: "Tailwater and road", open: true, f: [
      ["TW", "Tailwater level at the design flow", "m", null, "wide", "From a downstream channel or outfall calculation. Set it below the outlet invert for a free outfall."],
      ["road", "Road level over the culvert", "m", null, "", "Lowest level where water would overtop."], ["crestW", "Road or crest width", "m", null, "", "For the drawing."],
      ["slope", "Embankment side slope, 1 in", "", null, "", "For the drawing."], ["Lw", "Overtopping length along the road", "m", null, "", "0 to ignore overtopping flow."],
      ["Cw", "Overtopping weir coefficient", "m^½/s", null, "", "1.70 is the theoretical broad-crested value.", "", true]] },
    { t: "Your design criteria", f: [
      ["fb", "Minimum freeboard to road", "m", null, "", "", "", true], ["hwRatio", "Maximum HW/H", "", null, "", "0 to skip.", "", true],
      ["vScour", "Maximum barrel velocity", "m/s", null, "", "Scour or abrasion limit.", "", true], ["vSed", "Minimum velocity at design flow", "m/s", null, "", "To keep sediment moving.", "", true],
      ["vOut", "Permissible velocity in the receiving channel", "m/s", null, "wide", "Depends on the bed and bank material.", "", true],
      ["Qlow", "Low flow for fish passage", "m³/s", null, "", "0 to skip.", "", true], ["vFish", "Maximum velocity at low flow", "m/s", null, "", "", "", true],
      ["dFish", "Minimum depth at low flow", "m", null, "", "", "", true]],
      note: "Every criterion here is a placeholder. Use the values from your client, the highway or drainage authority, and your environmental and fisheries advice." }
  ];
  var LAB = {}; G.forEach(function (g) { g.f.forEach(function (d) { LAB[d[0]] = d; }); });

  function presetHtml() {
    var list = ROUGH[state.method] || ROUGH.manning, cur = +(state.method === "cw" ? state.ks : state.n), hit = -1;
    var o = list.map(function (p, i) { if (Math.abs(p[1] - cur) < 1e-9) hit = i; return '<option value="' + i + '">' + esc(p[0]) + " (" + (state.method === "cw" ? p[1] + " mm" : "n " + p[1].toFixed(3)) + ")</option>"; }).join("") + '<option value="custom">Custom value</option>';
    return '<select id="cv-preset" data-k="preset">' + o.replace('value="' + (hit > -1 ? hit : "custom") + '"', 'value="' + (hit > -1 ? hit : "custom") + '" selected') + "</select>";
  }
  function fieldHtml(d) {
    var k = d[0], lab = d[1], u = d[2], opts = d[3], cls = d[4] || "", help = d[5] || "", cond = d[6] || "", std = d[7], extra = d[8];
    var v = state[k], ca = cond ? ' data-cond="' + cond + '"' : "", ctl;
    if (opts === "preset") ctl = presetHtml();
    else if (Array.isArray(opts)) ctl = '<select id="cv-' + k + '" data-k="' + k + '">' + opts.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (String(o[0]) === String(v) ? " selected" : "") + ">" + esc(o[1]) + "</option>"; }).join("") + "</select>";
    else if (opts === "text") ctl = '<input type="text" id="cv-' + k + '" data-k="' + k + '" value="' + esc(v) + '">';
    else ctl = '<input type="number" step="any" inputmode="decimal" id="cv-' + k + '" data-k="' + k + '" value="' + esc(v) + '">';
    var after = extra === "flow" ? '<button type="button" class="btn ghost" id="cv-fromct" style="margin-top:6px;padding:4px 10px;font-size:.8rem">Use the catchment tool\'s peak flow</button><span class="small" id="cv-fromct-msg"></span>' : "";
    return '<div class="field ' + cls + '"' + ca + '><label for="cv-' + k + '">' + esc(lab) + (u ? ' <span class="u">' + esc(u) + "</span>" : "") + (std ? '<span class="std" title="Placeholder default: set your own value">set</span>' : "") + "</label>" + ctl + (help ? '<span class="small">' + esc(help) + "</span>" : "") + after + "</div>";
  }
  function buildForm() {
    $("cv-form").innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:8px 0"><span class="eyebrow">Inputs</span><button type="button" class="btn ghost" id="cv-reset" style="padding:4px 10px;font-size:.82rem">Reset to worked example</button></div>' +
      G.map(function (g) {
        var grad = g.t === "Barrel" ? '<span class="cv-grad" id="cv-grad"></span>' : "";
        return "<details" + (g.open ? " open" : "") + "><summary>" + esc(g.t) + '</summary><div class="cv-fields">' + g.f.map(fieldHtml).join("") + grad + "</div>" + (g.note ? '<p class="small" style="margin-top:8px">' + esc(g.note) + "</p>" : "") + "</details>";
      }).join("") + '<p class="small" style="padding:10px 0">Inputs are kept in this browser only.</p>';
    conds();
  }
  function conds() {
    Array.prototype.forEach.call($("cv-form").querySelectorAll("[data-cond]"), function (el) {
      var c = el.dataset.cond, on = true;
      if (c === "circ") on = state.shape === "circ"; else if (c === "notcirc") on = state.shape !== "circ";
      else if (c === "manning" || c === "cw") on = state.method === c;
      el.hidden = !on;
    });
  }
  function onInput(e) {
    var t = e.target, k = t.dataset.k; if (!k) return;
    if (k === "preset") {
      if (t.value !== "custom") { var p = (ROUGH[state.method] || ROUGH.manning)[+t.value]; state[state.method === "cw" ? "ks" : "n"] = p[1]; buildForm(); }
    } else {
      state[k] = t.value;
      if (k === "inlet" && INL[t.value] && INL[t.value].Ke != null && e.type === "change") { ["Ke", "Ku", "Cd"].forEach(function (c) { state[c] = INL[t.value][c]; }); buildForm(); }
      else if ((k === "Ke" || k === "Ku" || k === "Cd") && state.inlet !== "custom") { var P = INL[state.inlet]; if (P && +state[k] !== P[k]) { state.inlet = "custom"; var sel = $("cv-inlet"); if (sel) sel.value = "custom"; } }
      if ((k === "method" || k === "shape") && e.type === "change") buildForm();
      if ((k === "n" || k === "ks") && e.type === "change") { var ps = $("cv-preset"); if (ps) ps.outerHTML = presetHtml(); }
      conds();
    }
    save(); schedule();
  }
  $("cv-form").addEventListener("input", onInput);
  $("cv-form").addEventListener("change", onInput);
  $("cv-form").addEventListener("click", function (e) {
    if (e.target.id === "cv-reset") { state = clone(D0); save(); buildForm(); update(); }
    if (e.target.id === "cv-fromct") {
      var c = window.CPCatchment && window.CPCatchment.peakLs && window.CPCatchment.peakLs();
      if (c > 0) { state.Q = +(c / 1000).toFixed(3); $("cv-Q").value = state.Q; $("cv-fromct-msg").textContent = " Took " + f(c, 0) + " l/s from the catchment tool."; save(); update(); }
      else $("cv-fromct-msg").textContent = " Open the catchment tool and enter a catchment first.";
    }
  });
  var timer = null;
  function schedule() { clearTimeout(timer); timer = setTimeout(update, 60); }

  /* ---------- results ---------- */
  var last = null;
  function tile(k, v, unit, sub, gov) { return '<div class="cv-tile' + (gov ? " gov" : "") + '"><span class="k">' + k + '</span><span class="v">' + v + (unit ? "<small>" + unit + "</small>" : "") + "</span>" + (sub ? '<span class="s">' + sub + "</span>" : "") + "</div>"; }
  function update() {
    var r = C.run(state); last = r;
    var g = $("cv-grad"); if (g) g.textContent = isFinite(r.S0) ? "Gradient " + C.oneIn(r.S0) + " (" + f(r.S0 * 100, 3) + "%)" : "";
    if (r.error) {
      $("cv-msg").innerHTML = '<div class="notice" role="alert"><ul class="cv-note">' + r.warn.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") + "</ul></div>";
      ["cv-tiles", "cv-checks", "cv-chart", "cv-legend", "cv-calc", "cv-svg"].forEach(function (id) { $(id).innerHTML = ""; });
      renderAssumptions(r); return;
    }
    var D = r.design, I = r.inputs;
    $("cv-msg").innerHTML = r.notes.length ? '<div class="notice" role="note" style="margin-bottom:12px"><ul class="cv-note">' + r.notes.map(function (w) { return "<li>" + esc(w) + "</li>"; }).join("") + "</ul></div>" : "";
    $("cv-tiles").innerHTML =
      tile("Governing control", D.gov === "inlet" ? "Inlet" : "Outlet", "", "at " + f(I.Q, 2) + " m³/s", true) +
      tile("Design headwater", f(r.HW), "m", "HW/H " + f((r.HW - I.ILi) / I.H, 2) + (r.over ? " · overtopping" : ""), true) +
      tile("Inlet control", f(D.hwI), "m", D.inlet.regime === "unsubmerged" ? "inlet not submerged" : D.inlet.regime === "submerged" ? "inlet submerged" : "transition") +
      tile("Outlet control", D.hwO != null ? f(D.hwO) : "n/a", D.hwO != null ? "m" : "", D.hwO != null ? (D.out.fullLen >= I.L - 1e-6 ? "barrel full" : D.out.fullLen > 0 ? "full over " + f(D.out.fullLen, 1) + " m" : "part full") : "supercritical barrel") +
      tile("Freeboard to road", f(I.road - r.HW), "m", "road " + f(I.road)) +
      tile("Outlet velocity", f(r.outlet.V, 2), "m/s", r.outlet.Fr != null ? "Froude " + f(r.outlet.Fr, 2) : "barrel full at exit");
    $("cv-checks").innerHTML = r.checks.map(function (c) {
      var cls = c.status === "OK" ? "" : c.status === "INFO" ? " info" : " bad";
      return '<li><span class="tag' + cls + '">' + c.status + "</span><span><strong>" + esc(c.label) + ".</strong> " + esc(c.detail) + (c.why && c.status !== "OK" ? '<span class="why">' + esc(c.why) + "</span>" : "") + "</span></li>";
    }).join("");
    renderChart(r);
    $("cv-calc").innerHTML = '<tr><th>Ref</th><th>Item</th><th>Symbol</th><th class="eq">Equation, with your numbers</th><th style="text-align:right">Value</th><th>Unit</th></tr>' + r.rows.map(function (x) {
      return x.head ? '<tr class="h"><td colspan="6">' + esc(x.head) + "</td></tr>" : '<tr><td class="ref">' + esc(x.ref) + "</td><td>" + esc(x.desc) + "</td><td>" + esc(x.sym) + '</td><td class="eq">' + esc(x.eq) + '</td><td class="v">' + esc(x.val) + "</td><td>" + esc(x.unit) + "</td></tr>";
    }).join("");
    $("cv-svg").innerHTML = drawing(r);
    $("cv-sketch").hidden = !(window.CPSketch && window.CPSketch.importDetail);
    renderAssumptions(r);
  }
  $("cv-cs").addEventListener("toggle", function () { $("cv-cs").querySelector("summary").textContent = $("cv-cs").open ? "Hide the calculation sheet" : "Show the calculation sheet"; });

  function renderAssumptions(r) {
    var a = [
      "Steady flow at the design discharge. The approach velocity in the headwater pool is neglected, so the headwater is an energy level. The tailwater is your input and is held at that level across the whole performance curve; in reality it usually rises with the flow.",
      "Multiple barrels are identical and share the flow equally. Each barrel is checked on its own; there is no allowance for blockage, debris, sediment in the barrel or an embedded invert. Reduce the opening yourself if you want to allow for these.",
      "Inlet control, inlet not submerged: critical depth forms just inside the inlet, and the headwater is y_c + (1 + K_u) V_c²/2g. This is the minimum specific energy plus an entry loss, from open-channel theory.",
      "Inlet control, inlet submerged: the inlet acts as an orifice discharging the full barrel area, HW = ȳ + (q/(C_d A))²/2g, with the head measured from the centroid of the opening. Between the two HW/H limits you set, the headwater is taken on a straight line between the two relations. These are idealised relations with your coefficients, not the empirically calibrated inlet-control curves in design manuals.",
      "Outlet control: energy is traced from the outlet back to the pool. At the outlet the barrel depth is set by the tailwater with an exit loss K_x V²/2g, or by critical depth when the tailwater is lower. If the outlet runs full with a free outfall the hydraulic grade at the outlet is taken at the soffit, which is on the safe side. Friction is integrated along the barrel by the direct-step method for part-full flow and at the full-flow friction slope where the barrel runs full. The entrance loss is K_e V²/2g on the velocity at the inlet section.",
      "Manning's n is taken as constant with depth. Colebrook-White uses the hydraulic radius (4R in place of the diameter), as for part-full pipes. Roughness and viscosity are single values for the whole barrel.",
      "If the subcritical profile from the outlet reaches critical depth before the inlet, the barrel is steep at that flow, outlet conditions cannot set the headwater, and inlet control governs. On a steep barrel the outlet depth comes from a supercritical profile started at critical depth at the inlet, unless the tailwater is high enough (by the momentum function) to push a hydraulic jump into the barrel.",
      "Overtopping is a broad-crested weir over the road along the length you give, C_w L_w (HW − road)^1.5, with the flow split so the barrels and the road together carry the design flow. Road camber, kerbs, safety barriers and drowning of the weir by tailwater are not modelled.",
      "Velocity, freeboard, headwater ratio and fish passage checks compare against your criteria only. Low-flow depth and velocity are at normal depth (critical depth if the barrel is level or adverse). Scour depth, outlet protection sizing, structural design, cover, buoyancy, ground conditions and flood risk to property are outside this tool."
    ];
    $("cv-assume").innerHTML = a.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "<li><strong>" + esc(DISC) + "</strong></li>";
  }

  /* ---------- performance curve (live colours) ---------- */
  function renderChart(r) {
    var I = r.inputs, pts = r.curve, W = 600, Ht = 340, L = 56, R = 18, T = 14, B = 44, pw = W - L - R, ph = Ht - T - B;
    var xmax = pts[pts.length - 1].Q, lo = Infinity, hi = -Infinity;
    pts.forEach(function (p) { lo = Math.min(lo, p.hwI, p.hwO != null ? p.hwO : Infinity); hi = Math.max(hi, p.hw); });
    var top = Math.max(r.HW, I.road);
    lo = Math.min(lo, I.ILi); hi = Math.min(Math.max(hi, I.road + 0.2, r.HW + 0.1), top + 0.3 * (top - I.ILi) + 0.2);
    var span = hi - lo, step = [0.1, 0.2, 0.25, 0.5, 1, 2, 5].filter(function (s) { return span / s <= 8; })[0] || 10;
    lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
    var over = pts.filter(function (p) { return p.hw > hi; })[0];
    if (over) xmax = Math.min(xmax, Math.max(1.25 * I.Q, over.Q * 1.05));
    var xs = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50].filter(function (s) { return xmax / s <= 8; })[0] || 100;
    function Xp(q) { return L + q / xmax * pw; } function Yp(z) { return T + (hi - z) / (hi - lo) * ph; }
    var g = "";
    for (var x = 0; x <= xmax + 1e-9; x += xs) g += '<line x1="' + Xp(x) + '" x2="' + Xp(x) + '" y1="' + T + '" y2="' + (T + ph) + '" stroke="var(--line)"/><text x="' + Xp(x) + '" y="' + (T + ph + 16) + '" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="var(--font-mono)">' + +x.toFixed(2) + "</text>";
    for (var z = lo; z <= hi + 1e-9; z += step) g += '<line x1="' + L + '" x2="' + (L + pw) + '" y1="' + Yp(z) + '" y2="' + Yp(z) + '" stroke="var(--line)"/><text x="' + (L - 6) + '" y="' + (Yp(z) + 4) + '" text-anchor="end" font-size="11" fill="var(--muted)" font-family="var(--font-mono)">' + z.toFixed(step < 1 ? (step < 0.25 ? 1 : 2) : 0) + "</text>";
    g += '<text x="' + (L + pw / 2) + '" y="' + (Ht - 6) + '" text-anchor="middle" font-size="12" fill="var(--muted)">Flow (m³/s)</text>';
    g += '<text transform="translate(14 ' + (T + ph / 2) + ') rotate(-90)" text-anchor="middle" font-size="12" fill="var(--muted)">Headwater level (m)</text>';
    /* reference levels */
    function ref(z, label, col, dash, fx, below) { if (z < lo || z > hi) return; g += '<line x1="' + L + '" x2="' + (L + pw) + '" y1="' + Yp(z) + '" y2="' + Yp(z) + '" stroke="' + col + '" stroke-width="1.2"' + (dash ? ' stroke-dasharray="' + dash + '"' : "") + '/><text x="' + (L + 6 + fx * pw) + '" y="' + (Yp(z) + (below ? 13 : -4)) + '" font-size="11" fill="' + col + '">' + label + "</text>"; }
    ref(I.road, "Road " + f(I.road, 2), "var(--accent-2)", "", 0, false);
    ref(I.road - I.fb, "Road less freeboard", "var(--accent-2)", "2 3", 0.3, false);
    ref(I.ILi + I.H, "Inlet soffit", "var(--muted)", "4 3", 0.6, true);
    function path(get, qOf) {
      var d = "", prev = null; qOf = qOf || function (p) { return p.Q; };
      pts.forEach(function (p) {
        var v = get(p), q = qOf(p);
        if (v == null || !isFinite(v) || q > xmax * 1.0001) { prev = null; return; }
        if (v > hi) { if (prev && prev.v <= hi) { var t = (hi - prev.v) / (v - prev.v); d += "L" + Xp(prev.q + t * (q - prev.q)).toFixed(1) + " " + Yp(hi).toFixed(1); } prev = { v: v, q: q }; return; }
        if (prev && prev.v > hi) { var t2 = (hi - prev.v) / (v - prev.v); d += "M" + Xp(prev.q + t2 * (q - prev.q)).toFixed(1) + " " + Yp(hi).toFixed(1); prev = { v: v, q: q }; d += "L" + Xp(q).toFixed(1) + " " + Yp(v).toFixed(1); return; }
        d += (prev ? "L" : "M") + Xp(q).toFixed(1) + " " + Yp(v).toFixed(1); prev = { v: v, q: q };
      });
      return d;
    }
    g += '<path d="' + path(function (p) { return p.hw; }) + '" fill="none" stroke="var(--ink)" stroke-opacity=".28" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"/>';
    g += '<path d="' + path(function (p) { return p.hwI; }) + '" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="7 4"/>';
    g += '<path d="' + path(function (p) { return p.hwO; }) + '" fill="none" stroke="var(--s-blue,#3f6fd1)" stroke-width="2" stroke-dasharray="2 3"/>';
    var anyOver = pts.some(function (p) { return p.Qtot > p.Q + 1e-9; });
    if (anyOver) {
      var d = path(function (p) { return p.hw >= I.road ? p.hw : null; }, function (p) { return p.Qtot; });
      g += '<path d="' + d + '" fill="none" stroke="var(--accent-2)" stroke-width="2" stroke-dasharray="1 3" stroke-linecap="round"/>';
    }
    /* design point */
    var dq = r.over ? I.Q : I.Q, dz = r.HW;
    if (dq <= xmax && dz <= hi) g += '<circle cx="' + Xp(dq) + '" cy="' + Yp(dz) + '" r="5.5" fill="var(--ink)" stroke="var(--surface)" stroke-width="2"/><text x="' + (Xp(dq) - 8) + '" y="' + (Yp(dz) - 9) + '" text-anchor="end" font-size="11" fill="var(--ink)" font-family="var(--font-mono)">design ' + f(dz, 3) + "</text>";
    g += '<line class="cv-cross" x1="0" x2="0" y1="' + T + '" y2="' + (T + ph) + '" stroke="var(--ink)" opacity="0"/>';
    g += '<rect class="cv-hit" x="' + L + '" y="' + T + '" width="' + pw + '" height="' + ph + '" fill="transparent"/>';
    $("cv-chart").innerHTML = '<svg viewBox="0 0 ' + W + " " + Ht + '" role="img" aria-label="Headwater level against flow for inlet control, outlet control and the governing envelope">' + g + '</svg><div class="cv-tip" hidden></div>';
    $("cv-legend").innerHTML = '<span><i style="border-color:var(--ink);opacity:.35;border-top-width:6px"></i>Governing (higher of the two)</span><span><i style="border-color:var(--accent);border-top-style:dashed"></i>Inlet control</span><span><i style="border-color:var(--s-blue,#3f6fd1);border-top-style:dotted"></i>Outlet control</span>' + (anyOver ? '<span><i style="border-color:var(--accent-2);border-top-style:dotted"></i>Total flow with overtopping</span>' : "");
    var cross = pts.filter(function (p, i) { return i > 0 && pts[i - 1].gov !== p.gov; });
    $("cv-chart-note").textContent = "Governing control at the design flow: " + (r.gov === "inlet" ? "inlet" : "outlet") + "." + (cross.length ? " The control switches near " + cross.map(function (p) { return f(p.Q, 2) + " m³/s (to " + p.gov + ")"; }).join(", ") + "." : "") + (pts.some(function (p) { return p.hwO == null; }) ? " Where the outlet control curve is missing, the barrel is steep and outlet conditions cannot reach the inlet." : "");
    var svg = $("cv-chart").querySelector("svg"), tip = $("cv-chart").querySelector(".cv-tip"), cl = svg.querySelector(".cv-cross");
    function move(e) {
      var b = svg.getBoundingClientRect(), sx = (e.clientX - b.left) * W / b.width, q = (sx - L) / pw * xmax, best = pts[0];
      pts.forEach(function (p) { if (Math.abs(p.Q - q) < Math.abs(best.Q - q)) best = p; });
      cl.setAttribute("x1", Xp(best.Q)); cl.setAttribute("x2", Xp(best.Q)); cl.setAttribute("opacity", ".3");
      tip.hidden = false;
      tip.innerHTML = "Q <b>" + f(best.Q, 2) + "</b> m³/s<br>Inlet " + f(best.hwI) + "<br>Outlet " + (best.hwO != null ? f(best.hwO) : "n/a") + "<br>Governs: <b>" + best.gov + "</b> " + f(best.hw) + (best.Qtot > best.Q + 1e-9 ? "<br>With overtopping " + f(best.Qtot, 2) + " m³/s" : "");
      var px = Xp(best.Q) * b.width / W;
      tip.style.left = Math.max(0, Math.min(px + 12, b.width - tip.offsetWidth - 4)) + "px"; tip.style.top = "8px";
    }
    var hit = svg.querySelector(".cv-hit");
    hit.addEventListener("pointermove", move); hit.addEventListener("pointerdown", move);
    hit.addEventListener("pointerleave", function () { tip.hidden = true; cl.setAttribute("opacity", "0"); });
  }

  /* ---------- drawing: one A3 landscape sheet in paper millimetres ---------- */
  var INK = "#111", MUTE = "#555", BLUE = "#2f62c4", WFILL = "#dce8fb", RED = "#b3261e";
  var SCALES = [10, 20, 25, 50, 100, 125, 200, 250, 500, 1000, 1250, 2000, 2500, 5000];
  function niceScale(need) { for (var i = 0; i < SCALES.length; i++) if (SCALES[i] >= need) return SCALES[i]; return 10000; }
  function r1(x) { return Math.round(x * 100) / 100; }
  var DEFS = "<defs>" +
    '<pattern id="cvc" patternUnits="userSpaceOnUse" width="4" height="4"><rect width="4" height="4" fill="#eeeeea"/><circle cx="1" cy="1.1" r="0.25" fill="#666"/><circle cx="3" cy="2.8" r="0.2" fill="#666"/></pattern>' +
    '<pattern id="cvf" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)"><rect width="3" height="3" fill="#faf7ef"/><path d="M0 0V3" stroke="#c9bd9b" stroke-width="0.2"/></pattern>' +
    '<pattern id="cvg" patternUnits="userSpaceOnUse" width="3" height="3" patternTransform="rotate(45)"><path d="M0 0V3" stroke="#999" stroke-width="0.15"/></pattern>' +
    '<marker id="cvt" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="4" markerHeight="4" orient="auto"><path d="M1 5L5 1" stroke="#111" stroke-width="1"/></marker>' +
    '<marker id="cva" viewBox="0 0 6 6" refX="5.5" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L6 3L0 6z" fill="#111"/></marker>' +
    "</defs>";

  function drawing(r) {
    var I = r.inputs, S = r.sec, o = [], Lb = I.L, t = Math.max(0, I.t);
    function P(s) { o.push(s); }
    function txt(x, y, s, size, anchor, extra) { P('<text x="' + r1(x) + '" y="' + r1(y) + '" font-size="' + (size || 2.2) + '" text-anchor="' + (anchor || "start") + '"' + (extra || "") + ">" + esc(s) + "</text>"); }
    function ln(x1, y1, x2, y2, extra) { P('<path d="M' + r1(x1) + " " + r1(y1) + "L" + r1(x2) + " " + r1(y2) + '"' + (extra || ' stroke="' + INK + '" stroke-width="0.35"') + "/>"); }
    function poly(pts, fill, extra) { P('<path d="M' + pts.map(function (p) { return r1(p[0]) + " " + r1(p[1]); }).join("L") + 'z" fill="' + fill + '"' + (extra || ' stroke="' + INK + '" stroke-width="0.3"') + "/>"); }
    function hdim(x1, x2, y, s) { if (Math.abs(x2 - x1) < 0.5) return; P('<path d="M' + r1(x1) + " " + r1(y) + "H" + r1(x2) + '" stroke="' + INK + '" stroke-width="0.18" marker-start="url(#cvt)" marker-end="url(#cvt)"/><path d="M' + r1(x1) + " " + r1(y - 1.5) + "v3M" + r1(x2) + " " + r1(y - 1.5) + 'v3" stroke="' + INK + '" stroke-width="0.18"/>'); txt((x1 + x2) / 2, y - 1, s, 2, "middle"); }
    function vdim(x, y1, y2, s, left) { if (Math.abs(y2 - y1) < 0.4) return; P('<path d="M' + r1(x) + " " + r1(y1) + "V" + r1(y2) + '" stroke="' + INK + '" stroke-width="0.18" marker-start="url(#cvt)" marker-end="url(#cvt)"/><path d="M' + r1(x - 1.5) + " " + r1(y1) + "h3M" + r1(x - 1.5) + " " + r1(y2) + 'h3" stroke="' + INK + '" stroke-width="0.18"/>'); txt(x + (left ? -1.2 : 1.2), (y1 + y2) / 2 + 0.7, s, 2, left ? "end" : "start"); }
    function lvl(x, y, s, left, col) { P('<path d="M' + r1(x) + " " + r1(y) + 'l-1.1 -1.6h2.2z" fill="none" stroke="' + (col || INK) + '" stroke-width="0.22"/>'); txt(x + (left ? -1.8 : 1.8), y - 1, s, 2, left ? "end" : "start", col ? ' fill="' + col + '"' : ""); }

    P('<rect x="0" y="0" width="420" height="297" fill="#fff"/>');
    P('<rect x="10" y="10" width="400" height="277" fill="none" stroke="' + INK + '" stroke-width="0.5"/>');

    /* ---- Long section A-A ---- */
    var a = Math.max(4, 0.2 * Lb), x0w = -a, x1w = Lb + a;
    var soffI = I.ILi + I.H, soffO = I.ILo + I.H;
    var crestW = Math.min(Math.max(0, I.crestW), Lb), runOut = Math.max(0, (Lb - crestW) / 2) / Math.max(I.slope, 0.1);
    var topI = Math.max(I.road - runOut, soffI + t), topO = Math.max(I.road - runOut, soffO + t);
    var zmin = Math.min(I.ILi, I.ILo) - t - 0.8, zmax = Math.max(I.road, r.HW, I.TW, topI, topO) + 0.7;
    var box = { x: 22, y: 30, w: 370, h: 104 };
    var sH = niceScale((x1w - x0w) * 1000 / box.w), sV = niceScale((zmax - zmin) * 1000 / box.h);
    if (sV > sH) sV = sH;
    var kx = 1000 / sH, kz = 1000 / sV, ox = box.x + (box.w - (x1w - x0w) * kx) / 2, oy = box.y + (box.h - (zmax - zmin) * kz) / 2;
    function X(x) { return ox + (x - x0w) * kx; } function Y(z) { return oy + (zmax - z) * kz; }
    function ilAt(x) { return I.ILi - r.S0 * x; }
    txt(16, 20, "LONG SECTION A–A", 3.4, "start", ' font-weight="700"');
    txt(16, 24.5, "Horizontal 1:" + sH + ", vertical 1:" + sV + (sH !== sV ? " (vertical exaggerated ×" + +(sH / sV).toFixed(1) + ")" : "") + " at A3. Levels in metres.", 2.2, "start", ' fill="' + MUTE + '"');
    /* water: pool, barrel profile, tailwater */
    var hw = r.HW, gov = r.governed;
    poly([[X(x0w), Y(I.ILi)], [X(0), Y(I.ILi)], [X(0), Y(hw)], [X(x0w), Y(hw)]], WFILL, ' stroke="none"');
    if (I.TW > I.ILo) poly([[X(Lb), Y(I.ILo)], [X(x1w), Y(I.ILo)], [X(x1w), Y(I.TW)], [X(Lb), Y(Math.min(I.TW, topO))]], WFILL, ' stroke="none"');
    var prof = [];
    if (gov.gov === "outlet" || !r.sup) { if (gov.out.reach || gov.out.pts.length) gov.out.pts.forEach(function (p) { prof.push({ x: Lb - p.x, ws: p.ws, full: p.full }); }); prof.reverse(); }
    else r.sup.forEach(function (p) { prof.push({ x: p.x, ws: ilAt(p.x) + p.y, full: false }); });
    if (prof.length > 1) {
      var wp = prof.map(function (p) { return [X(p.x), Y(Math.min(p.ws, ilAt(p.x) + I.H))]; });
      poly(wp.concat([[X(prof[prof.length - 1].x), Y(ilAt(prof[prof.length - 1].x))], [X(prof[0].x), Y(ilAt(prof[0].x))]]), WFILL, ' stroke="none"');
      P('<path d="M' + prof.map(function (p) { return r1(X(p.x)) + " " + r1(Y(p.ws)); }).join("L") + '" fill="none" stroke="' + BLUE + '" stroke-width="0.5"/>');
      var fullPts = prof.filter(function (p) { return p.full; });
      if (fullPts.length > 1) txt(X((fullPts[0].x + fullPts[fullPts.length - 1].x) / 2), Y(Math.max(fullPts[0].ws, fullPts[fullPts.length - 1].ws)) - 1.2, "hydraulic grade line (barrel full)", 1.9, "middle", ' fill="' + BLUE + '"');
    }
    ln(X(x0w), Y(hw), X(0), Y(hw), ' stroke="' + BLUE + '" stroke-width="0.45"');
    if (I.TW > I.ILo) ln(X(Lb), Y(I.TW), X(x1w), Y(I.TW), ' stroke="' + BLUE + '" stroke-width="0.45"');
    /* ground / channel bed */
    poly([[X(x0w), Y(I.ILi)], [X(0) - 0.3 * kx, Y(I.ILi)], [X(0) - 0.3 * kx, Y(I.ILi) + 3], [X(x0w), Y(I.ILi) + 3]], "url(#cvg)", ' stroke="none"');
    poly([[X(Lb) + 0.3 * kx, Y(I.ILo)], [X(x1w), Y(I.ILo)], [X(x1w), Y(I.ILo) + 3], [X(Lb) + 0.3 * kx, Y(I.ILo) + 3]], "url(#cvg)", ' stroke="none"');
    ln(X(x0w), Y(I.ILi), X(0), Y(I.ILi), ' stroke="' + INK + '" stroke-width="0.4"');
    ln(X(Lb), Y(I.ILo), X(x1w), Y(I.ILo), ' stroke="' + INK + '" stroke-width="0.4"');
    /* embankment fill over the barrel */
    var cx1 = (Lb - crestW) / 2, cx2 = (Lb + crestW) / 2;
    poly([[X(0), Y(topI)], [X(cx1), Y(I.road)], [X(cx2), Y(I.road)], [X(Lb), Y(topO)], [X(Lb), Y(soffO + t)], [X(0), Y(soffI + t)]], "url(#cvf)", ' stroke="none"');
    P('<path d="M' + r1(X(0)) + " " + r1(Y(topI)) + "L" + r1(X(cx1)) + " " + r1(Y(I.road)) + "L" + r1(X(cx2)) + " " + r1(Y(I.road)) + "L" + r1(X(Lb)) + " " + r1(Y(topO)) + '" fill="none" stroke="' + INK + '" stroke-width="0.35"/>');
    ln(X(cx1), Y(I.road), X(cx2), Y(I.road), ' stroke="' + INK + '" stroke-width="1"');
    if (hw > topI) { /* headwater against the embankment face, and over the road when it overtops */
      var wpts = hw >= I.road ? [[X(0), Y(hw)], [X(0), Y(topI)], [X(cx1), Y(I.road)], [X(cx2), Y(I.road)], [X(cx2), Y(hw)]] : [[X(0), Y(hw)], [X(0), Y(topI)], [X(cx1 * (hw - topI) / Math.max(1e-6, I.road - topI)), Y(hw)]];
      poly(wpts, WFILL, ' stroke="none" fill-opacity="0.85"');
      ln(X(0), Y(hw), wpts[wpts.length - 1][0] === X(cx2) ? X(cx2) : wpts[2][0], Y(hw), ' stroke="' + BLUE + '" stroke-width="0.45"');
    }
    /* barrel slabs and headwalls */
    poly([[X(0), Y(I.ILi)], [X(Lb), Y(I.ILo)], [X(Lb), Y(I.ILo - t)], [X(0), Y(I.ILi - t)]], "url(#cvc)");
    poly([[X(0), Y(soffI)], [X(Lb), Y(soffO)], [X(Lb), Y(soffO + t)], [X(0), Y(soffI + t)]], "url(#cvc)");
    var hwT = 0.3;
    poly([[X(-hwT), Y(topI)], [X(0), Y(topI)], [X(0), Y(soffI)], [X(-hwT), Y(soffI)]], "url(#cvc)");
    poly([[X(-hwT), Y(I.ILi)], [X(0), Y(I.ILi)], [X(0), Y(I.ILi - t - 0.3)], [X(-hwT), Y(I.ILi - t - 0.3)]], "url(#cvc)");
    poly([[X(Lb), Y(topO)], [X(Lb + hwT), Y(topO)], [X(Lb + hwT), Y(soffO)], [X(Lb), Y(soffO)]], "url(#cvc)");
    poly([[X(Lb), Y(I.ILo)], [X(Lb + hwT), Y(I.ILo)], [X(Lb + hwT), Y(I.ILo - t - 0.3)], [X(Lb), Y(I.ILo - t - 0.3)]], "url(#cvc)");
    ln(X(0), Y(I.ILi), X(Lb), Y(I.ILo), ' stroke="' + INK + '" stroke-width="0.6"');
    ln(X(0), Y(soffI), X(Lb), Y(soffO), ' stroke="' + INK + '" stroke-width="0.6"');
    /* levels and labels */
    lvl(X(x0w) + 3, Y(hw), "HW " + f(hw) + (r.gov === "inlet" ? " (inlet control)" : " (outlet control)"), false, BLUE);
    if (I.TW > I.ILo) lvl(X(x1w) - 3, Y(I.TW), "TW " + f(I.TW), true, BLUE);
    lvl(X(x0w) + 3, Y(I.ILi), "Bed / IL " + f(I.ILi), false);
    lvl(X(x1w) - 3, Y(I.ILo), "IL " + f(I.ILo), true);
    lvl(X((cx1 + cx2) / 2), Y(I.road), "Road " + f(I.road), false);
    txt(X(Lb * 0.5), Y(ilAt(Lb * 0.5)) + 4.2, "Invert falls " + C.oneIn(r.S0) + " (" + f(I.ILi - I.ILo) + " m)", 2, "middle");
    vdim(X(0) + 3, Y(I.ILi), Y(soffI), "H " + f(I.H, 2), false);
    var fbx = X(-a * 0.45);
    if (I.road > hw) vdim(fbx, Y(I.road), Y(hw), "Freeboard " + f(I.road - hw), true);
    if (I.road > hw) ln(fbx - 2, Y(I.road), X(cx1), Y(I.road), ' stroke="' + MUTE + '" stroke-width="0.15" stroke-dasharray="1 0.8"');
    if (hw > I.road) txt(X((cx1 + cx2) / 2), Y(I.road) - 3.5, "OVERTOPPING " + f(hw - I.road) + " m deep", 2.4, "middle", ' fill="' + RED + '" font-weight="700"');
    var dimY = Y(zmin) - 1;
    hdim(X(0), X(Lb), dimY, "L = " + f(Lb, 2) + " m");
    if (crestW > 0 && crestW < Lb) hdim(X(cx1), X(cx2), Y(I.road) - 6, "Crest " + f(crestW, 1));
    P('<path d="M' + r1(X(x0w) + 4) + " " + r1(Y(I.ILi) + 6) + "h12" + '" stroke="' + INK + '" stroke-width="0.3" marker-end="url(#cva)"/>'); txt(X(x0w) + 4, Y(I.ILi) + 9.2, "FLOW", 2, "start");

    /* ---- Plan ---- */
    var nb = I.N, B = I.shape === "circ" ? I.D : I.B, isBox = I.shape === "box", pitch = isBox ? B + t : B + 2 * t + 0.3, Wx = isBox ? nb * B + (nb + 1) * t : nb * (B + 2 * t) + (nb - 1) * 0.3, wingL = Math.max(1, 0.6 * I.H + 0.5);
    var pbox = { x: 22, y: 172, w: 200, h: 106 };
    var pa = a, py0 = -(Wx / 2 + wingL + 1.5), py1 = -py0;
    var sP = niceScale(Math.max((Lb + 2 * pa) * 1000 / pbox.w, (py1 - py0) * 1000 / pbox.h));
    var kp = 1000 / sP, pox = pbox.x + (pbox.w - (Lb + 2 * pa) * kp) / 2, poy = pbox.y + pbox.h / 2;
    function PX(x) { return pox + (x + pa) * kp; } function PY(y) { return poy + y * kp; }
    txt(16, 164, "PLAN", 3.4, "start", ' font-weight="700"');
    txt(16, 168.5, "1:" + sP + " at A3", 2.2, "start", ' fill="' + MUTE + '"');
    /* road band */
    if (crestW > 0) {
      var rx1 = Math.max(-pa, (Lb - crestW) / 2), rx2 = Math.min(Lb + pa, (Lb + crestW) / 2);
      poly([[PX(rx1), PY(py0)], [PX(rx2), PY(py0)], [PX(rx2), PY(py1)], [PX(rx1), PY(py1)]], "#f2f2f2", ' stroke="none"');
      ln(PX(rx1), PY(py0), PX(rx1), PY(py1)); ln(PX(rx2), PY(py0), PX(rx2), PY(py1));
      ln(PX((rx1 + rx2) / 2), PY(py0), PX((rx1 + rx2) / 2), PY(py1), ' stroke="' + MUTE + '" stroke-width="0.2" stroke-dasharray="4 2"');
      txt(PX((rx1 + rx2) / 2) + 1, PY(py0) + 3.5, "ROAD", 2, "start", ' fill="' + MUTE + '"');
    }
    /* embankment tops of slope at the barrel ends (approximate) */
    ln(PX(0), PY(py0), PX(0), PY(-Wx / 2 - wingL), ' stroke="' + MUTE + '" stroke-width="0.2" stroke-dasharray="1.5 1"');
    ln(PX(Lb), PY(py0), PX(Lb), PY(-Wx / 2 - wingL), ' stroke="' + MUTE + '" stroke-width="0.2" stroke-dasharray="1.5 1"');
    /* barrel outline and internal walls */
    if (isBox) poly([[PX(0), PY(-Wx / 2)], [PX(Lb), PY(-Wx / 2)], [PX(Lb), PY(Wx / 2)], [PX(0), PY(Wx / 2)]], "none", ' stroke="' + INK + '" stroke-width="0.4" stroke-dasharray="3 1.2"');
    else for (var bj = 0; bj < nb; bj++) { var ya = -Wx / 2 + bj * pitch; poly([[PX(0), PY(ya)], [PX(Lb), PY(ya)], [PX(Lb), PY(ya + B + 2 * t)], [PX(0), PY(ya + B + 2 * t)]], "none", ' stroke="' + INK + '" stroke-width="0.4" stroke-dasharray="3 1.2"'); }
    for (var bi = 0; bi < nb; bi++) {
      var yA = -Wx / 2 + t + bi * pitch, yB = yA + B;
      ln(PX(0), PY(yA), PX(Lb), PY(yA), ' stroke="' + INK + '" stroke-width="0.25" stroke-dasharray="3 1.2"');
      ln(PX(0), PY(yB), PX(Lb), PY(yB), ' stroke="' + INK + '" stroke-width="0.25" stroke-dasharray="3 1.2"');
    }
    /* headwalls and wing walls */
    [[0, -1], [Lb, 1]].forEach(function (e) {
      var xe = e[0], sgn = e[1], xo = xe + sgn * hwT, half = Wx / 2 + 0.5;
      poly([[PX(Math.min(xe, xo)), PY(-half)], [PX(Math.max(xe, xo)), PY(-half)], [PX(Math.max(xe, xo)), PY(half)], [PX(Math.min(xe, xo)), PY(half)]], "url(#cvc)");
      [-1, 1].forEach(function (sy) { ln(PX(xo), PY(sy * half), PX(xo + sgn * wingL * 0.7), PY(sy * (half + wingL * 0.7)), ' stroke="' + INK + '" stroke-width="0.6"'); });
    });
    /* channel and flow */
    ln(PX(-pa), PY(-Wx / 2 - 0.3), PX(-hwT), PY(-Wx / 2 - 0.3), ' stroke="' + MUTE + '" stroke-width="0.2"'); ln(PX(-pa), PY(Wx / 2 + 0.3), PX(-hwT), PY(Wx / 2 + 0.3), ' stroke="' + MUTE + '" stroke-width="0.2"');
    ln(PX(Lb + hwT), PY(-Wx / 2 - 0.3), PX(Lb + pa), PY(-Wx / 2 - 0.3), ' stroke="' + MUTE + '" stroke-width="0.2"'); ln(PX(Lb + hwT), PY(Wx / 2 + 0.3), PX(Lb + pa), PY(Wx / 2 + 0.3), ' stroke="' + MUTE + '" stroke-width="0.2"');
    P('<path d="M' + r1(PX(-pa) + 2) + " " + r1(PY(0)) + "h" + r1(Math.min(14, pa * kp - 4)) + '" stroke="' + BLUE + '" stroke-width="0.4" marker-end="url(#cva)"/>'); txt(PX(-pa) + 2, PY(0) - 1.2, "FLOW", 2, "start", ' fill="' + BLUE + '"');
    /* section marks */
    txt(PX(-pa) + 1, PY(py1) - 1, "A", 2.6, "start", ' font-weight="700"'); txt(PX(Lb + pa) - 1, PY(py1) - 1, "A", 2.6, "end", ' font-weight="700"');
    ln(PX(-pa), PY(py1) - 4, PX(Lb + pa), PY(py1) - 4, ' stroke="' + MUTE + '" stroke-width="0.2" stroke-dasharray="6 1 1 1"');
    ln(PX(Lb * 0.25), PY(py0), PX(Lb * 0.25), PY(py1), ' stroke="' + MUTE + '" stroke-width="0.2" stroke-dasharray="6 1 1 1"'); txt(PX(Lb * 0.25) + 0.8, PY(py0) + 3, "B", 2.6, "start", ' font-weight="700"');
    hdim(PX(0), PX(Lb), PY(py1) + 5, "L = " + f(Lb, 2) + " m");
    vdim(PX(Lb + pa) - 2, PY(-Wx / 2), PY(Wx / 2), f(Wx, 2) + " overall", true);
    txt(PX(Lb / 2), PY(py0) - 1.5, nb + " no. " + (I.shape === "circ" ? f(I.D * 1000, 0) + " mm dia. pipe" : I.shape === "arch" ? f(I.B, 2) + " × " + f(I.H, 2) + " m arch" : f(I.B, 2) + " × " + f(I.H, 2) + " m box") + (nb > 1 ? (I.shape === "circ" ? "s" : "es") : ""), 2.2, "middle");

    /* ---- Section B-B through the barrels ---- */
    var sbox = { x: 236, y: 172, w: 82, h: 54 };
    var Hx = I.H + 2 * t, sS = niceScale(Math.max((Wx + 1) * 1000 / sbox.w, (Hx + 0.6) * 1000 / sbox.h)), ks = 1000 / sS;
    var sox = sbox.x + sbox.w / 2, soy = sbox.y + sbox.h - 6;
    function SX(y) { return sox + y * ks; } function SY(z) { return soy - z * ks; }
    txt(232, 164, "SECTION B–B", 3.4, "start", ' font-weight="700"');
    txt(232, 168.5, "1:" + sS + " at A3", 2.2, "start", ' fill="' + MUTE + '"');
    var yIn = null;
    if (r.sup && gov.gov === "inlet") yIn = r.sup[Math.floor(r.sup.length / 4)].y;
    else if (gov.out && gov.out.pts.length) { var qp = gov.out.pts.filter(function (p) { return p.x >= 0.75 * Lb; })[0] || gov.out.pts[gov.out.pts.length - 1]; yIn = Math.min(I.H, qp.y); }
    function shapePath(y0c, inner) { /* returns path for one barrel centred at y0c, offset outward by t when !inner */
      var e = inner ? 0 : t;
      if (I.shape === "circ") { var rr = I.D / 2 + e; return "M" + r1(SX(y0c - rr)) + " " + r1(SY(I.D / 2)) + "a" + r1(rr * ks) + " " + r1(rr * ks) + " 0 1 0 " + r1(2 * rr * ks) + " 0a" + r1(rr * ks) + " " + r1(rr * ks) + " 0 1 0 " + r1(-2 * rr * ks) + " 0z"; }
      if (I.shape === "arch") {
        var A = S.arch, n = 24, pts = [[y0c - B / 2 - e, -e], [y0c - B / 2 - e, A.hs]];
        var phiS = Math.acos(Math.max(-1, Math.min(1, (A.hs - A.c0) / A.R)));
        for (var i = 0; i <= n; i++) { var ph = -phiS + 2 * phiS * i / n; pts.push([y0c + (A.R + e) * Math.sin(ph), A.c0 + (A.R + e) * Math.cos(ph)]); }
        pts.push([y0c + B / 2 + e, A.hs], [y0c + B / 2 + e, -e]);
        return "M" + pts.map(function (p) { return r1(SX(p[0])) + " " + r1(SY(p[1])); }).join("L") + "z";
      }
      return "M" + r1(SX(y0c - B / 2 - e)) + " " + r1(SY(-e)) + "H" + r1(SX(y0c + B / 2 + e)) + "V" + r1(SY(I.H + e)) + "H" + r1(SX(y0c - B / 2 - e)) + "z";
    }
    var centres = []; for (var ci = 0; ci < nb; ci++) centres.push(-Wx / 2 + t + B / 2 + ci * pitch);
    centres.forEach(function (yc0) {
      P('<path d="' + shapePath(yc0, false) + '" fill="url(#cvc)" stroke="' + INK + '" stroke-width="0.3"/>');
      P('<path d="' + shapePath(yc0, true) + '" fill="#fff" stroke="' + INK + '" stroke-width="0.4"/>');
      if (yIn != null && yIn > 0) {
        var wdt = S.width(Math.min(yIn, I.H * 0.999)), half = wdt / 2;
        P('<clipPath id="cvclip' + Math.round(yc0 * 1000) + '"><path d="' + shapePath(yc0, true) + '"/></clipPath>');
        P('<rect x="' + r1(SX(yc0 - B / 2)) + '" y="' + r1(SY(yIn)) + '" width="' + r1(B * ks) + '" height="' + r1(yIn * ks) + '" fill="' + WFILL + '" clip-path="url(#cvclip' + Math.round(yc0 * 1000) + ')"/>');
        if (yIn < I.H * 0.999) ln(SX(yc0 - half), SY(yIn), SX(yc0 + half), SY(yIn), ' stroke="' + BLUE + '" stroke-width="0.3"');
      }
    });
    ln(SX(-Wx / 2 - 0.5), SY(-t), SX(Wx / 2 + 0.5), SY(-t), ' stroke="' + INK + '" stroke-width="0.2"');
    var c0 = centres[0];
    hdim(SX(c0 - B / 2), SX(c0 + B / 2), SY(I.H + t) - 3, (I.shape === "circ" ? "D " : "B ") + f(B, 2));
    if (I.shape !== "circ") vdim(SX(Wx / 2) + 3, SY(0), SY(I.H), "H " + f(I.H, 2), false);
    if (yIn != null) txt(sox, sbox.y + sbox.h + 3, "Water level a quarter of the way along, design flow", 1.8, "middle", ' fill="' + BLUE + '"');

    /* ---- Hydraulic summary ---- */
    var hx = 324, hy = 166, D = r.design;
    txt(hx, hy - 2, "HYDRAULIC SUMMARY (indicative)", 2.6, "start", ' font-weight="700"');
    var lines = [
      ["Design flow Q", f(I.Q, 3) + " m³/s"], ["Barrels", nb + " no."], ["Gradient", C.oneIn(r.S0)], ["Inlet control HW", f(D.hwI)], ["Outlet control HW", D.hwO != null ? f(D.hwO) : "n/a"],
      ["Governing", (r.gov === "inlet" ? "INLET" : "OUTLET") + " CONTROL"], ["Design HW", f(r.HW)], ["Tailwater", f(I.TW)], ["Freeboard to road", f(I.road - r.HW) + " m"],
      ["Outlet velocity", f(r.outlet.V, 2) + " m/s"], ["Max barrel velocity", f(r.vmax, 2) + " m/s"], ["Roughness", I.method === "manning" ? "n " + f(I.n, 3) : "ks " + f(I.ks, 2) + " mm"], ["K_e / K_u / C_d / K_x", [I.Ke, I.Ku, I.Cd, I.Kx].map(function (x) { return f(x, 2); }).join(" / ")]];
    lines.forEach(function (l, i) { txt(hx, hy + 3 + i * 4.3, l[0], 2.1); txt(406, hy + 3 + i * 4.3, l[1], 2.1, "end", ' font-family="Courier New, monospace"' + (l[0] === "Governing" || l[0] === "Design HW" ? ' font-weight="700"' : "")); });
    var bad = r.checks.filter(function (c) { return c.status === "FAIL" || c.status === "CHECK"; });
    txt(hx, hy + 3 + lines.length * 4.3 + 1, bad.length ? bad.length + " check" + (bad.length > 1 ? "s" : "") + " need attention: see calcs" : "All checks within your criteria", 2.1, "start", ' fill="' + (bad.length ? RED : INK) + '" font-weight="700"');

    /* ---- Title block ---- */
    var tb = { x: 232, y: 232, w: 178, h: 55 };
    P('<rect x="' + tb.x + '" y="' + tb.y + '" width="' + tb.w + '" height="' + tb.h + '" fill="#fff" stroke="' + INK + '" stroke-width="0.4"/>');
    [tb.y + 11, tb.y + 22, tb.y + 33, tb.y + 44].forEach(function (yy) { ln(tb.x, yy, tb.x + tb.w, yy, ' stroke="' + INK + '" stroke-width="0.2"'); });
    ln(tb.x + 118, tb.y + 33, tb.x + 118, tb.y + tb.h, ' stroke="' + INK + '" stroke-width="0.2"');
    function cell(x, y, k, v, sz) { txt(x + 2, y + 3, k, 1.7, "start", ' fill="' + MUTE + '"'); txt(x + 2, y + 8.3, v, sz || 3); }
    cell(tb.x, tb.y, "PROJECT", I.project || "–");
    cell(tb.x, tb.y + 11, "TITLE", "Culvert " + (I.ref || "") + ": long section, plan and section", 2.8);
    cell(tb.x, tb.y + 22, "STATUS", "INDICATIVE HYDRAULIC CHECK. NOT FOR CONSTRUCTION.", 2.6);
    cell(tb.x, tb.y + 33, "SCALE", "As shown at A3. Do not scale.", 2.4);
    var d = new Date(), ds = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    cell(tb.x + 118, tb.y + 33, "DATE", ds, 2.4);
    cell(tb.x, tb.y + 44, "NOTE", "Coefficients and criteria are the user's own. No standard is claimed.", 2.1);
    cell(tb.x + 118, tb.y + 44, "MADE WITH", "Civil Chartered Path", 2.2);

    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 297" width="420mm" height="297mm" font-family="Arial, Helvetica, sans-serif" fill="' + INK + '" role="img" aria-label="Culvert long section, plan and barrel section">' + DEFS + o.join("") + "</svg>";
  }

  /* ---------- exports ---------- */
  function stamp() { var d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }
  function fname(ext) { return "culvert-" + String(state.ref || "check").replace(/[^\w-]+/g, "-") + "." + ext; }
  function status(t) { $("cv-status").textContent = t; }
  function inputRows() {
    var out = [];
    function shown(c) { return !c || (c === "circ" ? state.shape === "circ" : c === "notcirc" ? state.shape !== "circ" : c === "manning" || c === "cw" ? state.method === c : true); }
    G.forEach(function (g) { g.f.forEach(function (d) { if (d[3] === "preset" || !shown(d[6])) return; var v = state[d[0]]; if (Array.isArray(d[3])) { var o = d[3].filter(function (x) { return String(x[0]) === String(v); })[0]; v = o ? o[1] : v; } else if (d[3] !== "text") v = +v; out.push([g.t, d[1], v, d[2] || "", d[7] ? "placeholder default: set your own" : ""]); }); });
    return out;
  }
  function curveRows(r) { return r.curve.map(function (p) { return [+p.Q.toFixed(3), +p.hwI.toFixed(3), p.hwO == null ? "" : +p.hwO.toFixed(3), +p.hw.toFixed(3), p.gov, +p.Qtot.toFixed(3)]; }); }
  function checkRows(r) { return r.checks.map(function (c) { return [c.label, c.status, c.detail, c.status === "OK" ? "" : c.why]; }); }
  var CURVE_HEAD = ["Flow through barrels (m³/s)", "Inlet control HW (m)", "Outlet control HW (m)", "Governing HW (m)", "Governing control", "Total flow with overtopping (m³/s)"];
  $("cv-csv").addEventListener("click", function () {
    var r = last; if (!r || r.error) return;
    var rows = [["Culvert hydraulic check", stamp()], [DISC], [], ["INPUTS"], ["Group", "Input", "Value", "Unit", "Note"]].concat(inputRows())
      .concat([[], ["CALCULATION"], ["Ref", "Item", "Symbol", "Equation", "Value", "Unit"]]).concat(r.rows.map(function (x) { return x.head ? [x.head] : [x.ref, x.desc, x.sym, x.eq, x.val, x.unit]; }))
      .concat([[], ["CHECKS"], ["Check", "Status", "Detail", "Action"]]).concat(checkRows(r))
      .concat([[], ["PERFORMANCE CURVE (tailwater held at " + f(r.inputs.TW) + ")"], CURVE_HEAD]).concat(curveRows(r));
    X.csv(fname("csv"), rows); status("Downloaded " + fname("csv"));
  });
  $("cv-xlsx").addEventListener("click", function () {
    var r = last; if (!r || r.error) return;
    var b = function (v) { return { v: v, b: true }; };
    var sum = [[b("Culvert hydraulic check: " + (state.project || "") + " " + (state.ref || ""))], [DISC], [stamp()], [], [b("Check"), b("Status"), b("Detail"), b("Action")]].concat(checkRows(r));
    var inp = [[b("Group"), b("Input"), b("Value"), b("Unit"), b("Note")]].concat(inputRows());
    var calc = [[b("Ref"), b("Item"), b("Symbol"), b("Equation, with your numbers"), b("Value"), b("Unit")]].concat(r.rows.map(function (x) { return x.head ? [b(x.head)] : [x.ref, x.desc, x.sym, x.eq, typeof x.val === "number" ? { v: x.val, fmt: "0.000" } : x.val, x.unit]; }));
    var cur = [[b("Tailwater held at " + f(r.inputs.TW) + " m")], CURVE_HEAD.map(b)].concat(curveRows(r));
    X.xlsx(fname("xlsx"), [{ name: "Checks", rows: sum, widths: [36, 10, 70, 70] }, { name: "Inputs", rows: inp, widths: [24, 40, 16, 12, 30] }, { name: "Calculation", rows: calc, widths: [8, 50, 12, 80, 14, 10] }, { name: "Performance curve", rows: cur, widths: [24, 20, 20, 20, 18, 28] }]);
    status("Downloaded " + fname("xlsx"));
  });
  function svgToCanvas(svg, scale) {
    return new Promise(function (ok, fail) {
      var img = new Image(), url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      img.onload = function () { var c = document.createElement("canvas"); c.width = 420 * scale; c.height = 297 * scale; var g = c.getContext("2d"); g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); g.drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url); ok(c); };
      img.onerror = function () { URL.revokeObjectURL(url); fail(new Error("render")); };
      img.src = url;
    });
  }
  var JSPDF = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js", jsPdfP = null;
  function loadJsPdf() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    if (!jsPdfP) jsPdfP = new Promise(function (ok, fail) { var sc = document.createElement("script"); sc.src = JSPDF; sc.onload = function () { ok(window.jspdf.jsPDF); }; sc.onerror = function () { jsPdfP = null; fail(new Error("load")); }; document.head.appendChild(sc); });
    return jsPdfP;
  }
  function toPdf(r, svg) {
    return Promise.all([loadJsPdf(), svgToCanvas(svg, 7)]).then(function (x) {
      var Pdf = x[0], c = x[1], doc = new Pdf({ orientation: "landscape", unit: "mm", format: "a3" });
      doc.addImage(c.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 420, 297);
      var y = 0, W = [16, 110, 26, 200, 34, 18];
      function clean(s) { return String(s == null ? "" : s).replace(/[₀₁₂ⁱ]/g, function (ch) { return { "₀": "0", "₁": "1", "₂": "2" }[ch] || ""; }).replace(/[^\x20-\x7E -ÿ]/g, function (ch) { return { "−": "-", "×": "x", "√": "sqrt", "²": "^2", "³": "^3", "⅓": "1/3", "⅔": "2/3", "½": "1/2", "θ": "theta", "ν": "nu", "λ": "lambda", "Δ": "d", "ȳ": "ybar", "–": "-", "’": "'" }[ch] || "?"; }); }
      function page(title) { doc.addPage("a3", "landscape"); doc.setFontSize(12); doc.setFont("helvetica", "bold"); doc.text(clean(title), 12, 14); doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.text(clean(DISC), 12, 19); y = 27; }
      page("Culvert " + (state.ref || "") + " calculation sheet: " + (state.project || ""));
      doc.setFont("helvetica", "bold"); [["Ref", "Item", "Symbol", "Equation, with your numbers", "Value", "Unit"]].forEach(function (h) { var cx = 12; h.forEach(function (s, j) { doc.text(s, cx, y); cx += W[j]; }); }); y += 5;
      r.rows.forEach(function (row) {
        if (row.head) { if (y > 275) page("Calculation sheet (continued)"); y += 2; doc.setFont("helvetica", "bold"); doc.text(clean(row.head), 12, y); doc.setFont("helvetica", "normal"); y += 5; return; }
        var eq = doc.splitTextToSize(clean(row.eq), W[3] - 2), desc = doc.splitTextToSize(clean(row.desc), W[1] - 2), h = Math.max(eq.length, desc.length) * 3.6 + 1.2;
        if (y + h > 285) page("Calculation sheet (continued)");
        var cx = 12; doc.text(clean(row.ref), cx, y); cx += W[0]; doc.text(desc, cx, y); cx += W[1]; doc.text(clean(row.sym), cx, y); cx += W[2]; doc.text(eq, cx, y); cx += W[3];
        var v = clean(row.val); if (/CONTROL/.test(v)) doc.setFont("helvetica", "bold"); doc.text(v, cx + W[4] - 4, y, { align: "right" }); doc.setFont("helvetica", "normal"); cx += W[4]; doc.text(clean(row.unit), cx, y);
        doc.setDrawColor(225); doc.line(12, y + h - 3.2, 408, y + h - 3.2); y += h;
      });
      page("Checks and performance curve");
      r.checks.forEach(function (ck) {
        var t = doc.splitTextToSize(clean(ck.detail + (ck.status !== "OK" && ck.why ? " " + ck.why : "")), 300), h = t.length * 3.6 + 1.5;
        if (y + h > 285) page("Checks (continued)");
        if (ck.status === "FAIL" || ck.status === "CHECK") doc.setTextColor(179, 38, 30); doc.setFont("helvetica", "bold"); doc.text(ck.status, 12, y); doc.setTextColor(0, 0, 0); doc.text(clean(ck.label), 30, y); doc.setFont("helvetica", "normal"); doc.text(t, 100, y); y += h;
      });
      y += 4; doc.setFont("helvetica", "bold"); var cx2 = 12; CURVE_HEAD.forEach(function (s) { doc.text(clean(s), cx2, y); cx2 += 60; }); doc.setFont("helvetica", "normal"); y += 5;
      curveRows(r).forEach(function (row) { if (y > 285) { page("Performance curve (continued)"); } var cx3 = 12; row.forEach(function (v) { doc.text(String(v), cx3, y); cx3 += 60; }); y += 3.8; });
      return doc.output("blob");
    });
  }
  $("cv-png").addEventListener("click", function () { if (!last || last.error) return; status("Making PNG…"); svgToCanvas(drawing(last), 8).then(function (c) { c.toBlob(function (b) { X.download(fname("png"), "image/png", b); status("Downloaded " + fname("png")); }); }, function () { status("Couldn't render the PNG in this browser."); }); });
  $("cv-svgdl").addEventListener("click", function () { if (!last || last.error) return; X.download(fname("svg"), "image/svg+xml", drawing(last)); status("Downloaded " + fname("svg")); });
  $("cv-pdf").addEventListener("click", function () { if (!last || last.error) return; status("Making PDF…"); toPdf(last, drawing(last)).then(function (b) { X.download(fname("pdf"), "application/pdf", b); status("Downloaded " + fname("pdf") + ": drawing on page 1, calculations after."); }, function () { status("Couldn't load the PDF library. Check your connection, or use PNG."); }); });
  $("cv-sketch").addEventListener("click", function () {
    if (!last || last.error) return;
    var ok = window.CPSketch && window.CPSketch.importDetail && window.CPSketch.importDetail({ svg: drawing(last), title: "Culvert " + (state.ref || "") + " long section and plan", scale: "As shown at A3", source: "culvert" });
    status(ok ? "Sent to the sketch pad." : "The sketch pad didn't accept the drawing.");
  });

  /* ---------- prefill from the hash: #culvert?Q=4.2 (m3/s) or #culvert?Qls=4200 ---------- */
  var lastQuery = null;
  function fromHash() {
    var h = location.hash.slice(1), i = h.indexOf("?"), name = i > -1 ? h.slice(0, i) : h;
    if (name !== ID) return;
    var qs = i > -1 ? h.slice(i + 1) : ""; if (!qs || qs === lastQuery) return; lastQuery = qs;
    var v = {}; qs.split("&").forEach(function (kv) { var p = kv.split("="); if (p[0]) v[decodeURIComponent(p[0])] = decodeURIComponent(p[1] || ""); });
    var q = parseFloat(v.Q), qls = parseFloat(v.Qls);
    if (qls > 0) q = qls / 1000;
    if (q > 0) { state.Q = +q.toFixed(4); save(); buildForm(); update(); status("Design flow set to " + f(q, 3) + " m³/s from the link."); }
  }
  window.addEventListener("hashchange", fromHash);

  buildForm(); update(); fromHash();
  window.addEventListener("load", function () { $("cv-sketch").hidden = !(window.CPSketch && window.CPSketch.importDetail); });
  window.CVTool = { state: function () { return state; }, result: function () { return last; }, svg: function () { return last && !last.error ? drawing(last) : ""; }, refresh: function () { buildForm(); update(); } };
})();
